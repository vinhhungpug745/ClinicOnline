from datetime import date, timedelta

from django.db.models import Q
from oauth2_provider.contrib.rest_framework import permissions
from rest_framework import viewsets, generics, parsers, status, pagination
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.generics import get_object_or_404
from rest_framework.mixins import UpdateModelMixin
from rest_framework.response import Response
from cliniconlineapi import paginators, permission
from cliniconlineapi.models import User, Specialty, StaffProfile, WorkDay,Appointment,TimeSlot, Medicine, MedicalRecord, TestResult, Prescription
from cliniconlineapi.serializers import userserializer, ChatBoxSerializer
from cliniconlineapi.serializers.AppointmentSerializer import AppointmentSerializer, AppointmentDetailSerializer
from cliniconlineapi.serializers.ChatBoxSerializer import GeminiChatSerializer
from cliniconlineapi.serializers.MedicalRecordSerializer import MedicalRecordUpdateSerializer, \
    MedicalRecordCreateSerializer, MedicalRecordDetailSerializer, MedicalRecordListSerializer
from cliniconlineapi.serializers.MedicalSerializer import PrescriptionDetailedSerializer, PrescriptionCreateSerializer, \
    MedicineSerializer
from cliniconlineapi.serializers.userserializer import WorkDaySerializer, TimeSlotSerializer, SpecialtySerializer, \
    WorkDayLiteSerializer, DoctorSerializer
import google.generativeai as genai

from cliniconlineapi.validators import MedicalRecordDataValidator

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

        query = User.objects.filter(
            role=User.Role.DOCTOR
        ).select_related("staff_profile").prefetch_related(
            "staff_profile__specialties"
        )

        q = self.request.GET.get("q", None)

        if q:
            query = query.filter(Q(first_name__icontains=q) | Q(last_name__icontains=q) | Q(staff_profile__specialties__name__icontains=q))

        return query

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
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = paginators.SpecialtyPaninator

    @action(methods=["GET"],
            url_path="doctors",
            url_name="doctors",
            detail=True,
            permission_classes=[permissions.IsAuthenticated], #chưa quuyen
            pagination_class = paginators.SpecialtyPaninator)
    def specialty_doctors(self, request,pk=None):
        q = User.objects.select_related('staff_profile').filter(
            role=User.Role.DOCTOR,
            staff_profile__specialties__id=pk
        ).select_related('staff_profile')
        return Response(DoctorSerializer(q, many=True).data, status=status.HTTP_200_OK)

    def get_queryset(self):
        query = Specialty.objects.filter(active=True)

        q = self.request.GET.get("q", None)

        if q:
            query = query.filter(Q(name__icontains=q))

        return query

