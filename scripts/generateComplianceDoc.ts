import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { concepts } from '../src/core/concepts/concepts.ts'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')
const outputPath = path.resolve(rootDir, 'docs', 'ASSESSMENT_COMPLIANCE.md')

function generateMarkdown(): string {
  const lines: string[] = []

  lines.push('# Assessment compliance — evidence-based status')
  lines.push('')
  lines.push('> **Auto-generated supporting record.** Generated from `src/core/concepts/concepts.ts` via `npm run docs:concepts`. Do not edit manually.')
  lines.push('')
  lines.push('**Nothing in this file is marked verified.** The original assessment *requirement* documents were not supplied.')
  lines.push('')
  lines.push('## Source review')
  lines.push('| # | Source | In workspace? | Reviewed? | Finding |')
  lines.push('|---|---|---|---|---|')
  lines.push('| S-1 | Frontend Design Lab assessment (question sheet) | ❌ | — | Not provided. |')
  lines.push('| S-2 | Testing Lab assessment (question sheet) | ❌ | — | Not provided. |')
  lines.push('| S-3 | `now.zip` → 41 PDFs `24MIC0135_FE_Lab_Assess_*` / `Frontend Lab *` (course **CSI3029 Front End Design and Testing (Lab)**) | ✅ | Partially (OCR of cover pages) | These are **completed lab submissions** (name, reg. no., screenshots of results), not requirement text. They are image-only PDFs; OCR cover text confirms the course code and that submissions are screenshots of working pages (e.g. Assessment 29 shows a mouse-event box). They contain no marking criteria, so they cannot verify any requirement. |')
  lines.push('')
  lines.push('**Blocker recorded:** without S-1/S-2, no assessment row can be verified. Unaffected work continued. Please supply the question sheets (or confirm which required techniques/libraries apply) to complete this matrix.')
  lines.push('')

  const total = concepts.length
  const pending = concepts.filter((c) => c.courseStatus === 'pending-review').length
  const notReq = concepts.filter((c) => c.courseStatus === 'not-required').length
  const verified = concepts.filter((c) => c.courseStatus === 'verified').length
  const applied = concepts.filter((c) => !!c.platformUse).length

  lines.push('## Summary statistics')
  lines.push(`- **Total registered concepts:** ${total}`)
  lines.push(`- **Applied in platform:** ${applied}`)
  lines.push(`- **Teaching-only (no platform use claimed):** ${total - applied}`)
  lines.push(`- **Pending review:** ${pending}`)
  lines.push(`- **Not required:** ${notReq}`)
  lines.push(`- **Verified:** ${verified}`)
  lines.push('')

  lines.push('## Frontend concepts application matrix')
  lines.push('| ID | Concept | Area | Platform use | Teach (Track / Topic) | Evidence tests | Status | Assessment Ref |')
  lines.push('|---|---|---|---|---|---|---|---|')

  for (const c of concepts) {
    const platform = c.platformUse
      ? `${c.platformUse.feature} (${c.platformUse.sourceFiles.join(', ')})`
      : 'Teaching-only (no platform use)'

    const teach = c.teachIn
      .map((t) => `${t.trackId}:${t.topicId}${t.challengeId ? ` (${t.challengeId})` : ''}`)
      .join('<br>')

    const tests = c.evidenceTests
      .map((t) => `\`${t.replace(/^src\/test\//, '')}\``)
      .join('<br>')

    const ref = c.assessmentRef ?? '—'

    lines.push(
      `| ${c.id} | ${c.title} | ${c.area} | ${platform} | ${teach} | ${tests} | \`${c.courseStatus}\` | ${ref} |`
    )
  }

  lines.push('')
  lines.push('All rows: **pending-review** except not-required rows (requires original question sheets).')
  lines.push('')

  return lines.join('\n')
}

export function generateComplianceDoc(): string {
  const content = generateMarkdown()
  fs.writeFileSync(outputPath, content, 'utf8')
  return content
}

// Execute when run as CLI script
if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
  generateComplianceDoc()
  console.log(`Successfully generated ${outputPath} (${concepts.length} concepts).`)
}
