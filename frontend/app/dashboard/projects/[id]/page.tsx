"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { api, tokenManager, type Project } from "@/lib/api";
import { Button } from "@/components/ui";

/**
 * Project Detail Page
 * 
 * หน้ารายละเอียดโปรเจกต์
 * - แสดงข้อมูลโปรเจกต์
 * - แสดงรายการไฟล์เสียง
 * - ปุ่มอัปโหลดไฟล์เสียง
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
  
  // Transcription options
  const [task, setTask] = useState<"transcribe" | "translate">("transcribe");
  const [language, setLanguage] = useState<string>("None");
  const [numSpeakers, setNumSpeakers] = useState<number | undefined>(undefined);
  const [minSpeakers, setMinSpeakers] = useState<number | undefined>(undefined);
  const [maxSpeakers, setMaxSpeakers] = useState<number | undefined>(undefined);
  const [speakerMode, setSpeakerMode] = useState<"auto" | "exact" | "range">("auto");

  useEffect(() => {
    fetchProject();
  }, [projectId]);

  // Auto-refresh every 5 seconds if there are processing files
  useEffect(() => {
    const hasProcessing = project?.audioFiles?.some(
      (file) => file.status === "PROCESSING"
    );

    if (hasProcessing) {
      const interval = setInterval(() => {
        fetchProject();
      }, 5000); // Refresh every 5 seconds

      return () => clearInterval(interval);
    }
  }, [project]);

  const fetchProject = async () => {
    const token = tokenManager.getAccessToken();
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const response = await api.getProjectById(token, projectId);
      if (response.data?.project) {
        setProject(response.data.project);
      } else if (response.error) {
        console.error("Project not found");
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Failed to fetch project:", error);
      router.push("/dashboard");
    } finally {
      setLoading(false);
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
      // Prepare transcription options
      const transcriptionOptions = {
        task,
        language,
        numSpeakers: speakerMode === "exact" ? numSpeakers : undefined,
        minSpeakers: speakerMode === "range" ? minSpeakers : undefined,
        maxSpeakers: speakerMode === "range" ? maxSpeakers : undefined,
      };

      // Upload and transcribe
      const response = await api.uploadAndTranscribe(
        token,
        projectId,
        selectedFile,
        transcriptionOptions
      );

      if (response.error) {
        alert(`Upload failed: ${response.error.message}`);
        return;
      }

      alert("อัปโหลดและเริ่มถอดเสียงแล้ว! กรุณารอสักครู่...");

      // Refresh project data
      await fetchProject();
      setShowUploadModal(false);
      setSelectedFile(null);
      setUploadProgress(100);
      
      // Reset options
      setTask("transcribe");
      setLanguage("None");
      setSpeakerMode("auto");
      setNumSpeakers(undefined);
      setMinSpeakers(undefined);
      setMaxSpeakers(undefined);
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Upload failed. Please try again.");
    } finally {
      setUploading(false);
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
      <header className="bg-background-secondary border-b border-background-tertiary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  ← กลับ
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-text-primary">
                  {project.name}
                </h1>
                {project.description && (
                  <p className="text-sm text-text-secondary mt-1">
                    {project.description}
                  </p>
                )}
              </div>
            </div>
            <Button
              variant="primary"
              size="md"
              onClick={() => setShowUploadModal(true)}
            >
              + อัปโหลดไฟล์เสียง
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-background-secondary rounded-xl p-6 border border-background-tertiary">
            <div className="text-3xl font-bold text-purple-400 mb-2">
              {project._count?.audioFiles || 0}
            </div>
            <div className="text-sm text-text-secondary">ไฟล์เสียงทั้งหมด</div>
          </div>
          <div className="bg-background-secondary rounded-xl p-6 border border-background-tertiary">
            <div className="text-3xl font-bold text-purple-400 mb-2">0</div>
            <div className="text-sm text-text-secondary">ถอดเสียงแล้ว</div>
          </div>
          <div className="bg-background-secondary rounded-xl p-6 border border-background-tertiary">
            <div className="text-3xl font-bold text-purple-400 mb-2">0</div>
            <div className="text-sm text-text-secondary">แปลภาษาแล้ว</div>
          </div>
        </div>

        {/* Audio Files List */}
        <div className="bg-background-secondary rounded-2xl p-8 border border-background-tertiary">
          <h2 className="text-xl font-bold text-text-primary mb-6">
            ไฟล์เสียง
          </h2>

          {!project.audioFiles || project.audioFiles.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🎵</div>
              <h3 className="text-xl font-semibold text-text-primary mb-2">
                ยังไม่มีไฟล์เสียง
              </h3>
              <p className="text-text-secondary mb-6">
                อัปโหลดไฟล์เสียงเพื่อเริ่มต้นถอดเสียง
              </p>
              <Button
                variant="primary"
                size="lg"
                onClick={() => setShowUploadModal(true)}
              >
                + อัปโหลดไฟล์เสียง
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {project.audioFiles.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-4 bg-background rounded-xl border border-background-tertiary hover:border-purple-500/50 transition-all"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                      <span className="text-2xl">🎵</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-text-primary">
                        {file.originalFilename}
                      </h4>
                      <p className="text-sm text-text-tertiary">
                        {(file.fileSizeBytes / 1024 / 1024).toFixed(2)} MB •{" "}
                        {new Date(file.uploadedAt).toLocaleDateString("th-TH")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        file.status === "COMPLETED"
                          ? "bg-green-500/20 text-green-400"
                          : file.status === "PROCESSING"
                          ? "bg-yellow-500/20 text-yellow-400"
                          : file.status === "FAILED"
                          ? "bg-red-500/20 text-red-400"
                          : "bg-gray-500/20 text-gray-400"
                      }`}
                    >
                      {file.status}
                    </span>
                    {file.status === "COMPLETED" && file.transcripts && file.transcripts.length > 0 ? (
                      <Link href={`/dashboard/transcripts/${file.transcripts[0].id}`}>
                        <Button variant="primary" size="sm">
                          ดูผลลัพธ์
                        </Button>
                      </Link>
                    ) : file.status === "PROCESSING" ? (
                      <Button variant="outline" size="sm" disabled>
                        กำลังประมวลผล...
                      </Button>
                    ) : file.status === "FAILED" ? (
                      <Button variant="outline" size="sm" disabled>
                        ถอดเสียงล้มเหลว
                      </Button>
                    ) : file.status === "COMPLETED" ? (
                      <Button variant="outline" size="sm" disabled>
                        ไม่พบ transcript
                      </Button>
                    ) : (
                      <Button variant="outline" size="sm" disabled>
                        รอดำเนินการ...
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upload Modal */}
        {showUploadModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-background-secondary/95 backdrop-blur-xl rounded-2xl p-8 max-w-lg w-full border border-background-tertiary shadow-2xl my-8">
              <h3 className="text-2xl font-bold text-text-primary mb-6">
                อัปโหลดไฟล์เสียง
              </h3>

              <div className="space-y-4">
                {/* File Input */}
                <div className="border-2 border-dashed border-background-tertiary rounded-xl p-8 text-center hover:border-purple-500/50 transition-all">
                  <input
                    type="file"
                    accept=".mp3,.wav,.m4a,.flac"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="audio-file-input"
                  />
                  <label
                    htmlFor="audio-file-input"
                    className="cursor-pointer block"
                  >
                    {selectedFile ? (
                      <div>
                        <div className="text-4xl mb-2">🎵</div>
                        <p className="text-text-primary font-medium">
                          {selectedFile.name}
                        </p>
                        <p className="text-sm text-text-tertiary mt-1">
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    ) : (
                      <div>
                        <div className="text-4xl mb-2">📁</div>
                        <p className="text-text-primary font-medium mb-1">
                          คลิกเพื่อเลือกไฟล์
                        </p>
                        <p className="text-sm text-text-tertiary">
                          รองรับ MP3, WAV, M4A, FLAC (สูงสุด 100MB)
                        </p>
                      </div>
                    )}
                  </label>
                </div>

                {/* Transcription Options */}
                {selectedFile && (
                  <div className="space-y-4 pt-4 border-t border-background-tertiary">
                    <h4 className="text-sm font-semibold text-text-primary">
                      ตัวเลือกการถอดเสียง
                    </h4>

                    {/* Task Selection */}
                    <div>
                      <label className="block text-sm text-text-secondary mb-2">
                        งาน
                      </label>
                      <select
                        value={task}
                        onChange={(e) => setTask(e.target.value as "transcribe" | "translate")}
                        className="w-full bg-background border border-background-tertiary rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:border-purple-500 [&>option]:bg-background [&>option]:text-text-primary"
                      >
                        <option value="transcribe">ถอดเสียง (Transcribe)</option>
                        <option value="translate">แปลเป็นภาษาอังกฤษ (Translate)</option>
                      </select>
                    </div>

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
                        <option value="thai">ไทย (Thai)</option>
                        <option value="english">อังกฤษ (English)</option>
                        <option value="chinese">จีน (Chinese)</option>
                        <option value="japanese">ญี่ปุ่น (Japanese)</option>
                        <option value="korean">เกาหลี (Korean)</option>
                        <option value="french">ฝรั่งเศส (French)</option>
                        <option value="german">เยอรมัน (German)</option>
                        <option value="spanish">สเปน (Spanish)</option>
                        <option value="portuguese">โปรตุเกส (Portuguese)</option>
                        <option value="russian">รัสเซีย (Russian)</option>
                        <option value="vietnamese">เวียดนาม (Vietnamese)</option>
                      </select>
                    </div>

                    {/* Speaker Configuration */}
                    <div>
                      <label className="block text-sm text-text-secondary mb-2">
                        จำนวนผู้พูด
                      </label>
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
                )}

                {/* Upload Progress */}
                {uploading && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-text-secondary">กำลังอัปโหลดและถอดเสียง...</span>
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
              </div>

              <div className="flex gap-3 mt-6">
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
                  {uploading ? "กำลังอัปโหลดและถอดเสียง..." : "อัปโหลดและถอดเสียง"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
