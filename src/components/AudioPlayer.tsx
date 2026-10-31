import React, { useEffect, useRef } from 'react';

interface AudioPlayerProps {
  musicUrl?: string;
  autoPlayTrigger?: boolean;
}

/**
 * AudioPlayer plays the wedding background soundtrack seamlessly in the background
 * without displaying any intrusive floating icons, widgets, or overlays on the frontend.
 */
export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  musicUrl,
  autoPlayTrigger,
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // When autoPlayTrigger changes to true (envelope opened by guest gesture)
  useEffect(() => {
    if (autoPlayTrigger && audioRef.current && musicUrl) {
      audioRef.current.volume = 0.65;
      audioRef.current
        .play()
        .catch((err) => {
          console.log('Audio autoplay policy required user gesture:', err);
        });
    }
  }, [autoPlayTrigger, musicUrl]);

  if (!musicUrl) return null;

  return (
    <audio
      ref={audioRef}
      src={musicUrl}
      loop
      preload="auto"
      className="hidden"
      aria-hidden="true"
    />
  );
};
