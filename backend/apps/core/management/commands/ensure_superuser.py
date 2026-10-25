import os

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = "Создаёт суперпользователя из переменных окружения, если его нет."

    def handle(self, *args, **opts):
        User = get_user_model()
        name = os.environ.get("DJANGO_SUPERUSER_USERNAME")
        pwd = os.environ.get("DJANGO_SUPERUSER_PASSWORD")
        if not name or not pwd or User.objects.filter(username=name).exists():
            return
        User.objects.create_superuser(name, os.environ.get("DJANGO_SUPERUSER_EMAIL", ""), pwd)
        self.stdout.write(f"Superuser {name} created")
