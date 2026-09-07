from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from middleware.auth_middleware import get_current_user
import tempfile, os
from resume_extractor import extract_text_from_pdf, extract_resume_data

router = APIRouter()

@router.post("/parse")
async def parse_resume(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(400, "Only PDF files are supported")

    contents = await file.read()

    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
        tmp.write(contents)
        tmp_path = tmp.name

    try:
        text   = extract_text_from_pdf(tmp_path)
        result = extract_resume_data(text)
    except Exception as e:
        raise HTTPException(422, str(e))
    finally:
        os.unlink(tmp_path)

    return result