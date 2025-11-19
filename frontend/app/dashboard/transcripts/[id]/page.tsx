"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { api, tokenManager, type Transcript, type TranscriptSegment } from "@/lib/api";
import { Button, showToast } from "@/components/ui";

/**
 * Transcript Viewer Page
 * 
 * หน้าแสดงผลลัพธ์การถอดเสียง
 * - แสดง segments พร้อม timestamp
 * - แก้ไข text ได้ (inline edit)
 * - แก้ไขชื่อ speaker ได้
 * - Export TXT/SRT
 */
export default function TranscriptViewerPage() {
  const router = useRouter();
  const params = useParams();
  const transcriptId = params.id as string;

  const [transcript, setTranscript] = useState<Transcript | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingSegmentId, setEditingSegmentId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");
  const [editingSpeakerId, setEditingSpeakerId] = useState<string | null>(null);
  const [editingSpeakerName, setEditingSpeakerName] = useState("");

  useEffect(() => {
    fetchTranscript();
  }, [transcriptId]);

  const fetchTranscript = async () => {
    const token = tokenManager.getAccessToken();
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const response = await api.getTranscript(token, transcriptId);
      if (response.data?.transcript) {
        setTranscript(response.data.transcript);
      } else if (response.error) {
        console.error("Transcript not found");
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Failed to fetch transcript:", error);
      router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number | null | undefined): string => {
    if (seconds === null || seconds === undefined) {
      return "--:--:---";
    }
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 1000);
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}.${ms.toString().padStart(3, "0")}`;
  };

  const handleEditSegment = (segment: TranscriptSegment) => {
    setEditingSegmentId(segment.id);
    setEditingText(segment.text);
  };

  const handleSaveSegment = async (segmentId: string) => {
    const token = tokenManager.getAccessToken();
    if (!token) return;

    try {
      const response = await api.updateSegment(token, segmentId, editingText);
      if (response.error) {
        showToast(`แก้ไขล้มเหลว: ${response.error.message}`, "error");
        return;
      }

      // Update local state
      if (transcript) {
        const updatedSegments = transcript.segments.map((seg) =>
          seg.id === segmentId ? { ...seg, text: editingText, isEdited: true } : seg
        );
        setTranscript({ ...transcript, segments: updatedSegments });
      }

      setEditingSegmentId(null);
      setEditingText("");
      showToast("แก้ไขสำเร็จ", "success");
    } catch (error) {
      console.error("Failed to update segment:", error);
      showToast("แก้ไขล้มเหลว", "error");
    }
  };

  const handleEditSpeaker = (speakerId: string, currentName: string) => {
    setEditingSpeakerId(speakerId);
    setEditingSpeakerName(currentName);
  };

  const handleSaveSpeaker = async (speakerId: string) => {
    const token = tokenManager.getAccessToken();
    if (!token) return;

    try {
      const response = await api.updateSpeaker(token, speakerId, editingSpeakerName);
      if (response.error) {
        showToast(`แก้ไขชื่อผู้พูดล้มเหลว: ${response.error.message}`, "error");
        return;
      }

      // Update local state
      if (transcript) {
        const updatedSpeakers = transcript.speakers.map((spk) =>
          spk.id === speakerId ? { ...spk, name: editingSpeakerName } : spk
        );
        const updatedSegments = transcript.segments.map((seg) =>
          seg.speaker?.id === speakerId
            ? { ...seg, speaker: { ...seg.speaker, name: editingSpeakerName } }
            : seg
        );
        setTranscript({ ...transcript, speakers: updatedSpeakers, segments: updatedSegments });
      }

      setEditingSpeakerId(null);
      setEditingSpeakerName("");
      showToast("แก้ไขชื่อผู้พูดสำเร็จ", "success");
    } catch (error) {
      console.error("Failed to update speaker:", error);
      showToast("แก้ไขชื่อผู้พูดล้มเหลว", "error");
    }
  };

  const exportTXT = () => {
    if (!transcript) return;

    let content = `Transcript: ${transcript.audioFile?.originalFilename || "Audio File"}\n`;
    content += `Language: ${transcript.language}\n`;
    content += `Word Count: ${transcript.wordCount}\n`;
    content += `\n${"=".repeat(80)}\n\n`;

    transcript.segments.forEach((seg) => {
      const time = `[${formatTime(seg.startTime)} - ${formatTime(seg.endTime)}]`;
      const speaker = seg.speaker ? `${seg.speaker.name}: ` : "";
      content += `${time} ${speaker}${seg.text}\n\n`;
    });

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `transcript-${transcriptId}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportSRT = () => {
    if (!transcript) return;

    let content = "";
    transcript.segments.forEach((seg, index) => {
      const startTime = formatTime(seg.startTime).replace(".", ",");
      const endTime = formatTime(seg.endTime).replace(".", ",");
      const speaker = seg.speaker ? `${seg.speaker.name}: ` : "";
      
      content += `${index + 1}\n`;
      content += `${startTime} --> ${endTime}\n`;
      content += `${speaker}${seg.text}\n\n`;
    });

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `transcript-${transcriptId}.srt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-text-secondary">กำลังโหลด...</div>
      </div>
    );
  }

  if (!transcript) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-background-secondary/95 backdrop-blur-xl border-b border-background-tertiary sticky top-0 z-10 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-4 min-w-0 flex-1">
              <Link href={`/dashboard/projects/${transcript.audioFile?.projectId}`}>
                <Button variant="ghost" size="sm">
                  ← กลับ
                </Button>
              </Link>
              <div className="min-w-0 flex-1">
                <h1 className="text-xl sm:text-2xl font-bold text-text-primary truncate">
                  {transcript.audioFile?.originalFilename || "Transcript"}
                </h1>
                <p className="text-xs sm:text-sm text-text-secondary mt-1">
                  {transcript.language} • {transcript.wordCount} คำ • {transcript.segments.length} segments
                </p>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap sm:flex-nowrap">
              <Button variant="outline" size="sm" onClick={exportTXT} className="flex-1 sm:flex-none">
                📄 TXT
              </Button>
              <Button variant="primary" size="sm" onClick={exportSRT} className="flex-1 sm:flex-none">
                🎬 SRT
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Speakers */}
        {transcript.speakers && transcript.speakers.length > 0 && (
          <div className="bg-background-secondary rounded-xl p-6 border border-background-tertiary mb-6">
            <h2 className="text-lg font-bold text-text-primary mb-4">ผู้พูด</h2>
            <div className="flex flex-wrap gap-3">
              {transcript.speakers.map((speaker) => (
                <div
                  key={speaker.id}
                  className="flex items-center gap-2 bg-background px-4 py-2 rounded-lg border border-background-tertiary"
                >
                  {editingSpeakerId === speaker.id ? (
                    <>
                      <input
                        type="text"
                        value={editingSpeakerName}
                        onChange={(e) => setEditingSpeakerName(e.target.value)}
                        className="bg-background-secondary border border-purple-500 rounded px-2 py-1 text-text-primary text-sm w-32 focus:outline-none"
                        autoFocus
                      />
                      <button
                        onClick={() => handleSaveSpeaker(speaker.id)}
                        className="text-green-400 hover:text-green-300 text-sm"
                      >
                        ✓
                      </button>
                      <button
                        onClick={() => {
                          setEditingSpeakerId(null);
                          setEditingSpeakerName("");
                        }}
                        className="text-red-400 hover:text-red-300 text-sm"
                      >
                        ✕
                      </button>
                    </>
                  ) : (
                    <>
                      <span className="text-text-primary font-medium">{speaker.name}</span>
                      <span className="text-text-tertiary text-sm">({speaker.segmentCount})</span>
                      <button
                        onClick={() => handleEditSpeaker(speaker.id, speaker.name)}
                        className="text-purple-400 hover:text-purple-300 text-sm ml-2"
                      >
                        ✏️
                      </button>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Transcript Segments - Mobile Optimized */}
        <div className="bg-background-secondary rounded-xl border border-background-tertiary overflow-hidden">
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-background border-b border-background-tertiary">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-text-secondary w-32">
                    เวลา
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-text-secondary w-32">
                    ผู้พูด
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-text-secondary">
                    ข้อความ
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-text-secondary w-24">
                    แก้ไข
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-background-tertiary">
                {transcript.segments.map((segment) => (
                  <tr key={segment.id} className="hover:bg-background/50 transition-colors">
                    <td className="px-4 py-3 text-sm text-text-tertiary whitespace-nowrap">
                      {formatTime(segment.startTime)}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {segment.speaker && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-300">
                          {segment.speaker.name}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {editingSegmentId === segment.id ? (
                        <textarea
                          value={editingText}
                          onChange={(e) => setEditingText(e.target.value)}
                          className="w-full bg-background border border-purple-500 rounded-lg px-3 py-2 text-text-primary focus:outline-none resize-none"
                          rows={3}
                          autoFocus
                        />
                      ) : (
                        <p className="text-text-primary leading-relaxed">
                          {segment.text}
                          {segment.isEdited && (
                            <span className="ml-2 text-xs text-purple-400">(แก้ไขแล้ว)</span>
                          )}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {editingSegmentId === segment.id ? (
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleSaveSegment(segment.id)}
                            className="text-green-400 hover:text-green-300 transition-colors text-sm"
                          >
                            ✓
                          </button>
                          <button
                            onClick={() => {
                              setEditingSegmentId(null);
                              setEditingText("");
                            }}
                            className="text-red-400 hover:text-red-300 transition-colors text-sm"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleEditSegment(segment)}
                          className="text-purple-400 hover:text-purple-300 transition-colors"
                        >
                          ✏️
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden divide-y divide-background-tertiary">
            {transcript.segments.map((segment) => (
              <div key={segment.id} className="p-4 hover:bg-background/50 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-text-tertiary whitespace-nowrap">
                      {formatTime(segment.startTime)}
                    </span>
                    {segment.speaker && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-300">
                        {segment.speaker.name}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => editingSegmentId === segment.id ? handleSaveSegment(segment.id) : handleEditSegment(segment)}
                    className="text-purple-400 hover:text-purple-300 transition-colors flex-shrink-0"
                  >
                    {editingSegmentId === segment.id ? "✓" : "✏️"}
                  </button>
                </div>
                {editingSegmentId === segment.id ? (
                  <textarea
                    value={editingText}
                    onChange={(e) => setEditingText(e.target.value)}
                    className="w-full bg-background border border-purple-500 rounded-lg px-3 py-2 text-text-primary focus:outline-none resize-none text-sm"
                    rows={3}
                    autoFocus
                  />
                ) : (
                  <p className="text-text-primary leading-relaxed text-sm">
                    {segment.text}
                    {segment.isEdited && (
                      <span className="ml-2 text-xs text-purple-400">(แก้ไขแล้ว)</span>
                    )}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="mt-6 text-center text-sm text-text-tertiary">
          💡 คลิก "แก้ไข" เพื่อแก้ไขข้อความ • คลิกที่ชื่อผู้พูดเพื่อเปลี่ยนชื่อ
        </div>
      </main>
    </div>
  );
}
