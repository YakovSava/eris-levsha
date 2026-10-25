from django.conf import settings
from django.db import models


class Kind(models.TextChoices):
    TEXT = "text", "Текст"
    PHOTO = "photo", "Фото"
    ARCHIVE = "archive", "Архив"


class KnowledgeItem(models.Model):
    """Единица данных; её текстовое описание индексируется в ChromaDB."""

    kind = models.CharField(max_length=16, choices=Kind.choices, default=Kind.TEXT)
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    event = models.CharField(max_length=255, blank=True)
    year = models.PositiveSmallIntegerField(null=True, blank=True, db_index=True)
    file = models.FileField(upload_to="knowledge/%Y/%m/", blank=True)
    uploaded_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, on_delete=models.SET_NULL)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.title

    @property
    def index_text(self) -> str:
        return " ".join(p for p in (self.title, self.event, str(self.year or ""), self.description) if p)
