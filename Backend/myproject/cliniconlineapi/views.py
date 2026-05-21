import os
from datetime import date, timedelta

from django.db.models import Count, Q, Case, When, Value, CharField, Sum, F
from django.db.models.functions import ExtractYear, TruncMonth
from drf_yasg import openapi
from drf_yasg.utils import swagger_auto_schema
from oauth2_provider.contrib.rest_framework import permissions
from django.utils.timezone import now
from rest_framework import viewsets, generics, parsers, status, permissions, pagination
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.generics import get_object_or_404
from rest_framework.mixins import UpdateModelMixin
from rest_framework.response import Response
from rest_framework.views import APIView
from cliniconlineapi import paginators, permission
from cliniconlineapi.serializers import userserializer, ChatBoxSerializer
from cliniconlineapi.models import User, Specialty, WorkDay, Appointment, TimeSlot, Medicine, MedicalRecord, TestResult, \
    Prescription, ServiceNormal,PrescriptionDetail, Test
from cliniconlineapi.serializers import userserializer, StaffSerializer
from cliniconlineapi.serializers.AppointmentSerializer import AppointmentSerializer, AppointmentDetailSerializer
from cliniconlineapi.serializers.ChatBoxSerializer import GeminiChatSerializer
from cliniconlineapi.serializers.MedicalRecordSerializer import MedicalRecordUpdateSerializer, \
    MedicalRecordCreateSerializer, MedicalRecordDetailSerializer, MedicalRecordListSerializer
from cliniconlineapi.serializers.MedicalSerializer import PrescriptionDetailedSerializer, PrescriptionCreateSerializer, \
    MedicineSerializer, PrescriptionUpdateSerializer
from cliniconlineapi.serializers.ServiceSerializer import ServiceNormalSerializer
from cliniconlineapi.serializers.TestResultSerializer import TestResultSerializer, TestResultCreateSerializer, \
    TestResultUpdateSerializer, TestResultBulkCreateSerializer, TestSerializer
from cliniconlineapi.serializers.userserializer import WorkDaySerializer, TimeSlotSerializer, SpecialtySerializer, \
    WorkDayLiteSerializer
from cliniconlineapi.serializers.StaffSerializer import DoctorSerializer
import google.generativeai as genai
from cliniconlineapi.validators import MedicalRecordDataValidator, PrescriptionDataValidator, TestResultDataValidator

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
            if request.user.role in [User.Role.HEALTHCARE, User.Role.DOCTOR]:
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

        protected_ids = set(
            workday.time_slots
            .filter(appointment_time_slot__isnull=False)
            .values_list('id', flat=True)
        )

        workday.time_slots.filter(appointment_time_slot__isnull=True).delete()

        new_slots = [s for s in time_slots_data if s.get('id') not in protected_ids]

        for slot in new_slots:
            slot.pop('id', None)

        serializer = TimeSlotSerializer(data=new_slots, many=True)
        serializer.is_valid(raise_exception=True)
        serializer.save(work_day=workday)

        return Response(WorkDaySerializer(workday).data, status=status.HTTP_200_OK)

