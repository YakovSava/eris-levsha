from rest_framework.routers import DefaultRouter

from .views import KnowledgeItemViewSet

router = DefaultRouter()
router.register("items", KnowledgeItemViewSet, basename="knowledge-item")
urlpatterns = router.urls
