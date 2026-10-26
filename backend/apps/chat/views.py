import logging
import re

from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.viewsets import ReadOnlyModelViewSet

from apps.core import services
from apps.core.permissions import IsMember
from apps.knowledge.models import KnowledgeItem

from .models import Chat, Message
from .serializers import AskSerializer, ChatDetailSerializer, ChatSerializer

log = logging.getLogger(__name__)

MEDIA_INTENT = re.compile(r"фот|картин|изображ|photo|picture|image", re.I)
YEAR = re.compile(r"\b(?:19|20)\d{2}\b")


class AskView(APIView):
    """Вопрос боту.

    Гости: ответ без сохранения и без выдачи медиа.
    Участники+: чат сохраняется; запросы вида «скинь фотки … в 2023 году» возвращают вложения.
    """

    permission_classes = [AllowAny]

    def post(self, request):
        s = AskSerializer(data=request.data)
        s.is_valid(raise_exception=True)
        text = s.validated_data["message"]
        user = request.user
        is_member = user.is_authenticated and user.has_role("member")

        attachments = []
        if is_member and MEDIA_INTENT.search(text):
            where = {"kind": "photo"}
            year = YEAR.search(text)
            if year:
                where = {"$and": [{"kind": "photo"}, {"year": int(year.group(0))}]}
            ids = [h["meta"]["item_id"] for h in services.search(text, n=10, where=where)]
            for item in KnowledgeItem.objects.filter(pk__in=ids):
                attachments.append({"id": item.pk, "title": item.title, "event": item.event,
                                    "year": item.year, "url": item.file.url if item.file else ""})

        chat, history = None, []
        if is_member:
            chat_id = s.validated_data.get("chat_id")
            chat = Chat.objects.filter(user=user, pk=chat_id).first() if chat_id else None
            chat = chat or Chat.objects.create(user=user, title=text[:80])
            recent = chat.messages.order_by("-created_at")[:10]
            history = [{"role": m.role, "content": m.content} for m in reversed(list(recent))]

        try:
            hits = services.search(text, n=5)
            answer = services.llm_answer(text, [h["text"] for h in hits], history)
        except Exception:
            log.exception("Ask failed (vector search or LLM call)")
            return Response({"detail": "Сервис ИИ временно недоступен. Проверьте LLM_* в .env и логи backend."},
                            status=502)

        if chat:
            Message.objects.create(chat=chat, role="user", content=text)
            Message.objects.create(chat=chat, role="assistant", content=answer, attachments=attachments)
        return Response({"answer": answer, "attachments": attachments,
                         "chat_id": chat.pk if chat else None, "saved": chat is not None})


class ChatViewSet(ReadOnlyModelViewSet):
    """Сохранённые чаты участника."""

    permission_classes = [IsMember]

    def get_queryset(self):
        return Chat.objects.filter(user=self.request.user)

    def get_serializer_class(self):
        return ChatDetailSerializer if self.action == "retrieve" else ChatSerializer
