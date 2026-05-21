from django.utils  import timezone
from django.core import validators
from datetime import timedelta, date
import re

from rest_framework import serializers
from rest_framework.exceptions import ValidationError

# ========================== USER VALIDATORS ==============================
class NameRegexValidator(validators.RegexValidator):
    regex = r'^[a-zA-ZÀ-ỹ\s]+$'
    message = 'Họ tên chỉ được chứa chữ cái và khoảng trắng.'


class MinLengthValidator(validators.MinLengthValidator):
    def __init__(self, limit_value=2,message=None):
        if message:
            self.message = message
        super().__init__(limit_value=limit_value)



class MaxLengthValidator(validators.MaxLengthValidator):
    def __init__(self, limit_value=20, message=None):
        if message:
            self.message = message
        super().__init__(limit_value=limit_value)

class PhoneNumberValidator(validators.RegexValidator):
    regex=r'^\+?\d{9,15}$'
    message="Số điện thoại phải có từ 9 đến 15 chữ số và có thể bắt đầu bằng dấu +."


class NameValidator:
    def __init__(self, min_length=2, max_length=50,
                    min_message=None,
                    max_message=None,):
        self.validators = [
            NameRegexValidator(),
            MinLengthValidator(min_length,min_message),
            MaxLengthValidator(max_length, max_message),
        ]

    def __call__(self, value):
        errors = []

        for validator in self.validators:
            try:
                validator(value)
            except Exception as e:
                errors.append(e.detail if hasattr(e, "detail") else str(e))

        if errors:
            raise ValidationError(errors)

# ===============================================================================
def has_dangerous_keywords(value):
    """Kiểm tra SQL injection keywords"""
    keywords = ['DROP', 'DELETE', 'INSERT', 'UPDATE', 'UNION', 'SELECT', 'ALTER', 'CREATE']
    return any(re.search(rf'\b{kw}\b', value, re.IGNORECASE) for kw in keywords)


def has_xss_patterns(value):
    """Kiểm tra XSS patterns"""
    patterns = [r'<script', r'javascript:', r'onerror=', r'onclick=']
    return any(re.search(pattern, value, re.IGNORECASE) for pattern in patterns)
# ========================== MEDICINE VALIDATORS ==============================
class  MedicineNameRegexValidator(validators.RegexValidator):
    regex = r'^[a-zA-Z0-9\s\-\(\)\.]+$'
    message = 'Tên thuốc chỉ được chứa chữ, số, khoảng trắng, và dấu -()'

class MedicineNameValidator:
    def __init__(self, min_length=2, max_length=100):
        self.validators = [
            MedicineNameRegexValidator(),
            MinLengthValidator(min_length),
            MaxLengthValidator(max_length),
        ]

    def __call__(self, value):
        errors = []
        for validator in self.validators:
            try:
                validator(value)
            except Exception as e:
                errors.append(e.detail if hasattr(e, "detail") else str(e))

            # ✅ Thêm check SQL injection & XSS
            if has_dangerous_keywords(value):
                errors.append("Tên thuốc chứa từ khóa không hợp lệ")

            if has_xss_patterns(value):
                errors.append("Tên thuốc chứa nội dung không hợp lệ")

            if errors:
                raise ValidationError(errors)


#đơn vị thuốc
class UnitValidator:
    VALID_UNITS = ['viên', 'chai', 'ống', 'hộp', 'vỉ', 'gói', 'lọ', 'ml']

    def __call__(self, value):
        if value not in self.VALID_UNITS:
            raise ValidationError(
                f"Đơn vị phải là một trong: {', '.join(self.VALID_UNITS)}"
            )

#mô tả thuốc
class DescriptionValidator:
    def __init__(self, max_length=1000):
        self.max_length = max_length

    def __call__(self, value):
        if not value:
            return

        if len(value) > self.max_length:
            raise ValidationError(
                f"Mô tả không được quá {self.max_length} ký tự"
            )

        if has_xss_patterns(value):
            raise ValidationError("Mô tả chứa nội dung không hợp lệ")

        if has_dangerous_keywords(value):
            raise ValidationError("Mô tả chứa từ khóa không hợp lệ")

