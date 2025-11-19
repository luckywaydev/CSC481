"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  api,
  tokenManager,
  transcribeAudio,
  type Project,
  type AudioFile,
  getAudioStreamUrl,
} from "@/lib/api";
import { Button, showToast, AudioPlayer, TranscriptViewer } from "@/components/ui";

/**
 * Project Detail Page (Redesigned)
 *
 * แสดงไฟล์เสียงทั้งหมดพร้อม Audio Player + Transcript ในหน้าเดียว
 * - ไม่มี stats cards
 * - ไม่มีปุ่มลบไฟล์
 * - Upload แยก 2 steps: Upload → Transcribe
 */
export default function ProjectDetailPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedAudioId, setUploadedAudioId] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Transcription options
  const [task, setTask] = useState<"transcribe" | "translate">("transcribe");
  const [language, setLanguage] = useState<string>("None");
  const [targetLanguage, setTargetLanguage] = useState<string>("th"); // For translation (default: Thai)
  const [numSpeakers, setNumSpeakers] = useState<number | undefined>(undefined);
  const [minSpeakers, setMinSpeakers] = useState<number | undefined>(undefined);
  const [maxSpeakers, setMaxSpeakers] = useState<number | undefined>(undefined);
  const [speakerMode, setSpeakerMode] = useState<"auto" | "exact" | "range">("auto");

  // Track current time for each audio file
  const [audioTimes, setAudioTimes] = useState<Record<string, number>>({});
  
  // Refs for audio players
  const audioRefs = useRef<Record<string, HTMLAudioElement | null>>({});

  useEffect(() => {
    fetchProject();
  }, [projectId]);

  // Auto-refresh every 3 seconds if there are processing files or recent completions (but not when modal is open)
  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    const hasProcessing = project?.audioFiles?.some((file) => file.status === "PROCESSING");
    
    // Check if there's a recently completed file (within last 30 seconds) that might be translating
    const hasRecentCompletion = project?.audioFiles?.some((file) => {
      if (file.status === "COMPLETED" && file.processedAt) {
        const processedTime = new Date(file.processedAt).getTime();
        const now = Date.now();
        const timeDiff = now - processedTime;
        // If completed within last 30 seconds, keep polling (might be translating)
        return timeDiff < 30000;
      }
      return false;
    });

    // Only auto-refresh if there are processing files OR recent completions AND modal is not open
    if ((hasProcessing || hasRecentCompletion) && !showUploadModal) {
      intervalRef.current = setInterval(() => {
        fetchProject(true); // silent refresh
      }, 3000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [project, showUploadModal]);

  const fetchProject = async (silent = false) => {
    const token = tokenManager.getAccessToken();
    if (!token) {
      if (!silent) {
        router.push("/login");
      }
      return;
    }

    try {
      const response = await api.getProjectById(token, projectId);
      if (response.data?.project) {
        // Update state without causing re-render issues
        setProject((prevProject) => {
          // If this is a silent refresh and user is interacting, preserve some state
          if (silent && prevProject && response.data?.project) {
            // Quick check: compare status of audio files
            const prevStatuses = prevProject.audioFiles?.map(f => `${f.id}:${f.status}`).join(',') || '';
            const newStatuses = response.data.project.audioFiles?.map(f => `${f.id}:${f.status}`).join(',') || '';
            
            // Only update if status changed
            if (prevStatuses === newStatuses) {
              return prevProject; // No status changes, don't update
            }
          }
          return response.data?.project || prevProject;
        });
      } else if (response.error) {
        console.error("Project not found");
        if (!silent) {
          router.push("/dashboard");
        }
      }
    } catch (error) {
      console.error("Failed to fetch project:", error);
      if (!silent) {
        router.push("/dashboard");
      }
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    const token = tokenManager.getAccessToken();
    if (!token) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      // อัปโหลดไฟล์ไปเซิร์ฟเวอร์ (จะเก็บไว้สำหรับ Audio Player และส่งต่อไปยัง Replicate)
      const formData = new FormData();
      formData.append("audio", selectedFile);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/projects/${projectId}/audio/upload`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok || data.error) {
        showToast(`อัปโหลดล้มเหลว: ${data.error?.message || "Unknown error"}`, "error");
        return;
      }

      showToast("อัปโหลดสำเร็จ! คุณสามารถกดถอดเสียงได้เลย", "success");
      setUploadedAudioId(data.data.audioFile.id);
      setUploadProgress(100);

      // Update project state without full page reload
      if (project) {
        setProject({
          ...project,
          audioFiles: [data.data.audioFile, ...(project.audioFiles || [])],
        });
      }
    } catch (error) {
      console.error("Upload failed:", error);
      showToast("อัปโหลดล้มเหลด กรุณาลองใหม่อีกครั้ง", "error");
    } finally {
      setUploading(false);
    }
  };

  const handleTranscribe = async () => {
    if (!uploadedAudioId) return;

    const token = tokenManager.getAccessToken();
    if (!token) return;

    try {
      // Prepare transcription options
      const transcriptionOptions = {
        task,
        language,
        targetLanguage: task === "translate" ? targetLanguage : undefined,
        numSpeakers: speakerMode === "exact" ? numSpeakers : undefined,
        minSpeakers: speakerMode === "range" ? minSpeakers : undefined,
        maxSpeakers: speakerMode === "range" ? maxSpeakers : undefined,
      };

      const response = await transcribeAudio(token, uploadedAudioId, transcriptionOptions);

      if (response.error) {
        showToast(`เริ่มถอดเสียงล้มเหลว: ${response.error.message}`, "error");
        return;
      }

      showToast("เริ่มถอดเสียงแล้ว! กรุณารอสักครู่...", "success");

      // Update audio file status to PROCESSING without full page reload
      if (project) {
        setProject({
          ...project,
          audioFiles: project.audioFiles?.map((file) =>
            file.id === uploadedAudioId
              ? { ...file, status: "PROCESSING" }
              : file
          ),
        });
      }

      // Close modal and reset
      setShowUploadModal(false);
      setSelectedFile(null);
      setUploadedAudioId(null);
      setTask("transcribe");
      setLanguage("None");
      setTargetLanguage("th");
      setSpeakerMode("auto");
      setNumSpeakers(undefined);
      setMinSpeakers(undefined);
      setMaxSpeakers(undefined);
    } catch (error) {
      console.error("Transcribe failed:", error);
      showToast("เริ่มถอดเสียงล้มเหลว กรุณาลองใหม่อีกครั้ง", "error");
    }
  };

  const handleSegmentClick = (audioId: string, startTime: number) => {
    // Seek to specific time in audio player
    const audioElement = audioRefs.current[audioId];
    if (audioElement) {
      (audioElement as any).seekTo?.(startTime);
    }
  };

  const handleEditSegment = async (segmentId: string, newText: string) => {
    const token = tokenManager.getAccessToken();
    if (!token) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/transcript-segments/${segmentId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ text: newText }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update segment");
      }

      // Update segment in state without full page reload
      if (project) {
        setProject({
          ...project,
          audioFiles: project.audioFiles?.map((file) => ({
            ...file,
            transcripts: file.transcripts?.map((transcript) => ({
              ...transcript,
              segments: transcript.segments?.map((segment) =>
                segment.id === segmentId
                  ? { ...segment, text: newText, isEdited: true }
                  : segment
              ),
            })),
          })),
        });
      }

      showToast("แก้ไข segment สำเร็จ", "success");
    } catch (error) {
      showToast("แก้ไข segment ล้มเหลว", "error");
      throw error;
    }
  };

  const handleEditSpeaker = async (speakerId: string, newName: string) => {
    const token = tokenManager.getAccessToken();
    if (!token) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/speakers/${speakerId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ name: newName }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update speaker");
      }

      // Update speaker in state without full page reload
      if (project) {
        setProject({
          ...project,
          audioFiles: project.audioFiles?.map((file) => ({
            ...file,
            transcripts: file.transcripts?.map((transcript) => ({
              ...transcript,
              speakers: transcript.speakers?.map((speaker) =>
                speaker.id === speakerId
                  ? { ...speaker, name: newName }
                  : speaker
              ),
              segments: transcript.segments?.map((segment) =>
                segment.speaker?.id === speakerId
                  ? { ...segment, speaker: { ...segment.speaker, name: newName } }
                  : segment
              ),
            })),
          })),
        });
      }

      showToast("แก้ไขชื่อผู้พูดสำเร็จ", "success");
    } catch (error) {
      showToast("แก้ไขชื่อผู้พูดล้มเหลว", "error");
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-text-secondary">กำลังโหลด...</div>
      </div>
    );
  }

  if (!project) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-background-secondary/80 backdrop-blur-xl border-b border-background-tertiary sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-4 min-w-0 flex-1">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  ← กลับ
                </Button>
              </Link>
              <div className="min-w-0 flex-1">
                <h1 className="text-xl sm:text-2xl font-bold text-text-primary truncate">
                  {project.name}
                </h1>
                {project.description && (
                  <p className="text-xs sm:text-sm text-text-secondary mt-1 line-clamp-1">
                    {project.description}
                  </p>
                )}
              </div>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowUploadModal(true)}
              className="w-full sm:w-auto"
            >
              + อัปโหลดไฟล์เสียง
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!project.audioFiles || project.audioFiles.length === 0 ? (
          // Empty State
          <div className="bg-background-secondary rounded-2xl p-12 border border-background-tertiary text-center">
            <div className="text-6xl mb-4">🎵</div>
            <h3 className="text-xl font-semibold text-text-primary mb-2">ยังไม่มีไฟล์เสียง</h3>
            <p className="text-text-secondary mb-6">อัปโหลดไฟล์เสียงเพื่อเริ่มต้นถอดเสียง</p>
            <Button variant="primary" size="lg" onClick={() => setShowUploadModal(true)}>
              + อัปโหลดไฟล์เสียง
            </Button>
          </div>
        ) : (
          // Audio Files List with Player + Transcript
          <div className="space-y-8">
            {project.audioFiles.map((audioFile) => {
              const transcript = audioFile.transcripts?.[0];
              const segments = transcript?.segments || [];
              const speakers = transcript?.speakers || [];
              const currentTime = audioTimes[audioFile.id] || 0;

              return (
                <div
                  key={audioFile.id}
                  className="bg-background-secondary rounded-2xl p-6 border border-background-tertiary"
                >
                  {/* File Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start space-x-4 flex-1 min-w-0">
                      <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                        <span className="text-2xl">🎵</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-text-primary text-lg break-words">
                          {audioFile.originalFilename}
                        </h3>
                        <p className="text-sm text-text-tertiary mt-1">
                          {(audioFile.fileSizeBytes / 1024 / 1024).toFixed(2)} MB •{" "}
                          {new Date(audioFile.uploadedAt).toLocaleDateString("th-TH")}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                        audioFile.status === "COMPLETED"
                          ? "bg-green-500/20 text-green-400"
                          : audioFile.status === "PROCESSING"
                          ? "bg-yellow-500/20 text-yellow-400 animate-pulse"
                          : audioFile.status === "FAILED"
                          ? "bg-red-500/20 text-red-400"
                          : "bg-gray-500/20 text-gray-400"
                      }`}
                    >
                      {audioFile.status === "PROCESSING"
                        ? "กำลังประมวลผล..."
                        : audioFile.status === "COMPLETED"
                        ? "เสร็จสิ้น"
                        : audioFile.status}
                    </span>
                  </div>

                  {/* Audio Player */}
                  {audioFile.status === "COMPLETED" && (
                    <div className="mb-6">
                      <AudioPlayer
                        key={audioFile.id}
                        ref={(el) => {
                          audioRefs.current[audioFile.id] = el;
                        }}
                        audioUrl={getAudioStreamUrl(tokenManager.getAccessToken()!, audioFile.id)}
                        onTimeUpdate={(time) => {
                          setAudioTimes((prev) => ({ ...prev, [audioFile.id]: time }));
                        }}
                        className="w-full"
                      />
                    </div>
                  )}

                  {/* Transcript Viewer */}
                  {audioFile.status === "COMPLETED" && transcript && segments.length > 0 ? (
                    <>
                      <TranscriptViewer
                        segments={segments}
                        speakers={speakers}
                        currentTime={currentTime}
                        onSegmentClick={(time) => handleSegmentClick(audioFile.id, time)}
                        onEditSegment={handleEditSegment}
                        onEditSpeaker={handleEditSpeaker}
                        className="w-full"
                      />

                      {/* Download Buttons */}
                      <div className="flex gap-3 mt-4">
                        <Link
                          href={`${process.env.NEXT_PUBLIC_API_URL}/transcripts/${transcript.id}/download/txt?token=${tokenManager.getAccessToken()}`}
                          target="_blank"
                        >
                          <Button variant="outline" size="sm">
                            📄 ดาวน์โหลด TXT
                          </Button>
                        </Link>
                        <Link
                          href={`${process.env.NEXT_PUBLIC_API_URL}/transcripts/${transcript.id}/download/srt?token=${tokenManager.getAccessToken()}`}
                          target="_blank"
                        >
                          <Button variant="outline" size="sm">
                            🎬 ดาวน์โหลด SRT
                          </Button>
                        </Link>
                      </div>

                      {/* Translation Status (if translating) */}
                      {audioFile.transcripts && audioFile.transcripts.length === 1 && audioFile.processedAt && (
                        (() => {
                          const processedTime = new Date(audioFile.processedAt).getTime();
                          const now = Date.now();
                          const timeDiff = now - processedTime;
                          // Show "translating" status if completed within last 30 seconds
                          if (timeDiff < 30000) {
                            return (
                              <div className="mt-6 pt-6 border-t border-background-tertiary">
                                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-6 text-center">
                                  <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                                  <p className="text-blue-400 font-medium">🌐 กำลังแปลภาษา...</p>
                                  <p className="text-text-tertiary text-sm mt-2">กรุณารอสักครู่</p>
                                </div>
                              </div>
                            );
                          }
                          return null;
                        })()
                      )}

                      {/* Translated Transcript (if exists) */}
                      {audioFile.transcripts && audioFile.transcripts.length > 1 && (
                        <div className="mt-6 pt-6 border-t border-background-tertiary">
                          <h4 className="text-lg font-semibold text-text-primary mb-4">
                            🌐 ผลลัพธ์การแปลภาษา
                          </h4>
                          {audioFile.transcripts.slice(1).map((translatedTranscript) => {
                            const translatedSegments = translatedTranscript.segments || [];
                            const translatedSpeakers = translatedTranscript.speakers || [];
                            
                            return (
                              <div key={translatedTranscript.id} className="mb-4">
                                <div className="flex items-center gap-2 mb-3">
                                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400">
                                    {translatedTranscript.language?.toUpperCase()}
                                  </span>
                                </div>
                                <TranscriptViewer
                                  segments={translatedSegments}
                                  speakers={translatedSpeakers}
                                  currentTime={currentTime}
                                  onSegmentClick={(time) => handleSegmentClick(audioFile.id, time)}
                                  onEditSegment={handleEditSegment}
                                  onEditSpeaker={handleEditSpeaker}
                                  className="w-full"
                                />
                                <div className="flex gap-3 mt-4">
                                  <Link
                                    href={`${process.env.NEXT_PUBLIC_API_URL}/transcripts/${translatedTranscript.id}/download/txt?token=${tokenManager.getAccessToken()}`}
                                    target="_blank"
                                  >
                                    <Button variant="outline" size="sm">
                                      📄 ดาวน์โหลด TXT (แปลแล้ว)
                                    </Button>
                                  </Link>
                                  <Link
                                    href={`${process.env.NEXT_PUBLIC_API_URL}/transcripts/${translatedTranscript.id}/download/srt?token=${tokenManager.getAccessToken()}`}
                                    target="_blank"
                                  >
                                    <Button variant="outline" size="sm">
                                      🎬 ดาวน์โหลด SRT (แปลแล้ว)
                                    </Button>
                                  </Link>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </>
                  ) : audioFile.status === "PROCESSING" ? (
                    <div className="text-center py-8">
                      <div className="inline-block w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                      <p className="text-text-secondary">กำลังถอดเสียง กรุณารอสักครู่...</p>
                    </div>
                  ) : audioFile.status === "FAILED" ? (
                    <div className="text-center py-8">
                      <p className="text-red-400">❌ การถอดเสียงล้มเหลว</p>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-text-tertiary">ยังไม่มี transcript</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Upload Modal */}
        {showUploadModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-background-secondary/95 backdrop-blur-xl rounded-2xl p-8 max-w-lg w-full border border-background-tertiary shadow-2xl my-8">
              <h3 className="text-2xl font-bold text-text-primary mb-6">อัปโหลดไฟล์เสียง</h3>

              <div className="space-y-4">
                {/* Step 1: File Upload */}
                {!uploadedAudioId && (
                  <>
                    <div className="border-2 border-dashed border-background-tertiary rounded-xl p-8 text-center hover:border-purple-500/50 transition-all">
                      <input
                        type="file"
                        accept=".mp3,.wav,.m4a,.flac"
                        onChange={handleFileSelect}
                        className="hidden"
                        id="audio-file-input"
                      />
                      <label htmlFor="audio-file-input" className="cursor-pointer block">
                        {selectedFile ? (
                          <div>
                            <div className="text-4xl mb-2">🎵</div>
                            <p className="text-text-primary font-medium">{selectedFile.name}</p>
                            <p className="text-sm text-text-tertiary mt-1">
                              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        ) : (
                          <div>
                            <div className="text-4xl mb-2">📁</div>
                            <p className="text-text-primary font-medium mb-1">คลิกเพื่อเลือกไฟล์</p>
                            <p className="text-sm text-text-tertiary">
                              รองรับ MP3, WAV, M4A, FLAC (สูงสุด 100MB)
                            </p>
                          </div>
                        )}
                      </label>
                    </div>

                    {uploading && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-text-secondary">กำลังอัปโหลด...</span>
                          <span className="text-purple-400">{uploadProgress}%</span>
                        </div>
                        <div className="w-full bg-background-tertiary rounded-full h-2">
                          <div
                            className="bg-purple-500 h-2 rounded-full transition-all"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                      </div>
                    )}

                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        size="md"
                        fullWidth
                        onClick={() => {
                          setShowUploadModal(false);
                          setSelectedFile(null);
                        }}
                        disabled={uploading}
                      >
                        ยกเลิก
                      </Button>
                      <Button
                        variant="primary"
                        size="md"
                        fullWidth
                        onClick={handleUpload}
                        disabled={!selectedFile || uploading}
                        loading={uploading}
                      >
                        {uploading ? "กำลังอัปโหลด..." : "อัปโหลด"}
                      </Button>
                    </div>
                  </>
                )}

                {/* Step 2: Transcription Options */}
                {uploadedAudioId && (
                  <>
                    <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 mb-4">
                      <p className="text-green-400 text-sm">
                        ✅ อัปโหลดสำเร็จ! ตอนนี้คุณสามารถตั้งค่าและเริ่มถอดเสียงได้
                      </p>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-sm font-semibold text-text-primary">ตัวเลือกการถอดเสียง</h4>

                      {/* Task Selection */}
                      <div>
                        <label className="block text-sm text-text-secondary mb-2">งาน</label>
                        <select
                          value={task}
                          onChange={(e) => setTask(e.target.value as "transcribe" | "translate")}
                          className="w-full bg-background border border-background-tertiary rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:border-purple-500 [&>option]:bg-background [&>option]:text-text-primary"
                        >
                          <option value="transcribe">ถอดเสียง (Transcribe)</option>
                          <option value="translate">แปลภาษา (Translate)</option>
                        </select>
                      </div>

                      {/* Target Language Selection (only for translate) */}
                      {task === "translate" && (
                        <div>
                          <label className="block text-sm text-text-secondary mb-2">
                            แปลเป็นภาษา
                          </label>
                          <select
                            value={targetLanguage}
                            onChange={(e) => setTargetLanguage(e.target.value)}
                            className="w-full bg-background border border-background-tertiary rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:border-purple-500 [&>option]:bg-background [&>option]:text-text-primary"
                          >
                            <option value="th">Thai (ไทย)</option>
                            <option value="en">English (อังกฤษ)</option>
                            <option value="zh">Chinese (จีน)</option>
                            <option value="ja">Japanese (ญี่ปุ่น)</option>
                            <option value="ko">Korean (เกาหลี)</option>
                            <option value="es">Spanish (สเปน)</option>
                            <option value="fr">French (ฝรั่งเศส)</option>
                            <option value="de">German (เยอรมัน)</option>
                            <option value="it">Italian (อิตาลี)</option>
                            <option value="pt">Portuguese (โปรตุเกส)</option>
                            <option value="ru">Russian (รัสเซีย)</option>
                            <option value="ar">Arabic (อาหรับ)</option>
                            <option value="hi">Hindi (ฮินดี)</option>
                            <option value="bn">Bengali (เบงกาลี)</option>
                            <option value="vi">Vietnamese (เวียดนาม)</option>
                            <option value="id">Indonesian (อินโดนีเซีย)</option>
                            <option value="ms">Malay (มาเลย์)</option>
                            <option value="tl">Tagalog (ตากาล็อก)</option>
                            <option value="nl">Dutch (ดัตช์)</option>
                            <option value="pl">Polish (โปแลนด์)</option>
                            <option value="tr">Turkish (ตุรกี)</option>
                            <option value="uk">Ukrainian (ยูเครน)</option>
                            <option value="sv">Swedish (สวีเดน)</option>
                            <option value="da">Danish (เดนมาร์ก)</option>
                            <option value="no">Norwegian (นอร์เวย์)</option>
                            <option value="fi">Finnish (ฟินแลนด์)</option>
                          </select>
                        </div>
                      )}

                      {/* Language Selection */}
                      <div>
                        <label className="block text-sm text-text-secondary mb-2">
                          ภาษาของไฟล์เสียง
                        </label>
                        <select
                          value={language}
                          onChange={(e) => setLanguage(e.target.value)}
                          className="w-full bg-background border border-background-tertiary rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:border-purple-500 [&>option]:bg-background [&>option]:text-text-primary"
                        >
                          <option value="None">ตรวจจับอัตโนมัติ</option>
                          <option value="afrikaans">Afrikaans</option>
                          <option value="albanian">Albanian</option>
                          <option value="amharic">Amharic</option>
                          <option value="arabic">Arabic</option>
                          <option value="armenian">Armenian</option>
                          <option value="assamese">Assamese</option>
                          <option value="azerbaijani">Azerbaijani</option>
                          <option value="bashkir">Bashkir</option>
                          <option value="basque">Basque</option>
                          <option value="belarusian">Belarusian</option>
                          <option value="bengali">Bengali</option>
                          <option value="bosnian">Bosnian</option>
                          <option value="breton">Breton</option>
                          <option value="bulgarian">Bulgarian</option>
                          <option value="cantonese">Cantonese</option>
                          <option value="catalan">Catalan</option>
                          <option value="chinese">Chinese</option>
                          <option value="croatian">Croatian</option>
                          <option value="czech">Czech</option>
                          <option value="danish">Danish</option>
                          <option value="dutch">Dutch</option>
                          <option value="english">English</option>
                          <option value="estonian">Estonian</option>
                          <option value="faroese">Faroese</option>
                          <option value="finnish">Finnish</option>
                          <option value="french">French</option>
                          <option value="galician">Galician</option>
                          <option value="georgian">Georgian</option>
                          <option value="german">German</option>
                          <option value="greek">Greek</option>
                          <option value="gujarati">Gujarati</option>
                          <option value="haitian creole">Haitian Creole</option>
                          <option value="hausa">Hausa</option>
                          <option value="hawaiian">Hawaiian</option>
                          <option value="hebrew">Hebrew</option>
                          <option value="hindi">Hindi</option>
                          <option value="hungarian">Hungarian</option>
                          <option value="icelandic">Icelandic</option>
                          <option value="indonesian">Indonesian</option>
                          <option value="italian">Italian</option>
                          <option value="japanese">Japanese</option>
                          <option value="javanese">Javanese</option>
                          <option value="kannada">Kannada</option>
                          <option value="kazakh">Kazakh</option>
                          <option value="khmer">Khmer</option>
                          <option value="korean">Korean</option>
                          <option value="lao">Lao</option>
                          <option value="latin">Latin</option>
                          <option value="latvian">Latvian</option>
                          <option value="lingala">Lingala</option>
                          <option value="lithuanian">Lithuanian</option>
                          <option value="luxembourgish">Luxembourgish</option>
                          <option value="macedonian">Macedonian</option>
                          <option value="malagasy">Malagasy</option>
                          <option value="malay">Malay</option>
                          <option value="malayalam">Malayalam</option>
                          <option value="maltese">Maltese</option>
                          <option value="maori">Maori</option>
                          <option value="marathi">Marathi</option>
                          <option value="mongolian">Mongolian</option>
                          <option value="myanmar">Myanmar</option>
                          <option value="nepali">Nepali</option>
                          <option value="norwegian">Norwegian</option>
                          <option value="nynorsk">Nynorsk</option>
                          <option value="occitan">Occitan</option>
                          <option value="pashto">Pashto</option>
                          <option value="persian">Persian</option>
                          <option value="polish">Polish</option>
                          <option value="portuguese">Portuguese</option>
                          <option value="punjabi">Punjabi</option>
                          <option value="romanian">Romanian</option>
                          <option value="russian">Russian</option>
                          <option value="sanskrit">Sanskrit</option>
                          <option value="serbian">Serbian</option>
                          <option value="shona">Shona</option>
                          <option value="sindhi">Sindhi</option>
                          <option value="sinhala">Sinhala</option>
                          <option value="slovak">Slovak</option>
                          <option value="slovenian">Slovenian</option>
                          <option value="somali">Somali</option>
                          <option value="spanish">Spanish</option>
                          <option value="sundanese">Sundanese</option>
                          <option value="swahili">Swahili</option>
                          <option value="swedish">Swedish</option>
                          <option value="tagalog">Tagalog</option>
                          <option value="tajik">Tajik</option>
                          <option value="tamil">Tamil</option>
                          <option value="tatar">Tatar</option>
                          <option value="telugu">Telugu</option>
                          <option value="thai">Thai</option>
                          <option value="tibetan">Tibetan</option>
                          <option value="turkish">Turkish</option>
                          <option value="turkmen">Turkmen</option>
                          <option value="ukrainian">Ukrainian</option>
                          <option value="urdu">Urdu</option>
                          <option value="uzbek">Uzbek</option>
                          <option value="vietnamese">Vietnamese</option>
                          <option value="welsh">Welsh</option>
                          <option value="yiddish">Yiddish</option>
                          <option value="yoruba">Yoruba</option>
                        </select>
                      </div>

                      {/* Speaker Configuration */}
                      <div>
                        <label className="block text-sm text-text-secondary mb-2">จำนวนผู้พูด</label>
                        <select
                          value={speakerMode}
                          onChange={(e) => {
                            setSpeakerMode(e.target.value as "auto" | "exact" | "range");
                            setNumSpeakers(undefined);
                            setMinSpeakers(undefined);
                            setMaxSpeakers(undefined);
                          }}
                          className="w-full bg-background border border-background-tertiary rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:border-purple-500 mb-2 [&>option]:bg-background [&>option]:text-text-primary"
                        >
                          <option value="auto">ตรวจจับอัตโนมัติ</option>
                          <option value="exact">ระบุจำนวนที่แน่นอน</option>
                          <option value="range">ระบุช่วง (ต่ำสุด-สูงสุด)</option>
                        </select>

                        {speakerMode === "exact" && (
                          <input
                            type="number"
                            min="1"
                            max="10"
                            value={numSpeakers || ""}
                            onChange={(e) => setNumSpeakers(parseInt(e.target.value) || undefined)}
                            placeholder="จำนวนผู้พูด (เช่น 2)"
                            className="w-full bg-background border border-background-tertiary rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:border-purple-500"
                          />
                        )}

                        {speakerMode === "range" && (
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="number"
                              min="1"
                              max="10"
                              value={minSpeakers || ""}
                              onChange={(e) => setMinSpeakers(parseInt(e.target.value) || undefined)}
                              placeholder="ต่ำสุด"
                              className="w-full bg-background border border-background-tertiary rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:border-purple-500"
                            />
                            <input
                              type="number"
                              min="1"
                              max="10"
                              value={maxSpeakers || ""}
                              onChange={(e) => setMaxSpeakers(parseInt(e.target.value) || undefined)}
                              placeholder="สูงสุด"
                              className="w-full bg-background border border-background-tertiary rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:border-purple-500"
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-3 mt-6">
                      <Button
                        variant="outline"
                        size="md"
                        fullWidth
                        onClick={() => {
                          setShowUploadModal(false);
                          setSelectedFile(null);
                          setUploadedAudioId(null);
                        }}
                      >
                        ปิด
                      </Button>
                      <Button variant="primary" size="md" fullWidth onClick={handleTranscribe}>
                        เริ่มถอดเสียง
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
