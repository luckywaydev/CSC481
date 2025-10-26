import type { Config } from "tailwindcss";

// ตั้งค่าสีม่วงกับพื้นหลังมืด ตามที่อยากได้
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
      // เงาแบบ 3D สำหรับปุ่ม
      boxShadow: {
        "3d": "0 4px 0 0 rgba(168, 85, 247, 0.4)",
        "3d-hover": "0 6px 0 0 rgba(168, 85, 247, 0.5)",
      },
    },
  },
  plugins: [],
};

export default config;
