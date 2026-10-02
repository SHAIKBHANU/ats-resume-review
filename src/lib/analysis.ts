import { genericJdWords, resumeSkillCatalog, sampleJobDescription, sampleResume, weakPhrases } from '../data/skills'
import type { Finding, KeywordMatch, ResumeAnalysis } from '../types'

const normalizedSkills = [...resumeSkillCatalog].sort((a, b) => b.length - a.length)

const sectionHeadings = ['SUMMARY', 'EXPERIENCE', 'SKILLS', 'EDUCATION', 'PROJECTS', 'CERTIFICATIONS']

function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, ' ').trim()
}

function toTitleCase(value: string): string {
  return value
    .toLowerCase()
    .split(' ')
    .map((word) => (word ? word[0].toUpperCase() + word.slice(1) : word))
    .join(' ')
}

export function extractTextFromFile(file: File): Promise<string> {
  const mime = file.type.toLowerCase()
  const extension = file.name.split('.').pop()?.toLowerCase() ?? ''

  if (extension === 'txt' || mime.includes('text/plain')) {
    return file.text()
  }

  if (extension === 'pdf' || mime.includes('pdf')) {
    return extractPdfText(file)
  }

  if (extension === 'docx' || mime.includes('officedocument.wordprocessingml.document')) {
    return extractDocxText(file)
  }

  return Promise.reject(new Error('Unsupported file type. Please upload a PDF, DOCX, or TXT resume.'))
}

async function extractPdfText(file: File): Promise<string> {
  const pdfjsLib = await import('pdfjs-dist')
  const pdfjs = pdfjsLib as typeof import('pdfjs-dist')

  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url,
  ).toString()

  const data = await file.arrayBuffer()
  const pdf = await pdfjs.getDocument({ data }).promise
  const pages: string[] = []

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber)
    const text = await page.getTextContent()
    pages.push(
      text.items
        .map((item) => ('str' in item ? item.str : ''))
        .join(' '),
    )
  }

  return pages.join('\n\n')
}

async function extractDocxText(file: File): Promise<string> {
  const mammoth = await import('mammoth')
  const uploaded = await file.arrayBuffer()
  const result = await mammoth.default.extractRawText({ arrayBuffer: uploaded })
  return result.value || ''
}

export function detectSections(text: string): Record<string, string> {
  const lines = text.split(/\n+/).map((line) => line.trim()).filter(Boolean)
  const summary: Record<string, string> = {}
  let currentSection = 'Other'

  for (const line of lines) {
    const headingMatch = sectionHeadings.find((heading) =>
      line.toUpperCase() === heading && line.length <= heading.length + 4,
    )

    if (headingMatch) {
      currentSection = headingMatch
      summary[currentSection] = ''
      continue
    }

    if (currentSection !== 'Other') {
      summary[currentSection] = `${summary[currentSection]} ${line} `.trim()
    }
  }

  return summary
}

export function extractSkills(text: string): string[] {
  const lowerText = text.toLowerCase()
  const foundSkills = normalizedSkills.filter((skill) => {
    const pattern = skill.toLowerCase()
    return lowerText.includes(pattern)
  })

  return foundSkills
}

function findKeywordMatches(text: string, jdText: string): KeywordMatch[] {
  const allSkills = resumeSkillCatalog.filter((skill) => text.toLowerCase().includes(skill.toLowerCase()))
  const jdLower = jdText.toLowerCase()

  return allSkills.map((skill) => {
    const skillLower = skill.toLowerCase()
    const resumeFound = text.toLowerCase().includes(skillLower)
    const jdRequired = jdLower.includes(skillLower)
    const evidenceText = resumeFound ? 'Found in the resume body' : 'Not detected in the resume'

    return {
      skill,
      jd: jdRequired ? 'Required' : 'Preferred',
      resume: resumeFound ? 'Found' : 'Missing',
      experience: evidenceText,
      confidence: resumeFound ? 'Strong' : 'Weak',
    }
  })
}

function detectWeakPhraseIssues(text: string): string[] {
  const matches: string[] = []
  const lowered = text.toLowerCase()

  weakPhrases.forEach((phrase) => {
    if (lowered.includes(phrase)) {
      matches.push(phrase)
    }
  })

  return matches
}

function scoreKeywordCoverage(text: string, jdText: string): number {
  if (!jdText.trim()) {
    return 82
  }

  const jdKeywords = [...resumeSkillCatalog].filter((skill) => jdText.toLowerCase().includes(skill.toLowerCase()))
  if (jdKeywords.length === 0) {
    return 78
  }

  const matched = jdKeywords.filter((keyword) => text.toLowerCase().includes(keyword.toLowerCase()))
  return Math.min(96, Math.max(48, Math.round((matched.length / jdKeywords.length) * 100)))
}

