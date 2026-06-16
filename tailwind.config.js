/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // shadcn-style semantic tokens mapped to the DigiSahabat palette
        primary: {
          DEFAULT: "#2F7D62", // dark green — primary actions
          light: "#6AB99D", // primary green — accents / progress
          foreground: "#FFFFFF",
        },
        mint: "#EAF7F1", // soft tinted surfaces
        cream: "#FFF8E8", // warm highlight surfaces
        foreground: "#1F2933", // primary text
        muted: {
          DEFAULT: "#F3F4F6", // muted surface
          foreground: "#6B7280", // muted text
        },
        border: "#E5E7EB",
        background: "#F7F8FA",
        card: "#FFFFFF",
        success: "#22C55E",
        warning: "#FBBF24",
        destructive: "#EF4444",
      },
    },
  },
  plugins: [],
};
