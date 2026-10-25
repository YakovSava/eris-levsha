import os

from fastapi import FastAPI
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer

MODEL_NAME = os.environ.get("EMBEDDINGS_MODEL", "intfloat/multilingual-e5-small")
model = SentenceTransformer(MODEL_NAME)
app = FastAPI(title="Levsha embeddings")


class EmbedRequest(BaseModel):
    texts: list[str]
    kind: str = "passage"  # "query" | "passage" (E5 prefixes)


@app.get("/health")
def health():
    return {"status": "ok", "model": MODEL_NAME}


@app.post("/embed")
def embed(req: EmbedRequest):
    prefix = "query: " if req.kind == "query" else "passage: "
    vectors = model.encode([prefix + t for t in req.texts], normalize_embeddings=True)
    return {"embeddings": vectors.tolist()}
