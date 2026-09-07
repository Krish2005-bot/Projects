import re
import pdfplumber


JOB_ROLE_SKILLS = {
    'AI Engineer':                ['python', 'machine learning', 'deep learning', 'numpy', 'pandas', 'scikit-learn', 'tensorflow', 'pytorch', 'model deployment', 'rest apis'],
    'Android Development':        ['java', 'kotlin', 'android studio', 'xml', 'apis', 'git', 'firebase', 'mvvm', 'gradle'],
    'Automation Engineer':        ['python', 'java', 'selenium', 'test automation', 'ci/cd', 'pytest', 'testng', 'jira'],
    'Backend Development':        ['python', 'java', 'django', 'flask', 'spring boot', 'sql', 'rest apis', 'authentication', 'git'],
    'Big Data Engineer':          ['hadoop', 'spark', 'sql', 'python', 'data pipelines', 'hive', 'kafka', 'etl'],
    'Blockchain Development':     ['solidity', 'smart contracts', 'ethereum', 'web3', 'cryptography', 'truffle', 'ganache'],
    'Cyber Security Analyst':     ['networking', 'linux', 'cyber security', 'risk analysis', 'vulnerability assessment', 'siem', 'incident response'],
    'Computer Vision Engineer':   ['python', 'opencv', 'deep learning', 'image processing', 'cnn', 'tensorflow', 'pytorch'],
    'Cloud Engineer':             ['aws', 'azure', 'gcp', 'linux', 'networking', 'cloud security', 'terraform', 'docker'],
    'Data Science':               ['python', 'statistics', 'machine learning', 'sql', 'pandas', 'numpy', 'data visualization', 'big data'],
    'Data Analyst':               ['excel', 'sql', 'python', 'power bi', 'tableau', 'data cleaning', 'data visualization'],
    'DevOps Engineer':            ['linux', 'docker', 'ci/cd', 'kubernetes', 'cloud', 'jenkins', 'ansible', 'git'],
    'Database Administrator':     ['sql', 'database design', 'performance tuning', 'backup and recovery', 'indexing', 'mysql', 'postgresql'],
    'Embedded Systems Engineer':  ['c', 'c++', 'microcontrollers', 'embedded linux', 'hardware basics', 'rtos'],
    'ETL Developer':              ['sql', 'python', 'data warehousing', 'etl tools', 'airflow', 'data pipelines'],
    'Frontend Developer':         ['html', 'css', 'javascript', 'react', 'responsive design', 'bootstrap', 'git'],
    'Full Stack Development':     ['html', 'css', 'javascript', 'python', 'java', 'sql', 'react', 'nodejs'],
    'Game Development':           ['unity', 'unreal engine', 'c#', 'c++', 'game physics', '3d modeling'],
    'IoT Engineer':               ['embedded systems', 'sensors', 'networking', 'python', 'c', 'mqtt', 'raspberry pi'],
    'Machine Learning Engineer':  ['python', 'ml algorithms', 'numpy', 'pandas', 'model deployment', 'docker', 'mlops'],
    'Mobile App Development':     ['flutter', 'react native', 'apis', 'ui design', 'firebase'],
    'Network Engineer':           ['networking', 'tcp/ip', 'routing', 'switching', 'firewalls', 'dns'],
    'Python Development':         ['python', 'oop', 'libraries', 'file handling', 'exception handling', 'unit testing'],
    'QA Engineer':                ['manual testing', 'automation basics', 'test cases', 'bug tracking', 'jira'],
    'Software Engineer':          ['programming', 'dsa', 'sql', 'html', 'css', 'nodejs', 'react', 'c++', 'python', 'java', 'git'],
    'UI/UX Designer':             ['figma', 'ux principles', 'wireframing', 'prototyping', 'user research'],
    'Web Development':            ['html', 'css', 'javascript', 'responsive design', 'seo basics'],
}

# Regex patterns to detect section headers in the resume
SECTION_HEADERS = {
    "skills":     r"^[ \t]*(skills|technical\s*skills|programming\s*skills|professional\s*skills)[ \t]*:?[ \t]*$",
    "education":  r"^[ \t]*(education|academic|qualifications|education\s*and\s*training)[ \t]*$",
    "experience": r"^[ \t]*(experience|work\s*experience|professional\s*experience|data\s*science|management)[ \t]*$",
    "projects":   r"^[ \t]*(projects?|personal\s*projects?|academic\s*projects?|key\s*projects?|major\s*projects?|portfolio)[ \t]*:?[ \t]*$",
}

REMOVE_WORDS = {"languages", "technologies", "programming", "skills"}

