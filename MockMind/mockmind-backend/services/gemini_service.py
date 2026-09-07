import httpx, os, json, asyncio
from dotenv import load_dotenv

load_dotenv()

GEMINI_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_URL = (
    "https://generativelanguage.googleapis.com/v1beta/models/"
    "gemini-2.5-flash:generateContent"
)

async def call_gemini(prompt: str) -> str:
    headers = {"Content-Type": "application/json"}
    params  = {"key": GEMINI_KEY}
    body    = {"contents": [{"parts": [{"text": prompt}]}]}

    # Retry up to 3 times on rate limit (429) with increasing wait
    for attempt in range(3):
        async with httpx.AsyncClient(timeout=60) as client:
            res = await client.post(GEMINI_URL, headers=headers, params=params, json=body)

            if res.status_code == 429:
                wait = (attempt + 1) * 15
                await asyncio.sleep(wait)
                continue

            res.raise_for_status()
            data = res.json()
            return data["candidates"][0]["content"]["parts"][0]["text"]

    raise Exception("Gemini rate limit exceeded. Please wait a moment and try again.")


def clean_json(raw: str) -> str:
    # Strip markdown code blocks Gemini sometimes wraps around JSON
    raw = raw.strip()
    if "```" in raw:
        parts = raw.split("```")
        for part in parts:
            part = part.strip()
            if part.startswith("json"):
                part = part[4:].strip()
            if part.startswith("[") or part.startswith("{"):
                raw = part
                break
    return raw.strip()


async def generate_questions(job_role: str, experience: str, difficulty: str, num: int, skills: list) -> list:
    skills_str = ", ".join(skills[:15]) if skills else "general software skills"
    prompt = f"""
You are a senior technical interviewer.
Generate exactly {num} {difficulty} difficulty interview questions for a {job_role} role.
Candidate has {experience or '0'} years of experience.
Skills from resume: {skills_str}

Rules:
- Questions must be technical and specific to the role
- Mix conceptual, practical and problem-solving questions
- Return ONLY a raw JSON array of strings with no extra text, no markdown, no numbering
- Format: ["Question 1?", "Question 2?", ...]
"""

    raw       = await call_gemini(prompt)
    raw       = clean_json(raw)

    # Extract JSON array even if Gemini adds extra surrounding text
    start = raw.find("[")
    end   = raw.rfind("]") + 1
    if start == -1 or end == 0:
        raise ValueError(f"Gemini did not return a valid JSON array. Response: {raw[:200]}")

    questions = json.loads(raw[start:end])
    if not isinstance(questions, list):
        raise ValueError("Gemini response was not a list")

    return questions


async def evaluate_answers(questions: list, answers: list, job_role: str) -> dict:
    qa_pairs = "\n".join([
        f"Q{i+1}: {q}\nA{i+1}: {a['answer']}"
        for i, (q, a) in enumerate(zip(questions, answers))
    ])
    prompt = f"""
You are a technical interview evaluator for a {job_role} role.
Evaluate each answer and return a JSON object.

{qa_pairs}

Return ONLY this exact JSON format with no extra text or markdown:
{{
  "overall_score": <integer 0-100>,
  "confidence_level": "<Low|Medium|High>",
  "improvement_areas": ["area1", "area2"],
  "feedback": [
    {{"score": <integer 0-100>, "feedback": "detailed feedback"}},
    ...one object per question...
  ]
}}
"""

    raw  = await call_gemini(prompt)
    print("=== RAW GEMINI EVAL RESPONSE ===")
    print(raw)
    print("================================")
    raw  = clean_json(raw)

    # Extract JSON object even if Gemini adds extra surrounding text
    start = raw.find("{")
    end   = raw.rfind("}") + 1
    if start == -1 or end == 0:
        raise ValueError(f"Gemini did not return a valid JSON object. Response: {raw[:200]}")

    result = json.loads(raw[start:end])

    print("=== PARSED RESULT ===")
    print(result)
    print("======================")

    if "overall_score" not in result:
        raise ValueError(
            f"Gemini response is missing 'overall_score' key. "
            f"Keys present: {list(result.keys())}. Raw parsed: {result}"
        )

    return result