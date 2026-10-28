import { announce, type Politeness } from './Announcer'

export function useAnnounce() {
  return {
    announce: (message: string, politeness?: Politeness) => announce(message, politeness),
  }
}

export { announce }
export type { Politeness }
