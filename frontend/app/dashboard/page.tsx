/**
 * Dashboard Page
 * 
 * หน้า Dashboard หลังจาก login สำเร็จ
 * - แสดงข้อความต้อนรับ
 * - แสดงข้อมูล user พร้อม role
 * - ปุ่ม logout
 */

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api, tokenManager, type Project } from "@/lib/api";
import { Button } from "@/components/ui";

/**
 * Projects Section Component
 */
function ProjectsSection() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDescription, setNewProjectDescription] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    const token = tokenManager.getAccessToken();
    if (!token) return;

    try {
      const response = await api.getProjects(token, { limit: 5 });
      if (response.data?.projects) {
        setProjects(response.data.projects);
      }
    } catch (error) {
      console.error("Failed to fetch projects:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) return;

    const token = tokenManager.getAccessToken();
    if (!token) return;

    setCreating(true);
    try {
      const response = await api.createProject(token, {
        name: newProjectName,
        description: newProjectDescription || undefined,
      });

      if (response.data?.project) {
        setProjects([response.data.project, ...projects]);
        setShowCreateModal(false);
        setNewProjectName("");
        setNewProjectDescription("");
      }
    } catch (error) {
      console.error("Failed to create project:", error);
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteProject = async (projectId: string, projectName: string) => {
    const confirmed = confirm(`คุณต้องการลบโปรเจกต์ "${projectName}" หรือไม่?\n\nการลบจะไม่สามารถกู้คืนได้`);
    if (!confirmed) return;

    const token = tokenManager.getAccessToken();
    if (!token) return;

    try {
      const response = await api.deleteProject(token, projectId);

      if (response.data?.success) {
        // Remove from list
        setProjects(projects.filter(p => p.id !== projectId));
        alert("ลบโปรเจกต์สำเร็จ");
      } else if (response.error) {
        alert(`ลบโปรเจกต์ล้มเหลว: ${response.error.message}`);
      }
    } catch (error) {
      console.error("Failed to delete project:", error);
      alert("ลบโปรเจกต์ล้มเหลว");
    }
  };

  if (loading) {
    return (
      <div className="mt-8">
        <div className="text-text-secondary">กำลังโหลดโปรเจกต์...</div>
      </div>
    );
  }

  return (
    <div className="mt-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-text-primary">โปรเจกต์ของฉัน</h2>
        <Button
          variant="primary"
          size="md"
          onClick={() => setShowCreateModal(true)}
        >
          + สร้างโปรเจกต์ใหม่
        </Button>
      </div>

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <div className="bg-background-secondary rounded-2xl p-12 border border-background-tertiary text-center">
          <div className="text-6xl mb-4">📁</div>
          <h3 className="text-xl font-semibold text-text-primary mb-2">
            ยังไม่มีโปรเจกต์
          </h3>
          <p className="text-text-secondary mb-6">
            สร้างโปรเจกต์แรกของคุณเพื่อเริ่มต้นถอดเสียง
          </p>
          <Button
            variant="primary"
            size="lg"
            onClick={() => setShowCreateModal(true)}
          >
            + สร้างโปรเจกต์ใหม่
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div
              key={project.id}
              className="group relative bg-background-secondary rounded-xl p-6 border border-background-tertiary hover:border-purple-500/50 transition-all"
            >
              {/* Delete Button */}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  handleDeleteProject(project.id, project.name);
                }}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-all opacity-0 group-hover:opacity-100"
                title="ลบโปรเจกต์"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>

              {/* Project Link */}
              <Link href={`/dashboard/projects/${project.id}`} className="block">
                <div className="flex items-start justify-between mb-3 pr-8">
                  <h3 className="text-lg font-semibold text-text-primary group-hover:text-purple-400 transition-colors">
                    {project.name}
                  </h3>
                  <span className="text-xs text-text-tertiary">
                    {project._count?.audioFiles || 0} ไฟล์
                  </span>
                </div>
                {project.description && (
                  <p className="text-sm text-text-secondary mb-4 line-clamp-2">
                    {project.description}
                  </p>
                )}
                <div className="text-xs text-text-tertiary">
                  สร้างเมื่อ {new Date(project.createdAt).toLocaleDateString('th-TH')}
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* Create Project Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-background-secondary/95 backdrop-blur-xl rounded-2xl p-8 max-w-md w-full border border-background-tertiary shadow-2xl">
            <h3 className="text-2xl font-bold text-text-primary mb-6">
              สร้างโปรเจกต์ใหม่
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  ชื่อโปรเจกต์ *
                </label>
                <input
                  type="text"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="เช่น บทสัมภาษณ์ลูกค้า"
                  className="w-full px-4 py-3 bg-background border border-background-tertiary rounded-xl text-text-primary focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  คำอธิบาย (ไม่บังคับ)
                </label>
                <textarea
                  value={newProjectDescription}
                  onChange={(e) => setNewProjectDescription(e.target.value)}
                  placeholder="อธิบายเกี่ยวกับโปรเจกต์นี้..."
                  rows={3}
                  className="w-full px-4 py-3 bg-background border border-background-tertiary rounded-xl text-text-primary focus:outline-none focus:border-purple-500 resize-none"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button
                variant="outline"
                size="md"
                fullWidth
                onClick={() => {
                  setShowCreateModal(false);
                  setNewProjectName("");
                  setNewProjectDescription("");
                }}
                disabled={creating}
              >
                ยกเลิก
              </Button>
              <Button
                variant="primary"
                size="md"
                fullWidth
                onClick={handleCreateProject}
                disabled={!newProjectName.trim() || creating}
                loading={creating}
              >
                {creating ? "กำลังสร้าง..." : "สร้างโปรเจกต์"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ดึงข้อมูล user จาก API
    const fetchUser = async () => {
      const token = tokenManager.getAccessToken();
      if (!token) {
        router.push("/login");
        return;
      }

      try {
        // เรียก API /auth/me
        const response = await api.getCurrentUser(token);
        
        if (response.error) {
          // ถ้า error (เช่น token หมดอายุ) ให้ redirect ไป login
          tokenManager.clearTokens();
          router.push("/login");
          return;
        }

        if (response.data?.user) {
          setUser(response.data.user);
          // อัปเดต user data ใน localStorage
          tokenManager.saveUser(response.data.user);
        }
      } catch (error) {
        console.error("Failed to fetch user:", error);
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  /**
   * Handle logout
   */
  const handleLogout = () => {
    // ลบ tokens
    tokenManager.clearTokens();
    // Redirect ไป login
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-text-secondary">กำลังโหลด...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-background-secondary border-b border-background-tertiary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-text-primary">
              Dashboard
            </h1>
            <Button
              variant="outline"
              size="md"
              onClick={handleLogout}
            >
              ออกจากระบบ
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Card */}
        <div className="bg-background-secondary rounded-2xl p-8 border border-background-tertiary shadow-lg">
          <h2 className="text-3xl font-bold text-text-primary mb-2">
            ยินดีต้อนรับ! 🎉
          </h2>
          <p className="text-text-secondary mb-6">
            คุณเข้าสู่ระบบสำเร็จแล้ว
          </p>

          {/* User Info */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <span className="text-text-tertiary">อีเมล:</span>
              <span className="text-text-primary font-medium">{user.email}</span>
            </div>
            {user.username && (
              <div className="flex items-center space-x-2">
                <span className="text-text-tertiary">ชื่อผู้ใช้:</span>
                <span className="text-text-primary font-medium">
                  {user.username}
                </span>
              </div>
            )}
            {user.role && (
              <div className="flex items-center space-x-2">
                <span className="text-text-tertiary">บทบาท:</span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  {user.role.name === 'admin' && '👑 '}
                  {user.role.name === 'pro' && '⭐ '}
                  {user.role.name === 'free' && '🆓 '}
                  {user.role.name.toUpperCase()}
                </span>
              </div>
            )}
          </div>

          {/* Info Box */}
          <div className="mt-8 bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
            <p className="text-sm text-purple-300">
              💡 <strong>หมายเหตุ:</strong> นี่เป็นหน้า Dashboard พื้นฐาน
              ระบบ Authentication ทำงานได้แล้ว! Features อื่นๆ กำลังพัฒนา
            </p>
          </div>
        </div>

        {/* Projects Section */}
        <ProjectsSection />
      </main>
    </div>
  );
}
