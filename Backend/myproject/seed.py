import random
from datetime import timedelta, time
from decimal import Decimal
from django.utils import timezone
from datetime import date
import django, os

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myproject.settings')
django.setup()

from cliniconlineapi.models import (
    User, StaffProfile, Specialty, ServiceNormal,
    CustomerProfile, WorkDay, TimeSlot, Medicine, Appointment,
)

# =========================================================
# SPECIALTIES
# =========================================================
specialties_data = [
    {"name": "Nội tổng quát",        "description": "Khám và điều trị các bệnh nội khoa tổng quát"},
    {"name": "Ngoại tổng quát",       "description": "Phẫu thuật các bệnh lý ngoại khoa"},
    {"name": "Tim mạch",              "description": "Chẩn đoán và điều trị bệnh tim và mạch máu"},
    {"name": "Thần kinh",             "description": "Điều trị các bệnh về não và hệ thần kinh"},
    {"name": "Chấn thương chỉnh hình","description": "Điều trị gãy xương, khớp và cơ"},
    {"name": "Sản phụ khoa",          "description": "Chăm sóc sức khỏe phụ nữ và thai sản"},
    {"name": "Nhi khoa",              "description": "Khám và điều trị cho trẻ em"},
    {"name": "Da liễu",               "description": "Điều trị các bệnh về da"},
    {"name": "Tai mũi họng",          "description": "Điều trị bệnh tai, mũi, họng"},
    {"name": "Răng hàm mặt",          "description": "Chăm sóc và điều trị răng miệng"},
    {"name": "Mắt",                   "description": "Khám và điều trị các bệnh về mắt"},
    {"name": "Hô hấp",                "description": "Điều trị bệnh phổi và đường hô hấp"},
    {"name": "Tiêu hóa",              "description": "Điều trị bệnh dạ dày, ruột"},
    {"name": "Nội tiết",              "description": "Điều trị các bệnh về hormone và tuyến nội tiết"},
    {"name": "Thận - tiết niệu",      "description": "Điều trị các bệnh về thận và đường tiết niệu"},
    {"name": "Ung bướu",              "description": "Chẩn đoán và điều trị ung thư"},
    {"name": "Huyết học",             "description": "Điều trị các bệnh về máu"},
    {"name": "Truyền nhiễm",          "description": "Điều trị các bệnh lây nhiễm"},
    {"name": "Y học cổ truyền",       "description": "Điều trị bằng phương pháp đông y"},
    {"name": "Phục hồi chức năng",    "description": "Vật lý trị liệu và phục hồi chức năng"},
    {"name": "Hồi sức cấp cứu",       "description": "Cấp cứu và điều trị bệnh nhân nặng"},
    {"name": "Gây mê hồi sức",        "description": "Gây mê và theo dõi phẫu thuật"},
    {"name": "Dinh dưỡng",            "description": "Tư vấn chế độ ăn và dinh dưỡng"},
]

for s in specialties_data:
    Specialty.objects.get_or_create(name=s["name"], defaults={"description": s["description"]})
    print(f"✅ Specialty: {s['name']}")

# =========================================================
# SERVICES
# =========================================================
services_data = [
    {
        "name": "Khám thường",
        "description": "Khám lâm sàng và tư vấn điều trị",
        "price": 100000
    },
    {
        "name": "Khám chuyên sâu",
        "description": "Khám kỹ lưỡng với các xét nghiệm cần thiết",
        "price": 300000
    },
    {
        "name": "Khám định kỳ",
        "description": "Gói khám định kỳ cho người cao tuổi",
        "price": 200000
    },
    {
        "name": "Khám sức khỏe tổng quát",
        "description": "Gói khám tổng quát cho mọi lứa tuổi",
        "price": 500000
    },
]

for s in services_data:
    ServiceNormal.objects.get_or_create(
        name=s["name"],
        defaults={
            "description": s["description"],
            "price": s["price"]
        }
    )

    print(f"✅ ServiceNormal: {s['name']}")

# =========================================================
# DOCTORS — 36 bác sĩ tên thật
# =========================================================
specialties = list(Specialty.objects.all())
degrees = ["BS", "CKII", "CKI", "ThS", "PGS.TS"]

