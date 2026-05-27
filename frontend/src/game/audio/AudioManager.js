const STORAGE_KEY = 'samurai-greg-audio-settings';
const LEGACY_MUSIC_KEY = 'samurai-greg-title-music';

const DEFAULT_SETTINGS = {
  masterVolume: 0.8,
  musicVolume: 0.32,
  sfxVolume: 0.65,
  ambientVolume: 0.22,
  uiVolume: 0.5,
  muted: false,
  musicEnabled: false,
};

const MIN_AUDIBLE_VOLUME = 0.05;
const PHASER_SOUND_UNLOCKED_EVENT = 'unlocked';

const clamp01 = (value) => Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0));

class AudioManager {
  constructor() {
    this.settings = { ...DEFAULT_SETTINGS };
    this.hasStoredSettings = false;
    this.musicPreferenceEnabled = false;
    this.loadSettings();
  }

  loadSettings() {
    this.hasStoredSettings = false;
    this.musicPreferenceEnabled = false;

    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);

      if (raw) {
        const parsed = JSON.parse(raw);
        this.hasStoredSettings = true;
        this.musicPreferenceEnabled = !!parsed.musicEnabled;
        this.settings = {
          ...DEFAULT_SETTINGS,
          ...parsed,
          masterVolume: clamp01(parsed.masterVolume ?? DEFAULT_SETTINGS.masterVolume),
          musicVolume: clamp01(parsed.musicVolume ?? DEFAULT_SETTINGS.musicVolume),
          sfxVolume: clamp01(parsed.sfxVolume ?? DEFAULT_SETTINGS.sfxVolume),
          ambientVolume: clamp01(parsed.ambientVolume ?? DEFAULT_SETTINGS.ambientVolume),
          uiVolume: clamp01(parsed.uiVolume ?? DEFAULT_SETTINGS.uiVolume),
          muted: !!parsed.muted,
          // Runtime audio always boots OFF after refresh; Press Start can re-enable it.
          musicEnabled: false,
        };
        return;
      }

