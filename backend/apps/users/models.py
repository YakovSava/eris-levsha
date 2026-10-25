from django.contrib.auth.models import AbstractUser
from django.db import models


class Role(models.TextChoices):
    MEMBER = "member", "Участник"
    MODERATOR = "moderator", "Модератор"
    ADMIN = "admin", "Админ"


_RANK = {Role.MEMBER: 1, Role.MODERATOR: 2, Role.ADMIN: 3}


class User(AbstractUser):
    role = models.CharField(max_length=16, choices=Role.choices, default=Role.MEMBER)

    def save(self, *args, **kwargs):
        if self.is_superuser:
            self.role = Role.ADMIN
        super().save(*args, **kwargs)

    def has_role(self, minimum: str) -> bool:
        """Иерархия: admin ⊃ moderator ⊃ member. Незарегистрированные — AnonymousUser."""
        return _RANK[Role(self.role)] >= _RANK[Role(minimum)]
