import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import { Howl, Howler } from 'howler';

const ASSETS = {
  heroAmbient: '/audios/looping track 10.mp3'
};

const VOLUMES = {
  heroBase: 0.4
};

const MUTE_STORAGE_KEY = 'casa_audio_muted_v1';

const DynamicAudioContext = createContext({
  isMuted: false,
  toggleMute: () => {},
  playSting: () => {}
});

export const useDynamicAudio = () => useContext(DynamicAudioContext);

const DynamicAudioManager = ({ children }) => {
  const [isMuted, setIsMuted] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.localStorage.getItem(MUTE_STORAGE_KEY) === '1';
  });

  const isMutedRef = useRef(isMuted);
  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  const heroRef = useRef(null);
  const heroIdRef = useRef(null);
  const heroPresenceStartedRef = useRef(false);
  const heroStartRequestedRef = useRef(false);

  const ensureHeroPlaying = useCallback(() => {
    if (Howler.ctx?.state === 'suspended') {
      Howler.ctx.resume();
    }

    const hero = heroRef.current;
    if (!hero) return null;

    if (heroIdRef.current == null) {
      heroIdRef.current = hero.play();
    } else if (!hero.playing(heroIdRef.current)) {
      hero.play(heroIdRef.current);
    }

    return heroIdRef.current;
  }, []);

  const fadeHeroTo = useCallback((targetVolume, durationMs) => {
    const hero = heroRef.current;
    if (!hero) return;

    const id = ensureHeroPlaying();
    if (id == null) return;

    const from = hero.volume(id);
    hero.fade(from, targetVolume, durationMs, id);
  }, [ensureHeroPlaying]);

  const applyTimelineStart = useCallback(() => {
    if (isMutedRef.current) return;
    if (heroPresenceStartedRef.current) return;
    if (heroStartRequestedRef.current) return;

    const hero = heroRef.current;
    if (!hero) return;

    if (Howler.ctx?.state === 'suspended') {
      Howler.ctx.resume();
    }

    heroStartRequestedRef.current = true;

    const id = heroIdRef.current ?? hero.play();
    heroIdRef.current = id;

    hero.once('play', (playedId) => {
      if (playedId !== id) return;
      heroPresenceStartedRef.current = true;
      heroStartRequestedRef.current = false;
      hero.volume(0, id);
      hero.fade(0, VOLUMES.heroBase, 3000, id);
    });

    hero.once('playerror', (playedId) => {
      if (playedId !== id) return;
      heroPresenceStartedRef.current = false;
      heroStartRequestedRef.current = false;
      try { hero.stop(id); } catch {}
      heroIdRef.current = null;
    });
  }, []);

  const restoreHeroBase = useCallback(() => {
    if (isMutedRef.current) return;
    fadeHeroTo(VOLUMES.heroBase, 1500);
  }, [fadeHeroTo]);

  const fadeAllToZero = useCallback(() => {
    const hero = heroRef.current;
    if (!hero) return;
    if (heroIdRef.current == null) return;
    const from = hero.volume(heroIdRef.current);
    hero.fade(from, 0, 1500, heroIdRef.current);
  }, []);

  const restoreVolumes = useCallback(() => {
    if (document.visibilityState === 'hidden') return;
    if (!heroPresenceStartedRef.current) applyTimelineStart();
    else restoreHeroBase();
  }, [applyTimelineStart, restoreHeroBase]);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      window.localStorage.setItem(MUTE_STORAGE_KEY, next ? '1' : '0');

      if (next) fadeAllToZero();
      else restoreVolumes();

      return next;
    });
  }, [fadeAllToZero, restoreVolumes]);

  useEffect(() => {
    const hero = new Howl({
      src: [ASSETS.heroAmbient],
      loop: true,
      volume: 0,
      preload: true
    });

    heroRef.current = hero;

    const onFirstInteraction = () => {
      if (Howler.ctx?.state === 'suspended') {
        Howler.ctx.resume();
      }
      if (!isMutedRef.current && !heroPresenceStartedRef.current) applyTimelineStart();
    };

    window.addEventListener('pointerdown', onFirstInteraction, { passive: true });
    window.addEventListener('keydown', onFirstInteraction, { passive: true });

    if (!isMutedRef.current) applyTimelineStart();

    return () => {
      window.removeEventListener('pointerdown', onFirstInteraction);
      window.removeEventListener('keydown', onFirstInteraction);
      try { hero.unload(); } catch {}
    };
  }, [applyTimelineStart]);

  useEffect(() => {
    const onVisibility = () => {
      const hero = heroRef.current;
      if (!hero) return;

      if (document.visibilityState === 'hidden') {
        if (heroIdRef.current != null) hero.pause(heroIdRef.current);
        return;
      }

      if (isMutedRef.current) return;

      if (heroIdRef.current != null) hero.play(heroIdRef.current);
      restoreHeroBase();
    };

    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, [restoreHeroBase]);

  const playSting = useCallback(() => {
  }, []);

  const value = useMemo(() => ({
    isMuted,
    toggleMute,
    playSting
  }), [isMuted, toggleMute, playSting]);

  return (
    <DynamicAudioContext.Provider value={value}>
      {children}

      <div
        className="fixed left-6 bottom-12 z-[10002] pointer-events-auto flex items-center gap-4 rotate-[-90deg] origin-left"
        data-audio-ui="true"
      >
        <button
          type="button"
          onClick={toggleMute}
          aria-pressed={isMuted}
          aria-label={isMuted ? 'Unmute audio' : 'Mute audio'}
          className="group flex items-center gap-3 rounded-full bg-transparent border border-neutral-800/80 px-4 py-2 outline-none select-none transition-colors duration-300 hover:border-casa-bronze/60 hover:shadow-[0_0_18px_rgba(200,169,126,0.18)]"
        >
          <span className="font-display text-[10px] tracking-[0.3em] uppercase text-neutral-500 group-hover:text-casa-cream transition-colors">
            {isMuted ? 'Muted' : 'Audio'}
          </span>

          <div className="flex items-end gap-[3px] h-3">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={[
                  'w-[1px] rounded-full bg-casa-cream/90 origin-bottom transition-all duration-300 motion-reduce:animate-none',
                  !isMuted ? 'animate-music-wave' : 'h-[2px]'
                ].join(' ')}
                style={{ animationDelay: `${i * 0.12}s` }}
              />
            ))}
          </div>
        </button>
      </div>
    </DynamicAudioContext.Provider>
  );
};

export default DynamicAudioManager;
