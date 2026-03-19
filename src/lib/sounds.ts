export const SOUNDS = {
  THREAD_ENTER: '/sounds/entrar%20hilo.mp3',
  THREAD_EXIT: '/sounds/salir%20hilo.mp3',
  LIKE: '/sounds/cutucar.mp3',
  UNLIKE: '/sounds/uncutucar.mp3',
  DISLIKE: '/sounds/desuncutucar.mp3', 
  UNDISLIKE: '/sounds/descutucar.mp3' 
} as const;

type SoundKey = keyof typeof SOUNDS;

const audioCache: Map<string, HTMLAudioElement> = new Map();

/**
 * Plays a sound effect (snippets ahh)
 * @param soundKey The key of the sound to play from SOUNDS constant
 * @param volume Volume level from 0 to 1
 */


export async function playSound(soundKey: SoundKey, volume = 0.5) {
  if (typeof window === 'undefined') return;

  try {
    const src = SOUNDS[soundKey];
    let audio = audioCache.get(src);

    if (!audio) {
      audio = new Audio(src);
      audioCache.set(src, audio);
    }

    audio.currentTime = 0;
    audio.volume = volume;

    await audio.play().catch(err => {
      console.warn(`Sound playback failed for ${soundKey}:`, err.message);
    });
  } catch (err) {
    console.error(`Error playing sound ${soundKey}:`, err);
  }
}
export function preloadSounds() {
  if (typeof window === 'undefined') return;
  
  Object.values(SOUNDS).forEach(src => {
    if (!audioCache.has(src)) {
      const audio = new Audio(src);
      audio.load();
      audioCache.set(src, audio);
    }
  });
}
