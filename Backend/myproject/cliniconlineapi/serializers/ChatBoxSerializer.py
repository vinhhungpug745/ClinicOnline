from rest_framework import serializers

class GeminiChatSerializer(serializers.Serializer):
    message = serializers.CharField(
        required=True,
        allow_blank=False,
        max_length=1000,
        error_messages={
            "required": "Vui lòng nhập tin nhắn.",
            "blank": "Tin nhắn không được để trống.",
            "max_length": "Tin nhắn không được vượt quá 1000 ký tự.",
        }
    )

    def validate_message(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError("Tin nhắn không được để trống.")
        return value