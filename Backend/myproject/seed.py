import random
from datetime import  timedelta, time
from decimal import Decimal
from django.utils import timezone

import django, os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myproject.settings')
django.setup()

from cliniconlineapi.models import User, StaffProfile, Specialty, ServiceNormal, CustomerProfile, TimeSlot, WorkDay

specialties_data = [
    {"name": "Nội tổng quát", "description": "Khám và điều trị các bệnh nội khoa tổng quát"},
    {"name": "Ngoại tổng quát", "description": "Phẫu thuật các bệnh lý ngoại khoa"},
    {"name": "Tim mạch", "description": "Chẩn đoán và điều trị bệnh tim và mạch máu"},
    {"name": "Thần kinh", "description": "Điều trị các bệnh về não và hệ thần kinh"},
    {"name": "Chấn thương chỉnh hình", "description": "Điều trị gãy xương, khớp và cơ"},
    {"name": "Sản phụ khoa", "description": "Chăm sóc sức khỏe phụ nữ và thai sản"},
    {"name": "Nhi khoa", "description": "Khám và điều trị cho trẻ em"},
    {"name": "Da liễu", "description": "Điều trị các bệnh về da"},
    {"name": "Tai mũi họng", "description": "Điều trị bệnh tai, mũi, họng"},
    {"name": "Răng hàm mặt", "description": "Chăm sóc và điều trị răng miệng"},
    {"name": "Mắt", "description": "Khám và điều trị các bệnh về mắt"},
    {"name": "Hô hấp", "description": "Điều trị bệnh phổi và đường hô hấp"},
    {"name": "Tiêu hóa", "description": "Điều trị bệnh dạ dày, ruột"},
    {"name": "Nội tiết", "description": "Điều trị các bệnh về hormone và tuyến nội tiết"},
    {"name": "Thận - tiết niệu", "description": "Điều trị các bệnh về thận và đường tiết niệu"},
    {"name": "Ung bướu", "description": "Chẩn đoán và điều trị ung thư"},
    {"name": "Huyết học", "description": "Điều trị các bệnh về máu"},
    {"name": "Truyền nhiễm", "description": "Điều trị các bệnh lây nhiễm"},
    {"name": "Y học cổ truyền", "description": "Điều trị bằng phương pháp đông y"},
    {"name": "Phục hồi chức năng", "description": "Vật lý trị liệu và phục hồi chức năng"},
    {"name": "Hồi sức cấp cứu", "description": "Cấp cứu và điều trị bệnh nhân nặng"},
    {"name": "Gây mê hồi sức", "description": "Gây mê và theo dõi phẫu thuật"},
    {"name": "Dinh dưỡng", "description": "Tư vấn chế độ ăn và dinh dưỡng"},
]

services = [
    {"name": "Khám thường", "description": "Khám lâm sàng và tư vấn điều trị"},
    {"name": "Khám chuyên sâu", "description": "Khám kỹ lưỡng với các xét nghiệm cần thiết"},
    {"name": "Khám định kỳ", "description": "Gói khám định kỳ cho người cao tuổi"},
    {"name": "Khám sức khỏe tổng quát", "description": "Gói khám tổng quát cho mọi lứa tuổi"},
]

for s in services:
    ServiceNormal.objects.get_or_create(
        name=s["name"],
        defaults={"description": s["description"]}
    )
    print(f"✅ ServiceNormal: {s['name']}")

for s in specialties_data:
    Specialty.objects.get_or_create(name=s["name"], defaults={"description": s["description"]})
    print(f"✅ Specialty: {s['name']}")