#số lượng thuốc
class StockValidator:
    MIN_STOCK = 0
    MAX_STOCK = 1000000

    def __call__(self, value):
        errors = []

        # Kiểm tra kiểu dữ liệu
        if not isinstance(value, int):
            errors.append("Số lượng phải là số nguyên")

        # Kiểm tra phạm vi
        if value < self.MIN_STOCK:
            errors.append("Số lượng không được âm")

        if value > self.MAX_STOCK:
            errors.append(f"Số lượng không được quá {self.MAX_STOCK:,}")

        if errors:
            raise ValidationError(errors)

#ngày sản xuất
class ProductionDateValidator:
    def __call__(self, value):
        if not value:
            return
        today = timezone.now().date()
        if value > today:
            raise ValidationError(
                "Ngày sản xuất không được lớn hơn ngày hôm nay"
            )

#ngày hết hạn
class ExpiryDateValidator:
    MAX_YEARS = 10
    def __call__(self, value):
        if not value:
            raise ValidationError("Ngày hết hạn là bắt buộc")
        today = timezone.now().date()
        # Ngày hết hạn phải > ngày hôm nay
        if value <= today:
            raise ValidationError(
                "Ngày hết hạn phải lớn hơn ngày hôm nay"
            )

        # Không được quá 10 năm
        max_date = today + timedelta(days=365 * self.MAX_YEARS)
        if value > max_date:
            raise ValidationError(
                f"Ngày hết hạn không được vượt quá {self.MAX_YEARS} năm"
            )

#khoảng ngày (expiry > production)
class DateRangeValidator:
    def __call__(self, data):
        production_date = data.get('production_date')
        expiry_date = data.get('expiry_date')

        if production_date and expiry_date:
            if expiry_date <= production_date:
                raise ValidationError({
                    'expiry_date': 'Ngày hết hạn phải lớn hơn ngày sản xuất'
                })

#giá thuốc
class PriceValidator:
    MIN_PRICE = 0
    MAX_PRICE = 9999999.99

    def __call__(self, value):
        errors = []
        try:
            float_value = float(value)
        except (ValueError, TypeError):
            errors.append("Giá phải là số")
            raise ValidationError(errors)

        if float_value < self.MIN_PRICE:
            errors.append("Giá không được âm")

        if float_value > self.MAX_PRICE:
            errors.append(f"Giá không được quá {self.MAX_PRICE:,.2f}")

        # Kiểm tra số chữ số thập phân
        value_str = str(value)
        if '.' in value_str:
            decimals = len(value_str.split('.')[1])
            if decimals > 2:
                errors.append("Giá chỉ được tối đa 2 chữ số thập phân")

        if errors:
            raise ValidationError(errors)

class MedicineDataValidator:
    def __init__(self):
        self.name_validator = MedicineNameValidator()
        self.unit_validator = UnitValidator()
        self.description_validator = DescriptionValidator()
        self.stock_validator = StockValidator()
        self.production_date_validator = ProductionDateValidator()
        self.expiry_date_validator = ExpiryDateValidator()
        self.date_range_validator = DateRangeValidator()
        self.price_validator = PriceValidator()

    def validate_field(self,field_name,value):
        validators_map={
            'name': self.name_validator,
            'unit': self.unit_validator,
            'description': self.description_validator,
            'stock': self.stock_validator,
            'production_date': self.production_date_validator,
            'expiry_date': self.expiry_date_validator,
            'price': self.price_validator,
        }

        validator = validators_map.get(field_name)
        if validator:
            validator(value)

    def validate_object(self, data):
        self.date_range_validator(data)


# ========================== Prescription VALIDATORS ==============================
class PrescriptionInstructionNotesValidator:
    MAX_LENGTH = 1000

    def __call__(self, value):
        if not value:
            return

        errors = []
        if len(value) > self.MAX_LENGTH:
            errors.append(f"Ghi chú không được quá {self.MAX_LENGTH}")

        if has_dangerous_keywords(value):
            errors.append("Ghi chú chứa từ khóa không hợp lệ ")

        if has_xss_patterns(value):
            errors.append("Ghi chú chứa nội dung không hợp lệ")

        if errors:
            raise ValidationError(errors)


