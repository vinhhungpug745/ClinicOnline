from django.db import transaction
from rest_framework import serializers

from cliniconlineapi.models import TestResult, MedicalRecord, Test
from cliniconlineapi.validators import TestResultDataValidator


class TestSerializer(serializers.ModelSerializer):
    class Meta:
        model = Test
        fields = ['id', 'name', 'price', 'description']

class TestResultSerializer(serializers.ModelSerializer):
    test = TestSerializer(read_only=True)
    class Meta:
        model = TestResult
        fields = ['id', 'test', 'result', 'file', 'created_date']


class TestResultNestedCreateSerializer(serializers.ModelSerializer):
    test_id = serializers.PrimaryKeyRelatedField(queryset=Test.objects.all(),source='test', write_only=True)
    class Meta:
        model = TestResult
        fields = ['test_id', 'result','file']

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.validator = TestResultDataValidator()

    def validate_test(self, value):
        if not value:
            raise serializers.ValidationError("Phải chọn loại xét nghiệm")
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
    test_id = serializers.PrimaryKeyRelatedField(
        queryset=Test.objects.all(),
        source='test',
        write_only=True
    )

    class Meta:
        model = TestResult
        fields = ['medical_record_id', 'test_id', 'result','file']

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.validator = TestResultDataValidator()

    def validate_test(self, value):
        if not value:
            raise serializers.ValidationError("Phải chọn loại xét nghiệm")
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
                        test=test['test'],
                        result=test['result'],
                        file=test.get('file', None),
                    )
                )
        return created

class TestResultUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = TestResult
        fields = ['result','file']

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.validator = TestResultDataValidator()


    def validate_result(self, value):
        self.validator.validate_result(value)
        return value

    def validate(self, attrs):
        request = self.context.get('request')
        self.validator.validate_update_permission(self.instance, request.user)
        return attrs