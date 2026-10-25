/**
 * Language-neutral Editor contracts per 01_PRODUCT_AND_ARCHITECTURE.md §B3.
 */

export interface EditorDiagnostic {
  line: number
  column?: number
  severity: 'error' | 'warning' | 'info'
  message: string
}

export interface EditorOptions {
  value: string
  language?: string
  readOnly?: boolean
  ariaLabel?: string
  lineNumbers?: boolean
  wrap?: boolean
  fontSize?: number
  tabSize?: number
  tabCapturesFocus?: boolean
  autoClose?: boolean
  onChange?(value: string): void
  onCursor?(pos: { line: number; column: number }): void
}

export interface EditorHandle {
  getValue(): string
  setValue(v: string): void
  insertAtCursor(text: string): void
  focus(): void
  setDiagnostics(d: EditorDiagnostic[]): void
  setReadOnly(v: boolean): void
  updateOptions(o: Partial<EditorOptions>): void
  destroy(): void
}

export interface EditorAdapter {
  mount(el: HTMLElement, opts: EditorOptions): EditorHandle
}
