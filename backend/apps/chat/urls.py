from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import AskView, ChatViewSet

router = DefaultRouter()
router.register("chats", ChatViewSet, basename="chat")
urlpatterns = [path("ask/", AskView.as_view()), *router.urls]
