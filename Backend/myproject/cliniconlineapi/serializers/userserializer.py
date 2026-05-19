from calendar import monthrange

from cloudinary import CloudinaryResource
from rest_framework import serializers
from rest_framework.exceptions import ValidationError
from cliniconlineapi.models import User, StaffProfile, CustomerProfile, Specialty, StaffSpecialty, WorkDay, TimeSlot
from cliniconlineapi.validators import NameValidator, PhoneNumberValidator, MaxLengthValidator, MinLengthValidator
from datetime import date, datetime

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'first_name', 'last_name', 'avatar', 'phone', 'email','dob',
                  'username', 'password','gender',
                  'role']
        extra_kwargs = {
            'password': {
                'write_only': True,
            },
            'username': {
                'write_only': True,
            },
            'avatar': {'required': False},
        }

    def to_representation(self, instance):
        data = super().to_representation(instance)
        if instance.avatar:
            data['avatar'] = instance.avatar.url
        return data

    def validate_phone(self, value):
        if value: PhoneNumberValidator()(value)
        return value

    def validate_avatar(self, value):

        if isinstance(value, CloudinaryResource):
            return value  # đã upload rồi, bỏ qua validate

        if value.size > 5 * 1024 * 1024:
            raise serializers.ValidationError("Ảnh không được vượt quá 5MB.")

        allowed_types = ["image/jpeg", "image/png"]
        if value.content_type not in allowed_types:
            raise serializers.ValidationError("Chỉ chấp nhận ảnh JPG, PNG")

        return value

    def validate_first_name(self, value):
        if value: NameValidator(2,20,
                                "Họ tên phải có ít nhất 2 ký tự!",
                                "Họ tên tối đa 20 ký tự!")(value)
        return value

    def validate_last_name(self, value):
        if value:
            NameValidator(2,20,"Họ tên phải có ít nhất 2 ký tự!",
                                "Họ tên tối đa 20 ký tự!")(value)
        return value

    def validate_password(self, value):
        MinLengthValidator(6, message="Mật khẩu phải có ít nhất 6 ký tự.")(value)
        return value

    def validate_role(self, value):
        request = self.context.get("request")
        user = request.user if request else None
        if value != User.Role.CUSTOMER:
            if not (user and user.is_staff):
                raise serializers.ValidationError("Chỉ admin mới có thể gán quyền này.")
        return value

    def create(self, validated_data):
        profile_data = validated_data.pop('profile', {})
        user = User(**validated_data)
        user.set_password(user.password)
        user.save()
        if user.role in [User.Role.DOCTOR, User.Role.HEALTHCARE]:
            StaffProfile.objects.create(user=user)
        elif user.role == User.Role.CUSTOMER:
            CustomerProfile.objects.create(
                user=user,
                height=profile_data.get('height'),
                weight=profile_data.get('weight'),
                insurance_number=profile_data.get('insurance_number'),
                insurance_expiry_date = profile_data.get('insurance_expiry_date'),
                allergy_history = profile_data.get('allergy_history'),
            )
        return user

class UserDetailSerializer(UserSerializer):
    profile = serializers.DictField(required=False)

    class Meta:
        model = UserSerializer.Meta.model
        fields = UserSerializer.Meta.fields + ['profile']

        extra_kwargs = UserSerializer.Meta.extra_kwargs

    def to_representation(self, instance):
        data = super().to_representation(instance)
        if instance.role == User.Role.CUSTOMER:
            data["profile"] = CustomerProfileSerializer(instance.customer_profile).data
        else:
            data["profile"] = StaffProfileDetailSerializer(instance.staff_profile).data
        return data

    def update(self, instance, validated_data):
        profile_data = validated_data.pop('profile', None)
        instance = super().update(instance, validated_data)

        if profile_data:
            if instance.role == User.Role.CUSTOMER:
                serializer = CustomerProfileSerializer(
                    instance.customer_profile,
                    data=profile_data,
                    partial=True
                )
            else:
                serializer = StaffProfileDetailSerializer(
                    instance.staff_profile,
                    data=profile_data,
                    partial=True
                )
            serializer.is_valid(raise_exception=True)
            serializer.save()

        return instance

