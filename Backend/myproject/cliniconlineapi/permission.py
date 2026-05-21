from django.contrib.auth.models import PermissionsMixin
from rest_framework.permissions import BasePermission, IsAuthenticated
from cliniconlineapi.models import User


class IsStaffRole(IsAuthenticated):
    def has_permission(self, request, view):
        return (
            super().has_permission(request, view) and
            request.user.role in [User.Role.DOCTOR, User.Role.HEALTHCARE]
        )

class IsCustomerRole(IsAuthenticated):
    def has_permission(self, request, view):
        return (
            super().has_permission(request, view) and
            request.user.role == User.Role.CUSTOMER
        )

class IsDoctorRole(IsAuthenticated):
    def has_permission(self, request, view):
        return (
                super().has_permission(request, view) and
                request.user.role == User.Role.DOCTOR
        )

class IsAdminRole(IsAuthenticated):
    def has_permission(self, request, view):
        return (
                super().has_permission(request, view) and
                request.user.is_superuser
        )

class IsHealthcareRole(IsAuthenticated):
    def has_permission(self, request, view):
        return (
                super().has_permission(request, view) and
                request.user.role == User.Role.HEALTHCARE
        )

class IsAppointmentOwner(IsAuthenticated):
    def has_object_permission(self, request, view, Appointment):
        return (
                super().has_permission(request, view) and
                ((request.user == Appointment.customer) or (request.user == Appointment.doctor))
        )

class IsDoctorAndAppointmentOwner(IsAppointmentOwner):
    def has_object_permission(self, request, view, Appointment):
        return (
                super().has_permission(request, view) and
                request.user.role == User.Role.DOCTOR and
                request.user == Appointment.doctor
        )

class IsOwner(BasePermission):
    def has_object_permission(self, request, view, obj):

        # Customer là chủ lịch hẹn
        if request.user.role == User.Role.CUSTOMER:
            return (
                super().has_object_permission(request, view) and
                request.user == obj.appointment.customer
            )

        # Doctor là bác sĩ của lịch hẹn
        elif request.user.role == User.Role.DOCTOR:
            return (
                    super().has_object_permission(request, view) and
                    request.user == obj.appointment.doctor
            )

        return False


class IsDoctorAndMedicalRecordOwner(IsAppointmentOwner):
    def has_object_permission(self, request, view,MedicalRecord):
        return (
                super().has_permission(request, view) and
                request.user.role == User.Role.DOCTOR and
                request.user == MedicalRecord.appointment.doctor
        )

class IsDoctorAndTestResultOwner(IsAppointmentOwner):
    def has_object_permission(self, request, view,TestResult):
        return (
                super().has_permission(request, view) and
                request.user.role == User.Role.DOCTOR and
                request.user == TestResult.MedicalRecord.appointment.doctor
        )

class IsCustomerAndAppointmentOwner(IsAppointmentOwner):
    def has_object_permission(self, request, view, Appointment):
        return (
                super().has_permission(request, view) and
                request.user.role == User.Role.CUSTOMER and
                request.user == Appointment.customer
        )

class IsWorkdayOwner(IsAuthenticated):
    def has_object_permission(self, request, view, Workday):
        return (
            super().has_permission(request, view) and
            request.user.Role in [User.Role.DOCTOR, User.Role.HEALTHCARE] and
            request.user == Workday.staff_profile.user
        )