avatar_doctor = [
    "https://res.cloudinary.com/dkdvg8jix/image/upload/v1777429050/images_mhchu3.jpg",
    "https://res.cloudinary.com/dkdvg8jix/image/upload/v1777429050/small_20240102_081908_598785_bac_si_max_1800x1800_jpg_98dcc6cbf1_mrrocw.jpg",
    "https://res.cloudinary.com/dkdvg8jix/image/upload/v1777429050/images_1_srifmw.jpg",
    "https://res.cloudinary.com/dkdvg8jix/image/upload/v1777429049/cheerful-male-doctor-white-gown-portrait_zreqk5.jpg",
    "https://res.cloudinary.com/dkdvg8jix/image/upload/v1777429049/images_2_mcecpg.jpg",
    "https://res.cloudinary.com/dkdvg8jix/image/upload/v1777429001/mature-japanese-man-doctor-with-eyeglasses-against-chroma-key-with-green-wall_251136-75041_rwwvw9.jpg",
    "https://res.cloudinary.com/dkdvg8jix/image/upload/v1777428964/happy-beautiful-female-doctor-medical-coat-standing-with-crossed-arms-isolated-white_264197-17834_xyqsti.jpg",
    "https://res.cloudinary.com/dkdvg8jix/image/upload/v1777428936/pleased-looking-up-young-superhero-girl-wearing-stethoscope-with-medical-robe-cloak-isolated-green-wall_141793-87578_fz7udh.jpg",
    "https://res.cloudinary.com/dkdvg8jix/image/upload/v1777428913/asian-doctor-office_1098-19684_c4kivi.jpg",
    "https://res.cloudinary.com/dkdvg8jix/image/upload/v1777428887/portrait-confident-young-medical-doctor-white-wall_1150-26696_v79btx.jpg",
    "https://res.cloudinary.com/dkdvg8jix/image/upload/v1777428870/bearded-doctor-glasses_23-2147896187_orqsuh.jpg",
    "https://res.cloudinary.com/dkdvg8jix/image/upload/v1777428853/young-handsome-indian-man-doctor-against-gray-wall_251136-2285_a6bclk.jpg",
    "https://res.cloudinary.com/dkdvg8jix/image/upload/v1777428813/portrait-friendly-asian-doctor-man-his-office-smiling-camera_264197-35768_iz4js8.jpg",
    "https://res.cloudinary.com/dkdvg8jix/image/upload/v1777428792/female-doctor-hospital-with-stethoscope_23-2148827774_twv22c.jpg",
    "https://res.cloudinary.com/dkdvg8jix/image/upload/v1777428689/pleased-young-female-doctor-wearing-medical-robe-stethoscope-with-glasses-isolated_141793-68695_q1ffre.jpg",
    "https://res.cloudinary.com/dkdvg8jix/image/upload/v1777428663/studio-shot-japanese-man-isolated-against-white-background_251136-36520_e0n7df.jpg",
    "https://res.cloudinary.com/dkdvg8jix/image/upload/v1777428634/male-doctor-with-face-mask-portrait_53876-105124_x0kgiv.jpg",
    "https://res.cloudinary.com/dkdvg8jix/image/upload/v1777428624/smiling-young-pretty-caucasian-girl-doctor-uniform-with-stethoscope-looking-side_141793-124530_t2fztp.jpg",
    "https://res.cloudinary.com/dkdvg8jix/image/upload/v1777428597/smiling-young-female-doctor-wearing-medical-robe-stethoscope-with-glasses-isolated_141793-68741_xsg6ev.jpg",
    "https://res.cloudinary.com/dkdvg8jix/image/upload/v1777428575/male-doctor-with-face-mask-portrait_53876-105124_exqkyo.jpg",
    "https://res.cloudinary.com/dkdvg8jix/image/upload/v1777428540/healthcare-medical-concept-korean-female-doctor-nurse-uniform-smiling-looking-helpful-blue-background_1258-83497_lepmi4.jpg",
]

