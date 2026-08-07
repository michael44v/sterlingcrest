/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        chase: {
          blue: '#0d9488',   // Vibrant Teal 600
          navy: '#022c22',   // Deep Forest Emerald 950
          light: '#f0fdf4',  // Light Emerald Tint 50
          mid: '#0f766e',    // Secondary Dark Teal 700
          border: '#a7f3d0', // Subtle Green/Emerald 200
        },
      },
    },
  },
  plugins: [],
}