class DoctorProfileViewSet(viewsets.ViewSet, generics.ListAPIView, generics.RetrieveAPIView):
    pagination_class = paginators.ItemPaginator

    def get_permissions(self):
        if self.action == "retrieve":
            return  [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def get_serializer_class(self):
        if self.action == "retrieve":
            return StaffSerializer.DoctorProfileSerializer
        return StaffSerializer.DoctorSerializer

    def get_queryset(self):
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
        permission_classes=[permissions.IsAuthenticated]
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

    def perform_update(self, serializer):
        instance = self.get_object()

        if instance.status != Appointment.Status.PENDING:
            raise ValidationError("Chỉ có thể cập nhật lịch hẹn đang chờ xác nhận.")

        updated = serializer.save()

        if updated.status == Appointment.Status.CANCELED:
            updated.time_slot.status = TimeSlot.Status.AVAILABLE
            updated.time_slot.save()

    def perform_destroy(self, instance):

        if instance.status not in [Appointment.Status.PENDING, Appointment.Status.CANCELED]:
            raise ValidationError("Chỉ có thể xóa lịch hẹn đang chờ xác nhận hoặc từ chối.")

        if instance.status == Appointment.Status.PENDING and now() - instance.created_date > timedelta(hours=24):
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

class ServiceNormalViewSet(viewsets.ViewSet, generics.ListAPIView):
    queryset = ServiceNormal.objects.all()
    serializer_class = ServiceNormalSerializer
    permission_classes = [permissions.IsAuthenticated]

genai.configure(
    api_key=os.getenv('GENIA_API_KEY'),
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
    pagination_class = [paginators.SpecialtyPaninator]


    def get_permissions(self):
        if self.action in ['create', 'update_stock',
                           'low_stock', 'expiring_soon']:
            return [permission.IsHealthcareRole()]


        return [permission.IsStaffRole()]


    def list(self, request, *args, **kwargs):
        queryset = self.queryset
        serializer = MedicineSerializer(queryset, many=True)
        return Response(serializer.data)



    def create(self,request, *args, **kwargs):
        s = MedicineSerializer(data=request.data)
        s.is_valid(raise_exception=True)
        s.save()
        return Response(s.data,status=status.HTTP_201_CREATED)


    @action(methods=["PATCH"],detail=True, url_path="update_stock")
    def update_stock(self,request,pk=None):
        medicine = get_object_or_404(Medicine, pk=pk,active=True)
        s = MedicineSerializer(medicine,data=request.data,partial=True)
        s.is_valid(raise_exception=True)
        s.save()
        return Response(s.data, status=status.HTTP_200_OK)


    @action(methods=["GET"], detail=False, url_path="low_stock")
    def low_stock(self,request):
        medicines = Medicine.objects.filter(
            stock__lt=10,
            active=True
        )
        return Response(MedicineSerializer(medicines, many=True).data)


    @action(methods=["GET"], detail=False, url_path="expiring_soon")
    def expiring_soon(self,request):
        threshold = date.today() + timedelta(days=30)
        medicines = Medicine.objects.filter(
            expiry_date__lte=threshold,
            active=True
        )
        return Response(MedicineSerializer(medicines, many=True).data)

class PrescriptionViewSet(viewsets.ViewSet, generics.ListCreateAPIView):
    queryset = Prescription.objects.filter(active=True)
    serializer_class = PrescriptionDetailedSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.action == 'create_prescription':
            return PrescriptionCreateSerializer
        if self.action == 'update_prescription':
            return PrescriptionUpdateSerializer
        return PrescriptionDetailedSerializer

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

    def list(self,request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = PrescriptionDetailedSerializer(queryset, many=True)
        return Response(serializer.data)


    def create(self,request, *args, **kwargs):
        serializer = PrescriptionCreateSerializer(data=request.data,context={'request': request})
        serializer.is_valid(raise_exception=True)
        prescription = serializer.save()
        return Response(
                PrescriptionDetailedSerializer(prescription).data,
                status=status.HTTP_201_CREATED
                )

    def partial_update(self, request, pk=None):
        prescription = get_object_or_404(Prescription, pk=pk, active=True)

        # Validate permission
        validator = PrescriptionDataValidator()
        validator.validate_update_permission(prescription, request.user)

        serializer = PrescriptionUpdateSerializer(
            prescription,
            data=request.data,
            partial=True,
            context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(
            PrescriptionDetailedSerializer(prescription).data,
            status=status.HTTP_200_OK
        )

#Kết quả xét nghiệm
class TestViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Test.objects.all()
    serializer_class = TestSerializer
    permission_classes = [permission.IsAuthenticated]


class TestResultViewSet(viewsets.ModelViewSet):
    queryset = TestResult.objects.select_related('test', 'medical_record')
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = TestResultSerializer
    http_method_names = ['get', 'post', 'patch', 'delete']

    def get_serializer_class(self):
        if self.action == 'create':
            return TestResultCreateSerializer
        if self.action == 'partial_update':
            return TestResultUpdateSerializer
        return TestResultSerializer

    def get_permissions(self):
        if self.action == 'create':
            return [permission.IsDoctorAndTestResultOwner()]

        return [permission.IsDoctorRole()]


    def get_queryset(self):
        user = self.request.user
        qs = self.queryset.select_related(
            'test',
            'medical_record__appointment__customer',
            'medical_record__appointment__doctor'
        )
        if user.role == "doctor":
            return qs.filter(medical_record__appointment__doctor=user)
        elif user.role == "customer":
            return qs.filter(medical_record__appointment__customer=user)
        return qs.none()

    def list(self,request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = TestResultSerializer(queryset, many=True)
        return Response(serializer.data)

    def create(self,request, *args, **kwargs):
        serializer = TestResultBulkCreateSerializer(data=request.data,context={'request': request})
        serializer.is_valid(raise_exception=True)
        testresults = serializer.save()
        return Response(
            TestResultSerializer(testresults,many=True).data,
            status=status.HTTP_201_CREATED
        )

    def partial_update(self, request, pk=None, *args, **kwargs):
        test_result = get_object_or_404(TestResult, pk=pk, active=True)

        validator = TestResultDataValidator()
        validator.validate_update_permission(test_result, request.user)

        serializer = TestResultUpdateSerializer(
            test_result,
            data=request.data,
            partial=True,
            context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(
            TestResultSerializer(test_result).data,
            status=status.HTTP_200_OK
        )

    def destroy(self, request, pk=None, *args, **kwargs):
        test_result = get_object_or_404(TestResult, pk=pk, active=True)

        validator = TestResultDataValidator()
        validator.validate_update_permission(test_result, request.user)

        test_result.delete()
        return Response(
            {'message': 'Xóa kết quả xét nghiệm thành công'},
            status=status.HTTP_204_NO_CONTENT
        )

#Bệnh án
class MedicalRecordViewSet(viewsets.ViewSet, generics.ListCreateAPIView, generics.RetrieveAPIView):
    queryset = MedicalRecord.objects.filter(active=True)
    serializer_class = MedicalRecordListSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_permissions(self):
        if self.action == 'create':
            return [permission.IsDoctorAndMedicalRecordOwner()]

        return [permission.IsOwner()]

    def get_queryset(self):
        user = self.request.user
        qs = (self.queryset.select_related(
                'appointment__customer',
                'appointment__doctor'
                ).prefetch_related('prescription','test_results'))
        # Bác sĩ chỉ thấy bệnh án của mình
        if user.role == "doctor":
            return qs.filter(appointment__doctor=user)
        # Customer chỉ thấy bệnh án của mình
        elif user.role == "customer":
            return qs.filter(appointment__customer=user)

        return qs.none()

    def list(self, request,*args, **kwargs):
        queryset = self.get_queryset()
        serializer = MedicalRecordListSerializer(queryset, many=True)
        return Response(serializer.data)

    def create(self, request,*args, **kwargs):
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

    def retrieve(self, request, pk):
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


    def partial_update(self, request, pk):
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

    @action(
        methods=['GET'],
        detail=False,
        url_path='search',
        permission_classes=[permission.IsDoctorRole]
    )
    def search_by_phone(self, request):
        phone = request.query_params.get('phone', '').strip()

        if not phone:
            return Response(
                {'error': 'Vui lòng nhập số điện thoại'},
                status=status.HTTP_400_BAD_REQUEST
            )

        qs = MedicalRecord.objects.filter(active=True) \
            .select_related('appointment__customer', 'appointment__doctor') \
            .prefetch_related('prescription') \
            .filter(appointment__customer__phone__icontains=phone)

        if not qs.exists():
            return Response(
                {'error': 'Không tìm thấy bệnh án với số điện thoại này'},
                status=status.HTTP_404_NOT_FOUND
            )

        return Response(
            MedicalRecordListSerializer(qs, many=True).data,
            status=status.HTTP_200_OK
        )

class TotalStatView(APIView):
    permission_classes = [permission.IsAdminRole]

    def get(self, request):
        stat_type = request.query_params.get('type')

        if stat_type == 'age':
            return Response(self.get_age())
        elif stat_type == 'gender':
            return Response(self.get_gender())
        elif stat_type == 'specialty':
            return Response(self.get_specialty())
        elif stat_type == 'serviceNormal':
            return Response(self.get_serviceNormal())
        elif stat_type == 'totalSales':
            return Response(self.get_totalSales(request))
        return Response({'error': 'type không hợp lệ'}, status=status.HTTP_400_BAD_REQUEST)

    def get_age(self):
        current_year = now().year
        return list(User.objects.filter(
            role='customer',
            is_active=True,
            dob__isnull=False
        ).annotate(
            age=current_year - ExtractYear('dob'),
            age_group=Case(
                When(age__lte=18, then=Value('0-18')),
                When(age__range=(19, 30), then=Value('19-30')),
                When(age__range=(31, 50), then=Value('31-50')),
                default=Value('50+'),
                output_field=CharField()
            )
        ).values('age_group').annotate(
            completed_appointments=Count(
                'appointments_customer',
                filter=Q(appointments_customer__status=Appointment.Status.COMPLETED)
            )
        ).order_by('age_group'))

    def get_gender(self):
        return list(User.objects.filter(
            role='customer',
            is_active=True
        ).values('gender').annotate(
            completed_appointments=Count(
                'appointments_customer',
                filter=Q(appointments_customer__status=Appointment.Status.COMPLETED)
            )
        ).order_by('gender'))

    def get_specialty(self):
        return list(Specialty.objects.annotate(
        completed_appointments=Count(
            'staffspecialty__staff__user__appointments_doctor',
            filter=Q(
                staffspecialty__staff__user__appointments_doctor__status=Appointment.Status.COMPLETED
            ),
            distinct=True
        )
    ).values('name', 'completed_appointments').order_by('name'))

    def get_serviceNormal(self):
        return list(ServiceNormal.objects.filter(
            active = True
        ).values('name').annotate(
              completed_appointments=Count(
                  'appointments_serviceNormal',
                  filter=Q(appointments_serviceNormal__status=Appointment.Status.COMPLETED),
              )
        ).order_by('name'))

    def get_totalSales(self, request):
        from django.utils.timezone import make_aware
        from datetime import datetime

        start = request.query_params.get('start')  # '2026-01-01'
        end = request.query_params.get('end')  # '2026-05-31'

        start_date = make_aware(datetime.strptime(start, '%Y-%m-%d')) if start else make_aware(datetime(now().year, 1, 1))
        end_date = make_aware(datetime.strptime(end, '%Y-%m-%d')) if end else make_aware(datetime(now().year, 12, 31))

        appointment_revenue = Appointment.objects.filter(
            status=Appointment.Status.COMPLETED,
            created_date__gte=start_date,
            created_date__lte=end_date
        ).annotate(
            month=TruncMonth('created_date')
        ).values('month').annotate(
            service_revenue=Sum('serviceNormal__price'),
            doctor_revenue=Sum('doctor__staff_profile__price'),
        ).order_by('month')

        medicine_revenue = PrescriptionDetail.objects.filter(
            prescription__medical_record__appointment__status=Appointment.Status.COMPLETED,
            prescription__medical_record__appointment__created_date__gte=start_date,
            prescription__medical_record__appointment__created_date__lte=end_date
        ).annotate(
            month=TruncMonth('prescription__medical_record__appointment__created_date')
        ).values('month').annotate(
            medicine_revenue=Sum(F('unit_price') * F('quantity')),
        ).order_by('month')

        medicine_map = {}
        for item in medicine_revenue:
            medicine_map[item['month']] = item['medicine_revenue'] or 0

        result = []
        for item in appointment_revenue:
            s = item['service_revenue'] or 0
            d = item['doctor_revenue'] or 0
            m = medicine_map.get(item['month'], 0)
            result.append({
                'month': f"T{item['month'].month}/{item['month'].year}",
                'total': s + d + m
            })

        return result

# Báo cáo số lượng bệnh nhân theo độ tuổi
# current_year = timezone.now().year
#
# User.objects.filter(
#     role='customer',
#     active=True,
#     dob__isnull=False
# ).annotate(
#     age=current_year - ExtractYear('dob'),
#     age_group=Case(
#         When(age__lte=18, then=Value('0-18')),
#         When(age__range=(19, 30), then=Value('19-30')),
#         When(age__range=(31, 50), then=Value('31-50')),
#         default=Value('50+'),
#         output_field=CharField()
#     )
# ).values('age_group').annotate(
#     completed_appointments=Count(
#         'appointments_customer',
#         filter=Q(appointments_customer__status=Appointment.Status.COMPLETED)
#     )
# ).order_by('age_group')

# theo giới tính
# User.objects.filter(
#     role='customer',
#     active=True,
# ).values('gender').annotate(
#     Count_gender=Count(
#         'appointments_customer',
#         filter=Q(appointments_customer__status=Appointment.Status.COMPLETED)
#     )
# ).order_by('gender')

# theo chuyên khoa
# User.objects.filter(
#     role='customer',
#     active=True,
# ).values(
#     specialty_name=F('appointments_customer__doctor__staff_profile__specialties__name')
# ).annotate(
#     completed_appointments=Count(
#         'appointments_customer',
#         filter=Q(appointments_customer__status=Appointment.Status.COMPLETED),
#         distinct=True
#     )
# ).order_by('specialty_name')

# Báo cáo số lượng dịch vụ y tế
# ServiceNormal.objects.filter(
#      active = True
# ).values('name').annotate(
#       completed_appointments=Count(
#           'appointments_serviceNormal',
#           filter=Q(appointments_serviceNormal__status=Appointment.Status.COMPLETED),
#       )
# ).order_by('name')

# tổng doanh thu
# Appointment.objects.filter(
#     status=Appointment.Status.COMPLETED
# ).annotate(
#     month=TruncMonth('updated_date')
# ).values('month').annotate(
#     total_revenue=Sum(
#         F('serviceNormal__price') +
#         F('doctor__staff_profile__price')
#     )
# ).order_by('month')

# medicine_revenue = PrescriptionDetail.objects.filter(
#     prescription__medical_record__appointment__status=Appointment.Status.COMPLETED
# ).annotate(
#     month=TruncMonth('prescription__medical_record__appointment__updated_date')
# ).values('month').annotate(
#     medicine_revenue=Coalesce(Sum(F('unit_price') * F('quantity')), Value(0.0))
# ).order_by('month')
