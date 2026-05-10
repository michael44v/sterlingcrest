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
          blue:    '#117ACA',   // Primary
          navy:    '#0A2D5A',   // Dark
          light:   '#E8F4FC',   // Light
          mid:     '#1A6BB5',   // Medium
          border:  '#C8DCF0',   // Border
        }
      }
    },
  },
  plugins: [],
}
