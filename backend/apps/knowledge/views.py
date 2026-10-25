from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.viewsets import ModelViewSet

from apps.core.permissions import IsModerator

from .models import KnowledgeItem
from .serializers import KnowledgeItemSerializer


class KnowledgeItemViewSet(ModelViewSet):
    """Загрузка данных и работа с архивами — модераторы и админы."""

    queryset = KnowledgeItem.objects.all()
    serializer_class = KnowledgeItemSerializer
    permission_classes = [IsModerator]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def perform_create(self, serializer):
        serializer.save(uploaded_by=self.request.user)
