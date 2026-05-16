from oauth2_provider.contrib.rest_framework import permissions
from rest_framework import viewsets, generics, parsers, status, pagination
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.mixins import UpdateModelMixin
from rest_framework.response import Response
from cliniconlineapi import paginators, permission
from cliniconlineapi.models import User, Specialty, StaffProfile, WorkDay,Appointment,TimeSlot
from cliniconlineapi.serializers import userserializer, ChatBoxSerializer
from cliniconlineapi.serializers.AppointmentSerializer import AppointmentSerializer, AppointmentDetailSerializer
from cliniconlineapi.serializers.ChatBoxSerializer import GeminiChatSerializer
from cliniconlineapi.serializers.userserializer import WorkDaySerializer, TimeSlotSerializer, SpecialtySerializer, \
    UserSerializer, TimeSlotNormal, WorkDayLiteSerializer
import google.generativeai as genai

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
            instance = user
            profile_serializer = userserializer.UserDetailSerializer(
                instance, data=request.data, partial=True, context={"request": request}
            )
            profile_serializer.is_valid(raise_exception=True)
            profile_serializer.save()

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
            return Response(WorkDayLiteSerializer(querry, many=True).data, status=status.HTTP_200_OK)


    @action(
        methods=["GET", "DELETE"],
        url_path="workday/(?P<pk>[^/.]+)",
        url_name="workday-detail",
        detail=False,
        permission_classes=[permission.IsWorkdayOwner]
    )
    def workday_detail(self, request, pk=None):
        try:
            workday = WorkDay.objects.get(pk=pk, staff_profile=request.user.staff_profile)
        except WorkDay.DoesNotExist:
            return Response({"detail": "Không tìm thấy."}, status=status.HTTP_404_NOT_FOUND)

        if request.method == "GET":
            return Response(WorkDaySerializer(workday).data, status=status.HTTP_200_OK)

        if request.method == "DELETE":
            workday.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)

    @action(
        methods=["PATCH"],
        url_path="workday/(?P<pk>[^/.]+)/timeslots",
        url_name="workday-timeslots",
        detail=False,
        permission_classes=[permission.IsWorkdayOwner]
    )
    def workday_timeslots(self, request, pk=None):
        try:
            workday = WorkDay.objects.get(pk=pk, staff_profile=request.user.staff_profile)
        except WorkDay.DoesNotExist:
            return Response({"detail": "Không tìm thấy."}, status=status.HTTP_404_NOT_FOUND)

        time_slots_data = request.data.get("time_slots", [])

        workday.time_slots.all().delete()

        serializer = TimeSlotSerializer(data=time_slots_data,many=True)
        serializer.is_valid(raise_exception=True)
        serializer.save(work_day=workday)

        return Response(WorkDaySerializer(workday).data, status=status.HTTP_200_OK)

class DoctorProfileViewSet(viewsets.ViewSet, generics.ListAPIView, generics.RetrieveAPIView):
    serializer_class = userserializer.UserSerializer
    pagination_class = paginators.ItemPaginator

    def get_serializer_class(self):
        if self.action == "retrieve":
            return userserializer.UserDetailSerializer
        return userserializer.UserSerializer

    def get_queryset(self):
        if self.action == "retrieve":
            return User.objects.filter(
                role__in=[User.Role.DOCTOR, User.Role.HEALTHCARE]
            ).select_related("staff_profile").prefetch_related(
                "staff_profile__specialties",
                # "staff_profile__work_days__time_slots"
            )

        return User.objects.filter(
            role=User.Role.DOCTOR
        ).select_related("staff_profile").prefetch_related(
            "staff_profile__specialties"
        )

    @action(
        methods=["GET"],
        url_path="doctor_workday",
        url_name="doctor_workday",
        detail=True,
    )
    def doctor_workday(self, request, pk):
        if request.method == "GET":
            W = WorkDay.objects.filter(staff_profile__user=pk).prefetch_related("time_slots")
            return Response(WorkDaySerializer(W, many=True).data, status=status.HTTP_200_OK)

