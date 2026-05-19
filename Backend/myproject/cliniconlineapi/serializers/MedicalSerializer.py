from django.db import transaction
from rest_framework import serializers
from cliniconlineapi.models import Medicine,MedicalRecord,TestResult,Prescription,PrescriptionDetail,Appointment
from cliniconlineapi.serializers.userserializer import CustomerProfileSerializer
from cliniconlineapi.validators import MedicineDataValidator, PrescriptionDataValidator


#thuốc
class MedicineSerializer(serializers.ModelSerializer):
    is_low_stock = serializers.SerializerMethodField()
    is_expiring_soon = serializers.SerializerMethodField()
    is_expired = serializers.SerializerMethodField()

    class Meta:
        model = Medicine
        fields = ['id', 'name', 'unit', 'description',
                  'stock','production_date', 'expiry_date', 'price',
                  'is_low_stock','is_expiring_soon','is_expired']

    def __init__(self,*args,**kwargs):
        super().__init__(*args,**kwargs)
        self.medicine_validator = MedicineDataValidator()

    #Validation
    def validate_name(self,value):
        self.medicine_validator.validate_field('name',value)
        return value.strip()

    def validate_unit(self, value):
        self.medicine_validator.validate_field('unit', value)
        return value

    def validate_stock(self,value):
        self.medicine_validator.validate_field('stock', value)
        return value

    def validate_description(self,value):
        self.medicine_validator.validate_field('description',value)
        return value.strip()

    def validate_price(self,value):
        self.medicine_validator.validate_field('price',value)
        return value

    def validate_production_date(self, value):
        self.medicine_validator.validate_field('production_date', value)
        return value

    def validate_expiry_date(self,value):
        self.medicine_validator.validate_field('expiry_date',value)
        return value


    def validate(self,data):
        self.medicine_validator.validate_object(data)
        return data

    def get_is_low_stock(self, obj):
        return obj.is_low_stock()

    def get_is_expiring_soon(self, obj):
        return obj.is_expiring_soon()

    def get_is_expired(self, obj):
        return obj.is_expired()


#tạo 1 dòng thuốc
class PrescriptionDetailCreateSerializer(serializers.ModelSerializer):
    medicine_id = serializers.PrimaryKeyRelatedField(
        queryset=Medicine.objects.filter(active=True),
        source='medicine'
    )

    class Meta:
        model = PrescriptionDetail
        fields = [
            'medicine_id',
            'quantity',
            'dosage'
        ]

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.validator = PrescriptionDataValidator()

    def validate_quantity(self, value):
        self.validator.validate_quantity(value)
        return value

    def validate_dosage(self, value):
        self.validator.validate_dosage(value)
        return value

    def validate(self, attrs):
        medicine = attrs.get('medicine')
        quantity = attrs.get('quantity')

        if medicine and quantity:
            self.validator.validate_medicine_stock(
                medicine,
                quantity
            )

        return attrs

#Hiển thị 1 dòng thuốc trong đơn
class PrescriptionDetailItemSerializer(serializers.ModelSerializer):
    medicine_name = serializers.CharField(
        source='medicine.name',
        read_only=True
    )
    medicine_unit = serializers.CharField(
        source='medicine.unit',
        read_only=True
    )
    total_price = serializers.SerializerMethodField()

    class Meta:
        model = PrescriptionDetail
        fields = [
            'medicine_name',
            'medicine_unit',
            'quantity',
            'dosage',
            'unit_price',
            'total_price',
        ]

    def get_total_price(self, obj):
        return obj.quantity * obj.unit_price

#Xem chi tiết 1 đơn thuốc
class PrescriptionDetailedSerializer(serializers.ModelSerializer):
    details = PrescriptionDetailItemSerializer(many=True, read_only=True)
    total_amount = serializers.SerializerMethodField()
    detail_count = serializers.SerializerMethodField()

    class Meta:
        model = Prescription
        fields = [
            'id',
            'instruction_notes',
            'details',
            'total_amount',
            'detail_count',
            'created_date',
            'updated_date',
        ]

    def get_customer_info(self, obj):
        customer = obj.medical_record.appointment.customer
        return {
            'id': customer.id,
            'name': customer.get_full_name(),
            'phone': customer.phone,
        }

    def get_total_amount(self, obj):
        return sum(
            d.quantity * d.unit_price
            for d in obj.details.all()
        )

    def get_detail_count(self, obj):
        return obj.details.count()

