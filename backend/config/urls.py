from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/", include("apps.users.urls")),
    path("api/chat/", include("apps.chat.urls")),
    path("api/knowledge/", include("apps.knowledge.urls")),
]