# Each tuple: (regex pattern, display label, priority — lower number = higher qualification)
DEGREE_KEYWORDS = [
    (r'(?i)\b(phd|ph\.d|doctor of philosophy)\b',                  'PhD',               1),
    (r'(?i)\b(m\.?tech|master of technology|mtech)\b',             'M.Tech',            2),
    (r'(?i)\b(m\.?s|master of science)\b',                         'M.S',               2),
    (r'(?i)\b(m\.?b\.?a|master of business administration|mba)\b', 'MBA',               2),
    (r'(?i)\b(m\.?c\.?a|master of computer applications|mca)\b',   'MCA',               2),
    (r'(?i)\b(master\'?s? degree|masters?)\b',                     "Master's Degree",   2),
    (r'(?i)\b(b\.?tech|bachelor of technology|btech)\b',           'B.Tech',            3),
    (r'(?i)\b(b\.?e|bachelor of engineering)\b',                   'B.E',               3),
    (r'(?i)\b(b\.?s|bachelor of science)\b',                       'B.S',               3),
    (r'(?i)\b(b\.?c\.?a|bachelor of computer applications|bca)\b', 'BCA',               3),
    (r'(?i)\b(b\.?b\.?a|bachelor of business administration|bba)\b','BBA',              3),
    (r'(?i)\b(bachelor\'?s? degree|bachelors?)\b',                 "Bachelor's Degree", 3),
    (r'(?i)\b(diploma)\b',                                         'Diploma',           4),
    (r'(?i)\b(12th|xii|higher secondary|hsc)\b',                   '12th Grade',        5),
    (r'(?i)\b(10th|x|secondary|ssc)\b',                            '10th Grade',        6),
]


def extract_text_from_pdf(pdf_path: str) -> str:
    text = ""
    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
    if not text.strip():
        raise ValueError("PDF appears empty or scanned — no text layer found.")
    return text


def extract_contact_info(text: str) -> dict:
    email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
    phone_pattern = r'(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}'

    emails = re.findall(email_pattern, text)
    phones = re.findall(phone_pattern, text)

    # Name is assumed to be in the first 5 lines, short, no digits or contact info
    name = "Not found"
    for line in text.split('\n')[:5]:
        line = line.strip()
        if (len(line) > 3 and len(line) < 50
                and not any(c.isdigit() for c in line)
                and '@' not in line
                and not re.search(phone_pattern, line)):
            name = line
            break

    return {
        "name":    name,
        "email":   emails[0] if emails else "Not found",
        "contact": phones[0] if phones else "Not found",
    }


def find_sections(text: str) -> dict:
    text_lower = text.lower()
    positions  = []

    for section_name, pattern in SECTION_HEADERS.items():
        for match in re.finditer(pattern, text_lower, re.I | re.M):
            # Calculate exact line boundaries to avoid including the header line in content
            line_start = text_lower.rfind("\n", 0, match.start()) + 1
            line_end   = text_lower.find("\n", match.start())
            line_end   = line_end if line_end != -1 else len(text_lower)
            positions.append((line_start, line_end, section_name))

    positions.sort()
    sections = {}

    for i, (_, line_end, section_name) in enumerate(positions):
        end     = positions[i + 1][0] if i + 1 < len(positions) else len(text)
        content = text[line_end:end]
        sections[section_name] = content.strip()

    return sections


def extract_skills(skills_text: str, job_role: str = None) -> dict:
    skills_text = skills_text.lower().replace(":", ",")
    raw_skills  = re.split(r'[,/\n•]\s*|\s{2,}', skills_text)

    # Multi-word skills are added both as a phrase and as individual words
    # so partial matches work in both directions during scoring
    cleaned = []
    for s in raw_skills:
        s = s.strip()
        if not s:
            continue
        if len(s.split()) > 1:
            cleaned.append(s)
            cleaned.extend(s.split())
        else:
            cleaned.append(s)

    all_skills = list(set(
        s for s in cleaned
        if s and s not in REMOVE_WORDS
    ))

    if not job_role:
        return {"all_skills": all_skills, "matched": [], "unmatched": [], "match_score": None}

    required = JOB_ROLE_SKILLS.get(job_role, [])
    matched, unmatched = [], []

    # Bidirectional substring match: catches partial skill names in both directions
    for req in required:
        found = any(req in usr or usr in req for usr in all_skills)
        (matched if found else unmatched).append(req)

    matched     = list(set(matched))
    match_score = round((len(matched) / len(required)) * 100, 2) if required else None

    return {
        "all_skills":  all_skills,
        "matched":     matched,
        "unmatched":   unmatched,
        "match_score": match_score,
    }


