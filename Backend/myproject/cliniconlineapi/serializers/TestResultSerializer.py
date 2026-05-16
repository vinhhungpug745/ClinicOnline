from rest_framework import serializers

from cliniconlineapi.models import TestResult


class TestResultSerializer(serializers.ModelSerializer):
    class Meta:
        model = TestResult
        fields = ['id', 'test_name', 'result', 'file', 'created_date']
