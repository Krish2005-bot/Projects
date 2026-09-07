# MockMind

MockMind is an AI-powered mock interview platform that helps candidates practice technical and behavioral interviews with real-time, AI-generated questions and feedback.

## Features

- AI-generated interview questions tailored to the candidate's resume and target role
- Real-time interview sessions with adaptive difficulty
- Resume parsing to extract skills and experience
- Post-interview scoring and feedback
- Session history so candidates can track progress over time
- Secure authentication with JWT-based protected routes

## Tech Stack

**Frontend**
- React (Vite)
- React Router

**Backend**
- FastAPI (Python)
- MongoDB
- JWT Authentication
- Google Gemini API (question generation & scoring)
- spaCy (NLP / resume parsing)
- pdfplumber (resume text extraction)

## Project Structure

```
MockMind/
├── mockmind-backend/     # FastAPI backend, routes, services, auth
└── mockmind-frontend/    # React + Vite frontend
```

## Getting Started

### Backend

```bash
cd mockmind-backend
pip install -r requirement.txt
# add your .env file with Mongo URI, Gemini API key, JWT secret, etc.
uvicorn main:app --reload
```

### Frontend

```bash
cd mockmind-frontend
npm install
npm run dev
```

## Environment Variables

Create a `.env` file inside `mockmind-backend/` with:

```
MONGO_URI=your_mongodb_connection_string
GEMINI_API_KEY=your_gemini_api_key
JWT_SECRET=your_jwt_secret
```

`.env` files are gitignored and should never be committed.

## Notes

- Built as a 3-member team project for Full Stack Development and Data Science & AI coursework.
- Handles Gemini API rate limiting (429s) gracefully on the backend.

## License

This project is for academic/portfolio purposes.