class PrescriptionDetailsValidator:
    MIN_DETAILS = 1
    MAX_DETAILS = 100

    def __call__(self, value):
        errors = {}

        if not value:
            raise ValidationError("Đơn thuốc phải có ít nhất 1 mặt hàng")

        if len(value) < self.MIN_DETAILS:
            raise ValidationError(f"Tối thiểu {self.MIN_DETAILS} mặt hàng")

        if len(value) > self.MAX_DETAILS:
            raise ValidationError(f"Tối đa {self.MAX_DETAILS} mặt hàng")

        medicine_ids = []
        for idx, detail in enumerate(value):
            medicine = detail.get('medicine')

            if not medicine:
                errors[f'details[{idx}]'] = "Thuốc là bắt buộc"
                continue

            medicine_ids.append(medicine.id)

        # Kiểm tra trùng
        if len(medicine_ids) != len(set(medicine_ids)):
            raise ValidationError("Không được thêm cùng 1 thuốc nhiều lần")

        if errors:
            raise ValidationError(errors)


class PrescriptionDetailQuantityValidator:
    MIN = 1
    MAX = 10000
    def __call__(self, value):
        errors = []
        if not isinstance(value, int):
            errors.append("Số lượng phải là số nguyên")

        if value < self.MIN:
            errors.append(f"Số lượng tối thiểu là {self.MIN}")

        if value > self.MAX:
            errors.append(f"Số lượng tối đa là {self.MAX}")

        if errors:
            raise ValidationError(errors)

#liều dùng
class PrescriptionDetailDosageValidator:
    MAX_LENGTH = 100

    def __call__(self, value):
        if not value:
            raise ValidationError("Liều dùng là bắt buộc")

        errors = []

        if len(value) > self.MAX_LENGTH:
            errors.append(f"Liều dùng không được quá {self.MAX_LENGTH} ký tự")

        if has_xss_patterns(value):
            errors.append("Liều dùng chứa nội dung không hợp lệ")

        if has_dangerous_keywords(value):
            errors.append("Liều dùng chứa từ khóa không hợp lệ")

        if errors:
            raise ValidationError(errors)


class PrescriptionDetailUnitPriceValidator:
    MIN = 0
    MAX = 9999999.99

    def __call__(self, value):
        errors = []

        try:
            float_value = float(value)
        except (ValueError, TypeError):
            errors.append("Giá phải là số")
            raise ValidationError(errors)

        if float_value < self.MIN:
            errors.append("Giá không được âm")

        if float_value > self.MAX:
            errors.append(f"Giá không được quá {self.MAX:,.2f}")

        value_str = str(value)
        if '.' in value_str:
            decimals = len(value_str.split('.')[1])
            if decimals > 2:
                errors.append("Giá chỉ được tối đa 2 chữ số thập phân")

        if errors:
            raise ValidationError(errors)


class PrescriptionDetailMedicineStockValidator:
    def __call__(self, medicine, quantity):
        if not medicine:
            raise ValidationError("Thuốc là bắt buộc")

        # Refresh để lấy stock mới nhất
        medicine.refresh_from_db()

        if medicine.stock < quantity:
            raise ValidationError(
                f"Thuốc '{medicine.name}' không đủ! "
                f"Yêu cầu {quantity}, còn {medicine.stock} {medicine.unit}."
            )

class PrescriptionCreatePermissionValidator:
    def __call__(self, medical_record, user):
        if medical_record.appointment.doctor != user:
            raise ValidationError("Bạn không phải bác sĩ phụ trách hồ sơ này")

class PrescriptionUpdatePermissionValidator:
    def __call__(self, prescription, user):
        if prescription.medical_record.appointment.doctor != user:
            raise ValidationError("Bạn không có quyền sửa đơn thuốc này")


