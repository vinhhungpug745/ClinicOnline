from rest_framework import serializers
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from cliniconlineapi.models import Appointment, TimeSlot
from cliniconlineapi.serializers.ServiceNormalSerializer import ServiceNormalSerializer
from cliniconlineapi.serializers.userserializer import TimeSlotDetailSerializer, UserSerializer, UserDetailSerializer


class AppointmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Appointment
        fields = ['id', 'customer', 'doctor', 'time_slot',
                  'reason','symptoms', 'serviceNormal','status']
        extra_kwargs = {
            'status': {
                'required':False
            }
        }

    def validate_status(self, value):
        if self.instance:
            current_status = self.instance.status

            allowed_status = [
                Appointment.Status.CANCELED,
                Appointment.Status.CONFIRMED,
                Appointment.Status.PENDING_PAYMENT,
                Appointment.Status.COMPLETED,
            ]

            if value not in allowed_status:
                raise serializers.ValidationError("Trạng thái không hợp lệ.")

            if current_status == Appointment.Status.CANCELED and value == Appointment.Status.CONFIRMED:
                raise serializers.ValidationError("Không thể xác nhận phiếu đã bị hủy.")

            if current_status == Appointment.Status.CONFIRMED and value == Appointment.Status.CANCELED:
                raise serializers.ValidationError("Không thể hủy phiếu đã được xác nhận.")

            # validate khi hoàn thành khám
            if value == Appointment.Status.PENDING_PAYMENT:
                try:
                    record = self.instance.medical_record
                except:
                    raise serializers.ValidationError("Chưa có hồ sơ bệnh án")

                if not hasattr(record, "prescription"):
                    raise serializers.ValidationError("Chưa có đơn thuốc")

        return value

    def validate_time_slot(self, value):
        if value.status == TimeSlot.Status.BOOKED:
            raise serializers.ValidationError("Khung giờ này đã được đặt, vui lòng chọn giờ khác.")
        return value

    def to_representation(self, instance):
        data = super().to_representation(instance)

        request = self.context.get("request")
        user = request.user if request else None

        if user and user.role == "doctor":
            data["customer"] = UserSerializer(instance.customer).data
        else:
            data["doctor"] = UserSerializer(instance.doctor).data

        data["time_slot"] = TimeSlotDetailSerializer(instance.time_slot).data
        data["serviceNormal"] = ServiceNormalSerializer(instance.serviceNormal).data

        return data

    def create(self, validated_data):
        from django.db import transaction
        time_slot = validated_data.get("time_slot")

        with transaction.atomic():
            slot = TimeSlot.objects.select_for_update().get(pk=time_slot.id)

            if slot.status == TimeSlot.Status.BOOKED:
                raise serializers.ValidationError("Khung giờ này vừa được đặt, vui lòng chọn giờ khác.")

            appointment = Appointment(**validated_data)
            appointment.save()

            slot.status = TimeSlot.Status.BOOKED
            slot.save()

        return appointment

class AppointmentDetailSerializer(AppointmentSerializer):
    class Meta:
        model = Appointment
        fields = AppointmentSerializer.Meta.fields

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data["customer"] = UserDetailSerializer(instance.customer).data
        data["doctor"] = UserSerializer(instance.doctor).data
        try:
            record = instance.medical_record
            print("medicalrecord:", record)
            data["has_medical_record"] = record is not None
        except Exception as e:
            print("Exception:", e)
            data["has_medical_record"] = False
        return data