class AppointmentViewSet(viewsets.ViewSet,
                         generics.CreateAPIView,
                         generics.ListAPIView,
                         generics.RetrieveAPIView,
                         generics.DestroyAPIView,
                         UpdateModelMixin):
    queryset = Appointment.objects.filter(active=True)
    serializer_class = AppointmentSerializer
    permission_classes = [permission.IsAppointmentOwner]
    http_method_names = ['get', 'post', 'patch', 'delete']

    def get_permissions(self):
        if self.action == 'create':
            return [permission.IsCustomerRole()]
        if self.action == 'partial_update':
            return [permission.IsDoctorAndAppointmentOwner()]
        if self.action == 'destroy':
            return [permission.IsCustomerAndAppointmentOwner()]
        return [permission.IsAppointmentOwner()]

    def get_serializer_class(self):
        if self.action == "retrieve":
            return AppointmentDetailSerializer
        return AppointmentSerializer

    def get_queryset(self):
        user = self.request.user

        if self.action == "retrieve":
            return Appointment.objects.select_related("customer", "doctor").filter(
                active=True
            )

        if user.role == "customer":
            return self.queryset.filter(customer=user)
        elif user.role == "doctor":
            return self.queryset.filter(doctor=user)

        return self.queryset.none()

    def perform_destroy(self, instance):
        from django.utils import timezone
        from datetime import timedelta

        if instance.status != Appointment.Status.PENDING:
            raise ValidationError("Chỉ có thể xóa lịch hẹn đang chờ xác nhận.")

        if timezone.now() - instance.created_date > timedelta(hours=24):
            raise ValidationError("Không thể xóa lịch hẹn sau 24 giờ kể từ khi đặt.")

        instance.time_slot.status = TimeSlot.Status.AVAILABLE
        instance.time_slot.save()
        instance.delete()

class SpecialtyViewSet(viewsets.ViewSet, generics.ListAPIView):
    queryset = Specialty.objects.filter(active=True)
    serializer_class = SpecialtySerializer
    permission_classes = [permission.IsCustomerRole]
    pagination_class = paginators.SpecialtyPaninator

    @action(methods=["GET"],
            url_path="doctors",
            url_name="doctors",
            detail=True,
            permission_classes=[permission.IsCustomerRole],
            pagination_class = paginators.SpecialtyPaninator)
    def specialty_doctors(self, request,pk=None):
        q = User.objects.filter(role=User.Role.DOCTOR,staff_profile__specialties__id=pk)
        return Response(UserSerializer(q, many=True).data, status=status.HTTP_200_OK)

genai.configure(
    api_key="AIzaSyBBbel276NVkEA0OpKj1dFjwTqvPIjcNiA"
)

_model = None

def get_cached_model():
    global _model
    if _model is None:
        specialties = Specialty.objects.filter(active=True)
        doctors = User.objects.filter(
            role=User.Role.DOCTOR
        ).select_related("staff_profile").prefetch_related(
            "staff_profile__specialties"
        )

        dept_list = "\n".join([
            f"- {s.name}: {s.description}"
            for s in specialties
        ])

        doctor_list = "\n".join([
            f"- BS. {d.last_name} {d.first_name} "
            f"| Chuyên khoa: {', '.join(sp.name for sp in d.staff_profile.specialties.all())} "
            f"| Kinh nghiệm: {d.staff_profile.experience or 'chưa cập nhật'} năm "
            f"| Học vị: {d.staff_profile.degree or 'chưa cập nhật'}"
            for d in doctors
        ])

        prompt = f"""
Bạn là trợ lý y tế của phòng khám. Nhiệm vụ:
1. Lắng nghe triệu chứng và gợi ý chuyên khoa phù hợp
2. Gợi ý bác sĩ phù hợp với triệu chứng
3. Trả lời câu hỏi sức khỏe cơ bản

DANH SÁCH CHUYÊN KHOA:
{dept_list}

DANH SÁCH BÁC SĨ:
{doctor_list}

QUY TẮC:
- Chỉ gợi ý chuyên khoa và bác sĩ có trong danh sách trên
- Không chẩn đoán bệnh cụ thể
- Triệu chứng nghiêm trọng → khuyên đến cấp cứu ngay
- Trả lời tiếng Việt, thân thiện, ngắn gọn
- Câu hỏi không liên quan y tế → từ chối lịch sự
"""
        _model = genai.GenerativeModel(
            model_name="models/gemini-2.5-flash-lite",
            system_instruction=prompt
        )
    return _model

class GeminiChatViewSet(viewsets.ViewSet, generics.CreateAPIView):

    permission_classes = [permissions.IsAuthenticated]

    serializer_class = GeminiChatSerializer

    def create(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        message = serializer.validated_data["message"]
        try:
            response = get_cached_model().generate_content(message)
            return Response({"reply": response.text})

        except Exception as e:
            return Response({"error": str(e)},status=status.HTTP_500_INTERNAL_SERVER_ERROR)