# 36 bác sĩ: (first_name, last_name, gender, username)
doctors_data = [
    ("Minh Tuấn",   "Nguyễn Văn",  "male",   "bs_minhtuan"),
    ("Quốc Hùng",   "Trần Văn",    "male",   "bs_quochung"),
    ("Thanh Long",  "Lê Văn",      "male",   "bs_thanhlong"),
    ("Đức Dũng",    "Phạm Văn",    "male",   "bs_ducdung"),
    ("Hoàng Khoa",  "Hoàng Văn",   "male",   "bs_hoangkhoa"),
    ("Văn Bình",    "Vũ Văn",      "male",   "bs_vanbinh"),
    ("Trọng Hải",   "Đặng Văn",    "male",   "bs_tronghai"),
    ("Quang Nam",   "Bùi Văn",     "male",   "bs_quangnam"),
    ("Hữu Tài",     "Đỗ Văn",      "male",   "bs_huutai"),
    ("Chí Phúc",    "Ngô Văn",     "male",   "bs_chiphuc"),
    ("Mạnh Thắng",  "Dương Văn",   "male",   "bs_manhthang"),
    ("Tiến Quân",   "Lý Văn",      "male",   "bs_tienquan"),
    ("Đình Việt",   "Phan Văn",    "male",   "bs_dinhviet"),
    ("Công Đức",    "Võ Văn",      "male",   "bs_congduc"),
    ("Xuân Thành",  "Đinh Văn",    "male",   "bs_xuanthanh"),
    ("Bảo Nghĩa",   "Trịnh Văn",   "male",   "bs_baonghia"),
    ("Anh Hiếu",    "Lưu Văn",     "male",   "bs_anhhieu"),
    ("Quốc Trung",  "Tô Văn",      "male",   "bs_quoctrung"),
    ("Minh Hòa",    "Cao Văn",     "male",   "bs_minhhoa"),
    ("Thanh Phong", "Mai Văn",     "male",   "bs_thanhphong"),
    ("Thị Lan",     "Nguyễn",      "female", "bs_thilan"),
    ("Thị Hoa",     "Trần",        "female", "bs_thihoa"),
    ("Thị Linh",    "Lê",          "female", "bs_thilinh"),
    ("Thị Thảo",    "Phạm",        "female", "bs_thithao"),
    ("Thị Hương",   "Hoàng",       "female", "bs_thihuong"),
    ("Thị Nhung",   "Vũ",          "female", "bs_thinhhung"),
    ("Thị Trang",   "Đặng",        "female", "bs_thitrang"),
    ("Thị Yến",     "Bùi",         "female", "bs_thiyen"),
    ("Thị Ngọc",    "Đỗ",          "female", "bs_thingoc"),
    ("Thị Mai",     "Ngô",         "female", "bs_thimai"),
    ("Thị Thu",     "Dương",       "female", "bs_thithu"),
    ("Thị Phương",  "Lý",          "female", "bs_thiphuong"),
    ("Thị Quỳnh",   "Phan",        "female", "bs_thiquynh"),
    ("Thị Diễm",    "Võ",          "female", "bs_thidiem"),
    ("Thị Châu",    "Đinh",        "female", "bs_thichau"),
    ("Thị Xuân",    "Trịnh",       "female", "bs_thixuan"),
]


def get_specialties_for_doctor(i, specialties):
    count = (i % 2) + 2
    return [specialties[(i + j) % len(specialties)] for j in range(count)]


for i, (first_name, last_name, gender, username) in enumerate(doctors_data):
    user, created = User.objects.get_or_create(username=username)

    if created:
        user.set_password("Doctor@123")
        user.first_name = first_name
        user.last_name = last_name
        user.phone = f"09{str(i).zfill(2)}222{str(i).zfill(3)}"
        user.email = f"{username}@gmail.com"
        user.role = User.Role.DOCTOR
        user.gender = gender
        user.avatar = avatar_doctor[i % len(avatar_doctor)]
        user.dob = date(
            random.randint(1960, 1985),
            random.randint(1, 12),
            random.randint(1, 28)
        )
        user.save()

        doctor_specialties = get_specialties_for_doctor(i, specialties)
        experience = (i % 20) + 2
        specialty_names = ", ".join([s.name for s in doctor_specialties])

        profile = StaffProfile.objects.create(
            user=user,
            degree=degrees[i % len(degrees)],
            experience=experience,
            bio=(
                f"Bác sĩ {last_name} {first_name} là chuyên gia với hơn {experience} năm kinh nghiệm "
                f"trong lĩnh vực {specialty_names}. "
                f"Với quá trình đào tạo bài bản và tận tâm trong công việc, bác sĩ đã trực tiếp thăm khám "
                f"và điều trị cho hàng nghìn bệnh nhân. "
                f"Bác sĩ luôn đặt sức khỏe và sự an toàn của người bệnh lên hàng đầu, "
                f"mang đến dịch vụ y tế chất lượng cao và đáng tin cậy."
            ),
            price=random.randint(100_000, 500_000),
        )
        profile.specialties.add(*doctor_specialties)

        print(f"✅ Tạo: {last_name} {first_name} | {username} | Chuyên khoa: {specialty_names}")
    else:
        print(f"⚠️  Đã tồn tại: {username}")

