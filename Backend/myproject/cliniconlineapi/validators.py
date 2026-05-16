from django.core import validators
from rest_framework.exceptions import ValidationError


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