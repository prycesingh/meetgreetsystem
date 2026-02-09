# Meet & Greet Interview Evaluation System

## High-level Architecture Diagram

```text
+-------------------------------+        +------------------------------+
|     Web / Desktop Client      |        |        Admin Dashboard       |
|  Next.js + Electron (React)   |        |   Next.js (Analytics Views)  |
|-------------------------------|        |------------------------------|
| - Question player             |        | - Aggregate metrics          |
| - Camera preview              |        | - Per-user reports           |
| - MediaRecorder capture       |        | - Export / PDF trigger       |
| - Offline queue + sync        |        | - Filters & comparisons      |
+---------------+---------------+        +---------------+--------------+
                | REST APIs (JSON + media uploads)        |
                v                                         v
+-----------------------------------------------------------------------+
|                          FastAPI Backend                              |
|-----------------------------------------------------------------------|
|  API Layer (routers)                                                  |
|  - /api/uploads     (video/audio + metadata)                          |
|  - /api/transcripts (verbatim + timestamps)                           |
|  - /api/results     (scores + insights)                               |
|  - /api/dashboard   (aggregations)                                    |
|                                                                       |
|  Services                                                            |
|  - Media extraction (ffmpeg)                                          |
|  - Speech-to-text (Whisper)                                           |
|  - Language detection + fillers                                       |
|  - Scoring pipeline                                                   |
|  - Report generation (PDF)                                            |
|                                                                       |
|  Data layer                                                          |
|  - Relational DB (SQLAlchemy)                                         |
|  - File storage (video/audio/transcripts)                             |
+-----------------------------------------------------------------------+
                |                                         |
                v                                         v
+------------------------------+           +------------------------------+
|    Object/File Storage       |           |        Metadata DB           |
|  /interviews/{user}/{qid}/   |           |  users, interviews, answers  |
+------------------------------+           +------------------------------+
```

## Proposed Folder Structure

```text
meetgreetsystem/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── interview.py
│   │   │   ├── scoring.py
│   │   │   └── upload.py
│   │   ├── schemas/
│   │   │   ├── common.py
│   │   │   └── dashboard.py
│   │   ├── services/
│   │   │   ├── processing.py
│   │   │   ├── storage.py
│   │   │   └── transcription.py
│   │   └── main.py
│   ├── tests/
│   │   └── test_health.py
│   └── requirements.txt
├── frontend/
│   ├── app/
│   │   └── page.tsx
│   ├── components/
│   │   ├── InterviewRecorder.tsx
│   │   ├── QuestionCard.tsx
│   │   └── RecordingControls.tsx
│   ├── hooks/
│   │   └── useRecorder.ts
│   ├── lib/
│   │   └── apiTypes.ts
│   ├── services/
│   │   └── interviewApi.ts
│   └── utils/
│       └── media.ts
└── docs/
    ├── architecture.md
    └── api-contracts.json
```

## Data Flow Summary

1. Frontend fetches interview questions from backend.
2. Client plays audio/voice prompt, shows countdown, then records response.
3. Video/audio chunks are uploaded per question with metadata.
4. Backend stores raw media, extracts audio, and sends for transcription.
5. Transcript is enriched with timestamps, fillers, language tags, and pauses.
6. Scoring service produces per-answer and per-interview evaluation.
7. Dashboard aggregates analytics for admin and reporting.
