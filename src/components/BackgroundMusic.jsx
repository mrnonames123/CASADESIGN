import React, { useCallback, useEffect, useRef, useState } from 'react';

const AUDIO_SRC = '/assets/casa-ambient-vibe.mp3';

const BackgroundMusic = () => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.muted = true;
    audio.volume = 0.7;

    const tryAutoplayMuted = async () => {
      try {
        await audio.play();
      } catch {
      }
    };

    tryAutoplayMuted();

    return () => {
      audio.pause();
    };
  }, []);

  const toggleMusic = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.muted = true;
      audio.pause();
      setIsPlaying(false);
      return;
    }

    try {
      audio.muted = false;
      await audio.play();
      setIsPlaying(true);
    } catch {
      setIsPlaying(false);
    }
  }, [isPlaying]);

  return (
    <div className="fixed left-6 bottom-12 z-50 pointer-events-auto flex items-center gap-4 rotate-[-90deg] origin-left">
      <audio ref={audioRef} src={AUDIO_SRC} loop preload="auto" playsInline />

      <button
        type="button"
        onClick={toggleMusic}
        aria-pressed={isPlaying}
        aria-label={isPlaying ? 'Pause background music' : 'Play background music'}
        className="group flex items-center gap-3 rounded-full bg-transparent border border-neutral-800/80 px-4 py-2 outline-none select-none transition-colors duration-300 hover:border-casa-bronze/60 hover:shadow-[0_0_18px_rgba(200,169,126,0.18)]"
      >
        <span className="font-display text-[10px] tracking-[0.3em] uppercase text-neutral-500 group-hover:text-casa-cream transition-colors">
          {isPlaying ? 'Sound On' : 'Sound Off'}
        </span>

        <div className="flex items-end gap-[3px] h-3">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={[
                'w-[1px] rounded-full bg-casa-cream/90 origin-bottom transition-all duration-300 motion-reduce:animate-none',
                isPlaying ? 'animate-music-wave' : 'h-[2px]'
              ].join(' ')}
              style={{ animationDelay: `${i * 0.12}s` }}
            />
          ))}
        </div>
      </button>
    </div>
  );
};

export default BackgroundMusic;
