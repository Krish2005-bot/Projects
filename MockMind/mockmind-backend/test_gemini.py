import httpx, os, asyncio
from dotenv import load_dotenv

load_dotenv()

KEY = os.getenv("GEMINI_API_KEY")
URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent"

async def test():
    body = {"contents": [{"parts": [{"text": "Say hello in one word"}]}]}
    async with httpx.AsyncClient(timeout=30) as client:
        res = await client.post(URL, params={"key": KEY}, json=body)
        print("Status:", res.status_code)
        print("Response:", res.text[:300])

asyncio.run(test())