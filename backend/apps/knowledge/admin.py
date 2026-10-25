from django.contrib import admin

from .models import KnowledgeItem


@admin.register(KnowledgeItem)
class KnowledgeItemAdmin(admin.ModelAdmin):
    list_display = ("title", "kind", "event", "year", "created_at")
    list_filter = ("kind", "year")
    search_fields = ("title", "event", "description")
