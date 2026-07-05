import os
import json
import shutil
from pathlib import Path
from contradiction import detect_contradiction

from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

import cognee

app = FastAPI(title="CourtMind API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

REGISTRY_FILE = Path("case_registry.json")


def case_dataset(case_id: str) -> str:
    return f"case_{case_id}"


def extract_text(results):
    if results and hasattr(results[0], "text"):
        return results[0].text
    return str(results)


def load_registry():
    if REGISTRY_FILE.exists():
        return json.loads(REGISTRY_FILE.read_text())
    return {}


def save_registry(registry):
    REGISTRY_FILE.write_text(json.dumps(registry, indent=2))


@app.post("/cases/{case_id}/upload")
async def upload_document(case_id: str, file: UploadFile = File(...)):
    dest = UPLOAD_DIR / f"{case_id}_{file.filename}"
    with dest.open("wb") as f:
        shutil.copyfileobj(file.file, f)

    await cognee.remember(str(dest), dataset_name=case_dataset(case_id))

    registry = load_registry()
    registry[case_id] = {
        "case_id": case_id,
        "filename": file.filename,
    }
    save_registry(registry)

    return {"status": "remembered", "case_id": case_id, "file": file.filename}


class QuestionRequest(BaseModel):
    question: str


@app.post("/cases/{case_id}/ask")
async def ask_case(case_id: str, req: QuestionRequest):
    try:
        results = await cognee.recall(req.question, datasets=[case_dataset(case_id)])
    except Exception:
        raise HTTPException(status_code=404, detail=f"No memory found for case '{case_id}'. Upload a document first.")

    answer = extract_text(results)
    return {"case_id": case_id, "answer": answer}


@app.delete("/cases/{case_id}")
async def forget_case(case_id: str):
    await cognee.forget(dataset=case_dataset(case_id))
    registry = load_registry()
    registry.pop(case_id, None)
    save_registry(registry)
    return {"status": "forgotten", "case_id": case_id}


@app.post("/cases/{case_id}/improve")
async def improve_case(case_id: str):
    await cognee.improve(dataset=case_dataset(case_id))
    return {"status": "memory improved", "case_id": case_id}


@app.post("/cases/{case_id}/contradictions")
async def check_contradictions(case_id: str):
    q1 = "What did the witness say in Hearing 1?"
    q2 = "What did the witness say in Hearing 3?"

    try:
        result1 = await cognee.recall(q1, datasets=[case_dataset(case_id)])
        result2 = await cognee.recall(q2, datasets=[case_dataset(case_id)])
    except Exception:
        raise HTTPException(status_code=404, detail=f"No memory found for case '{case_id}'. Upload a document first.")

    statement_a = extract_text(result1)
    statement_b = extract_text(result2)

    contradiction_result = detect_contradiction(statement_a, statement_b)

    response = {
        "case_id": case_id,
        "hearing_1_statement": statement_a,
        "hearing_3_statement": statement_b,
        "contradiction_check": contradiction_result
    }

    print("RETURNING CONTRADICTIONS RESPONSE:", response)
    return response


@app.get("/cases/{case_id}/memory")
async def memory_status(case_id: str):
    registry = load_registry()
    if case_id in registry:
        return {
            "case_id": case_id,
            "cognee_status": "Cognized",
            "memory_stored": 0,
            "embeddings_created": 0,
        }
    return {
        "case_id": case_id,
        "cognee_status": "No memory yet",
        "memory_stored": 0,
        "embeddings_created": 0,
    }


@app.get("/memory/summary")
async def memory_summary():
    registry = load_registry()
    case_statuses = [
        {"case_id": case_id, "status": "Cognized"}
        for case_id in registry
    ]

    return {
        "total_cases": len(registry),
        "total_documents": len(registry),
        "cases": case_statuses
    }


@app.get("/health")
async def health():
    return {"status": "alive"}