specialties = list(Specialty.objects.all())
alphabet = [chr(i) for i in range(ord('A'), ord('U'))]
degrees = ["BS", "CKII", "CKI", "ThS", "PGS.TS"]
genders = ["male", "female", "other"]
avaterDoctor = [
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


# Mỗi bác sĩ gán 2-3 chuyên khoa theo pattern cố định (không random để chạy lại không đổi)
def get_specialties_for_doctor(i, specialties):
    count = (i % 2) + 2  # 2 hoặc 3 chuyên khoa
    return [specialties[(i + j) % len(specialties)] for j in range(count)]

for i, letter in enumerate(alphabet):
    username = f"nguyenvan{letter.lower()}{i+1}"
    user, created = User.objects.get_or_create(username=username)

    if created:
        user.set_password("Doctor@123")
        user.first_name = letter
        user.last_name = "Nguyễn Văn"
        user.phone = f"09{str(i).zfill(2)}111{str(i).zfill(3)}"
        user.email = f"bsnguyenvan{letter.lower()}@gmail.com"
        user.role = User.Role.DOCTOR
        user.gender = genders[i % len(genders)]
        user.avatar = avaterDoctor[i % len(avaterDoctor)]
        user.save()

        doctor_specialties = get_specialties_for_doctor(i, specialties)
        experience = (i % 20) + 2
        specialty_names = ", ".join([s.name for s in doctor_specialties])

        profile = StaffProfile.objects.create(
            user=user,
            degree=degrees[i % len(degrees)],
            experience=experience,
            bio=f"Bác sĩ Nguyễn Văn {letter} có {experience} năm kinh nghiệm trong lĩnh vực {specialty_names}.",
            price=round(random.uniform(100000, 1000000), 0)  # ← THÊM VÀO ĐÂY
        )

        # Gán nhiều chuyên khoa
        profile.specialties.add(*doctor_specialties)

        print(f"✅ Tạo: {user.last_name} {user.first_name} | {username} | Chuyên khoa: {specialty_names}")
    else:
        print(f"⚠️  Đã tồn tại: {username}")



from cliniconlineapi.models import (
    User,
    Medicine,
    Appointment,
)

customers = []

for i in range(5):

    username = f'customer{i+1}'

    customer, created = User.objects.get_or_create(
        username=username
    )

    if created:

        customer.set_password('Customer@123')

        customer.first_name = f'Khách{i+1}'
        customer.last_name = 'Nguyễn'

        customer.email = f'{username}@gmail.com'

        customer.phone = f'09000000{i+1}'

        customer.role = User.Role.CUSTOMER

        customer.gender = random.choice([
            User.Gender.MALE,
            User.Gender.FEMALE
        ])

        customer.save()

        CustomerProfile.objects.create(
            user=customer,
            height=random.randint(150, 185),
            weight=random.randint(45, 90),
            blood_group=random.choice([
                'A+',
                'B+',
                'O+',
                'AB+'
            ])
        )

        print(f'✅ Created customer: {username}')

    else:
        print(f'⚠️ Customer exists: {username}')

    customers.append(customer)

medicine_names = [
    'Paracetamol',
    'Amoxicillin',
    'Vitamin C',
    'Ibuprofen',
    'Aspirin',
    'Cefixime',
    'Panadol',
    'Decolgen',
]

units = [
    'Viên',
    'Hộp',
    'Chai',
    'Gói'
]

for i in range(100):

    name = f'{random.choice(medicine_names)} {i+1}'

    medicine, created = Medicine.objects.get_or_create(
        name=name,
        defaults={
            'unit': random.choice(units),

            'description': f'Thuốc {name}',

            'stock': random.randint(20, 300),

            'price': Decimal(
                random.randint(5000, 200000)
            ),

            'active': True
        }
    )

    if created:
        print(f'✅ Medicine: {name}')

# =========================================================
# WORKDAY + TIMESLOT + APPOINTMENT
# =========================================================
services = list(ServiceNormal.objects.all())
time_slots_data = [
    (time(8, 0), time(8, 30)),
    (time(8, 30), time(9, 0)),
    (time(9, 0), time(9, 30)),
    (time(9, 30), time(10, 0)),
    (time(10, 0), time(10, 30)),
]

appointments_created = 0
doctors = list(
    User.objects.filter(
        role=User.Role.DOCTOR
    )
)
if not doctors:
    raise Exception("Không có doctor")

for i in range(5):

    customer = random.choice(customers)

    doctor = random.choice(doctors)

    service = random.choice(services)

    work_date = timezone.now().date() + timedelta(
        days=random.randint(1, 5)
    )

    staff_profile = StaffProfile.objects.get(
        user=doctor
    )

    work_day, _ = WorkDay.objects.get_or_create(
        staff_profile=staff_profile,
        date=work_date
    )

    start_time, end_time = random.choice(
        time_slots_data
    )

    time_slot, created = TimeSlot.objects.get_or_create(
        work_day=work_day,
        start_time=start_time,
        defaults={
            'end_time': end_time,
            'status': TimeSlot.Status.AVAILABLE
        }
    )

    if not created:
        continue

    appointment = Appointment.objects.create(
        reason='Khám tổng quát',

        symptoms=random.choice([
            'Đau họng',
            'Sốt',
            'Ho',
            'Mệt mỏi'
        ]),

        status=Appointment.Status.CONFIRMED,

        customer=customer,

        doctor=doctor,

        serviceNormal=service,

        time_slot=time_slot
    )

    time_slot.status = TimeSlot.Status.BOOKED
    time_slot.save()

    appointments_created += 1

    print(
        f'✅ Appointment ID={appointment.id} | '
        f'{customer.username} -> {doctor.username}'
    )