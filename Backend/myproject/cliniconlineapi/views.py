from django.conf.global_settings import AUTHENTICATION_BACKENDS
from oauth2_provider.contrib.rest_framework import permissions
from rest_framework import viewsets, generics, parsers, status, pagination
from rest_framework.decorators import action
from rest_framework.response import Response
from cliniconlineapi import paginators, permission
from cliniconlineapi.models import User, Specialty, StaffProfile, WorkDay,Appointment,TimeSlot
from cliniconlineapi.serializers import userserializer
from cliniconlineapi.serializers.AppointmentSerializer import AppointmentSerializer, AppointmentDetailSerializer
from cliniconlineapi.serializers.userserializer import WorkDaySerializer, TimeSlotSerializer, SpecialtySerializer, \
    UserSerializer


class UserViewSet(viewsets.ViewSet, generics.CreateAPIView):
    queryset = User.objects.filter(is_active=True)
    serializer_class = userserializer.UserSerializer
    parser_classes = [parsers.JSONParser,
                    parsers.MultiPartParser,
                    parsers.FormParser]

    @action(methods=["GET", "PATCH"],
            url_path="profile_user",
            url_name="profile_user",
            detail=False,
            permission_classes=[permissions.IsAuthenticated])
    def profile_user(self,request):
        try:
            if request.user.role == User.Role.CUSTOMER:
                user = User.objects.select_related("customer_profile").get(id=request.user.id)
            else:
                user = User.objects.select_related("staff_profile").prefetch_related(
                    "staff_profile__specialties"
                ).get(
                    id=request.user.id
                )
        except User.DoesNotExist:
            return Response({"detail": "User not found."}, status=status.HTTP_404_NOT_FOUND)

        if request.method == "GET":
            s = userserializer.UserDetailSerializer(user, context={"request": request})
            return Response(s.data, status=status.HTTP_200_OK)

        if request.method == "PATCH":
            if user.role == User.Role.CUSTOMER:
                instance = user.customer_profile
                profile_serializer = userserializer.CustomerProfileSerializer(
                    instance, data=request.data, partial=True, context={"request": request}
                )
                profile_serializer.is_valid(raise_exception=True)
                profile_serializer.save()
            else:
                instance = user.staff_profile
                profile_serializer = userserializer.StaffProfileSerializer(
                    instance, data=request.data, partial=True, context={"request": request}
                )
                profile_serializer.is_valid(raise_exception=True)
                profile_serializer.save()

                specialty_ids = request.data.get("specialties", [])
                if specialty_ids:
                    instance.specialties.set(specialty_ids)

            return Response(
                userserializer.UserDetailSerializer(user, context={"request": request}).data,
                status=status.HTTP_200_OK
            )

    @action(methods=["GET", "POST"],
            url_path="workday_staff",
            url_name="workday_staff",
            detail=False,
            permission_classes=[permission.IsStaffRole])
    def workday_staff(self, request):
        if request.method == "POST":
            s = WorkDaySerializer(data=request.data, context={"request": request})
            s.is_valid(raise_exception=True)
            c = s.save(staff_profile=request.user.staff_profile)
            return Response(WorkDaySerializer(c).data, status=status.HTTP_201_CREATED)
        else:
            querry = WorkDay.objects.filter(staff_profile = request.user.staff_profile)
            return Response(WorkDaySerializer(querry, many=True).data, status=status.HTTP_200_OK)

    @action(
        methods=["PATCH", "DELETE"],
        url_path="workday/(?P<pk>[^/.]+)",
        url_name="workday-detail",
        detail=False,
        permission_classes=[permission.IsStaffRole]
    )
    def workday_detail(self, request, pk=None):
        pass

class DoctorProfileViewSet(viewsets.ViewSet, generics.ListAPIView):
    queryset = User.objects.filter(role=User.Role.DOCTOR).select_related("staff_profile").prefetch_related("staff_profile__specialties")
    serializer_class = userserializer.UserSerializer
    pagination_class = paginators.ItemPaginator

    @action(
        methods=["GET"],
        url_path="doctor_detail",
        url_name="doctor_detail",
        detail=True,
    )
    def doctor_detail(self, request, pk):
        user = User.objects.filter(
            role__in=[User.Role.DOCTOR, User.Role.HEALTHCARE]
        ).select_related("staff_profile").prefetch_related(
            "staff_profile__specialties",
            "staff_profile__work_days__time_slots"
        ).get(pk=pk)
        return Response(userserializer.UserDetailSerializer(user).data, status=status.HTTP_200_OK)

    @action(
        methods=["GET"],
        url_path="doctor_workday",
        url_name="doctor_workday",
        detail=True,
    )
    def doctor_workday(self, request, pk):
        W = WorkDay.objects.filter(staff_profile__user=pk).prefetch_related("time_slots")
        return Response(WorkDaySerializer(W, many=True).data, status=status.HTTP_200_OK)

class AppointmentViewSet(viewsets.ViewSet, generics.CreateAPIView, generics.ListAPIView):
    queryset = Appointment.objects.filter(active=True)
    serializer_class = AppointmentSerializer
    permission_classes = [permission.IsAppointmentOwner]

    def get_permissions(self):
        if self.action == 'create':  # ← CreateAPIView
            return [permission.IsCustomerRole()]
        return [permission.IsAppointmentOwner()]

    def get_queryset(self):
        user = self.request.user

        if user.role == "customer":
            return self.queryset.filter(customer=user)
        elif user.role == "doctor":
            return self.queryset.filter(doctor=user)

        return self.queryset.none()

    @action(methods=["GET"],
            url_path="detail",
            url_name="detail",
            detail= True,
            permission_classes=[permission.IsAppointmentOwner])
    def detail_appointment(self, request, pk):
        if(request.method == "GET"):
            s =  Appointment.objects.select_related("customer","doctor").get(pk=pk)
            return Response(AppointmentDetailSerializer(s).data, status=status.HTTP_200_OK)

class SpecialtyViewSet(viewsets.ViewSet, generics.ListAPIView):
    queryset = Specialty.objects.filter(active=True)
    serializer_class = SpecialtySerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = paginators.SpecialtyPaninator

    @action(methods=["GET"],
            url_path="doctors",
            url_name="doctors",
            detail=True,
            permission_classes=[permissions.IsAuthenticated],
            pagination_class = paginators.SpecialtyPaninator)
    def specialty_doctors(self, request,pk=None):
        q = User.objects.filter(role=User.Role.DOCTOR,staff_profile__specialties__id=pk)
        return Response(UserSerializer(q, many=True).data, status=status.HTTP_200_OK)

