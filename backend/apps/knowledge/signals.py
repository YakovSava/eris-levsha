from django.db.models.signals import post_delete, post_save
from django.dispatch import receiver

from apps.core import services

from .models import KnowledgeItem


@receiver(post_save, sender=KnowledgeItem)
def index_item(sender, instance, **kwargs):
    services.index_document(
        f"item-{instance.pk}",
        instance.index_text,
        {"item_id": instance.pk, "kind": instance.kind, "year": instance.year or 0, "event": instance.event},
    )


@receiver(post_delete, sender=KnowledgeItem)
def unindex_item(sender, instance, **kwargs):
    services.delete_document(f"item-{instance.pk}")
