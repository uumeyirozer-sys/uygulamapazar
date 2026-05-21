import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "1rem",
        sm: "1.25rem",
        lg: "2rem",
        xl: "2.5rem"
      },
      screens: {
        "2xl": "1180px"
      }
    },
    extend: {
      colors: {
        brand: {
          red: "#e50914",
          "red-hover": "#c80711",
          black: "#09090b",
          white: "#ffffff"
        },
        neutral: {
          50: "#fafafa",
          100: "#f4f4f5",
          200: "#e4e4e7",
          300: "#d4d4d8",
          400: "#a1a1aa",
          500: "#71717a",
          600: "#52525b",
          700: "#3f3f46",
          800: "#27272a",
          900: "#18181b",
          950: "#09090b"
        }
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"]
      },
      fontSize: {
        "page-title": ["2.25rem", { lineHeight: "2.7rem", fontWeight: "800" }],
        "section-title": ["1.75rem", { lineHeight: "2.25rem", fontWeight: "800" }],
        "card-title": ["1.125rem", { lineHeight: "1.625rem", fontWeight: "700" }],
        "body-text": ["1rem", { lineHeight: "1.75rem", fontWeight: "400" }],
        "meta-text": ["0.875rem", { lineHeight: "1.25rem", fontWeight: "500" }],
        "tag-text": ["0.75rem", { lineHeight: "1rem", fontWeight: "700" }]
      },
      borderRadius: {
        xs: "0.25rem",
        sm: "0.375rem",
        md: "0.5rem",
        lg: "0.875rem",
        xl: "1rem",
        "2xl": "1.25rem"
      },
      boxShadow: {
        card: "0 1px 2px rgba(9, 9, 11, 0.05), 0 16px 44px rgba(9, 9, 11, 0.07)",
        "card-hover": "0 8px 18px rgba(9, 9, 11, 0.08), 0 28px 70px rgba(9, 9, 11, 0.12)"
      },
      spacing: {
        page: "2rem",
        section: "5rem",
        "section-sm": "3rem"
      },
      transitionTimingFunction: {
        premium: "cubic-bezier(0.22, 1, 0.36, 1)"
      }
    }
  },
  plugins: []
};

export default config;
