import { describe, expect, it } from 'vitest'

import { analyzeResume, detectSections, extractSkills } from './analysis'

const resumeText = `
SUMMARY
Experienced platform engineer with AWS and Kubernetes expertise.

EXPERIENCE
Platform Engineer | Northstar Cloud | 2022 - Present
- Built AWS infrastructure with Terraform and Kubernetes.
- Improved CI/CD automation for production releases.

SKILLS
AWS, Kubernetes, Terraform, CI/CD, Docker
`

const jobText = `
Senior Platform Engineer
Required: AWS, Kubernetes, Terraform, CI/CD
Preferred: Docker, observability
`

describe('resume analysis engine', () => {
  it('extracts section headings from a resume', () => {
    const sections = detectSections(resumeText)
    expect(sections.SUMMARY).toContain('Experienced platform engineer')
    expect(sections.EXPERIENCE).toContain('Platform Engineer')
  })

  it('detects core skills from resume content', () => {
    const skills = extractSkills(resumeText)
    expect(skills).toContain('AWS')
    expect(skills).toContain('Kubernetes')
    expect(skills).toContain('Terraform')
  })

  it('produces a score and keyword match for the target job description', () => {
    const analysis = analyzeResume(resumeText, jobText)
    expect(analysis.readinessScore).toBeGreaterThan(0)
    expect(analysis.keywordMatrix.length).toBeGreaterThan(0)
    expect(analysis.breakdown.jobAlignment).toBeGreaterThan(0)
    expect(analysis.topIssues.length).toBeGreaterThan(0)
  })
})
