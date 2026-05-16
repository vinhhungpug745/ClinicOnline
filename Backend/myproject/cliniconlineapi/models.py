from cloudinary.models import CloudinaryField
from django.contrib.auth.models import AbstractUser
from django.db import models


# Create your models here.
class BaseModel(models.Model):
    active = models.BooleanField(default=True)
    created_date = models.DateTimeField(auto_now_add=True)
    updated_date = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True

AbstractUser.username.field.error_messages["unique"] = 'Tên đăng nhập đã tồn tại !'
class User(AbstractUser):
    avatar = CloudinaryField(null=True, blank=True)
    email = models.EmailField(unique=True, blank=True, null=True, error_messages={
        "unique": "Email này đã tồn tại !"
    })
    phone = models.CharField(max_length=20, null=True, unique=True, blank=True, error_messages={
            "unique": "Số điện thoại đã được sử dụng !"
        })
    class Role(models.TextChoices):
        CUSTOMER = "customer"
        DOCTOR = "doctor"
        HEALTHCARE = "healthcare"
    class Gender(models.TextChoices):
        MALE = "male"
        FEMALE = "female"
        OTHER = "other"

    gender = models.CharField(max_length=10, choices=Gender.choices,null=True,blank=True,default=Gender.OTHER)
    role = models.CharField(max_length=20, choices=Role.choices, default=Role.CUSTOMER)
    dob = models.DateField(null=True, blank=True)


class Specialty(BaseModel):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)

    def __str__(self):
        return self.name

class ServiceSpecialty(BaseModel):
    name = models.CharField(max_length=200, unique=True)
    description = models.TextField(blank=True,max_length=200,null=True)
    price = models.FloatField(default=0)
    Specialty = models.ManyToManyField(Specialty, blank=True)

class StaffProfile(BaseModel):
    user = models.OneToOneField(User, on_delete=models.CASCADE,related_name="staff_profile")
    specialties = models.ManyToManyField(Specialty, through="StaffSpecialty", blank=True)
    degree = models.CharField(max_length=20, blank=True)
    experience = models.IntegerField(null=True, blank=True)
    bio = models.TextField(null=True, blank=True)
    price = models.FloatField(null=True, blank=True,default=0)

    def __str__(self):
        return f"BS. {self.user.get_full_name()}"

class CustomerProfile(BaseModel):
    user = models.OneToOneField(User, on_delete=models.CASCADE,related_name="customer_profile")
    height = models.IntegerField(null=True, blank=True)
    weight = models.IntegerField(null=True, blank=True)
    insurance_number = models.CharField(max_length=50, null=True, blank=True)
    insurance_expiry_date = models.DateField(null=True, blank=True)
    BLOOD_GROUP_CHOICES = [
        ('A+', 'A+'), ('A-', 'A-'),
        ('B+', 'B+'), ('B-', 'B-'),
        ('AB+', 'AB+'), ('AB-', 'AB-'),
        ('O+', 'O+'), ('O-', 'O-'),
    ]
    blood_group = models.CharField(
        max_length=3,
        choices=BLOOD_GROUP_CHOICES,
        null=True,
        blank=True
    )
    allergy_history = models.TextField(null=True, blank=True)
    def __str__(self):
        return f"BN. {self.user.get_full_name()}"

class StaffSpecialty(BaseModel):
    staff = models.ForeignKey(StaffProfile, on_delete=models.CASCADE)
    specialty = models.ForeignKey(Specialty, on_delete=models.SET_NULL, null=True, blank=True)

    class Meta:
        unique_together = [("staff", "specialty")]

    def __str__(self):
        return f"{self.staff} - {self.specialty}"

class WorkDay(BaseModel):
    staff_profile = models.ForeignKey("StaffProfile", on_delete=models.CASCADE, related_name="work_days")
    date = models.DateField(null=False,blank=False,unique=True)
    class Meta:
        unique_together = ("staff_profile", "date")
        ordering = ["date"]


