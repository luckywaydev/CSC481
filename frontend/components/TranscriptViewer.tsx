"use client";

import { useState, useCallback, memo } from 'react';
import { Button } from './ui';
import type { TranscriptSegment, Speaker } from '@/lib/api';

/**
 * TranscriptViewer Component
 * แสดงและแก้ไข transcript segments
 */

interface TranscriptViewerProps {
  segments: TranscriptSegment[];
  speakers: Speaker[];
  onSegmentClick?: (startTime: number) => void;
  onEditSegment?: (segmentId: string, newText: string) => Promise<void>;
  onEditSpeaker?: (speakerId: string, newName: string) => Promise<void>;
  currentTime?: number;
  className?: string;
}

// Memoized Segment Component
const SegmentItem = memo(function SegmentItem({
  segment,
  speakers,
  isActive,
  onSegmentClick,
  onEditSegment,
  onEditSpeaker,
}: {
  segment: TranscriptSegment;
  speakers: Speaker[];
  isActive: boolean;
  onSegmentClick?: (startTime: number) => void;
  onEditSegment?: (segmentId: string, newText: string) => Promise<void>;
  onEditSpeaker?: (speakerId: string, newName: string) => Promise<void>;
}) {
  const [isEditingText, setIsEditingText] = useState(false);
  const [isEditingSpeaker, setIsEditingSpeaker] = useState(false);
  const [editingText, setEditingText] = useState(segment.text);
  const [editingSpeakerName, setEditingSpeakerName] = useState(segment.speaker?.name || '');
  const [isSaving, setIsSaving] = useState(false);

  // Format time
  const formatTime = (seconds: number | null | undefined): string => {
    if (seconds === null || seconds === undefined) {
      return '--:--:---';
    }
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 1000);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
  };

  // Handle save text
  const handleSaveText = async () => {
    if (!onEditSegment || editingText.trim() === segment.text) {
      setIsEditingText(false);
      return;
    }

    setIsSaving(true);
    try {
      await onEditSegment(segment.id, editingText.trim());
      setIsEditingText(false);
    } catch (error) {
      console.error('Failed to save segment:', error);
      // Reset to original text on error
      setEditingText(segment.text);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle save speaker
  const handleSaveSpeaker = async () => {
    if (!onEditSpeaker || !segment.speakerId || editingSpeakerName.trim() === segment.speaker?.name) {
      setIsEditingSpeaker(false);
      return;
    }

    setIsSaving(true);
    try {
      await onEditSpeaker(segment.speakerId, editingSpeakerName.trim());
      setIsEditingSpeaker(false);
    } catch (error) {
      console.error('Failed to save speaker:', error);
      // Reset to original name on error
      setEditingSpeakerName(segment.speaker?.name || '');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle cancel editing
  const handleCancelText = () => {
    setEditingText(segment.text);
    setIsEditingText(false);
  };

  const handleCancelSpeaker = () => {
    setEditingSpeakerName(segment.speaker?.name || '');
    setIsEditingSpeaker(false);
  };

  return (
    <div
      className={`p-4 border-l-4 transition-all cursor-pointer hover:bg-background/50 ${
        isActive ? 'border-l-purple-500 bg-purple-500/10' : 'border-l-background-tertiary'
      }`}
      onClick={() => onSegmentClick?.(segment.startTime)}
    >
      {/* Time and Speaker */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-3">
          {/* Time */}
          <span className="text-xs text-text-tertiary font-mono">
            {formatTime(segment.startTime)}
            {segment.endTime && ` - ${formatTime(segment.endTime)}`}
          </span>

          {/* Speaker */}
          {segment.speaker && (
            <div className="flex items-center space-x-2">
              {isEditingSpeaker ? (
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={editingSpeakerName}
                    onChange={(e) => setEditingSpeakerName(e.target.value)}
                    className="px-2 py-1 text-xs bg-background border border-purple-500 rounded text-text-primary focus:outline-none"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveSpeaker();
                      if (e.key === 'Escape') handleCancelSpeaker();
                    }}
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSaveSpeaker();
                    }}
                    disabled={isSaving}
                    className="text-green-400 hover:text-green-300 text-xs"
                  >
                    ✓
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCancelSpeaker();
                    }}
                    className="text-red-400 hover:text-red-300 text-xs"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <span
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-300 cursor-pointer hover:bg-purple-500/30"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsEditingSpeaker(true);
                  }}
                >
                  {segment.speaker.name}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Edit Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsEditingText(true);
          }}
          className="text-text-tertiary hover:text-purple-400 transition-colors"
        >
          ✏️
        </button>
      </div>

      {/* Text */}
      <div>
        {isEditingText ? (
          <div className="space-y-2">
            <textarea
              value={editingText}
              onChange={(e) => setEditingText(e.target.value)}
              className="w-full bg-background border border-purple-500 rounded-lg px-3 py-2 text-text-primary focus:outline-none resize-none"
              rows={3}
              autoFocus
            />
            <div className="flex items-center space-x-2">
              <Button variant="primary" size="sm" onClick={handleSaveText} disabled={isSaving}>
                {isSaving ? 'กำลังบันทึก...' : 'บันทึก'}
              </Button>
              <Button variant="outline" size="sm" onClick={handleCancelText}>
                ยกเลิก
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-text-primary leading-relaxed">
            {segment.text}
            {segment.isEdited && <span className="ml-2 text-xs text-purple-400">(แก้ไขแล้ว)</span>}
          </p>
        )}
      </div>
    </div>
  );
});

export function TranscriptViewer({
  segments,
  speakers,
  onSegmentClick,
  onEditSegment,
  onEditSpeaker,
  currentTime = 0,
  className = '',
}: TranscriptViewerProps) {
  // Find active segment based on current time
  const activeSegmentIndex = segments.findIndex((segment, index) => {
    const nextSegment = segments[index + 1];
    return currentTime >= segment.startTime && (nextSegment ? currentTime < nextSegment.startTime : true);
  });

  if (segments.length === 0) {
    return (
      <div
        className={`bg-background-secondary rounded-xl p-8 border border-background-tertiary text-center ${className}`}
      >
        <p className="text-text-tertiary">ไม่มี transcript</p>
      </div>
    );
  }

  return (
    <div
      className={`bg-background-secondary rounded-xl border border-background-tertiary overflow-hidden ${className}`}
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-background-tertiary">
        <h3 className="text-lg font-semibold text-text-primary">Transcript ({segments.length} segments)</h3>
        <p className="text-sm text-text-tertiary mt-1">
          คลิกที่ segment เพื่อเล่นเสียงจากจุดนั้น • คลิกที่ชื่อผู้พูดหรือข้อความเพื่อแก้ไข
        </p>
      </div>

      {/* Segments */}
      <div className="max-h-96 overflow-y-auto">
        {segments.map((segment, index) => (
          <SegmentItem
            key={segment.id}
            segment={segment}
            speakers={speakers}
            isActive={index === activeSegmentIndex}
            onSegmentClick={onSegmentClick}
            onEditSegment={onEditSegment}
            onEditSpeaker={onEditSpeaker}
          />
        ))}
      </div>
    </div>
  );
}

export default TranscriptViewer;
