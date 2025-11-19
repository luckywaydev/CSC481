"use client";

import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Button } from './ui';

/**
 * AudioPlayer Component
 * เล่นไฟล์เสียงพร้อม controls และ seek bar
 */

interface AudioPlayerProps {
  audioUrl: string;
  onTimeUpdate?: (currentTime: number) => void;
  onLoadedMetadata?: (duration: number) => void;
  className?: string;
}

export const AudioPlayer = forwardRef<HTMLAudioElement, AudioPlayerProps>(
  function AudioPlayer({ audioUrl, onTimeUpdate, onLoadedMetadata, className = '' }, ref) {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Expose audio element to parent
    useImperativeHandle(ref, () => audioRef.current as HTMLAudioElement);

    // Format time as MM:SS
    const formatTime = (seconds: number): string => {
      if (isNaN(seconds)) return '00:00';
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Handle play/pause
    const togglePlayPause = async () => {
      if (!audioRef.current) return;

      try {
        if (isPlaying) {
          audioRef.current.pause();
        } else {
          await audioRef.current.play();
        }
      } catch (error) {
        console.error('Audio play error:', error);
        setError('ไม่สามารถเล่นไฟล์เสียงได้');
      }
    };

    // Handle seek
    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!audioRef.current) return;
      const newTime = parseFloat(e.target.value);
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    };

    // Audio event handlers
    useEffect(() => {
      const audio = audioRef.current;
      if (!audio) return;

      const handleLoadedMetadata = () => {
        setDuration(audio.duration);
        setIsLoading(false);
        onLoadedMetadata?.(audio.duration);
      };

      const handleTimeUpdate = () => {
        setCurrentTime(audio.currentTime);
        onTimeUpdate?.(audio.currentTime);
      };

      const handlePlay = () => setIsPlaying(true);
      const handlePause = () => setIsPlaying(false);
      const handleEnded = () => setIsPlaying(false);

      const handleError = () => {
        setError('ไม่สามารถโหลดไฟล์เสียงได้');
        setIsLoading(false);
      };

      const handleLoadStart = () => {
        setIsLoading(true);
        setError(null);
      };

      // Add event listeners
      audio.addEventListener('loadedmetadata', handleLoadedMetadata);
      audio.addEventListener('timeupdate', handleTimeUpdate);
      audio.addEventListener('play', handlePlay);
      audio.addEventListener('pause', handlePause);
      audio.addEventListener('ended', handleEnded);
      audio.addEventListener('error', handleError);
      audio.addEventListener('loadstart', handleLoadStart);

      return () => {
        // Remove event listeners
        audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
        audio.removeEventListener('timeupdate', handleTimeUpdate);
        audio.removeEventListener('play', handlePlay);
        audio.removeEventListener('pause', handlePause);
        audio.removeEventListener('ended', handleEnded);
        audio.removeEventListener('error', handleError);
        audio.removeEventListener('loadstart', handleLoadStart);
      };
    }, [onTimeUpdate, onLoadedMetadata]);

    // Seek to specific time (for external control)
    useEffect(() => {
      if (audioRef.current) {
        (audioRef.current as any).seekTo = (time: number) => {
          if (audioRef.current) {
            audioRef.current.currentTime = time;
            setCurrentTime(time);
          }
        };
      }
    }, []);

    if (error) {
      return (
        <div className={`bg-red-500/10 border border-red-500/20 rounded-xl p-4 ${className}`}>
          <p className="text-red-400 text-sm">❌ {error}</p>
        </div>
      );
    }

    return (
      <div className={`bg-background-secondary rounded-xl p-4 border border-background-tertiary ${className}`}>
        {/* Hidden audio element */}
        <audio ref={audioRef} src={audioUrl} preload="metadata" />

        {/* Player Controls */}
        <div className="flex items-center space-x-4">
          {/* Play/Pause Button */}
          <Button
            variant="primary"
            size="sm"
            onClick={togglePlayPause}
            disabled={isLoading}
            className="w-12 h-12 rounded-full flex items-center justify-center"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : isPlaying ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg className="w-5 h-5 ml-1" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </Button>

          {/* Progress Bar Container */}
          <div className="flex-1 flex flex-col space-y-2">
            {/* Progress Bar */}
            <div className="relative w-full h-2 bg-background-tertiary rounded-full overflow-hidden">
              {/* Played Progress */}
              <div
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-500 to-purple-600 transition-all duration-100"
                style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
              />
              
              {/* Seek Input (invisible but functional) */}
              <input
                type="range"
                min="0"
                max={duration || 0}
                value={currentTime}
                onChange={handleSeek}
                disabled={isLoading}
                className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              
              {/* Thumb */}
              <div
                className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg border-2 border-purple-500 transition-all duration-100 pointer-events-none"
                style={{ left: `calc(${duration > 0 ? (currentTime / duration) * 100 : 0}% - 8px)` }}
              />
            </div>
            
            {/* Time Display */}
            <div className="flex justify-between text-xs text-text-tertiary">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

export default AudioPlayer;
