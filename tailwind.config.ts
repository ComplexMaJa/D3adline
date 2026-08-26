import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#000000",
        foreground: "#F5F5F5",
        surface: {
          DEFAULT: "#080808",
          card: "#0C0C0C",
          elevated: "#101010",
          hover: "#141414",
          active: "#1A1A1A",
        },
        border: {
          DEFAULT: "#1F1F1F",
          subtle: "#161616",
          active: "#2E2E2E",
          purple: "rgba(139, 92, 246, 0.3)",
        },
        purple: {
          50: "#FAF5FF",
          100: "#F3E8FF",
          200: "#E9D5FF",
          300: "#D8B4FE",
          400: "#C084FC",
          500: "#A855F7",
          600: "#8B5CF6",
          700: "#7C3AED",
          800: "#6D28D9",
          900: "#581C87",
          950: "#3B0764",
          accent: "#8B5CF6",
          bright: "#A78BFA",
          muted: "#6D4ACF",
        },
        status: {
          notStarted: "#71717A",
          inProgress: "#3B82F6",
          completed: "#22C55E",
          overdue: "#EF4444",
        },
        priority: {
          low: "#10B981",
          medium: "#F59E0B",
          high: "#EF4444",
        },
      },
      boxShadow: {
        "purple-glow": "0 0 25px -5px rgba(139, 92, 246, 0.25)",
        "purple-glow-sm": "0 0 15px -3px rgba(139, 92, 246, 0.2)",
        "purple-glow-lg": "0 0 40px -5px rgba(139, 92, 246, 0.3)",
        "card": "0 1px 3px 0 rgba(0, 0, 0, 0.7), 0 1px 2px -1px rgba(0, 0, 0, 0.7)",
        "elevated": "0 4px 20px -2px rgba(0, 0, 0, 0.8)",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
      },
      animation: {
        "fade-in": "fadeIn 0.2s ease-in-out",
        "slide-up": "slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        "scale-in": "scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
        "pulse-subtle": "pulseSubtle 3s infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.96)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        pulseSubtle: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.85" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
