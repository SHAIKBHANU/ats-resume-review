export type Severity = 'Low' | 'Medium' | 'High'

export type Confidence = 'Strong' | 'Moderate' | 'Weak'

export interface Finding {
  id: string
  title: string
  severity: Severity
  category: string
  reason: string
  fix: string
}

export interface KeywordMatch {
  skill: string
  jd: 'Required' | 'Preferred' | 'Keyword'
  resume: 'Found' | 'Partial' | 'Missing'
  experience: string
  confidence: Confidence
}

export interface ResumeAnalysis {
  readinessScore: number
  breakdown: {
    parsingSafety: number
    jobAlignment: number
    keywordCoverage: number
    evidenceStrength: number
    contentQuality: number
    consistency: number
  }
  findings: Finding[]
  topIssues: Finding[]
  skills: string[]
  keywordMatrix: KeywordMatch[]
  parserView: string
  extractedText: string
  sectionSummary: Record<string, string>
  weaknessSignals: string[]
  evidenceDensity: string
}