class PrescriptionDataValidator:
    def __init__(self):
        self.instruction_notes_validator = PrescriptionInstructionNotesValidator()
        self.details_validator = PrescriptionDetailsValidator()
        self.quantity_validator = PrescriptionDetailQuantityValidator()
        self.dosage_validator = PrescriptionDetailDosageValidator()
        self.unit_price_validator = PrescriptionDetailUnitPriceValidator()
        self.medicine_stock_validator = PrescriptionDetailMedicineStockValidator()
        self.create_permission_validator = PrescriptionCreatePermissionValidator()
        self.update_permission_validator = PrescriptionUpdatePermissionValidator()

    def validate_notes(self, value):
        self.instruction_notes_validator(value)

    def validate_details(self, value):
        self.details_validator(value)

    def validate_quantity(self, value):
        self.quantity_validator(value)

    def validate_dosage(self, value):
        self.dosage_validator(value)

    def validate_unit_price(self, value):
        self.unit_price_validator(value)

    def validate_medicine_stock(self, medicine, quantity):
        self.medicine_stock_validator(medicine, quantity)

    def validate_create_permission(self, medical_record, user):
        self.create_permission_validator(medical_record, user)

    def validate_update_permission(self, prescription, user):
        self.update_permission_validator(prescription, user)

# ========================== MedicalRecord VALIDATORS ==============================
class MedicalRecordDiagnosisValidator:
    MIN_LENGTH = 5
    MAX_LENGTH = 2000

    def __call__(self, value):
        if not value:
            raise ValidationError(
                "Chẩn đoán là bắt buộc"
            )
        errors = []
        value = value.strip()

        if len(value) < self.MIN_LENGTH:
            errors.append(f"Chẩn đoán tối thiểu {self.MIN_LENGTH} ký tự")
        if len(value) > self.MAX_LENGTH:
            errors.append(f"Chẩn đoán tối đa {self.MAX_LENGTH} ký tự")

        if has_xss_patterns(value):
            errors.append("Chẩn đoán chứa nội dung không hợp lệ")
        if has_dangerous_keywords(value):
            errors.append("Chẩn đoán chứa từ khóa nguy hiểm")

        if errors:
            raise ValidationError(errors)

class MedicalRecordSymptomsValidator:
    MIN_LENGTH = 5
    MAX_LENGTH = 2000
    def __call__(self, value):
        if not value:
            return
        errors = []
        if len(value) < self.MIN_LENGTH:
            errors.append(f"Triệu chứng tối thiểu {self.MIN_LENGTH} ký tự")
        if len(value) > self.MAX_LENGTH:
            errors.append(f"Triệu chứng tối đa {self.MAX_LENGTH} ký tự")

        if has_xss_patterns(value):
            errors.append("Chẩn đoán chứa nội dung không hợp lệ")
        if has_dangerous_keywords(value):
            errors.append("Chẩn đoán chứa từ khóa nguy hiểm")

        if errors:
            raise ValidationError(errors)

class MedicalRecordNotesValidator:
    MAX_LENGTH = 3000

    def __call__(self, value):
        if not value:
            return
        errors = []
        if len(value) > self.MAX_LENGTH:
            errors.append(f"Ghi chú tối đa {self.MAX_LENGTH} ký tự")

        if has_xss_patterns(value):
            errors.append("Ghi chú chứa nội dung không hợp lệ")
        if has_dangerous_keywords(value):
            errors.append("Ghi chú chứa từ khóa nguy hiểm")

        if errors:
            raise ValidationError(errors)

class MedicalRecordFollowUpDateValidator:
    def __call__(self, value):
        if not value:
            return
        errors = []
        today = date.today()
        if value <= today:
            errors.append("Ngày tái khám phải sau ngày hiện tại")
        if value > today + timedelta(days=365):
            errors.append("Ngày tái khám không hợp lệ")

        if errors:
            raise ValidationError(errors)


class MedicalRecordCreatePermissionsValidator:
    def __call__(self,appointment, user):
        if appointment.doctor != user:
            raise ValidationError("Bạn không phải là bác sĩ của lịch hẹn này")