#Tạo đơn thuốc khi đã có hồ sơ bênh án
class PrescriptionCreateSerializer(serializers.ModelSerializer):
    medical_record_id = serializers.PrimaryKeyRelatedField(
        queryset=MedicalRecord.objects.all(),
        source='medical_record',
        write_only=True
    )
    details = PrescriptionDetailCreateSerializer(many=True, required=True)

    class Meta:
        model = Prescription
        fields = ['medical_record_id','instruction_notes', 'details']

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.validator = PrescriptionDataValidator()

    def validate_medical_record_id(self, medical_record):
        if hasattr(medical_record, 'prescription'):
            raise serializers.ValidationError("Bệnh án này đã có đơn thuốc")
        return medical_record

    def validate_instruction_notes(self, value):
        self.validator.instruction_notes_validator(value)
        return value


    def validate_details(self, value):
        if not value:
            raise serializers.ValidationError(
                "Đơn thuốc phải có ít nhất 1 thuốc"
            )
        # Kiểm tra trùng thuốc
        medicine_ids = [d['medicine'].id for d in value]
        if len(medicine_ids) != len(set(medicine_ids)):
            raise serializers.ValidationError("Thuốc bị trùng trong đơn")
        return value

    def validate(self, attrs):
        #bác sĩ phụ trách mới được tạo
        medical_record = attrs.get('medical_record')
        request = self.context.get('request')
        self.validator.validate_create_permission(medical_record, request.user)
        return attrs

    def create(self, validated_data):
        details_data = validated_data.pop('details')
        with transaction.atomic():
            prescription = Prescription.objects.create(**validated_data)
            for detail in details_data:
                medicine = detail['medicine']
                PrescriptionDetail.objects.create(
                    prescription=prescription,
                    medicine=medicine,
                    quantity=detail['quantity'],
                    dosage=detail['dosage'],
                    unit_price=medicine.price
                )
                medicine.stock -= detail['quantity']
                medicine.save(update_fields=['stock'])
        return prescription

#tạo đơn thuốc trong hồ sơ bệnh án
class PrescriptionNestedCreateSerializer(serializers.ModelSerializer):
    details = PrescriptionDetailCreateSerializer(many=True, required=True)

    class Meta:
        model = Prescription
        fields = ['instruction_notes', 'details']

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.validator = PrescriptionDataValidator()

    def validate_instruction_notes(self, value):
        self.validator.instruction_notes_validator(value)
        return value

    def validate_details(self, value):
        if not value:
            raise serializers.ValidationError("Đơn thuốc phải có ít nhất 1 thuốc")
        medicine_ids = [d['medicine'].id for d in value]
        if len(medicine_ids) != len(set(medicine_ids)):
            raise serializers.ValidationError("Thuốc bị trùng trong đơn")
        return value

class PrescriptionUpdateSerializer(serializers.ModelSerializer):
    details = PrescriptionDetailCreateSerializer(many=True, required=False)

    class Meta:
        model = Prescription
        fields = ['instruction_notes', 'details']

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.validator = PrescriptionDataValidator()

    def validate_instruction_notes(self, value):
        self.validator.validate_notes(value)
        return value

    def validate_details(self, value):
        if value:
            self.validator.validate_details(value)
            medicine_ids = [d['medicine'].id for d in value]
            if len(medicine_ids) != len(set(medicine_ids)):
                raise serializers.ValidationError("Thuốc bị trùng trong đơn")
        return value

    def update(self, instance, validated_data):
        details_data = validated_data.pop('details', None)
        instance.instruction_notes = validated_data.get(
            'instruction_notes', instance.instruction_notes
        )
        instance.save()

        if details_data is not None:
            with transaction.atomic():
                # Hoàn trả stock cũ trước khi xóa
                for old_detail in instance.details.all():
                    medicine = old_detail.medicine
                    medicine.stock += old_detail.quantity
                    medicine.save(update_fields=['stock'])

                # Xóa details cũ
                instance.details.all().delete()

                # Tạo details mới
                for detail in details_data:
                    medicine = detail['medicine']
                    self.validator.validate_medicine_stock(medicine, detail['quantity'])
                    PrescriptionDetail.objects.create(
                        prescription=instance,
                        medicine=medicine,
                        quantity=detail['quantity'],
                        dosage=detail['dosage'],
                        unit_price=medicine.price
                    )
                    medicine.stock -= detail['quantity']
                    medicine.save(update_fields=['stock'])

        return instance