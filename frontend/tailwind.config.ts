import type { Config } from "tailwindcss";

// ตั้งค่าสีม่วงกับพื้นหลังมืด ตามที่อยากได้
// เพิ่ม shadow แบบ 3D สำหรับปุ่ม
const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // สีหลัก - Dark + Purple
      colors: {
        background: {
          DEFAULT: "#0a0a0f", // พื้นหลังมืดๆ
          secondary: "#13131a",
          tertiary: "#1a1a24",
        },
        purple: {
          500: "#a855f7", // สีม่วงหลัก
          600: "#9333ea",
        },
        text: {
          primary: "#ffffff",
          secondary: "#a0a0b0",
          tertiary: "#6b6b80",
        },
      },
      // เงาแบบ 3D สำหรับปุ่ม - ลองหลายค่าถึงจะได้แบบนี้
      boxShadow: {
        "3d": "0 4px 0 0 rgba(168, 85, 247, 0.4), 0 8px 16px -4px rgba(168, 85, 247, 0.3)",
        "3d-hover": "0 6px 0 0 rgba(168, 85, 247, 0.5), 0 12px 24px -4px rgba(168, 85, 247, 0.4)",
        "3d-active": "0 2px 0 0 rgba(168, 85, 247, 0.4), 0 4px 8px -2px rgba(168, 85, 247, 0.3)",
        "card": "0 4px 24px -4px rgba(168, 85, 247, 0.1)",
        "card-hover": "0 8px 32px -4px rgba(168, 85, 247, 0.2)",
      },
      // Background gradients
      backgroundImage: {
        "gradient-purple": "linear-gradient(135deg, #a855f7 0%, #9333ea 100%)",
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};

export default config;