class MedicalRecordUpdatePermissionValidator:
    def __call__(self, medical_record, user):
         if medical_record.appointment.doctor != user:
            raise ValidationError("Bạn không có quyền sửa bệnh án này")

class MedicalRecordDataValidator:
    def __init__(self):
         self.diagnosis_validator = MedicalRecordDiagnosisValidator()
         self.symptoms_validator = MedicalRecordSymptomsValidator()
         self.medical_notes_validator = MedicalRecordNotesValidator()
         self.follow_up_date_validator = MedicalRecordFollowUpDateValidator()
         self.create_permission_validator = MedicalRecordCreatePermissionsValidator()
         self.update_permission_validator = MedicalRecordUpdatePermissionValidator()

    def validate_diagnosis(self, value):
        self.diagnosis_validator(value)

    def validate_symptoms(self, value):
        self.symptoms_validator(value)

    def validate_medical_notes(self, value):
        self.medical_notes_validator(value)

    def validate_follow_up_date(self, value):
        self.follow_up_date_validator(value)

    def validate_create_permission(self, appointment, user):
        self.create_permission_validator(appointment, user)

    def validate_update_permission(self, medical_record, user):
        self.update_permission_validator(medical_record, user)

# ========================== TestResult VALIDATORS ==============================

class TestResultNameValidator:
    MIN_LENGTH = 3
    MAX_LENGTH = 200

    def __call__(self, value):
        if not value:
            return
        errors = []
        if len(value.strip()) < self.MIN_LENGTH:
            errors.append(f"Tên xét nghiệm tối thiểu {self.MIN_LENGTH} ký tự")
        if len(value) > self.MAX_LENGTH:
            errors.append(f"Tên xét nghiệm tối đa {self.MAX_LENGTH} ký tự")
        if has_xss_patterns(value):
            errors.append("Tên xét nghiệm chứa nội dung không hợp lệ")
        if has_dangerous_keywords(value):
            errors.append("Tên xét nghiệm chứa từ khóa nguy hiểm")
        if errors:
            raise ValidationError(errors)


class TestResultValueValidator:
    MIN_LENGTH = 1
    MAX_LENGTH = 5000

    def __call__(self, value):
        if not value:
            return
        errors = []
        if len(value.strip()) < self.MIN_LENGTH:
            errors.append("Kết quả xét nghiệm không được để trống")
        if len(value) > self.MAX_LENGTH:
            errors.append(f"Kết quả tối đa {self.MAX_LENGTH} ký tự")
        if has_xss_patterns(value):
            errors.append("Kết quả chứa nội dung không hợp lệ")
        if has_dangerous_keywords(value):
            errors.append("Kết quả chứa từ khóa nguy hiểm")
        if errors:
            raise ValidationError(errors)



class TestResultCreatePermissionValidator:
    def __call__(self, medical_record, user):
        if medical_record.appointment.doctor != user:
            raise ValidationError("Bạn không phải bác sĩ phụ trách hồ sơ này")


class TestResultUpdatePermissionValidator:
    def __call__(self, test_result, user):
        if test_result.medical_record.appointment.doctor != user:
            raise ValidationError("Bạn không có quyền sửa kết quả xét nghiệm này")


class TestResultDataValidator:
    def __init__(self):
        self.name_validator = TestResultNameValidator()
        self.result_validator = TestResultValueValidator()
        self.test_result_price_validator = PriceValidator()
        self.create_permission_validator = TestResultCreatePermissionValidator()
        self.update_permission_validator = TestResultUpdatePermissionValidator()


    def validate_test_name(self, value):
        self.name_validator(value)

    def validate_result(self, value):
        self.result_validator(value)

    def validate_test_result_price(self,value):
        self.test_result_price_validator(value)

    def validate_create_permission(self, medical_record, user):
        self.create_permission_validator(medical_record, user)

    def validate_update_permission(self, test_result, user):
        self.update_permission_validator(test_result, user)