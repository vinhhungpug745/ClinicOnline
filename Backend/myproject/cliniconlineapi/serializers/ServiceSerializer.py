from rest_framework import serializers

from cliniconlineapi.models import ServiceNormal


class ServiceNormalSerializer(serializers.ModelSerializer):
    class Meta:
        model = ServiceNormal
        fields = ['id', 'name','description', 'price']
