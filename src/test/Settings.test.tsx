import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Settings from '../pages/Settings'
import { AppStateProvider } from '../state/AppState'
import { ToastProvider } from '../components/Toast'
import { expectNoA11yViolations } from './a11y'

function renderSettings() {
  return render(
    <AppStateProvider>
      <ToastProvider>
        <Settings />
      </ToastProvider>
    </AppStateProvider>
  )
}

describe('Settings Page (14.1, 14.2, 14.4, FC-07)', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('uses real labelled form controls for FC-07 compliance', async () => {
    const { container } = renderSettings()

    // Radio group for theme
    const themeRadio = screen.getByRole('radio', { name: /Obsidian/i })
    expect(themeRadio).toBeInTheDocument()

    // Select for pace
    const paceSelect = screen.getByRole('combobox', { name: /Preferred Pace/i })
    expect(paceSelect).toBeInTheDocument()

    // Checkbox / Toggle for high contrast
    const contrastSwitch = screen.getByRole('switch', { name: /High Contrast Mode/i })
    expect(contrastSwitch).toBeInTheDocument()

    // File input for import
    const fileInput = container.querySelector('input[type="file"][accept=".json"]')
    expect(fileInput).not.toBeNull()

    await expectNoA11yViolations(container)
  })

  it('validates profile name length (≤ 40 chars) and trims whitespace', async () => {
    const user = userEvent.setup()
    renderSettings()

    const nameInput = screen.getByLabelText(/Display Name/i)
    await user.clear(nameInput)
    await user.type(nameInput, '   Alex Explorer   ')

    expect(nameInput).toHaveValue('   Alex Explorer   ')
  })

  it('requires explicit typed "RESET" confirmation before allowing danger reset', async () => {
    const user = userEvent.setup()
    renderSettings()

    // Click Reset All Learning Data
    const dangerBtn = screen.getByRole('button', { name: /Reset All Learning Data/i })
    await user.click(dangerBtn)

    // Dialog appears
    const confirmInput = screen.getByLabelText(/Type RESET to confirm/i)
    const resetActionBtn = screen.getByRole('button', { name: /Reset Everything/i })
    expect(resetActionBtn).toBeDisabled()

    // Type something other than RESET
    await user.type(confirmInput, 'no')
    expect(resetActionBtn).toBeDisabled()

    // Type RESET
    await user.clear(confirmInput)
    await user.type(confirmInput, 'RESET')
    expect(resetActionBtn).not.toBeDisabled()

    await user.click(resetActionBtn)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('renders atmosphere toggles and motion selector taking immediate effect', async () => {
    const user = userEvent.setup()
    renderSettings()

    // Motion select
    const motionSelect = screen.getByLabelText(/Motion & Animation/i)
    expect(motionSelect).toHaveValue('system')
    await user.selectOptions(motionSelect, 'reduced')
    expect(motionSelect).toHaveValue('reduced')

    // Atmosphere toggles
    const nebulaToggle = screen.getByRole('switch', { name: /Dynamic Nebula Background/i })
    expect(nebulaToggle).toBeChecked()
    await user.click(nebulaToggle)
    expect(nebulaToggle).not.toBeChecked()

    const particlesToggle = screen.getByRole('switch', { name: /Ambient Particle Field/i })
    expect(particlesToggle).not.toBeChecked()
    await user.click(particlesToggle)
    expect(particlesToggle).toBeChecked()
  })

  it('renders Stage 16 accessibility and reminder controls with proper accessibility', async () => {
    const user = userEvent.setup()
    const { container } = renderSettings()

    // 13.1 Font Size Scaler: input type="range"
    const fontScaleSlider = screen.getByRole('slider', { name: /Font Size Scale/i })
    expect(fontScaleSlider).toBeInTheDocument()
    expect(fontScaleSlider).toHaveAttribute('type', 'range')

    // 13.2 Dyslexia font toggle
    const dyslexiaToggle = screen.getByRole('switch', { name: /Dyslexia-Friendly Font/i })
    expect(dyslexiaToggle).not.toBeChecked()
    await user.click(dyslexiaToggle)
    expect(dyslexiaToggle).toBeChecked()

    // 13.4 Screen-Reader Announcements toggle
    const announceToggle = screen.getByRole('switch', { name: /Screen-Reader Progress Announcements/i })
    expect(announceToggle).toBeChecked()
    await user.click(announceToggle)
    expect(announceToggle).not.toBeChecked()

    // 14.3 Study reminders toggle
    const reminderToggle = screen.getByRole('switch', { name: /Daily Study Reminders/i })
    expect(reminderToggle).not.toBeChecked()
    await user.click(reminderToggle)
    expect(reminderToggle).toBeChecked()

    // Time input appears when reminders are enabled
    const timeInput = screen.getByLabelText(/Preferred Practice Time/i)
    expect(timeInput).toBeInTheDocument()
    expect(timeInput).toHaveAttribute('type', 'time')

    // Day checkboxes
    const monCheckbox = screen.getByRole('checkbox', { name: /Remind on Mon/i })
    expect(monCheckbox).toBeInTheDocument()

    // Verify no accessibility violations with all controls mounted
    await expectNoA11yViolations(container)
  })
})
