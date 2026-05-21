from rest_framework import serializers
from rest_framework.exceptions import ValidationError
from cliniconlineapi.models import StaffProfile
from cliniconlineapi.serializers.userserializer import UserSerializer


class StaffProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = StaffProfile
        fields = ["id", "specialties", "degree", "experience", "bio", "price"]

    def to_representation(self, instance):
        from cliniconlineapi.serializers.userserializer import WorkDayLiteSerializer,SpecialtySerializer
        data = super().to_representation(instance)
        data["workday_set"] = WorkDayLiteSerializer(instance.work_days.all(), many=True).data
        data["specialties"] = SpecialtySerializer(instance.specialties.all(), many=True).data
        return data

    def validate_experience(self, value):
        if value:
            if value > 98:
                raise ValidationError("ko dược lớn hơn 98")
            elif value < 2:
                raise ValidationError("ko dược nhỏ hơn 1")
        return value

class StaffProfileLiteSerializer(StaffProfileSerializer):
    def to_representation(self, instance):
        from cliniconlineapi.serializers.userserializer import SpecialtySerializer
        data = super(StaffProfileSerializer, self).to_representation(instance)  # bỏ qua to_representation của parent
        data["specialties"] = SpecialtySerializer(instance.specialties.all(), many=True).data
        return data

class DoctorSerializer(UserSerializer):
    price = serializers.FloatField(
        source='staff_profile.price',
        read_only=True
    )

    class Meta:
        model = UserSerializer.Meta.model
        fields = UserSerializer.Meta.fields + ['price']
        extra_kwargs = UserSerializer.Meta.extra_kwargs


class DoctorProfileSerializer(DoctorSerializer):
    profile = StaffProfileLiteSerializer(source='staff_profile', read_only=True)

    class Meta:
        model = DoctorSerializer.Meta.model
        fields = DoctorSerializer.Meta.fields + ['profile']
