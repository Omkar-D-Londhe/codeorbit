import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../../state/AppState'
import { useToast } from '../../components/Toast'
import { Icon } from '../../components/Icon'
import { SandboxedPreview } from '../../components/SandboxedPreview'
import { validateChallenge } from '../../lib/validators'
import { toChallenge } from '../content/challengeAdapter'
import { useTrack } from '../content/useTrack'
import { getQuotaInfo } from '../storage/quota'
import type { ChallengeV2, ChallengeFile } from '../content/types'
import type { ChallengeRequirement, Rule } from '../../data/types'

function Card({
  title,
  eyebrow,
  children,
}: {
  title: string
  eyebrow?: string
  children: React.ReactNode
}) {
  return (
    <section className="card" style={{ padding: '24px', marginBottom: '24px' }}>
      {eyebrow && <p className="eyebrow" style={{ marginBottom: '4px' }}>{eyebrow}</p>}
      <h2 className="card__title" style={{ fontSize: '20px', marginBottom: '16px' }}>{title}</h2>
      {children}
    </section>
  )
}

function Button({
  variant = 'primary',
  size,
  children,
  onClick,
  disabled,
  title,
  'aria-label': ariaLabel,
}: {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger-ghost'
  size?: 'sm'
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  title?: string
  'aria-label'?: string
}) {
  const cls = `btn btn--${variant}${size ? ` btn--${size}` : ''}`
  return (
    <button type="button" className={cls} onClick={onClick} disabled={disabled} title={title} aria-label={ariaLabel}>
      {children}
    </button>
  )
}

export type CreatorStep = 'details' | 'files' | 'requirements' | 'hints' | 'preview'

const STEPS: CreatorStep[] = ['details', 'files', 'requirements', 'hints', 'preview']
const STEP_LABELS: Record<CreatorStep, string> = {
  details: 'Details',
  files: 'Files',
  requirements: 'Requirements',
  hints: 'Hints & Solution',
  preview: 'Preview & Test',
}

