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
    CustomerProfile, WorkDay, TimeSlot, Medicine, Appointment, Test,
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
# TESTS (Danh sách xét nghiệm)
# =========================================================
tests_data = [
    {
        "name": "Xét nghiệm máu toàn bộ",
        "price": 150000,
        "description": "Kiểm tra hemoglobin, hematocrit, WBC, RBC, platelet..."
    },
    {
        "name": "Xét nghiệm nước tiểu",
        "price": 80000,
        "description": "Kiểm tra thành phần nước tiểu, phát hiện bệnh thận..."
    },
    {
        "name": "Xét nghiệm glucose",
        "price": 50000,
        "description": "Kiểm tra mức đường huyết, phát hiện tiểu đường"
    },
    {
        "name": "Xét nghiệm chỉ số ure creatinine",
        "price": 120000,
        "description": "Kiểm tra chức năng thận"
    },
    {
        "name": "Xét nghiệm AST ALT",
        "price": 100000,
        "description": "Kiểm tra chức năng gan"
    },
    {
        "name": "Xét nghiệm colesterol",
        "price": 150000,
        "description": "Kiểm tra mức cholesterol toàn phần, HDL, LDL, triglyceride"
    },
    {
        "name": "Xét nghiệm hormone tuyến giáp",
        "price": 200000,
        "description": "Kiểm tra TSH, T3, T4"
    },
    {
        "name": "Xét nghiệm PSA",
        "price": 180000,
        "description": "Phát hiện ung thư tuyến tiền liệt ở nam giới"
    },
    {
        "name": "Xét nghiệm CEA",
        "price": 200000,
        "description": "Phát hiện ung thư"
    },
    {
        "name": "Xét nghiệm HIV",
        "price": 250000,
        "description": "Kiểm tra virus HIV"
    },
    {
        "name": "CT Scan não",
        "price": 500000,
        "description": "Chẩn đoán hình ảnh não"
    },
    {
        "name": "CT Scan ngực",
        "price": 450000,
        "description": "Chẩn đoán hình ảnh ngực"
    },
    {
        "name": "Siêu âm tim",
        "price": 350000,
        "description": "Chẩn đoán bệnh tim"
    },
    {
        "name": "Siêu âm ổ bụng",
        "price": 300000,
        "description": "Kiểm tra các cơ quan trong ổ bụng"
    },
    {
        "name": "X-quang ngực",
        "price": 200000,
        "description": "Kiểm tra phổi"
    },
    {
        "name": "ECG (Điện tâm đồ)",
        "price": 100000,
        "description": "Kiểm tra nhịp tim"
    },
    {
        "name": "Nội soi dạ dày",
        "price": 400000,
        "description": "Kiểm tra dạ dày trực tiếp"
    },
    {
        "name": "Nội soi đại tràng",
        "price": 500000,
        "description": "Kiểm tra đại tràng trực tiếp"
    },
    {
        "name": "Xét nghiệm Helicobacter pylori",
        "price": 150000,
        "description": "Phát hiện vi khuẩn HP gây viêm dạ dày"
    },
    {
        "name": "Test dị ứng",
        "price": 300000,
        "description": "Kiểm tra các chất gây dị ứng"
    },
]

created_tests = []
for test_data in tests_data:
    test, created = Test.objects.get_or_create(
        name=test_data["name"],
        defaults={
            "price": test_data["price"],
            "description": test_data["description"],
        }
    )
    created_tests.append(test)
    if created:
        print(f"✅ Test: {test_data['name']} - {test_data['price']:,}đ")
    else:
        print(f"⚠️  Test exists: {test_data['name']}")
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

# Thêm vào cuối file seed, sau phần WORKDAY + TIMESLOT + APPOINTMENT

