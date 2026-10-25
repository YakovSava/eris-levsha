from rest_framework import serializers

from .models import KnowledgeItem


class KnowledgeItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = KnowledgeItem
        fields = ("id", "kind", "title", "description", "event", "year", "file", "created_at")
        read_only_fields = ("id", "created_at")