genai.configure(
    api_key="AIzaSyAN5g621nGyKmHN6ZgQ6NlPM2GfdhzHeLY"
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

class MedicineViewSet(viewsets.ViewSet,generics.ListCreateAPIView):
    serializer_class = MedicineSerializer
    queryset = Medicine.objects.filter(active=True)


    def get_permissions(self):
        if self.action in ['create', 'update_stock',
                           'low_stock', 'expiring_soon']:
            return [permission.IsHealthcareRole()]

        if self.action in ['list']:
            return [permission.IsStaffRole()]

        return [permission.IsAuthenticated()]

    """Xem danh sách thuốc"""
    def list(self, request):
        queryset = self.queryset
        serializer = MedicineSerializer(queryset, many=True)
        return Response(serializer.data)


    """Nhân viên y tế thêm thuốc mới"""
    def create(self,request):
        s = MedicineSerializer(data=request.data)
        s.is_valid(raise_exception=True)
        s.save()
        return Response(s.data,status=status.HTTP_201_CREATED)

    """NV y tế cập nhật stock"""
    @action(methods=["PATCH"],detail=True, url_path="update_stock")
    def update_stock(self,request,pk=None):
        medicine = get_object_or_404(Medicine, pk=pk,active=True)
        s = MedicineSerializer(medicine,data=request.data,partial=True)
        s.is_valid(raise_exception=True)
        s.save()
        return Response(s.data, status=status.HTTP_200_OK)

    """ Thuốc sắp hết """
    @action(methods=["GET"], detail=False, url_path="low_stock")
    def low_stock(self,request):
        medicines = Medicine.objects.filter(
            stock__lt=10,
            active=True
        )
        return Response(MedicineSerializer(medicines, many=True).data)

    """ Thuốc sắp hết hạn """
    @action(methods=["GET"], detail=False, url_path="expiring_soon")
    def expiring_soon(self,request):
        threshold = date.today() + timedelta(days=30)
        medicines = Medicine.objects.filter(
            expiry_date__lte=threshold,
            active=True
        )
        return Response(MedicineSerializer(medicines, many=True).data)


class PrescriptionViewSet(viewsets.ViewSet, generics.ListAPIView):
    queryset = Prescription.objects.filter(active=True)
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = self.queryset.select_related(
            'medical_record__appointment__customer',
            'medical_record__appointment__doctor'
        )
        # Doctor
        if user.role == "doctor":
            return qs.filter(medical_record__appointment__doctor=user)
        # Customer
        elif user.role == "customer":
            return qs.filter(medical_record__appointment__customer=user)
        return qs.none()

    def list(self,request):
        queryset = self.queryset
        serializer = PrescriptionDetailedSerializer(queryset, many=True)
        return Response(serializer.data)

    @action(
        methods=['POST'],
        detail=False,
        url_path='create',
        permission_classes=[permission.IsDoctorRole]
    )
    def create_prescription(self,request):
        serializer = PrescriptionCreateSerializer(
                            data=request.data,
                            context={'request': request}
                          )
        serializer.is_valid(raise_exception=True)
        prescription = serializer.save()
        return Response(
                PrescriptionDetailedSerializer(prescription).data,
                status=status.HTTP_201_CREATED
                )


#Bệnh án
class MedicalRecordViewSet(viewsets.ViewSet, generics.ListAPIView):
    queryset = MedicalRecord.objects.filter(active=True)
    serializer_class = MedicalRecordListSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = self.queryset.select_related('appointment__customer','appointment__doctor')
        # Bác sĩ chỉ thấy bệnh án của mình
        if user.role == "doctor":
            return qs.filter(appointment__doctor=user)
        # Customer chỉ thấy bệnh án của mình
        elif user.role == "customer":
            return qs.filter(appointment__customer=user)

        return qs.none()

    def list(self, request):
        queryset = self.queryset
        serializer = MedicalRecordListSerializer(queryset, many=True)
        return Response(serializer.data)

    @action(
        methods=['GET'],
        detail=True,
        url_path='detail',
        permission_classes=[permissions.IsAuthenticated]
    )
    def get_detail(self, request, pk):
        medical_record = get_object_or_404(
            MedicalRecord.objects.prefetch_related(
                'test_results',
                'prescription__details__medicine',
            ).select_related(
                'appointment__customer',
                'appointment__doctor',
            ),
            pk=pk,
            active=True
        )
        return Response(
            MedicalRecordDetailSerializer(medical_record).data,
            status=status.HTTP_200_OK
        )


    @action(
        methods=['POST'],
        detail=False,
        url_path='create',
        permission_classes=[permission.IsDoctorRole]
    )
    def create_medical_record(self, request):
        serializer = MedicalRecordCreateSerializer(
            data=request.data,
            context={'request': request}
        )
        if serializer.is_valid():
            medical_record = serializer.save()
            return Response(
                MedicalRecordDetailSerializer(
                    medical_record,
                    context={'request': request}
                ).data,
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


    @action(
        methods=['PATCH'],
        detail=True,
        url_path='update',
        permission_classes=[permission.IsDoctorRole]
    )
    def update_medical_record(self, request, pk):
        medical_record = get_object_or_404(MedicalRecord, pk=pk, active=True)

        validator = MedicalRecordDataValidator()
        validator.validate_update_permission(medical_record,request.user)

        serializer = MedicalRecordUpdateSerializer(
            medical_record,
            data=request.data,
            partial=True,
            context={'request': request}
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # Kê đơn và gửi trực tuyến cho bệnh nhân
    @action(
        methods=['POST'],
        detail=True,
        url_path='send-prescription',
        permission_classes=[permission.IsDoctorRole]
    )
    def send_prescription(self, request, pk):
        medical_record = get_object_or_404(
            MedicalRecord, pk=pk, active=True
        )

        # Kiểm tra đã có đơn chưa
        if hasattr(medical_record, 'prescription') and medical_record.prescription:
            return Response(
                {'detail': 'Bệnh án này đã có đơn thuốc'},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = PrescriptionCreateSerializer(
            data=request.data,
            context={'request': request, 'medical_record': medical_record}
        )
        if serializer.is_valid():
            prescription = serializer.save(medical_record=medical_record)

            # Gửi đơn thuốc cho bệnh nhân (email/notification)
            self._send_prescription_to_patient(medical_record, prescription)

            return Response(
                PrescriptionDetailedSerializer(prescription).data,
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def _send_prescription_to_patient(self, medical_record, prescription):
        """Gửi đơn thuốc cho bệnh nhân"""
        customer = medical_record.appointment.customer
        # TODO: tích hợp email/notification service
        # send_email(customer.email, prescription)
        # send_notification(customer.id, prescription)
        pass
