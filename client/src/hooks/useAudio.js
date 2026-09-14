import { audioEngine } from '../services/audioEngine';

export function useAudio() {
  return {
    playEffect: (name) => audioEngine.playEffect(name),
    speakText: (text) => audioEngine.speakText(text),
    playAudioFile: (url) => audioEngine.playAudioFile(url),
    stopAll: () => audioEngine.stopAll(),
    setVolume: (vol) => audioEngine.setVolume(vol),
    setAudioMode: (mode) => audioEngine.setAudioMode(mode),
    setSoundEffects: (effects) => audioEngine.setSoundEffects(effects),
    unlockAudio: () => audioEngine.unlockAudio()
  };
}