      const legacy = window.localStorage.getItem(LEGACY_MUSIC_KEY);
      if (legacy === 'enabled' || legacy === 'muted') {
        this.hasStoredSettings = true;
        this.musicPreferenceEnabled = legacy === 'enabled';
        this.settings.musicEnabled = false;
        this.settings.muted = legacy === 'muted';
      }
    } catch {
      this.hasStoredSettings = false;
      this.musicPreferenceEnabled = false;
      this.settings = { ...DEFAULT_SETTINGS };
    }
  }

  saveSettings() {
    try {
      this.hasStoredSettings = true;
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(this.settings));
    } catch {
      // Ignore storage errors.
    }
  }

  getSettings() {
    return { ...this.settings };
  }

  shouldEnableMusicOnUserGesture() {
    if (this.settings.muted) {
      return false;
    }

    if (!this.hasStoredSettings) {
      return true;
    }

    return this.musicPreferenceEnabled;
  }

  enableMusicFromUserGesture() {
    if (!this.shouldEnableMusicOnUserGesture()) {
      return false;
    }

    this.ensureAudibleSettings();

    if (!this.settings.musicEnabled) {
      this.setMusicEnabled(true);
    }

    return true;
  }

  setMusicEnabled(value) {
    this.settings.musicEnabled = !!value;
    this.musicPreferenceEnabled = !!value;

    if (this.settings.musicEnabled) {
      this.ensureAudibleSettings();
    }

    this.saveSettings();
  }

  setMuted(value) {
    this.settings.muted = !!value;

    if (!this.settings.muted) {
      this.ensureAudibleSettings();
    }

    this.saveSettings();
  }

  ensureAudibleSettings() {
    let didChange = false;

    if (this.settings.masterVolume < MIN_AUDIBLE_VOLUME) {
      this.settings.masterVolume = DEFAULT_SETTINGS.masterVolume;
      didChange = true;
    }

    if (this.settings.musicVolume < MIN_AUDIBLE_VOLUME) {
      this.settings.musicVolume = DEFAULT_SETTINGS.musicVolume;
      didChange = true;
    }

    if (this.settings.sfxVolume < MIN_AUDIBLE_VOLUME) {
      this.settings.sfxVolume = DEFAULT_SETTINGS.sfxVolume;
      didChange = true;
    }

    if (this.settings.ambientVolume < MIN_AUDIBLE_VOLUME) {
      this.settings.ambientVolume = DEFAULT_SETTINGS.ambientVolume;
      didChange = true;
    }

    if (this.settings.uiVolume < MIN_AUDIBLE_VOLUME) {
      this.settings.uiVolume = DEFAULT_SETTINGS.uiVolume;
      didChange = true;
    }

    if (didChange) {
      this.saveSettings();
    }
  }

  setMasterVolume(value) {
    this.settings.masterVolume = clamp01(value);
    this.saveSettings();
  }

  setMusicVolume(value) {
    this.settings.musicVolume = clamp01(value);
    this.saveSettings();
  }

  setSfxVolume(value) {
    this.settings.sfxVolume = clamp01(value);
    this.saveSettings();
  }

  setAmbientVolume(value) {
    this.settings.ambientVolume = clamp01(value);
    this.saveSettings();
  }

  setUiVolume(value) {
    this.settings.uiVolume = clamp01(value);
    this.saveSettings();
  }

  getCategoryMultiplier(category) {
    switch (category) {
      case 'music':
        return this.settings.musicVolume;
      case 'ambient':
        return this.settings.ambientVolume;
      case 'ui':
        return this.settings.uiVolume;
      case 'sfx':
      default:
        return this.settings.sfxVolume;
    }
  }

  getEffectiveVolume(category, baseVolume = 1) {
    if (this.settings.muted) {
      return 0;
    }

    if (category === 'music' && !this.settings.musicEnabled) {
      return 0;
    }

    const scalar = this.settings.masterVolume * this.getCategoryMultiplier(category);
    return clamp01(baseVolume) * scalar;
  }

  resolveCategoryFromKey(key) {
    if (key === 'sfx-title-bgm' || key === 'sfx-game-bgm' || key === 'sfx-boss-bgm') {
      return 'music';
    }

    if (key === 'sfx-title-ambient') {
      return 'ambient';
    }

    if (key === 'sfx-menu-hover' || key === 'sfx-menu-confirm') {
      return 'ui';
    }

    return 'sfx';
  }

  playSfx(scene, key, config = {}, options = {}) {
    if (!scene.sound || !scene.cache.audio.exists(key)) {
      return;
    }

    if (scene.sound.locked) {
      return;
    }

    const category = options.category || this.resolveCategoryFromKey(key);
    const minInterval = options.minInterval ?? 35;
    const now = scene.time?.now ?? Date.now();

    if (!scene.__audioLastPlay) {
      scene.__audioLastPlay = new Map();
    }

    const lastAt = scene.__audioLastPlay.get(key) ?? -Infinity;
    if (now - lastAt < minInterval) {
      return;
    }

    scene.__audioLastPlay.set(key, now);

    const baseVolume = config.volume ?? 1;
    const finalVolume = this.getEffectiveVolume(category, baseVolume);

    if (finalVolume <= 0.001) {
      return;
    }

    scene.sound.play(key, {
      ...config,
      volume: finalVolume,
    });
  }

  waitForSceneAudioUnlock(scene, timeoutMs = 900) {
    const sound = scene?.sound;

    if (!sound || !sound.locked) {
      return Promise.resolve(true);
    }

    if (typeof sound.once !== 'function') {
      return Promise.resolve(false);
    }

    return new Promise((resolve) => {
      let settled = false;
      let timeoutId = null;

      const finish = (unlocked) => {
        if (settled) {
          return;
        }

        settled = true;

        if (timeoutId !== null) {
          window.clearTimeout(timeoutId);
        }

        if (typeof sound.off === 'function') {
          sound.off(PHASER_SOUND_UNLOCKED_EVENT, handleUnlock);
        }

        resolve(unlocked);
      };

      const handleUnlock = () => finish(true);

      sound.once(PHASER_SOUND_UNLOCKED_EVENT, handleUnlock);
      timeoutId = window.setTimeout(() => finish(!sound.locked), timeoutMs);
    });
  }

  async unlockSceneAudio(scene) {
    const sound = scene?.sound;

    if (!sound) {
      return false;
    }

    if (!sound.locked && sound.context?.state !== 'suspended' && sound.context?.state !== 'interrupted') {
      return true;
    }

    if (sound.locked && typeof sound.unlock === 'function') {
      try {
        sound.unlock();
      } catch {
        // Browser unlock quirks vary; direct context resume below is the reliable mobile path.
      }
    }

    const context = sound.context;
    const shouldResumeContext = context
      && typeof context.resume === 'function'
      && (context.state === 'suspended' || context.state === 'interrupted');

    if (shouldResumeContext) {
      try {
        await context.resume();

        if (sound.locked && context.state === 'running') {
          sound.unlocked = true;
        }
      } catch {
        return this.waitForSceneAudioUnlock(scene, 450);
      }
    }

    if (sound.locked && context?.state === 'running') {
      sound.unlocked = true;
    }

    if (sound.locked) {
      return this.waitForSceneAudioUnlock(scene);
    }

    return true;
  }

  ensureMusicTrack(scene, slot, key) {
    if (!scene.__audioTracks) {
      scene.__audioTracks = {};
    }

    const existing = scene.__audioTracks[slot];
    if (existing && existing.key === key) {
      return existing;
    }

    if (existing) {
      existing.stop();
      existing.destroy();
      scene.__audioTracks[slot] = null;
    }

    if (!scene.sound || !scene.cache.audio.exists(key)) {
      return null;
    }

    const track = scene.sound.add(key, {
      loop: true,
      volume: 0,
    });

    scene.__audioTracks[slot] = track;
    return track;
  }

  syncMusicTrack(scene, slot, key, baseVolume = 1, fadeMs = 260) {
    const track = this.ensureMusicTrack(scene, slot, key);

    if (!track) {
      return null;
    }

    const nextVolume = this.getEffectiveVolume('music', baseVolume);

    scene.tweens.killTweensOf(track);

    if (nextVolume <= 0.001) {
      if (track.isPlaying) {
        if (fadeMs > 0) {
          scene.tweens.add({
            targets: track,
            volume: 0,
            duration: Math.max(120, fadeMs),
            ease: 'Sine.out',
            onComplete: () => track.pause(),
          });
        } else {
          track.setVolume(0);
          track.pause();
        }
      } else {
        track.setVolume(0);
      }

      return track;
    }

    if (track.isPaused && typeof track.resume === 'function') {
      track.resume();
    } else if (!track.isPlaying) {
      track.setVolume(0);
      track.play();
    }

    if (fadeMs > 0) {
      scene.tweens.add({
        targets: track,
        volume: nextVolume,
        duration: fadeMs,
        ease: 'Sine.out',
      });
    } else {
      track.setVolume(nextVolume);
    }

    return track;
  }

  fadeOutAndStop(scene, track, duration = 350, onComplete) {
    if (!track || !track.isPlaying) {
      onComplete?.();
      return;
    }

    scene.tweens.add({
      targets: track,
      volume: 0,
      duration,
      ease: 'Sine.out',
      onComplete: () => {
        track.stop();
        onComplete?.();
      },
    });
  }
}

export const audioManager = new AudioManager();
