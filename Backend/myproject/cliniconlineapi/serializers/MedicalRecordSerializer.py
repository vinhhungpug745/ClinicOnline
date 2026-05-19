from datetime import date

from django.db import transaction
from rest_framework import serializers

from cliniconlineapi.models import MedicalRecord, Appointment, Prescription, PrescriptionDetail, TestResult
from cliniconlineapi.serializers.MedicalSerializer import PrescriptionCreateSerializer, PrescriptionDetailedSerializer,PrescriptionNestedCreateSerializer
from cliniconlineapi.serializers.TestResultSerializer import TestResultSerializer, TestResultCreateSerializer, \
    TestResultNestedCreateSerializer
from cliniconlineapi.validators import MedicalRecordDataValidator


class MedicalRecordListSerializer(serializers.ModelSerializer):
    customer_name = serializers.SerializerMethodField()
    doctor_id = serializers.IntegerField(source='appointment.doctor.id',read_only=True)
    doctor_name = serializers.SerializerMethodField()
    has_prescription = serializers.SerializerMethodField()
    has_test_result = serializers.SerializerMethodField()
    test_result_count = serializers.SerializerMethodField()


    class Meta:
        model = MedicalRecord
        fields = [
            'id',
            'customer_name',
            'doctor_id',
            'doctor_name',
            'diagnosis',
            'symptoms',
            'follow_up_date',
            'has_prescription',
            'has_test_result',
            'test_result_count',
            'created_date'
        ]

    def get_customer_name(self, obj):
        return obj.appointment.customer.get_full_name()

    def get_doctor_name(self, obj):
        return obj.appointment.doctor.get_full_name()

    def get_has_prescription(self, obj):
        try:
            return obj.prescription is not None
        except Prescription.DoesNotExist:
            return False

    def get_has_test_result(self, obj):
        try:
            return obj.test_results is not None
        except TestResult.DoesNotExist:
            return False

    def get_test_result_count(self, obj):
        return obj.test_results.count()

class MedicalRecordDetailSerializer(serializers.ModelSerializer):
    customer_info = serializers.SerializerMethodField()
    doctor_info = serializers.SerializerMethodField()
    appointment_date = serializers.DateTimeField(source='appointment.appointment_date',read_only=True)
    prescription = PrescriptionDetailedSerializer(read_only=True)
    test_results = TestResultSerializer(many=True, read_only=True)

    class Meta:
        model = MedicalRecord
        fields = [
            'id',
            'customer_info',
            'doctor_info',
            'appointment_date',
            'diagnosis',
            'symptoms',
            'medical_notes',
            'follow_up_date',
            'prescription',
            'test_results',
            'created_date',
            'updated_date',
        ]

    def get_customer_info(self, obj):
        customer = obj.appointment.customer
        return {
            'id': customer.id,
            'name': customer.get_full_name(),
            'phone': customer.phone,
        }
    #Lấy thong tin bác sĩ cho hồ sơ bênh án nếu cần
    def get_doctor_info(self, obj):
        doctor = obj.appointment.doctor
        specialties = []
        if hasattr(doctor, 'staff_profile'):
            specialties = [
                s.name
                for s in doctor.staff_profile.specialties.all()
            ]
        return {
            'name': doctor.get_full_name(),
            'phone': doctor.phone,
            'specialties': specialties
        }


class MedicalRecordUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = MedicalRecord
        fields = [
            'diagnosis',
            'symptoms',
            'medical_notes',
            'follow_up_date',
        ]
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.validator = MedicalRecordDataValidator()

    def validate_diagnosis(self, value):
        self.validator.validate_diagnosis(value)
        return value
    def validate_symptoms(self, value):
        self.validator.validate_symptoms(value)
        return value
    def validate_follow_up_date(self, value):
        self.validator.validate_follow_up_date(value)
        return value
    def validate_medical_notes(self, value):
        self.validator.validate_medical_notes(value)
        return value



class MedicalRecordCreateSerializer(serializers.ModelSerializer):
    appointment_id = serializers.PrimaryKeyRelatedField(
        queryset=Appointment.objects.filter(status=Appointment.Status.CONFIRMED),
        source='appointment',
        write_only=True
    )

    prescription = PrescriptionNestedCreateSerializer(required=False)
    test_results = TestResultNestedCreateSerializer(many=True, required=False)

    class Meta:
        model = MedicalRecord
        fields = [
            'appointment_id',
            'diagnosis', 'symptoms',
            'medical_notes', 'follow_up_date',
            'prescription',
            'test_results'
        ]

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.validator = MedicalRecordDataValidator()

    def validate_diagnosis(self, value):
        self.validator.validate_diagnosis(value)
        return value
    def validate_symptoms(self, value):
        self.validator.validate_symptoms(value)
        return value
    def validate_follow_up_date(self, value):
        self.validator.validate_follow_up_date(value)
        return value
    def validate_medical_notes(self, value):
        self.validator.validate_medical_notes(value)
        return value

    def validate(self, attrs):
        appointment = attrs.get('appointment')
        request = self.context.get('request')
        self.validator.validate_create_permission(appointment,request.user  )
        return attrs

    def validate_appointment_id(self, appointment):
        if hasattr(appointment, 'medical_record'):
            raise serializers.ValidationError(
                "Lịch hẹn này đã có bệnh án rồi!"
            )
        return appointment

    def create(self, validated_data):
        prescription_data = validated_data.pop('prescription',None)
        test_results_data = validated_data.pop('test_results', [])
        appointment = validated_data.get('appointment')
        with transaction.atomic():
            medical_record = MedicalRecord.objects.create(
                appointment=appointment,
                diagnosis=validated_data.get('diagnosis'),
                symptoms=validated_data.get('symptoms'),
                medical_notes=validated_data.get('medical_notes'),
                follow_up_date=validated_data.get('follow_up_date')
            )
            for test in test_results_data:
                TestResult.objects.create(
                    medical_record=medical_record,
                    test_name=test['test_name'],
                    result=test['result']
                )

            if prescription_data:
                details_data = prescription_data.pop('details',[])
                prescription = Prescription.objects.create(
                    medical_record=medical_record,
                    instruction_notes=prescription_data.get('instruction_notes')
                )
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

        return medical_record

