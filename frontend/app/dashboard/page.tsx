// หน้า dashboard - ยังทำไม่เสร็จ แค่ layout พื้นฐาน
export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar - ตรงนี้ยังไม่ responsive */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-background-secondary border-r border-background-tertiary p-6">
        {/* Logo */}
        <div className="flex items-center space-x-2 mb-8">
          <div className="w-10 h-10 bg-gradient-purple rounded-xl flex items-center justify-center">
            <span className="text-2xl">🎙️</span>
          </div>
          <span className="text-xl font-bold text-text-primary">
            TranscribeAI
          </span>
        </div>

        {/* Navigation */}
        <nav className="space-y-2">
          <a
            href="/dashboard"
            className="flex items-center space-x-3 px-4 py-3 rounded-xl bg-purple-500/10 text-purple-400"
          >
            <span>📊</span>
            <span>Dashboard</span>
          </a>
          <a
            href="/projects"
            className="flex items-center space-x-3 px-4 py-3 rounded-xl text-text-secondary hover:bg-background-tertiary"
          >
            <span>📁</span>
            <span>Projects</span>
          </a>
          <a
            href="/settings"
            className="flex items-center space-x-3 px-4 py-3 rounded-xl text-text-secondary hover:bg-background-tertiary"
          >
            <span>⚙️</span>
            <span>Settings</span>
          </a>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="ml-64 p-8">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary mb-2">
            Dashboard
          </h1>
          <p className="text-text-secondary">
            ยินดีต้อนรับกลับมา
          </p>
        </header>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Card 1 */}
          <div className="bg-background-secondary border border-background-tertiary rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-text-secondary">Total Projects</span>
              <span className="text-2xl">📁</span>
            </div>
            <p className="text-3xl font-bold text-text-primary">0</p>
          </div>

          {/* Card 2 */}
          <div className="bg-background-secondary border border-background-tertiary rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-text-secondary">Files This Month</span>
              <span className="text-2xl">📄</span>
            </div>
            <p className="text-3xl font-bold text-text-primary">0</p>
          </div>

          {/* Card 3 */}
          <div className="bg-background-secondary border border-background-tertiary rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-text-secondary">Remaining Quota</span>
              <span className="text-2xl">⚡</span>
            </div>
            <p className="text-3xl font-bold text-text-primary">100</p>
          </div>
        </div>

        {/* Recent Projects */}
        <div className="bg-background-secondary border border-background-tertiary rounded-2xl p-6">
          <h2 className="text-xl font-bold text-text-primary mb-4">
            Recent Projects
          </h2>
          <p className="text-text-secondary text-center py-8">
            ยังไม่มีโปรเจกต์
          </p>
        </div>
      </main>
    </div>
  );
}