export function isValidSelector(sel: string): boolean {
  if (!sel || !sel.trim()) return false
  const trimmed = sel.trim()

  // Verify balanced brackets and parentheses
  const stack: string[] = []
  for (const ch of trimmed) {
    if (ch === '[' || ch === '(') stack.push(ch)
    else if (ch === ']') {
      if (stack.pop() !== '[') return false
    } else if (ch === ')') {
      if (stack.pop() !== '(') return false
    }
  }
  if (stack.length > 0) return false

  // Disallow malformed consecutive combinators / pseudos
  if (/>\s*>|\+\s*\+|~\s*~|,\s*,|\.{2,}|#{2,}|:{3,}/.test(trimmed)) return false

  try {
    document.createDocumentFragment().querySelector(trimmed)
    return true
  } catch {
    return false
  }
}

export function ChallengeCreator() {
  const { state, dispatch } = useApp()
  const track = useTrack()
  const toast = useToast()
  const navigate = useNavigate()

  const [currentStep, setCurrentStep] = useState<CreatorStep>('details')

  // Form State
  const [title, setTitle] = useState('')
  const [difficulty, setDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner')
  const [prompt, setPrompt] = useState('')
  const [objective, setObjective] = useState('')

  // Files
  const [fileName, setFileName] = useState('index.html')
  const [starterCode, setStarterCode] = useState(
    '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="utf-8">\n  <title>Custom Challenge</title>\n</head>\n<body>\n  <!-- Write your HTML here -->\n</body>\n</html>'
  )

  // Requirements
  const [requirements, setRequirements] = useState<ChallengeRequirement[]>([
    {
      id: 'req-1',
      description: 'Document has a valid HTML5 doctype',
      explanation: 'HTML5 documents must begin with <!DOCTYPE html>.',
      rule: { kind: 'doctype' },
    },
  ])

  // Hints & Solution
  const [hint1, setHint1] = useState('Consider the fundamental structure needed for this element.')
  const [hint2, setHint2] = useState('Use appropriate HTML attributes to describe the content.')
  const [hint3, setHint3] = useState('Review the objective description for exact tag names.')
  const [solutionCode, setSolutionCode] = useState(
    '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="utf-8">\n  <title>Custom Challenge</title>\n</head>\n<body>\n  <main>\n    <h1>Custom Challenge</h1>\n  </main>\n</body>\n</html>'
  )
  const [solutionExplanation, setSolutionExplanation] = useState('Reference solution that fulfills all specified requirements.')

  // Step 3 helper: new requirement builder
  const [newRuleKind, setNewRuleKind] = useState<Rule['kind']>('selector')
  const [newReqDesc, setNewReqDesc] = useState('')
  const [newReqSelector, setNewReqSelector] = useState('')
  const [newReqAttr, setNewReqAttr] = useState('')
  const [newReqMin, setNewReqMin] = useState(1)

  // Validation errors per step
  const detailsError = useMemo(() => {
    if (!title.trim()) return 'Title is required.'
    if (title.length > 100) return 'Title must be 100 characters or less.'
    if (!prompt.trim()) return 'Challenge brief/prompt is required.'
    if (!objective.trim()) return 'Objective summary is required.'
    return null
  }, [title, prompt, objective])

  const filesError = useMemo(() => {
    if (!fileName.trim()) return 'File name is required.'
    if (!starterCode.trim()) return 'Starter code cannot be empty.'
    return null
  }, [fileName, starterCode])

  const requirementsError = useMemo(() => {
    if (requirements.length === 0) return 'At least one requirement is required.'
    for (const req of requirements) {
      if (!req.description.trim()) return 'All requirements must have a description.'
      if ('selector' in req.rule && req.rule.selector) {
        if (!isValidSelector(req.rule.selector)) {
          return `Invalid CSS selector in requirement: "${req.rule.selector}"`
        }
      }
      if ('attr' in req.rule && !req.rule.attr?.trim()) {
        return 'Attribute name cannot be empty for attribute rules.'
      }
    }
    return null
  }, [requirements])

  const hintsError = useMemo(() => {
    if (!hint1.trim() || !hint2.trim() || !hint3.trim()) {
      return 'All 3 hints (conceptual, structural, specific) are required.'
    }
    if (!solutionCode.trim()) return 'Solution code is required.'
    return null
  }, [hint1, hint2, hint3, solutionCode])

  const addRequirement = () => {
    if (!newReqDesc.trim()) {
      toast.show('Please provide a description for the requirement.', 'warning')
      return
    }

    let rule: Rule
    switch (newRuleKind) {
      case 'doctype':
        rule = { kind: 'doctype' }
        break
      case 'selector':
        if (!isValidSelector(newReqSelector)) {
          toast.show('Please enter a valid CSS selector.', 'warning')
          return
        }
        rule = { kind: 'selector', selector: newReqSelector.trim(), min: newReqMin || 1 }
        break
      case 'noMatch':
        if (!isValidSelector(newReqSelector)) {
          toast.show('Please enter a valid CSS selector.', 'warning')
          return
        }
        rule = { kind: 'noMatch', selector: newReqSelector.trim() }
        break
      case 'textLength':
        if (!isValidSelector(newReqSelector)) {
          toast.show('Please enter a valid CSS selector.', 'warning')
          return
        }
        rule = { kind: 'textLength', selector: newReqSelector.trim(), min: newReqMin || 1 }
        break
      case 'everyHasAttr':
        if (!isValidSelector(newReqSelector) || !newReqAttr.trim()) {
          toast.show('Please enter a valid selector and attribute name.', 'warning')
          return
        }
        rule = { kind: 'everyHasAttr', selector: newReqSelector.trim(), attr: newReqAttr.trim(), nonEmpty: true }
        break
      case 'everyAttrContains':
        if (!isValidSelector(newReqSelector) || !newReqAttr.trim()) {
          toast.show('Please enter a valid selector and attribute name.', 'warning')
          return
        }
        rule = { kind: 'everyAttrContains', selector: newReqSelector.trim(), attr: newReqAttr.trim(), token: '' }
        break
      case 'anyHasAttr':
        if (!isValidSelector(newReqSelector) || !newReqAttr.trim()) {
          toast.show('Please enter a valid selector and attribute name.', 'warning')
          return
        }
        rule = { kind: 'anyHasAttr', selector: newReqSelector.trim(), attr: newReqAttr.trim() }
        break
      case 'controlsLabelled':
        rule = { kind: 'controlsLabelled' }
        break
      case 'headingOrder':
        rule = { kind: 'headingOrder' }
        break
      case 'fragmentLinksResolve':
        rule = { kind: 'fragmentLinksResolve' }
        break
      case 'noLinkText':
        rule = { kind: 'noLinkText', patterns: ['click here', 'read more', 'link'] }
        break
      default:
        rule = { kind: 'doctype' }
    }

    const newReq: ChallengeRequirement = {
      id: `req-${Date.now()}-${requirements.length + 1}`,
      description: newReqDesc.trim(),
      explanation: `Check that: ${newReqDesc.trim()}`,
      rule,
    }

    setRequirements([...requirements, newReq])
    setNewReqDesc('')
    setNewReqSelector('')
    setNewReqAttr('')
    toast.show('Requirement added.', 'success')
  }

  const removeRequirement = (id: string) => {
    if (requirements.length <= 1) {
      toast.show('Challenge must have at least one requirement.', 'warning')
      return
    }
    setRequirements(requirements.filter((r) => r.id !== id))
  }

  // Assembled ChallengeV2 for preview and saving
  const assembledChallengeV2: ChallengeV2 = useMemo(() => {
    const activeTrackId = track?.id ?? ''
    const activeLang = track?.language?.id ?? track?.id ?? 'code'
    const starterFile: ChallengeFile = {
      name: fileName,
      language: activeLang,
      content: starterCode,
    }
    const solFile: ChallengeFile = {
      name: fileName,
      language: activeLang,
      content: solutionCode,
    }

    return {
      id: `custom:ch-${Date.now()}`,
      trackId: activeTrackId,
      topicId: 'custom',
      title: title.trim(),
      difficulty,
      prompt: prompt.trim(),
      objective: objective.trim(),
      files: [starterFile],
      requirements,
      hints: [hint1.trim(), hint2.trim(), hint3.trim()],
      solution: {
        files: [solFile],
        explanation: solutionExplanation.trim(),
      },
    }
  }, [
    track,
    fileName,
    starterCode,
    solutionCode,
    title,
    difficulty,
    prompt,
    objective,
    requirements,
    hint1,
    hint2,
    hint3,
    solutionExplanation,
  ])

  // Solution check result (verifies challenge is solvable)
  const solutionCheckResult = useMemo(() => {
    try {
      const challengeObj = toChallenge(assembledChallengeV2)
      return validateChallenge(challengeObj, solutionCode)
    } catch {
      return null
    }
  }, [assembledChallengeV2, solutionCode])

  const canGoNext = () => {
    if (currentStep === 'details') return !detailsError
    if (currentStep === 'files') return !filesError
    if (currentStep === 'requirements') return !requirementsError
    if (currentStep === 'hints') return !hintsError
    return true
  }

  const handleNext = () => {
    const idx = STEPS.indexOf(currentStep)
    if (idx < STEPS.length - 1 && canGoNext()) {
      setCurrentStep(STEPS[idx + 1])
    }
  }

  const handleBack = () => {
    const idx = STEPS.indexOf(currentStep)
    if (idx > 0) {
      setCurrentStep(STEPS[idx - 1])
    }
  }

  const handleSave = () => {
    if (detailsError || filesError || requirementsError || hintsError) {
      toast.show('Please resolve all validation errors before saving.', 'warning')
      return
    }

    if (!solutionCheckResult?.allPassed) {
      toast.show(
        'The reference solution failed one or more requirements. Fix your solution or requirements to make this challenge solvable.',
        'warning'
      )
      return
    }

    // Quota guard check
    const quota = getQuotaInfo(state)
    if (quota.level === 'full') {
      toast.show('Storage budget is full. Delete older notes or data before saving new challenges.', 'warning')
      return
    }

    dispatch({
      type: 'SAVE_CUSTOM_CHALLENGE',
      challenge: assembledChallengeV2,
    })

    toast.show(`Custom challenge "${title}" saved successfully!`, 'success')
    navigate(`/practice/${assembledChallengeV2.id}`)
  }

  return (
    <div className="page" style={{ maxWidth: '860px', margin: '0 auto', padding: '24px 16px 64px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: 700, marginBottom: '6px' }}>Challenge Creator</h1>
        <p className="page-lede" style={{ margin: 0 }}>
          Design, check, and author custom interactive HTML challenges for yourself or peer review.
        </p>
      </div>

      {/* Stepper Navigation */}
      <nav aria-label="Creation progress" style={{ marginBottom: '28px' }}>
        <ol
          style={{
            display: 'flex',
            listStyle: 'none',
            padding: 0,
            margin: 0,
            gap: '8px',
            borderBottom: '1px solid var(--c-border, #2d3040)',
            paddingBottom: '12px',
            overflowX: 'auto',
          }}
        >
          {STEPS.map((step, idx) => {
            const isActive = step === currentStep
            const isCompleted = STEPS.indexOf(currentStep) > idx
            return (
              <li key={step} style={{ display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}>
                <button
                  type="button"
                  onClick={() => {
                    // Only allow navigating to visited or previous steps
                    if (isCompleted || isActive) {
                      setCurrentStep(step)
                    }
                  }}
                  disabled={!isCompleted && !isActive}
                  className={`tab ${isActive ? 'is-active' : ''}`}
                  style={{
                    fontSize: '13px',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    background: isActive ? 'var(--c-surface-2, #212433)' : 'transparent',
                    border: 'none',
                    color: isActive ? 'var(--c-text, #fff)' : isCompleted ? 'var(--c-accent, #9a8bff)' : 'var(--c-text-muted)',
                    cursor: isCompleted || isActive ? 'pointer' : 'default',
                  }}
                >
                  <span style={{ fontWeight: 600, marginRight: '4px' }}>{idx + 1}.</span>
                  {STEP_LABELS[step]}
                </button>
              </li>
            )
          })}
        </ol>
      </nav>

      {/* Step 1: Details */}
      {currentStep === 'details' && (
        <Card title="Challenge Details" eyebrow="Step 1 of 5">
          <div style={{ display: 'grid', gap: '16px', marginTop: '16px' }}>
            <div>
              <label htmlFor="ch-title" className="field-label" style={{ display: 'block', marginBottom: '6px', fontWeight: 600 }}>
                Challenge Title <span style={{ color: 'var(--c-accent, #9a8bff)' }}>*</span>
              </label>
              <input
                id="ch-title"
                type="text"
                className="form-input"
                placeholder="e.g. Build an Accessible Registration Form"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={100}
                style={{ width: '100%' }}
              />
              <span className="small muted">{title.length} / 100 characters</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label htmlFor="ch-track" className="field-label" style={{ display: 'block', marginBottom: '6px', fontWeight: 600 }}>
                  Track
                </label>
                <select id="ch-track" className="select" value={track?.id ?? ''} disabled style={{ width: '100%' }}>
                  <option value={track?.id ?? ''}>{track?.name ?? 'Interactive Track'}</option>
                </select>
              </div>

              <div>
                <label htmlFor="ch-difficulty" className="field-label" style={{ display: 'block', marginBottom: '6px', fontWeight: 600 }}>
                  Difficulty
                </label>
                <select
                  id="ch-difficulty"
                  className="select"
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as 'beginner' | 'intermediate' | 'advanced')}
                  style={{ width: '100%' }}
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="ch-objective" className="field-label" style={{ display: 'block', marginBottom: '6px', fontWeight: 600 }}>
                Objective Summary <span style={{ color: 'var(--c-accent, #9a8bff)' }}>*</span>
              </label>
              <input
                id="ch-objective"
                type="text"
                className="form-input"
                placeholder="e.g. Create a semantic article card with heading, paragraphs, and tags."
                value={objective}
                onChange={(e) => setObjective(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label htmlFor="ch-prompt" className="field-label" style={{ display: 'block', marginBottom: '6px', fontWeight: 600 }}>
                Detailed Instructions / Prompt <span style={{ color: 'var(--c-accent, #9a8bff)' }}>*</span>
              </label>
              <textarea
                id="ch-prompt"
                className="form-input"
                rows={4}
                placeholder="Explain what the learner must build, why semantic choices matter, and any specific requirements to follow."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                style={{ width: '100%', fontFamily: 'inherit' }}
              />
            </div>

            {detailsError && (
              <div role="alert" style={{ color: '#f87171', fontSize: '13px' }}>
                {detailsError}
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Step 2: Files */}
      {currentStep === 'files' && (
        <Card title="Starter Files" eyebrow="Step 2 of 5">
          <div style={{ display: 'grid', gap: '16px', marginTop: '16px' }}>
            <div>
              <label htmlFor="ch-file-name" className="field-label" style={{ display: 'block', marginBottom: '6px', fontWeight: 600 }}>
                Entry File Name
              </label>
              <input
                id="ch-file-name"
                type="text"
                className="form-input"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                style={{ width: '100%', maxWidth: '240px' }}
              />
            </div>

            <div>
              <label htmlFor="ch-starter-code" className="field-label" style={{ display: 'block', marginBottom: '6px', fontWeight: 600 }}>
                Starter Code (provided to the learner)
              </label>
              <textarea
                id="ch-starter-code"
                className="form-input"
                rows={12}
                value={starterCode}
                onChange={(e) => setStarterCode(e.target.value)}
                style={{ width: '100%', fontFamily: 'var(--font-mono, monospace)', fontSize: '13px' }}
              />
            </div>

            {filesError && (
              <div role="alert" style={{ color: '#f87171', fontSize: '13px' }}>
                {filesError}
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Step 3: Requirements */}
      {currentStep === 'requirements' && (
        <Card title="Challenge Requirements" eyebrow="Step 3 of 5">
          <div style={{ display: 'grid', gap: '20px', marginTop: '16px' }}>
            <p className="muted small" style={{ margin: 0 }}>
              Requirements are validated deterministically by the track runner. Every challenge must specify at least one requirement.
            </p>

            {/* List of current requirements */}
            <div style={{ display: 'grid', gap: '10px' }}>
              {requirements.map((req, idx) => (
                <div
                  key={req.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    background: 'var(--c-surface-1, #191b26)',
                    border: '1px solid var(--c-border, #2d3040)',
                    borderRadius: '8px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="small muted" style={{ fontWeight: 600 }}>
                      #{idx + 1}
                    </span>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '14px' }}>{req.description}</div>
                      <div className="small muted">
                        Rule: <span style={{ fontFamily: 'monospace' }}>{req.rule.kind}</span>
                        {'selector' in req.rule && ` (${req.rule.selector})`}
                        {'attr' in req.rule && ` [${req.rule.attr}]`}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeRequirement(req.id)}
                    aria-label={`Remove requirement ${req.description}`}
                  >
                    <Icon name="trash" size={14} />
                  </Button>
                </div>
              ))}
            </div>

            {/* Add requirement form */}
            <div
              style={{
                padding: '16px',
                background: 'var(--c-surface-2, #212433)',
                borderRadius: '8px',
                border: '1px dashed var(--c-border-strong, #3b3f54)',
                display: 'grid',
                gap: '12px',
              }}
            >
              <div style={{ fontWeight: 600, fontSize: '14px' }}>Add a Rule-Based Requirement</div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px' }}>
                <div>
                  <label htmlFor="new-rule-kind" className="field-label small" style={{ display: 'block', marginBottom: '4px' }}>
                    Rule Type
                  </label>
                  <select
                    id="new-rule-kind"
                    className="select"
                    value={newRuleKind}
                    onChange={(e) => setNewRuleKind(e.target.value as Rule['kind'])}
                    style={{ width: '100%' }}
                  >
                    <option value="doctype">doctype (Valid HTML5 doctype)</option>
                    <option value="selector">selector (Element must exist)</option>
                    <option value="noMatch">noMatch (Element must NOT exist)</option>
                    <option value="textLength">textLength (Content length check)</option>
                    <option value="everyHasAttr">everyHasAttr (All have attribute)</option>
                    <option value="anyHasAttr">anyHasAttr (At least one has attribute)</option>
                    <option value="controlsLabelled">controlsLabelled (All inputs labelled)</option>
                    <option value="headingOrder">headingOrder (Heading hierarchy)</option>
                    <option value="fragmentLinksResolve">fragmentLinksResolve (Internal links)</option>
                    <option value="noLinkText">noLinkText (No generic link text)</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="new-req-desc" className="field-label small" style={{ display: 'block', marginBottom: '4px' }}>
                    Requirement Description <span style={{ color: 'var(--c-accent)' }}>*</span>
                  </label>
                  <input
                    id="new-req-desc"
                    type="text"
                    className="form-input"
                    placeholder="e.g. Include an article element with heading"
                    value={newReqDesc}
                    onChange={(e) => setNewReqDesc(e.target.value)}
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              {['selector', 'noMatch', 'textLength', 'everyHasAttr', 'anyHasAttr', 'everyAttrContains'].includes(newRuleKind) && (
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
                  <div>
                    <label htmlFor="new-req-selector" className="field-label small" style={{ display: 'block', marginBottom: '4px' }}>
                      CSS Selector
                    </label>
                    <input
                      id="new-req-selector"
                      type="text"
                      className="form-input"
                      placeholder="e.g. article h2, form input[type='email']"
                      value={newReqSelector}
                      onChange={(e) => setNewReqSelector(e.target.value)}
                      style={{ width: '100%', fontFamily: 'monospace' }}
                    />
                  </div>

                  {['everyHasAttr', 'anyHasAttr', 'everyAttrContains'].includes(newRuleKind) && (
                    <div>
                      <label htmlFor="new-req-attr" className="field-label small" style={{ display: 'block', marginBottom: '4px' }}>
                        Attribute Name
                      </label>
                      <input
                        id="new-req-attr"
                        type="text"
                        className="form-input"
                        placeholder="e.g. alt, for, aria-label"
                        value={newReqAttr}
                        onChange={(e) => setNewReqAttr(e.target.value)}
                        style={{ width: '100%' }}
                      />
                    </div>
                  )}

                  {['selector', 'textLength'].includes(newRuleKind) && (
                    <div>
                      <label htmlFor="new-req-min" className="field-label small" style={{ display: 'block', marginBottom: '4px' }}>
                        Minimum Count / Length
                      </label>
                      <input
                        id="new-req-min"
                        type="number"
                        min={1}
                        className="form-input"
                        value={newReqMin}
                        onChange={(e) => setNewReqMin(parseInt(e.target.value, 10) || 1)}
                        style={{ width: '100%' }}
                      />
                    </div>
                  )}
                </div>
              )}

              <div>
                <Button variant="secondary" size="sm" onClick={addRequirement}>
                  <Icon name="plus" size={14} /> Add Requirement to Challenge
                </Button>
              </div>
            </div>

            {requirementsError && (
              <div role="alert" style={{ color: '#f87171', fontSize: '13px' }}>
                {requirementsError}
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Step 4: Hints & Solution */}
      {currentStep === 'hints' && (
        <Card title="Hints & Reference Solution" eyebrow="Step 4 of 5">
          <div style={{ display: 'grid', gap: '16px', marginTop: '16px' }}>
            <div>
              <label htmlFor="ch-hint-1" className="field-label" style={{ display: 'block', marginBottom: '4px', fontWeight: 600 }}>
                Hint 1 (Conceptual Clue)
              </label>
              <input
                id="ch-hint-1"
                type="text"
                className="form-input"
                value={hint1}
                onChange={(e) => setHint1(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label htmlFor="ch-hint-2" className="field-label" style={{ display: 'block', marginBottom: '4px', fontWeight: 600 }}>
                Hint 2 (Structural Clue)
              </label>
              <input
                id="ch-hint-2"
                type="text"
                className="form-input"
                value={hint2}
                onChange={(e) => setHint2(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label htmlFor="ch-hint-3" className="field-label" style={{ display: 'block', marginBottom: '4px', fontWeight: 600 }}>
                Hint 3 (Specific Guidance)
              </label>
              <input
                id="ch-hint-3"
                type="text"
                className="form-input"
                value={hint3}
                onChange={(e) => setHint3(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label htmlFor="ch-solution-code" className="field-label" style={{ display: 'block', marginBottom: '4px', fontWeight: 600 }}>
                Reference Solution Code
              </label>
              <textarea
                id="ch-solution-code"
                className="form-input"
                rows={10}
                value={solutionCode}
                onChange={(e) => setSolutionCode(e.target.value)}
                style={{ width: '100%', fontFamily: 'monospace', fontSize: '13px' }}
              />
            </div>

            <div>
              <label htmlFor="ch-solution-exp" className="field-label" style={{ display: 'block', marginBottom: '4px', fontWeight: 600 }}>
                Solution Explanation
              </label>
              <textarea
                id="ch-solution-exp"
                className="form-input"
                rows={3}
                value={solutionExplanation}
                onChange={(e) => setSolutionExplanation(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>

            {hintsError && (
              <div role="alert" style={{ color: '#f87171', fontSize: '13px' }}>
                {hintsError}
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Step 5: Preview & Save */}
      {currentStep === 'preview' && (
        <Card title="Live Preview & Self-Check" eyebrow="Step 5 of 5">
          <div style={{ display: 'grid', gap: '20px', marginTop: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 600, margin: 0 }}>{title}</h3>
                <span className="small muted">
                  Difficulty: <strong style={{ textTransform: 'capitalize' }}>{difficulty}</strong> · {requirements.length} requirements
                </span>
              </div>
            </div>

            {/* Validation feedback against solution */}
            <div
              style={{
                padding: '14px',
                background: solutionCheckResult?.allPassed ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                border: `1px solid ${solutionCheckResult?.allPassed ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                borderRadius: '8px',
              }}
            >
              <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '6px', color: solutionCheckResult?.allPassed ? '#4ade80' : '#f87171' }}>
                {solutionCheckResult?.allPassed
                  ? 'All requirements pass against your reference solution! Challenge is valid.'
                  : `Solution check: ${solutionCheckResult?.passed ?? 0} of ${solutionCheckResult?.total ?? 0} requirements passed.`}
              </div>

              {solutionCheckResult?.results.map((r) => (
                <div key={r.id} style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                  <Icon name={r.status === 'pass' ? 'check' : 'x'} size={14} />
                  <span>{r.description}</span>
                </div>
              ))}
            </div>

            {/* Live sandboxed preview */}
            <div>
              <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '8px' }}>Starter Code Preview:</div>
              <div style={{ height: '260px', border: '1px solid var(--c-border)', borderRadius: '8px', overflow: 'hidden' }}>
                <SandboxedPreview html={starterCode} />
              </div>
            </div>

            <div>
              <Button
                variant="primary"
                onClick={handleSave}
                disabled={!solutionCheckResult?.allPassed}
              >
                <Icon name="check" size={16} /> Save Challenge to My Workspace
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Stepper Footer Controls */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '24px',
          paddingTop: '16px',
          borderTop: '1px solid var(--c-border, #2d3040)',
        }}
      >
        <Button variant="ghost" onClick={handleBack} disabled={currentStep === 'details'}>
          Back
        </Button>

        {currentStep !== 'preview' ? (
          <Button variant="primary" onClick={handleNext} disabled={!canGoNext()}>
            Next: {STEP_LABELS[STEPS[STEPS.indexOf(currentStep) + 1]]}
          </Button>
        ) : null}
      </div>
    </div>
  )
}
export default ChallengeCreator
