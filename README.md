# ResumeLens

ResumeLens is a browser-based resume review tool developed with React, TypeScript, and Vite. It lets a user paste or upload a resume and compare it against a job description to review keyword coverage, section structure, and weak phrasing.

## How it was developed

This project uses:

- React for the UI
- TypeScript for typed application logic
- Vite for the frontend build and local development
- PDF.js for PDF text extraction
- Mammoth for DOCX extraction
- Client-side logic for resume parsing and scoring

The application is designed as a static frontend. The main review flow runs in the browser and does not require a backend for the core experience.

## What it can do

- Upload a PDF, DOCX, or TXT resume
- Paste resume text directly into the app
- Paste a job description for comparison
- Extract text from uploaded resume files
- Review skill keywords and section coverage
- Highlight generic phrases and likely weak areas in the resume
- Show a score-style summary based on the current resume text and job description

## Local development

```bash
npm install
npm run dev
```

## Quality checks

```bash
npm run lint
npm test -- --run
npm run build
```

## GitHub Pages deployment

This project is configured for GitHub Pages static hosting.

### Recommended setup

1. Push the repository to GitHub.
2. Open the repository settings.
3. Go to Pages.
4. Choose GitHub Actions as the deployment source.
5. Use the workflow included in `.github/workflows/deploy-pages.yml`.

The Vite config uses a relative base path so the built app can work correctly from a GitHub Pages deployment.

## Notes

This tool is designed to help review resume content and compare it with a job description. It does not guarantee interview outcomes, ATS approval, or hiring decisions. Results should be treated as a review aid and not as a guarantee of employer behavior.

The project does not require a backend for the core workflow. Uploaded resume text is handled in the browser as part of the local review process.
