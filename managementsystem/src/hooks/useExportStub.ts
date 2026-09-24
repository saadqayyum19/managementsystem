import { useToast } from '../components/ui/Toast'

/** Export actions in this phase are stubs — they surface a toast until the backend lands. */
export function useExportStub() {
  const toast = useToast()
  return {
    exportStub: (label: string) => toast.info({ title: `${label} export queued`, message: 'Export profiles arrive with the backend integration — the mock layer has no file service.' }),
    notImplemented: (label: string) => toast.warning({ title: `${label} needs the backend`, message: 'This action is wired to a stub in the mock-only phase.' }),
  }
}
