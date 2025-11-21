/** @type {import('tailwindcss').Config} */
const config = {
  darkMode: ["class"],

  theme: {
    extend: {
      fontFamily: {
        dmsans: ["DM Sans", "sans-serif"],
        tinos: ["Tinos", "serif"],
        "back-street": ["back-street"],
        "bastliga-one": ["bastliga-one"],
        "central-well": ["central-well"],
        corinthiago: ["corinthiago"],
        "whispering-signature": ["whispering-signature"],
        arial: ["arial"],
        helvetica: ["helvetica"],
        "helvetica-bold": ["helvetica-bold"],
      },
      screens: {
        mid: "1400px",
        "3xl": "1920px",
        "4xl": "2560px",
      },
      colors: {
        primary: "rgba(var(--primary))",
        "primary-950": "rgba(var(--primary-950))",
        // "primary-50": "rgba(var(--primary-50))",
        // "primary-100": "rgba(var(--primary-100))",
        "primary-200": "rgba(var(--primary-200))",
        "primary-300": "rgba(var(--primary-300))",
        "primary-400": "rgba(var(--primary-400))",
        // "primary-500": "rgba(var(--primary-500))",
        "primary-600": "rgba(var(--primary-600))",
        // "primary-700": "rgba(var(--primary-700))",
        // "primary-800": "rgba(var(--primary-800))",
        // "primary-900": "rgba(var(--primary-900))",

        "grey-100": "rgba(var(--grey-100))",
        "grey-200": "rgba(var(--grey-200))",

        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      backgroundImage: {
        "custom-gradient":
          "linear-gradient(95.1deg, #3357AA 0.6%, #BF1B39 101.33%)",
      },
      boxShadow: {
        all: "0px 0px 9px 0px rgba(0, 0, 0, 0.14)",
      },
      height: {
        comments: "calc(100vh - 520px)",
      },
      keyframes: {
        "progress-bar": {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "spin-reverse": {
          from: { transform: "rotate(360deg)" },
          to: { transform: "rotate(0deg)" },
        },
      },
      animation: {
        "progress-bar": "progress-bar 1.5s linear infinite",
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "spin-reverse": "spin-reverse 1s linear infinite",
      },
    },
  },
};

export default config;