class DoctorSerializer(UserSerializer):
    price = serializers.FloatField(
        source='staff_profile.price',
        read_only=True
    )

    class Meta:
        model = UserSerializer.Meta.model
        fields = UserSerializer.Meta.fields + ['price']

class SpecialtySerializer(serializers.ModelSerializer):
    class Meta:
        model = Specialty
        fields = ["id", "name", "description"]


class TimeSlotNormal(serializers.ModelSerializer):
    class Meta:
        model = TimeSlot
        fields = ["id", "status"]

class TimeSlotSerializer(TimeSlotNormal):
    id = serializers.IntegerField(required=False)
    class Meta:
        model = TimeSlotNormal.Meta.model
        fields = TimeSlotNormal.Meta.fields + ["start_time", "end_time"]

    def to_internal_value(self, data):
        data = data.copy()
        data.pop("work_day", None)
        return super().to_internal_value(data)

    def validate(self, attrs):
        if attrs["start_time"] >= attrs["end_time"]:
            raise serializers.ValidationError("start_time phải nhỏ hơn end_time.")
        return attrs

    def validate_time_slots(self, value):
        if not value:
            raise serializers.ValidationError("Phải có ít nhất 1 time slot.")

        # sort theo start_time
        sorted_slots = sorted(value, key=lambda x: x["start_time"])

        for i in range(len(sorted_slots) - 1):
            current = sorted_slots[i]
            next_slot = sorted_slots[i + 1]

            if current["end_time"] > next_slot["start_time"]:
                raise serializers.ValidationError(
                    "Các time slot bị trùng hoặc chồng lấn thời gian."
                )

        return value

class TimeSlotDetailSerializer(TimeSlotSerializer):
    class Meta:
        model = TimeSlotSerializer.Meta.model
        fields = TimeSlotSerializer.Meta.fields

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['work_day'] = WorkDayLiteSerializer(instance.work_day).data
        return data


class WorkDayLiteSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkDay
        fields = ["id", "date"]

    def validate_date(self ,value):
        today = date.today()
        last_day = monthrange(today.year, today.month)[1]
        end_of_month = today.replace(day=last_day)

        if value > end_of_month:
            raise serializers.ValidationError("Chỉ được đặt lịch trong tháng hiện tại.")
        if value < today:
            raise serializers.ValidationError("Không được đặt lịch trong quá khứ.")

        return value

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data["day_of_week"] = instance.date.strftime("%A")
        return data

# chưa validate
class WorkDaySerializer(WorkDayLiteSerializer):
    time_slots = TimeSlotSerializer(many=True)

    class Meta:
        model = WorkDayLiteSerializer.Meta.model
        fields = WorkDayLiteSerializer.Meta.fields + ['time_slots']

    def create(self, validated_data):
        time_slots_data = validated_data.pop("time_slots", [])
        workday = WorkDay.objects.create(**validated_data)
        for slot in time_slots_data:
            TimeSlot.objects.create(work_day=workday, **slot)
        return workday

class StaffProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = StaffProfile
        fields = ["id", "specialties", "degree", "experience", "bio", "price"]

    def to_representation(self, instance):
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

class StaffProfileDetailSerializer(StaffProfileSerializer):
    class Meta:
        model = StaffProfileSerializer.Meta.model
        fields = StaffProfileSerializer.Meta.fields

    # def to_representation(self, instance):
    #     data = super().to_representation(instance)
    #     data["workday_set"] = WorkDaySerializer(instance.work_days.all(), many=True).data
    #     return data

class CustomerProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomerProfile
        fields = ["height", "weight","insurance_number","insurance_expiry_date","allergy_history","blood_group"]

    def validate_height(self, value):
        if value is not None and (value < 50 or value > 300):
            raise serializers.ValidationError("Chiều cao không hợp lệ.")
        return value

    def validate_weight(self, value):
        if value is not None and (value < 2 or value > 500):
            raise serializers.ValidationError("Cân nặng không hợp lệ.")
        return value

    def validate_insurance_number(self, value):
        if value and len(value) < 5:
            raise serializers.ValidationError("Số BHYT không hợp lệ.")
        return value

    def validate_insurance_expiry_date(self, value):
        if value and value < date.today():
            raise serializers.ValidationError("BHYT đã hết hạn.")
        return value








