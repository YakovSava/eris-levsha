from rest_framework import serializers

from .models import Chat, Message


class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ("id", "role", "content", "attachments", "created_at")


class ChatSerializer(serializers.ModelSerializer):
    class Meta:
        model = Chat
        fields = ("id", "title", "created_at")


class ChatDetailSerializer(ChatSerializer):
    messages = MessageSerializer(many=True, read_only=True)

    class Meta(ChatSerializer.Meta):
        fields = ChatSerializer.Meta.fields + ("messages",)


class AskSerializer(serializers.Serializer):
    message = serializers.CharField(max_length=4000)
    chat_id = serializers.IntegerField(required=False)