class TimeSlot(BaseModel):
    class Status(models.TextChoices):
        AVAILABLE = "Available"
        BOOKED = "Booked"

    work_day = models.ForeignKey(WorkDay, on_delete=models.CASCADE,related_name="time_slots")
    start_time = models.TimeField()
    end_time   = models.TimeField()
    status     = models.CharField(
        max_length=10,
        choices=Status.choices,
        default=Status.AVAILABLE,
    )

    class Meta:
        unique_together = ("work_day", "start_time")
        ordering = ["start_time"]


class ServiceNormal(BaseModel):
    name = models.CharField(max_length=200, unique=True)
    description = models.TextField(blank=True,max_length=200,null=True)

# Lịch hẹn
class Appointment(BaseModel):
    class Status(models.TextChoices):
        PENDING = "Pending"
        CONFIRMED = "Confirmed"
        COMPLETED = "Completed"
        CANCELED = "Canceled"

    reason = models.TextField(blank=False, null= False)
    symptoms = models.TextField(blank=True, null= True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    time_slot=models.OneToOneField(TimeSlot, on_delete=models.PROTECT,related_name="appointment_time_slot")

    customer = models.ForeignKey(User, on_delete=models.CASCADE,related_name="appointments_customer")
    doctor = models.ForeignKey(User, on_delete=models.CASCADE,related_name="appointments_doctor")
    serviceNormal = models.ForeignKey(ServiceNormal, on_delete=models.SET_NULL,related_name="appointments_serviceNormal", null=True)

    class Meta:
        ordering = ["-created_date"]

    def __str__(self):
        return f"Lịch hẹn: {self.customer} lúc {self.time_slot}"

    def get_doctor(self):
        return self.time_slot.work_day.staff_profile

# bệnh án
class MedicalRecord(BaseModel):
    appointment = models.OneToOneField(Appointment, on_delete=models.CASCADE,related_name="medical_record")
    diagnosis = models.TextField()           # Chẩn đoán
    symptoms = models.TextField(blank=True)  # Triệu chứng
    notes = models.TextField(blank=True)
    follow_up_date = models.DateField(null=True, blank=True)  # Ngày tái khám

    def __str__(self):
        return f"Bệnh án: {self.appointment.customer} - {self.created_date.date()}"

    def get_customer(self):
        return self.appointment.customer.user

    def get_doctor(self):
        return self.appointment.get_doctor().user

# thuốc
class Medicine(BaseModel):
    name = models.CharField(max_length=200, unique=True)
    unit = models.CharField(max_length=50)       #  viên, chai, ống...
    description = models.TextField(blank=True)
    stock = models.IntegerField(default=0)
    expiry_date = models.DateField(null=True,blank=True)
    price = models.FloatField(default=0)

    def __str__(self):
        return f"{self.name} ({self.stock} {self.unit})"

    def is_low_stock(self):
        return self.stock < 10

    def is_expiring_soon(self):
        from django.utils import timezone
        import datetime
        if not self.expiry_date:
            return False
        return self.expiry_date <= (timezone.now().date() + datetime.timedelta(days=30))


# đơn thuốc
class Prescription(BaseModel):
    medical_record = models.OneToOneField(MedicalRecord, on_delete=models.CASCADE,related_name="prescription")
    notes = models.TextField(blank=True)   # Hướng dẫn chung

    def __str__(self):
        return f"Đơn thuốc: {self.medical_record}"

class PrescriptionDetail(BaseModel):
    prescription = models.ForeignKey(Prescription, on_delete=models.CASCADE, related_name="details")
    medicine = models.ForeignKey(Medicine, on_delete=models.PROTECT)
    quantity = models.IntegerField()
    dosage = models.CharField(max_length=200)   # Liều dùng: "2 viên/ngày, sau ăn"
    unit_price = models.FloatField(default=0)

    class Meta:
        unique_together = ("prescription", "medicine")

    def __str__(self):
        return f"{self.medicine.name} x{self.quantity}"

#kết quả xét nghiệm
class TestResult(BaseModel):
    medical_record = models.ForeignKey(MedicalRecord, on_delete=models.CASCADE, related_name="test_results")
    test_name = models.CharField(max_length=200)
    result = models.TextField()
    file = CloudinaryField(null=True, blank=True)   # Upload file PDF/ảnh

    def __str__(self):
        return f"{self.test_name} - {self.medical_record}"
