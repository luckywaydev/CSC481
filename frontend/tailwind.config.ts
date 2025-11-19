import type { Config } from "tailwindcss";

/**
 * Tailwind CSS Configuration
 * 
 * ตั้งค่า Design System:
 * - Color Theme: Dark (Background) + Purple (Primary)
 * - Typography: Modern sans-serif
 * - Spacing: Consistent scale
 * - Effects: 3D shadows, gradients
 */
const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // สีหลักของระบบ - Dark + Purple Theme
      colors: {
        // Background colors (Dark theme)
        background: {
          DEFAULT: "#0a0a0f", // พื้นหลังหลัก - เกือบดำ
          secondary: "#13131a", // พื้นหลังรอง
          tertiary: "#1a1a24", // พื้นหลังที่สาม
        },
        // Purple accent colors
        purple: {
          50: "#faf5ff",
          100: "#f3e8ff",
          200: "#e9d5ff",
          300: "#d8b4fe",
          400: "#c084fc",
          500: "#a855f7", // สีม่วงหลัก
          600: "#9333ea", // สีม่วงเข้ม
          700: "#7e22ce",
          800: "#6b21a8",
          900: "#581c87",
          950: "#3b0764",
        },
        // Text colors
        text: {
          primary: "#ffffff", // ข้อความหลัก - ขาว
          secondary: "#a0a0b0", // ข้อความรอง - เทาอ่อน
          tertiary: "#6b6b80", // ข้อความที่สาม - เทา
        },
        // Status colors
        success: "#10b981",
        error: "#ef4444",
        warning: "#f59e0b",
        info: "#3b82f6",
      },
      // Typography
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
      // Box shadows สำหรับ 3D effect
      boxShadow: {
        // 3D button shadows
        "3d": "0 4px 0 0 rgba(168, 85, 247, 0.4), 0 8px 16px -4px rgba(168, 85, 247, 0.3)",
        "3d-hover": "0 6px 0 0 rgba(168, 85, 247, 0.5), 0 12px 24px -4px rgba(168, 85, 247, 0.4)",
        "3d-active": "0 2px 0 0 rgba(168, 85, 247, 0.4), 0 4px 8px -2px rgba(168, 85, 247, 0.3)",
        // Card shadows
        "card": "0 4px 24px -4px rgba(168, 85, 247, 0.1)",
        "card-hover": "0 8px 32px -4px rgba(168, 85, 247, 0.2)",
        // Glow effect
        "glow": "0 0 20px rgba(168, 85, 247, 0.3)",
        "glow-lg": "0 0 40px rgba(168, 85, 247, 0.4)",
      },
      // Background gradients
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "gradient-purple": "linear-gradient(135deg, #a855f7 0%, #9333ea 100%)",
        "gradient-purple-dark": "linear-gradient(135deg, #7e22ce 0%, #581c87 100%)",
      },
      // Animation
      animation: {
        "float": "float 3s ease-in-out infinite",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "shimmer": "shimmer 2s linear infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-1000px 0" },
          "100%": { backgroundPosition: "1000px 0" },
        },
      },
      // Border radius
      borderRadius: {
        "4xl": "2rem",
      },
    },
  },
  plugins: [],
  // Enable dark mode
  darkMode: "class",
};

export default config;
