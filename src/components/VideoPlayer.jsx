import React, { useRef, useEffect, useState } from 'react';
import { PlayIcon, PauseIcon, SpeakerWaveIcon, SpeakerXMarkIcon } from '@heroicons/react/24/outline';
import './VideoPlayer.css';

const VideoPlayer = ({ src, className = '', autoplay = true, muted: initialMuted = true }) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(initialMuted);
  const [isVisible, setIsVisible] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  // Intersection Observer pour détecter la visibilité
  useEffect(() => {
    const videoElement = videoRef.current;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.5 } // 50% visible
    );

    if (videoElement) {
      observer.observe(videoElement);
    }

    return () => {
      if (videoElement) {
        observer.unobserve(videoElement);
      }
    };
  }, []);

  // Gestion autoplay basé sur la visibilité
  useEffect(() => {
    if (!videoRef.current) return;

    if (isVisible && autoplay && !hasInteracted) {
      // Démarrer l'autoplay seulement si l'utilisateur n'a pas encore interagi
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => setIsPlaying(true))
          .catch(() => {
            // Autoplay bloqué par le navigateur, rester en pause
            setIsPlaying(false);
          });
      }
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  }, [isVisible, autoplay, hasInteracted]);

  // Gestion des événements vidéo
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => {
      setIsPlaying(false);
      // Rejouer automatiquement en boucle
      if (autoplay) {
        video.currentTime = 0;
        video.play().catch(() => {});
      }
    };

    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('ended', handleEnded);
    };
  }, [autoplay]);

  const togglePlay = () => {
    if (!videoRef.current) return;

    setHasInteracted(true); // L'utilisateur a interagi

    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play().catch(() => {});
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;

    setHasInteracted(true);
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    videoRef.current.muted = newMuted;
  };

  return (
    <div className={`video-player-container ${className}`}>
      <video
        ref={videoRef}
        src={src}
        className="video-player"
        muted={isMuted}
        playsInline
        loop={autoplay}
        preload="metadata"
      />

      {/* Overlay de contrôle */}
      <div className="video-overlay">
        {/* Bouton play/pause central */}
        <button
          className="video-control play-pause-btn"
          onClick={togglePlay}
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? (
            <PauseIcon className="control-icon" />
          ) : (
            <PlayIcon className="control-icon" />
          )}
        </button>

        {/* Contrôles en bas */}
        <div className="video-controls-bottom">
          <button
            className="video-control mute-btn"
            onClick={toggleMute}
            aria-label={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? (
              <SpeakerXMarkIcon className="control-icon" />
            ) : (
              <SpeakerWaveIcon className="control-icon" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;