export function analyzeResume(text: string, jobDescription: string = ''): ResumeAnalysis {
  const cleanText = normalizeWhitespace(text)
  const sectionSummary = detectSections(cleanText)
  const skills = extractSkills(cleanText)
  const weakSignals = detectWeakPhraseIssues(cleanText)
  const keywordMatrix = findKeywordMatches(cleanText, jobDescription)
  const jdNoise = genericJdWords.filter((term) => jobDescription.toLowerCase().includes(term))

  const parsingSafety = Math.min(
    96,
    Math.max(
      56,
      82 - (cleanText.split(/\t|\|/).length > 2 ? 10 : 0) - (cleanText.length > 8000 ? 6 : 0),
    ),
  )

  const jobAlignment = scoreKeywordCoverage(cleanText, jobDescription)
  const keywordCoverage = Math.min(97, Math.max(45, Math.round((skills.length / Math.max(resumeSkillCatalog.length, 1)) * 100)))
  const evidenceStrength = Math.min(
    95,
    Math.max(40, Math.round((skills.length / Math.max(10, skills.length + 3)) * 100) + (weakSignals.length === 0 ? 12 : 0)),
  )
  const contentQuality = Math.min(
    94,
    Math.max(50, 78 - Math.min(weakSignals.length * 6, 24) + (cleanText.includes('%') ? 8 : 0)),
  )
  const consistency = Math.min(95, Math.max(48, 86 - (cleanText.match(/\b[A-Z]{2,}\b/g)?.length ?? 0) * 2))

  const readinessScore = Math.round(
    (parsingSafety + jobAlignment + keywordCoverage + evidenceStrength + contentQuality + consistency) / 6,
  )

  const findings: Finding[] = [
    {
      id: 'parsing',
      title: 'Check parse reliability',
      severity: 'Medium',
      category: 'Parsing',
      reason: 'The resume structure is workable, but dense formatting or inconsistent sections can reduce ATS readability.',
      fix: 'Use a single-column layout, standard headings, and keep dates and bullets consistently formatted.',
    },
    {
      id: 'keyword-gap',
      title: 'Skill evidence is uneven',
      severity: 'Medium',
      category: 'Keyword coverage',
      reason: 'Some job-critical skills are present, but supporting evidence is not equally strong across the experience section.',
      fix: 'Tie each important skill to a concrete project, responsibility, or outcome in the resume experience bullets.',
    },
  ]

  if (weakSignals.length > 0) {
    findings.push({
      id: 'weak-bullets',
      title: 'Some bullets are responsibility-heavy',
      severity: 'Medium',
      category: 'Content quality',
      reason: 'Phrases such as "responsible for" or "worked on" describe activity without enough context about outcome or impact.',
      fix: 'Replace vague responsibility language with the result, scale, or customer impact where it is true.',
    })
  }

  if (jobDescription.trim() && jobAlignment < 70) {
    findings.push({
      id: 'job-match',
      title: 'Target role alignment needs stronger evidence',
      severity: 'High',
      category: 'Job match',
      reason: 'The resume is not yet demonstrating the same terminology and evidence density as the target job description.',
      fix: 'Mirror key role language and add proof points for platform, reliability, and deployment responsibilities.',
    })
  }

  if (jdNoise.length > 0) {
    findings.push({
      id: 'jd-noise',
      title: 'Job description includes generic language',
      severity: 'Low',
      category: 'JD noise',
      reason: 'Some job description terms are broad and not differentiated enough to drive a strong keyword match.',
      fix: 'Prioritize tangible technical and operational terms before generic professional language.',
    })
  }

  const topIssues = findings.slice(0, 5)

  return {
    readinessScore,
    breakdown: {
      parsingSafety,
      jobAlignment,
      keywordCoverage,
      evidenceStrength,
      contentQuality,
      consistency,
    },
    findings,
    topIssues,
    skills,
    keywordMatrix,
    parserView: cleanText,
    extractedText: cleanText,
    sectionSummary,
    weaknessSignals: weakSignals,
    evidenceDensity: `${Math.max(4, Math.round(skills.length * 1.8))} signals mapped across ${Object.keys(sectionSummary).length || 4} sections`,
  }
}

export function getSampleAnalysis(): ResumeAnalysis {
  return analyzeResume(sampleResume, sampleJobDescription)
}

export function getBannerCopy(): string {
  return 'Your resume is analyzed in your browser. We do not need to upload your resume to run the core analysis.'
}

export function getRoleSuggestions(): Array<{ label: string; value: string }> {
  return [
    { label: 'Platform Engineer', value: 'Platform Engineer' },
    { label: 'Senior DevOps Engineer', value: 'Senior DevOps Engineer' },
    { label: 'SRE', value: 'Site Reliability Engineer' },
    { label: 'Data Engineer', value: 'Data Engineer' },
  ]
}

export function formatScore(value: number): string {
  return `${value}/100`
}

export function getSectionTitle(value: string): string {
  return toTitleCase(value)
}
