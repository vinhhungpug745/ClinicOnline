from datetime import date

from django.db import transaction
from rest_framework import serializers

from cliniconlineapi.models import MedicalRecord, Appointment, Prescription, PrescriptionDetail, TestResult
from cliniconlineapi.serializers.AppointmentSerializer import AppointmentSerializer
from cliniconlineapi.serializers.MedicalSerializer import PrescriptionCreateSerializer, PrescriptionDetailedSerializer,PrescriptionNestedCreateSerializer
from cliniconlineapi.serializers.TestResultSerializer import TestResultSerializer, TestResultCreateSerializer, \
    TestResultNestedCreateSerializer
from cliniconlineapi.validators import MedicalRecordDataValidator


class MedicalRecordListSerializer(serializers.ModelSerializer):
    doctor = serializers.SerializerMethodField()
    customer = serializers.SerializerMethodField()
    has_prescription = serializers.SerializerMethodField()
    has_test_result = serializers.SerializerMethodField()
    test_result_count = serializers.SerializerMethodField()


    class Meta:
        model = MedicalRecord
        fields = [
            'id',
            'doctor',
            'customer',
            'diagnosis',
            'symptoms',
            'follow_up_date',
            'has_prescription',
            'has_test_result',
            'test_result_count',
            'created_date'
        ]

    def get_doctor(self, obj):
        doctor = obj.appointment.doctor
        return {
            "id": doctor.id,
            "first_name": doctor.first_name,
            "last_name": doctor.last_name,
            "avatar": doctor.avatar.url if doctor.avatar else None,
        }

    def get_customer(self, obj):
        customer = obj.appointment.customer
        return {
            "id": customer.id,
            "first_name": customer.first_name,
            "last_name": customer.last_name,
            "avatar": customer.avatar.url if customer.avatar else None,
        }

    def get_has_prescription(self, obj):
        try:
            return obj.prescription is not None
        except Prescription.DoesNotExist:
            return False

    def get_has_test_result(self, obj):
        return obj.test_results.exists()

    def get_test_result_count(self, obj):
        return obj.test_results.count()

class MedicalRecordDetailSerializer(serializers.ModelSerializer):
    appointment_id = serializers.IntegerField(source='appointment.id', read_only=True)
    customer = serializers.SerializerMethodField()
    doctor = serializers.SerializerMethodField()
    appointment_date = serializers.DateTimeField(source='appointment.appointment_date',read_only=True)
    prescription = PrescriptionDetailedSerializer(read_only=True)
    test_results = TestResultSerializer(many=True, read_only=True)

    class Meta:
        model = MedicalRecord
        fields = [
            'id',
            'appointment_id',
            'customer',
            'doctor',
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


    def get_customer(self, obj):
        customer = obj.appointment.customer
        profile = getattr(customer, 'customer_profile', None)
        return {
            "id": customer.id,
            "first_name": customer.first_name,
            "last_name": customer.last_name,
            "phone": customer.phone,
            "email": customer.email,
            "gender": customer.gender,
            "dob": customer.dob,
            "profile": {
                "insurance_number": profile.insurance_number if profile else None,
                "insurance_expiry_date": profile.insurance_expiry_date if profile else None,
                "blood_group": profile.blood_group if profile else None,
                "allergy_history": profile.allergy_history if profile else None,
                "height": profile.height if profile else None,
                "weight": profile.weight if profile else None,
            } if profile else None,
        }

    #Lấy thong tin bác sĩ cho hồ sơ bênh án nếu cần
    def get_doctor(self, obj):
        doctor = obj.appointment.doctor
        specialties = []
        if hasattr(doctor, 'staff_profile'):
            specialties = [
                s.name
                for s in doctor.staff_profile.specialties.all()
            ]
        return {
            "first_name": doctor.first_name,
            "last_name": doctor.last_name,
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
            for test_data in test_results_data:
                TestResult.objects.create(
                    medical_record=medical_record,
                    test=test_data['test'],
                    result=test_data['result'],
                    file=test_data.get('file')
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

