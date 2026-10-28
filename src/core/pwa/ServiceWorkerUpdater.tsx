import { useEffect } from 'react'
import { useToast } from '../../components/Toast'
import { registerServiceWorker } from './register'

export function ServiceWorkerUpdater() {
  const { show } = useToast()

  useEffect(() => {
    registerServiceWorker((reload) => {
      show('New version available', 'info', 'sw-update', {
        label: 'Reload',
        onClick: reload,
      })
    })
  }, [show])

  return null
}