# =========================================================
# THÊM CUSTOMERS ĐỂ TEST THỐNG KÊ
# =========================================================
extra_customers_data = [
    ("Nam",      "Nguyễn Văn",  "male",   "09022200001", date(2000, 3, 15)),   # 26t
    ("Hùng",     "Trần Văn",    "male",   "09022200002", date(1995, 7, 20)),   # 31t
    ("Linh",     "Lê Thị",      "female", "09022200003", date(1990, 1, 10)),   # 36t
    ("Hoa",      "Phạm Thị",    "female", "09022200004", date(1985, 5, 25)),   # 41t
    ("Tuấn",     "Hoàng Văn",   "male",   "09022200005", date(2010, 8, 5)),    # 16t
    ("Lan",      "Vũ Thị",      "female", "09022200006", date(1975, 11, 30)),  # 51t
    ("Dũng",     "Đặng Văn",    "male",   "09022200007", date(2005, 4, 18)),   # 21t
    ("Yến",      "Bùi Thị",     "female", "09022200008", date(1968, 9, 12)),   # 58t
    ("Khoa",     "Đỗ Văn",      "male",   "09022200009", date(1998, 6, 22)),   # 28t
    ("Mai",      "Ngô Thị",     "female", "09022200010", date(2008, 2, 14)),   # 18t
    ("Phúc",     "Dương Văn",   "male",   "09022200011", date(1980, 12, 8)),   # 46t
    ("Thảo",     "Lý Thị",      "female", "09022200012", date(1993, 3, 27)),   # 33t
    ("Minh",     "Phan Văn",    "male",   "09022200013", date(2003, 7, 3)),    # 23t
    ("Ngọc",     "Võ Thị",      "female", "09022200014", date(1970, 10, 19)), # 56t
    ("Tài",      "Đinh Văn",    "male",   "09022200015", date(1988, 4, 6)),    # 38t
]

extra_customers = []
for i, (first_name, last_name, gender, phone, dob) in enumerate(extra_customers_data):
    username = f"test_customer{i + 1}"
    customer, created = User.objects.get_or_create(username=username)
    if created:
        customer.set_password("Customer@123")
        customer.first_name = first_name
        customer.last_name = last_name
        customer.email = f"{username}@gmail.com"
        customer.phone = phone
        customer.role = User.Role.CUSTOMER
        customer.gender = gender
        customer.dob = dob
        customer.save()

        CustomerProfile.objects.create(
            user=customer,
            height=random.randint(150, 185),
            weight=random.randint(45, 90),
            blood_group=random.choice(["A+", "B+", "O+", "AB+"]),
        )
        print(f"✅ Extra customer: {username} - {last_name} {first_name} - dob: {dob}")
    else:
        print(f"⚠️  Exists: {username}")
    extra_customers.append(customer)

all_customers = customers + extra_customers

# =========================================================
# COMPLETED APPOINTMENTS ĐỂ TEST THỐNG KÊ
# =========================================================
completed_time_slots = [
    (time(8,  0), time(8,  30)),
    (time(8, 30), time(9,   0)),
    (time(9,  0), time(9,  30)),
    (time(9, 30), time(10,  0)),
    (time(10, 0), time(10, 30)),
    (time(10,30), time(11,  0)),
    (time(11, 0), time(11, 30)),
    (time(13, 0), time(13, 30)),
    (time(13,30), time(14,  0)),
    (time(14, 0), time(14, 30)),
]

completed_count = 0

for i in range(60):
    customer  = random.choice(all_customers)
    doctor    = random.choice(doctors)
    service   = random.choice(services)

    # tạo ngày trong quá khứ để test doanh thu theo tháng
    days_ago  = random.randint(1, 150)
    work_date = timezone.now().date() - timedelta(days=days_ago)

    try:
        staff_profile = StaffProfile.objects.get(user=doctor)
        work_day, _   = WorkDay.objects.get_or_create(
            staff_profile=staff_profile,
            date=work_date
        )

        start_time, end_time = random.choice(completed_time_slots)
        time_slot, created = TimeSlot.objects.get_or_create(
            work_day=work_day,
            start_time=start_time,
            defaults={
                "end_time": end_time,
                "status": TimeSlot.Status.BOOKED
            },
        )

        if not created:
            continue

        appointment = Appointment.objects.create(
            reason=random.choice([
                "Khám tổng quát", "Đau đầu kéo dài",
                "Khó thở", "Đau bụng", "Sốt cao",
                "Kiểm tra định kỳ", "Tái khám",
            ]),
            symptoms=random.choice([
                "Đau họng", "Sốt", "Ho", "Mệt mỏi",
                "Chóng mặt", "Buồn nôn", "Đau lưng",
            ]),
            status=Appointment.Status.COMPLETED,  # ✅ COMPLETED để test thống kê
            customer=customer,
            doctor=doctor,
            serviceNormal=service,
            time_slot=time_slot,
        )

        time_slot.status = TimeSlot.Status.BOOKED
        time_slot.save()

        completed_count += 1
        print(f"✅ COMPLETED Appointment ID={appointment.id} | {customer.username} -> {doctor.username} | {work_date}")

    except Exception as e:
        print(f"❌ Lỗi: {e}")
        continue

print(f"\n🎉 Seed hoàn tất! Tổng COMPLETED appointments: {completed_count}")