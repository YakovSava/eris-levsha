from rest_framework.permissions import BasePermission

from apps.users.models import Role


class IsMember(BasePermission):
    """Участник, модератор или админ."""

    def has_permission(self, request, view):
        u = request.user
        return bool(u and u.is_authenticated and u.has_role(Role.MEMBER))


class IsModerator(BasePermission):
    """Модератор или админ."""

    def has_permission(self, request, view):
        u = request.user
        return bool(u and u.is_authenticated and u.has_role(Role.MODERATOR))