# =========================================================
# CUSTOMERS
# =========================================================
customer_data = [
    ("An",       "Nguyễn Văn",  "male",   "09011100001"),
    ("Bình",     "Trần Thị",    "female", "09011100002"),
    ("Cường",    "Lê Văn",      "male",   "09011100003"),
    ("Dung",     "Phạm Thị",    "female", "09011100004"),
    ("Emm",      "Hoàng Văn",   "male",   "09011100005"),
]

customers = []

for i, (first_name, last_name, gender, phone) in enumerate(customer_data):
    username = f"customer{i + 1}"
    customer, created = User.objects.get_or_create(username=username)

    if created:
        customer.set_password("Customer@123")
        customer.first_name = first_name
        customer.last_name = last_name
        customer.email = f"{username}@gmail.com"
        customer.phone = phone
        customer.role = User.Role.CUSTOMER
        customer.gender = gender
        customer.save()

        CustomerProfile.objects.create(
            user=customer,
            height=random.randint(150, 185),
            weight=random.randint(45, 90),
            blood_group=random.choice(["A+", "B+", "O+", "AB+"]),
        )
        print(f"✅ Created customer: {username} - {last_name} {first_name}")
    else:
        print(f"⚠️  Customer exists: {username}")

    customers.append(customer)

# =========================================================
# MEDICINES
# =========================================================
medicine_names = [
    "Paracetamol", "Amoxicillin", "Vitamin C", "Ibuprofen",
    "Aspirin", "Cefixime", "Panadol", "Decolgen",
]
units = ["Viên", "Hộp", "Chai", "Gói"]

for i in range(100):
    name = f"{random.choice(medicine_names)} {i + 1}"
    medicine, created = Medicine.objects.get_or_create(
        name=name,
        defaults={
            "unit":        random.choice(units),
            "description": f"Thuốc {name}",
            "stock":       random.randint(20, 300),
            "price":       Decimal(random.randint(5_000, 200_000)),
            "active":      True,
        },
    )
    if created:
        print(f"✅ Medicine: {name}")

# =========================================================
# WORKDAY + TIMESLOT + APPOINTMENT
# =========================================================
services = list(ServiceNormal.objects.all())
time_slots_data = [
    (time(8,  0), time(8,  30)),
    (time(8, 30), time(9,   0)),
    (time(9,  0), time(9,  30)),
    (time(9, 30), time(10,  0)),
    (time(10, 0), time(10, 30)),
]

doctors = list(User.objects.filter(role=User.Role.DOCTOR))
if not doctors:
    raise Exception("Không có doctor nào trong DB")

appointments_created = 0

for i in range(10):
    customer  = random.choice(customers)
    doctor    = random.choice(doctors)
    service   = random.choice(services)
    work_date = timezone.now().date() + timedelta(days=random.randint(1, 7))

    staff_profile = StaffProfile.objects.get(user=doctor)
    work_day, _   = WorkDay.objects.get_or_create(staff_profile=staff_profile, date=work_date)

    start_time, end_time = random.choice(time_slots_data)
    time_slot, created = TimeSlot.objects.get_or_create(
        work_day=work_day,
        start_time=start_time,
        defaults={"end_time": end_time, "status": TimeSlot.Status.AVAILABLE},
    )

    if not created:
        continue

    appointment = Appointment.objects.create(
        reason="Khám tổng quát",
        symptoms=random.choice(["Đau họng", "Sốt", "Ho", "Mệt mỏi"]),
        status=Appointment.Status.CONFIRMED,
        customer=customer,
        doctor=doctor,
        serviceNormal=service,
        time_slot=time_slot,
    )

    time_slot.status = TimeSlot.Status.BOOKED
    time_slot.save()

    appointments_created += 1
    print(f"✅ Appointment ID={appointment.id} | {customer.username} -> {doctor.username}")

print(f"\n🎉 Seed hoàn tất! Tổng appointments tạo mới: {appointments_created}")