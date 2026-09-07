def compute_confidence(answers: list, questions: list) -> str:
    if not answers:
        return "Low"

    scores = []

    for i, ans in enumerate(answers):
        answer_text  = ans.get("answer", "")
        time_taken   = ans.get("timeTaken", 60)
        word_count   = len(answer_text.split())
        score        = 0

        # Length score — ideal is 30-100 words
        if word_count >= 60:
            score += 40
        elif word_count >= 30:
            score += 25
        elif word_count >= 10:
            score += 10

        # Time score — answered in reasonable time
        if 10 <= time_taken <= 50:
            score += 30
        elif time_taken < 10:
            score += 10
        else:
            score += 20

        # Not skipped
        if answer_text != "[No answer provided]":
            score += 30

        scores.append(score)

    avg = sum(scores) / len(scores)

    if avg >= 70: return "High"
    if avg >= 40: return "Medium"
    return "Low"