def extract_degree(text_lower: str) -> str:
    found = []
    for pattern, label, priority in DEGREE_KEYWORDS:
        if re.search(pattern, text_lower):
            found.append((label, priority))

    if not found:
        return "Not Found"

    # Return the highest qualification found (lowest priority number)
    found.sort(key=lambda x: x[1])
    return found[0][0]


def extract_projects(projects_text: str) -> list:
    if not projects_text:
        return []

    lines         = projects_text.split("\n")
    projects      = []
    current       = None
    title_pattern = re.compile(r"^(\d+[\.\)]\s+|[-•●▪*]\s*)?([A-Z][^\n]{3,60})$")
    tech_pattern  = re.compile(r"(tech(nologies|nology|[ ]?stack)?|tools?|built with|using|stack)\s*[:\-]", re.I)
    github_pat    = re.compile(r"github\.com/\S+", re.I)

    for line in lines:
        stripped = line.strip()
        if not stripped:
            continue

        github_match = github_pat.search(stripped)
        is_title     = (title_pattern.match(stripped) and len(stripped) < 80 and not stripped.endswith("."))

        if github_match and current and not is_title:
            link = github_match.group()
            current["github"] = link if link.startswith("http") else f"https://{link}"
            continue

        if tech_pattern.search(stripped) and current:
            tech_text = re.sub(r".*?[:\-]\s*", "", stripped, count=1)
            current["tech_stack"] = [t.strip() for t in re.split(r"[,|/]", tech_text) if t.strip()]
            continue

        if is_title:
            if current:
                projects.append(current)
            clean_title = re.sub(r"^(\d+[\.\)]\s+|[-•●▪*]\s*)", "", stripped).strip()
            current = {"title": clean_title, "description": [], "tech_stack": [], "github": None}
        elif current:
            current["description"].append(stripped)

    if current:
        projects.append(current)

    for p in projects:
        p["description"] = " ".join(p["description"]).strip()
        if not p["github"]:
            del p["github"]

    return projects


def extract_resume_data(text: str, job_role: str = None) -> dict:
    text_clean = re.sub(r"\n{3,}", "\n\n", text)
    text_clean = re.sub(r"[ \t]{2,}", " ", text_clean)
    text_lower = text_clean.lower()

    sections     = find_sections(text_clean)
    contact_info = extract_contact_info(text_clean)
    degree       = extract_degree(text_lower)

    skills_result = {"all_skills": [], "matched": [], "unmatched": [], "match_score": None}
    if sections.get("skills"):
        skills_result = extract_skills(sections["skills"], job_role)

    projects = extract_projects(sections.get("projects", ""))

    return {
        "contact":        contact_info,
        "degree":         degree,
        "sections_found": list(sections.keys()),
        "skills":         skills_result,
        "projects":       projects,
        "total_skills":   len(skills_result["all_skills"]),
        "total_projects": len(projects),
    }


def create_app():
    try:
        from fastapi import FastAPI, UploadFile, File, HTTPException, Query
        from fastapi.middleware.cors import CORSMiddleware
        import tempfile, os
    except ImportError:
        return None

    app = FastAPI(title="MockMind Resume Extractor")
    app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

    @app.post("/resume/parse")
    async def parse(file: UploadFile = File(...), job_role: str = Query(None)):
        if not file.filename.endswith(".pdf"):
            raise HTTPException(400, "Only PDF files supported")
        contents = await file.read()
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
            tmp.write(contents)
            tmp_path = tmp.name
        try:
            text   = extract_text_from_pdf(tmp_path)
            result = extract_resume_data(text, job_role)
        except Exception as e:
            raise HTTPException(422, str(e))
        finally:
            os.unlink(tmp_path)
        return result

    @app.get("/health")
    def health():
        return {"status": "ok"}

    return app


if __name__ == "__main__":
    import json

    demo = """
Krish Patel
krish@email.com | +91 9876543210

SKILLS
Python, JavaScript, React, FastAPI, MongoDB, Machine Learning, scikit-learn, Pandas, NumPy, Docker, Git

PROJECTS

AI Interview Preparation Platform
Full-stack web app that generates interview questions using Gemini API based on resume.
Tech Stack: React, FastAPI, MongoDB, spaCy, Gemini API
github.com/krish/mockmind

Customer Churn Prediction
XGBoost-based ML model with 91% accuracy to predict customer churn.
Tech Stack: Python, XGBoost, scikit-learn, Streamlit, Pandas
github.com/krish/churn-prediction

EDUCATION
B.Tech CSE — L. J. Institute of Engineering and Technology — 2023-2027

EXPERIENCE
ML Intern — XYZ Company — June 2024
Built REST APIs using FastAPI and deployed on AWS EC2.
"""

    result = extract_resume_data(demo, job_role="Data Science")
    print(json.dumps(result, indent=2))