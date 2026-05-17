from django.db import transaction
from rest_framework import serializers

from cliniconlineapi.models import TestResult, MedicalRecord
from cliniconlineapi.validators import TestResultDataValidator


class TestResultSerializer(serializers.ModelSerializer):
    class Meta:
        model = TestResult
        fields = ['id', 'test_name', 'result']


class TestResultNestedCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = TestResult
        fields = ['test_name', 'result']

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.validator = TestResultDataValidator()

    def validate_test_name(self, value):
        self.validator.validate_test_name(value)
        return value

    def validate_result(self, value):
        self.validator.validate_result(value)
        return value


class TestResultCreateSerializer(serializers.ModelSerializer):
    medical_record_id = serializers.PrimaryKeyRelatedField(
        queryset=MedicalRecord.objects.filter(active=True),
        source='medical_record',
        write_only=True
    )

    class Meta:
        model = TestResult
        fields = ['medical_record_id', 'test_name', 'result']

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.validator = TestResultDataValidator()

    def validate_test_name(self, value):
        self.validator.validate_test_name(value)
        return value

    def validate_result(self, value):
        self.validator.validate_result(value)
        return value

    def validate(self, attrs):
        medical_record = attrs.get('medical_record')
        request = self.context.get('request')
        self.validator.validate_create_permission(medical_record, request.user)
        return attrs

class TestResultBulkCreateSerializer(serializers.Serializer):
    medical_record_id = serializers.PrimaryKeyRelatedField(
        queryset=MedicalRecord.objects.filter(active=True),
        source='medical_record',
    )
    test_results = TestResultNestedCreateSerializer(many=True, required=True)

    def validate_medical_record_id(self, medical_record):
        return medical_record

    def validate_test_results(self, value):
        if not value:
            raise serializers.ValidationError("Phải có ít nhất 1 kết quả xét nghiệm")
        return value

    def validate(self, attrs):
        medical_record = attrs.get('medical_record')
        request = self.context.get('request')
        validator = TestResultDataValidator()
        validator.validate_create_permission(medical_record, request.user)
        return attrs

    def create(self, validated_data):
        medical_record = validated_data['medical_record']
        test_results_data = validated_data['test_results']
        created = []
        with transaction.atomic():
            for test in test_results_data:
                created.append(
                    TestResult.objects.create(
                        medical_record=medical_record,
                        test_name=test['test_name'],
                        result=test['result']
                    )
                )
        return created

class TestResultUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = TestResult
        fields = ['test_name', 'result']

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.validator = TestResultDataValidator()

    def validate_test_name(self, value):
        self.validator.validate_test_name(value)
        return value

    def validate_result(self, value):
        self.validator.validate_result(value)
        return value