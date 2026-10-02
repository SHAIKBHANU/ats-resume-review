import { type ChangeEvent, useMemo, useState } from 'react'
import { analyzeResume, extractTextFromFile, getBannerCopy } from './lib/analysis'
import { sampleJobDescription, sampleResume } from './data/skills'
import './App.css'

const pageLinks = ['Home', 'Inspect', 'Fixes', 'Privacy']

const scoreBreakdownLabels = [
  { key: 'parsingSafety', label: 'Parsing safety' },
  { key: 'jobAlignment', label: 'Job alignment' },
  { key: 'keywordCoverage', label: 'Keyword coverage' },
  { key: 'evidenceStrength', label: 'Evidence strength' },
  { key: 'contentQuality', label: 'Content quality' },
  { key: 'consistency', label: 'Consistency' },
] as const

function App() {
  const [resumeText, setResumeText] = useState(sampleResume)
  const [jobDescription, setJobDescription] = useState(sampleJobDescription)
  const [error, setError] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [viewMode, setViewMode] = useState<'visual' | 'parser'>('visual')
  const [refreshKey, setRefreshKey] = useState(0)

  const analysis = useMemo(() => {
    void refreshKey
    return analyzeResume(resumeText, jobDescription)
  }, [resumeText, jobDescription, refreshKey])

  const scoreStatus = useMemo(() => {
    if (analysis.readinessScore >= 80) {
      return { label: 'Good', tone: 'score-good' }
    }

    if (analysis.readinessScore >= 60) {
      return { label: 'Better', tone: 'score-better' }
    }

    return { label: 'Low', tone: 'score-low' }
  }, [analysis.readinessScore])

  const scoreCards = useMemo(
    () =>
      scoreBreakdownLabels.map((item) => ({
        ...item,
        value: analysis.breakdown[item.key],
      })),
    [analysis],
  )

  const handleAnalyze = () => {
    setRefreshKey((current) => current + 1)
  }

  const handleSampleResume = () => {
    setResumeText(sampleResume)
    setJobDescription(sampleJobDescription)
    setError(null)
  }

  const handleUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }

    setIsProcessing(true)
    setError(null)

    try {
      const extracted = await extractTextFromFile(file)
      setResumeText(extracted || 'No text detected in the uploaded file.')
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : 'Unable to read this file. Please try a PDF, DOCX, or TXT resume.',
      )
    } finally {
      setIsProcessing(false)
      event.target.value = ''
    }
  }

  const scrollToConsole = () => {
    const node = document.getElementById('inspection-console')
    node?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="page-shell">
      <header className="topbar">
        <div className="brand-block">
          <div className="brand-mark" aria-hidden="true">AR</div>
          <div>
            <div className="brand-name">ATSReview.in</div>
            <div className="brand-tag">ATS Resume Review</div>
          </div>
        </div>

        <nav className="nav" aria-label="Main navigation">
          {pageLinks.map((link) => (
            <a key={link} href="#" className="nav-link">
              {link}
            </a>
          ))}
        </nav>

        <button type="button" className="primary-button" onClick={scrollToConsole}>
          Inspect my resume
        </button>
      </header>

      <main>
        <section className="hero-section">
          <div className="hero-copy">
            <div className="pill">Free • private • browser-based</div>
            <h1>See what your resume says before an ATS does.</h1>
            <p>
              Upload a resume or paste your text, then review your match score and ATS issues immediately.
            </p>

            <div className="cta-row">
              <button type="button" className="primary-button" onClick={() => document.getElementById('resume-upload')?.click()}>
                Upload resume
              </button>
              <button type="button" className="secondary-button" onClick={() => window.scrollTo({ top: 780, behavior: 'smooth' })}>
                View report
              </button>
            </div>

            <div className="trust-row">
              <span>Free</span>
              <span>PDF / DOCX / TXT</span>
              <span>Browser only</span>
            </div>

            <label className="upload-box compact-upload" htmlFor="resume-upload">
              <input
                id="resume-upload"
                type="file"
                accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
                onChange={handleUpload}
              />
              <span className="upload-title">Choose a resume file</span>
              <span className="upload-meta">PDF • DOCX • TXT</span>
            </label>
          </div>

          <div className="inspection-demo">
            <div className="demo-topline">Review status</div>
            <div className="score-ring summary-score">
              <div className="score-ring-inner">
                <strong>{analysis.readinessScore}</strong>
                <span>/100</span>
              </div>
            </div>
            <div className={`score-status ${scoreStatus.tone}`}>
              Final ATS score: {scoreStatus.label}
            </div>
            <div className="demo-summary">
              <div>
                <span className="mono-label">Role</span>
                <strong>{jobDescription.trim() ? 'Custom role' : 'Platform Engineer'}</strong>
              </div>
              <div>
                <span className="mono-label">Strong matches</span>
                <strong>{analysis.skills.length}</strong>
              </div>
              <div>
                <span className="mono-label">Weak signals</span>
                <strong>{analysis.weaknessSignals.length}</strong>
              </div>
            </div>
          </div>
        </section>

        <section id="inspection-console" className="console-section">
          <div className="console-shell">
            <div className="console-input-panel">
              <div className="panel-header">
                <span className="eyebrow">Resume input</span>
                <h2>Review details</h2>
              </div>

              <div className="editor-grid">
                <div className="field-panel">
                  <label htmlFor="resume-paste">Resume</label>
                  <textarea
                    id="resume-paste"
                    value={resumeText}
                    onChange={(event) => setResumeText(event.target.value)}
                    placeholder="Paste your resume here..."
                  />
                </div>

                <div className="field-panel">
                  <label htmlFor="job-description">Target job description</label>
                  <textarea
                    id="job-description"
                    value={jobDescription}
                    onChange={(event) => setJobDescription(event.target.value)}
                    placeholder="Paste the job description you are targeting..."
                  />
                </div>
              </div>

              <div className="action-row">
                <button type="button" className="primary-button" onClick={handleAnalyze} disabled={isProcessing}>
                  {isProcessing ? 'Analyzing…' : 'Analyze now'}
                </button>
                <button type="button" className="secondary-button" onClick={handleSampleResume}>
                  Load sample
                </button>
              </div>

              <div className="copy-note">{getBannerCopy()}</div>
              {error ? <div className="error-box">{error}</div> : null}
            </div>

            <aside className="console-logic-panel">
              <div className="panel-header compact">
                <span className="eyebrow">Quick summary</span>
                <h3>Live status</h3>
              </div>

              <div className="signal-card">
                <div className="signal-row">
                  <span>ATS score</span>
                  <strong>{analysis.readinessScore}/100</strong>
                </div>
                <div className="signal-row">
                  <span>Clear sections</span>
                  <strong>{Object.keys(analysis.sectionSummary).length}</strong>
                </div>
                <div className="signal-row">
                  <span>Skill matches</span>
                  <strong>{analysis.skills.length}</strong>
                </div>
              </div>
            </aside>
          </div>
        </section>

        <section className="results-panel">
          <div className="results-header">
            <div>
              <span className="eyebrow">Results</span>
              <h2>ATS insight board</h2>
            </div>
            <div className="target-block">
              <span className="muted-tag">Target role</span>
              <strong>{jobDescription.trim() ? 'Custom role match' : 'Platform Engineer'}</strong>
            </div>
          </div>

          <div className="results-grid">
            <main className="results-main">
              <div className="score-matrix">
                {scoreCards.map((card) => (
                  <div key={card.key} className="score-card">
                    <span>{card.label}</span>
                    <strong>{card.value}</strong>
                    <div className="meter">
                      <div className="meter-fill" style={{ width: `${card.value}%` }} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="content-panel">
                <div className="toggle-row" aria-label="Resume view selector">
                  <button
                    type="button"
                    className={viewMode === 'visual' ? 'toggle-button active' : 'toggle-button'}
                    onClick={() => setViewMode('visual')}
                  >
                    Visual view
                  </button>
                  <button
                    type="button"
                    className={viewMode === 'parser' ? 'toggle-button active' : 'toggle-button'}
                    onClick={() => setViewMode('parser')}
                  >
                    Raw text
                  </button>
                </div>

                {viewMode === 'visual' ? (
                  <div className="resume-visual">
                    {Object.entries(analysis.sectionSummary).map(([section, content]) => (
                      <div key={section} className="res-block">
                        <div className="res-label">{section}</div>
                        <div className="res-copy">{content || 'Section detected.'}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <pre className="parser-output">{analysis.parserView}</pre>
                )}
              </div>

              <div className="matrix-panel">
                <h3>Skill evidence</h3>
                <table>
                  <thead>
                    <tr>
                      <th>Skill</th>
                      <th>JD</th>
                      <th>Resume</th>
                      <th>Evidence</th>
                      <th>Confidence</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analysis.keywordMatrix.slice(0, 6).map((row) => (
                      <tr key={row.skill}>
                        <td>{row.skill}</td>
                        <td>{row.jd}</td>
                        <td>{row.resume}</td>
                        <td>{row.experience}</td>
                        <td>{row.confidence}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </main>

            <aside className="priority-panel">
              <h3>Fix these first</h3>
              {analysis.topIssues.map((issue) => (
                <div key={issue.id} className="priority-item">
                  <div className="priority-meta">
                    <span className={`priority-badge ${issue.severity.toLowerCase()}`}>{issue.severity}</span>
                    <span className="priority-title">{issue.title}</span>
                  </div>
                  <p>{issue.fix}</p>
                </div>
              ))}
            </aside>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="footer-grid">
          <div>
            <div className="brand-name">ATSReview.in</div>
            <p>Review your resume before the ATS does.</p>
          </div>
          <div>
            <strong>Tools</strong>
            <ul>
              <li>ATS Checker</li>
              <li>Keyword match</li>
              <li>Resume review</li>
            </ul>
          </div>
          <div>
            <strong>Privacy</strong>
            <ul>
              <li>Local analysis</li>
              <li>No account</li>
              <li>Browser only</li>
            </ul>
          </div>
          <div>
            <strong>Support</strong>
            <ul>
              <li>PDF / DOCX</li>
              <li>Text paste</li>
              <li>ATS tips</li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
