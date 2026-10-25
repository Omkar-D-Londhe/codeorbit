/**
 * Challenge Adapter.
 * Bridges baseline single-file Challenge objects to language-neutral ChallengeV2 format.
 */

import { getTopic } from '../../data/curriculum'
import type { Challenge } from '../../data/types'
import { defaultTrackId, getTrack } from './registry'
import type { ChallengeFile, ChallengeV2 } from './types'

export function toChallengeV2(challenge: Challenge, trackId?: string): ChallengeV2 {
  const resolvedTrackId =
    trackId ??
    getTopic(challenge.topicId)?.technologyId ??
    defaultTrackId() ??
    ''

  const track = getTrack(resolvedTrackId)
  const langId = track?.language.id ?? resolvedTrackId
  const fileName = track?.language.defaultFiles?.[0]?.name ?? `index${track?.language.fileExtension ?? ''}`

  const starterFile: ChallengeFile = {
    name: fileName,
    language: langId,
    content: challenge.starterCode,
  }

  const solutionFile: ChallengeFile = {
    name: fileName,
    language: langId,
    content: challenge.solutionCode,
  }

  return {
    id: challenge.id,
    trackId: resolvedTrackId,
    topicId: challenge.topicId,
    title: challenge.title,
    difficulty: challenge.difficulty,
    prompt: challenge.prompt,
    objective: challenge.objective,
    files: [starterFile],
    requirements: challenge.requirements,
    hints: challenge.hints,
    solution: {
      files: [solutionFile],
      explanation: challenge.solutionExplanation.join('\n\n'),
    },
  }
}

export function toChallenge(v2: ChallengeV2): Challenge {
  return {
    id: v2.id,
    topicId: v2.topicId,
    title: v2.title,
    difficulty: v2.difficulty,
    prompt: v2.prompt,
    objective: v2.objective,
    starterCode: v2.files[0]?.content ?? '',
    requirements: v2.requirements,
    hints: v2.hints,
    solutionCode: v2.solution.files[0]?.content ?? '',
    solutionExplanation: v2.solution.explanation.split('\n\n'),
  }
}
