import React, { useEffect, useRef, useState } from 'react';

interface RemotionLoopVideoProps {
  name: 'cefr-diagnostic-loop' | 'quick-recast-loop';
  className?: string;
  alt?: string;
  style?: React.CSSProperties;
}

export const RemotionLoopVideo: React.FC<RemotionLoopVideoProps> = ({
  name,
  className = '',
  alt = 'Product Demonstration Loop',
  style,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  const webmSrc = `/media/loops/${name}.webm`;
  const mp4Src = `/media/loops/${name}.mp4`;
  const posterSrc = `/media/loops/${name}-poster.webp`;

  useEffect(() => {
    // Check prefers-reduced-motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const listener = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', listener);
    } else {
      mediaQuery.addListener(listener);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', listener);
      } else {
        mediaQuery.removeListener(listener);
      }
    };
  }, []);

  useEffect(() => {
    if (prefersReducedMotion || !videoRef.current) return;

    const video = videoRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            video.play().catch(() => {
              // Ignore autoplay restrictions or interruptions
            });
          } else {
            video.pause();
          }
        });
      },
      { threshold: 0.15 }
    );

    observer.observe(video);

    return () => {
      observer.disconnect();
    };
  }, [prefersReducedMotion]);

  if (prefersReducedMotion) {
    return (
      <img
        src={posterSrc}
        alt={alt}
        className={`w-full h-auto object-cover rounded-xl ${className}`}
        style={style}
        loading="lazy"
      />
    );
  }

  return (
    <video
      ref={videoRef}
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
      poster={posterSrc}
      aria-hidden="true"
      className={`w-full h-auto object-cover rounded-xl ${className}`}
      style={style}
    >
      <source src={webmSrc} type="video/webm" />
      <source src={mp4Src} type="video/mp4" />
      Your browser does not support the video tag.
    </video>
  );
};
