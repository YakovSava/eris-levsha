"""Клиенты внешних сервисов: эмбеддинги (локально), ChromaDB (RAG), LLM (OpenAI-compatible)."""
from functools import lru_cache

import requests
from django.conf import settings


def embed(texts: list[str], kind: str = "passage") -> list[list[float]]:
    r = requests.post(f"{settings.EMBEDDINGS_URL}/embed", json={"texts": texts, "kind": kind}, timeout=60)
    r.raise_for_status()
    return r.json()["embeddings"]


@lru_cache(maxsize=1)
def collection():
    import chromadb

    client = chromadb.HttpClient(host=settings.CHROMA_HOST, port=settings.CHROMA_PORT)
    return client.get_or_create_collection(settings.CHROMA_COLLECTION, metadata={"hnsw:space": "cosine"})


def index_document(doc_id: str, text: str, metadata: dict) -> None:
    collection().upsert(ids=[doc_id], documents=[text], embeddings=embed([text]), metadatas=[metadata])


def delete_document(doc_id: str) -> None:
    collection().delete(ids=[doc_id])


def search(query: str, n: int = 5, where: dict | None = None) -> list[dict]:
    res = collection().query(query_embeddings=embed([query], "query"), n_results=n, where=where or None)
    return [
        {"id": i, "text": d, "meta": m, "distance": dist}
        for i, d, m, dist in zip(res["ids"][0], res["documents"][0], res["metadatas"][0], res["distances"][0])
    ]


def llm_answer(question: str, context: list[str], history: list[dict] | None = None) -> str:
    from openai import OpenAI

    client = OpenAI(base_url=settings.LLM_BASE_URL, api_key=settings.LLM_API_KEY)
    system = (
        "Ты — Левша, ИИ-помощник. Отвечай на языке пользователя, кратко и по делу. "
        "Опирайся на контекст из базы знаний; если ответа там нет — скажи об этом.\n\n"
        "Контекст:\n" + "\n---\n".join(context)
    )
    messages = [{"role": "system", "content": system}, *(history or []), {"role": "user", "content": question}]
    resp = client.chat.completions.create(model=settings.LLM_MODEL, messages=messages)
    return resp.choices[0].message.content or ""
