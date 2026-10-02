# ResumeLens

ResumeLens is a static-first ATS resume analysis app built in React + TypeScript + Vite. It focuses on browser-only resume parsing, privacy-first analysis, and a distinctive inspection-style dashboard for resume diagnostics.

## Features

- Upload or paste PDF, DOCX, or TXT resumes
- Browser-side extraction with PDF.js and Mammoth
- ATS parsing and structure analysis
- Job-description keyword and skill comparison
- Evidence matrix and content quality checks
- Responsive inspection dashboard
- Local-only analysis workflow without a backend

## Run locally

```bash
npm install
npm run dev
```

## Production build

```bash
npm run build
```

## Notes

This project is intentionally designed as a static client-side app for GitHub Pages, Cloudflare Pages, or Vercel static hosting. The core analysis runs entirely in the browser and does not require a backend or database.
