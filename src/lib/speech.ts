/**
 * Speak text using Web Speech API
 */
export function speak(text: string, muted: boolean): void {
  if (muted) return
  if (!('speechSynthesis' in window)) return

  // Cancel any ongoing speech
  window.speechSynthesis.cancel()

  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'en-US'
  utterance.rate = 0.9
  utterance.pitch = 1
  utterance.volume = 1

  window.speechSynthesis.speak(utterance)
}

/**
 * Announce next shooter
 */
export function announceShooter(stageName: string, shooterName: string, muted: boolean): void {
  const text = `${stageName}, ${shooterName}, your turn`
  speak(text, muted)
}
