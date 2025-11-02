import Link from "next/link";

/**
 * Auth Layout Component
 * 
 * Layout สำหรับหน้า Authentication (Login, Register, Forgot Password)
 * - Centered card design
 * - Purple gradient background
 * - Logo และ branding
 * - Responsive (Mobile + Desktop)
 */

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  title,
  subtitle,
}) => {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex items-center justify-center p-4">
      {/* Background Gradient Effects */}
      <div className="absolute inset-0 bg-gradient-radial from-purple-900/20 via-background to-background"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse-slow"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl animate-pulse-slow"></div>

      {/* Auth Card Container */}
      <div className="w-full max-w-md relative z-10">
        {/* Logo/Brand */}
        <Link href="/" className="flex items-center justify-center space-x-2 mb-8">
          <div className="w-12 h-12 bg-gradient-purple rounded-xl flex items-center justify-center shadow-glow">
            <span className="text-3xl">🎙️</span>
          </div>
          <span className="text-2xl font-bold text-text-primary">
            TranscribeAI
          </span>
        </Link>

        {/* Auth Card */}
        <div className="bg-background-secondary border border-background-tertiary rounded-2xl shadow-card p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-text-primary mb-2">
              {title}
            </h1>
            {subtitle && (
              <p className="text-text-secondary">
                {subtitle}
              </p>
            )}
          </div>

          {/* Form Content */}
          {children}
        </div>

        {/* Back to Home Link */}
        <div className="text-center mt-6">
          <Link 
            href="/" 
            className="text-sm text-text-secondary hover:text-purple-400 transition-colors"
          >
            ← กลับหน้าแรก
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
