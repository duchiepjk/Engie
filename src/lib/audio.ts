export function speakEnglishText(text: string, rate: number = 1.0) {
  if (!('speechSynthesis' in window)) {
    console.warn('Browser does not support SpeechSynthesis');
    return;
  }

  // Cancel any active speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-US';
  utterance.rate = rate;

  // Try to find natural sounding US voice
  const voices = window.speechSynthesis.getVoices();
  const englishVoice = voices.find(
    (v) => (v.lang === 'en-US' || v.lang.startsWith('en')) && v.name.includes('Google')
  ) || voices.find((v) => v.lang.startsWith('en'));

  if (englishVoice) {
    utterance.voice = englishVoice;
  }

  window.speechSynthesis.speak(utterance);
}
