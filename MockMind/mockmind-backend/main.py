from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import auth, resume, interview

app = FastAPI(title="MockMind API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router,      prefix="/auth")
app.include_router(resume.router,    prefix="/resume")
app.include_router(interview.router, prefix="/interview")

@app.get("/")
def root():
    return {"status": "MockMind API running"}