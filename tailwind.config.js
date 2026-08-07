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
          blue: '#fe820e',   // Vibrant Orange
          navy: '#1c1917',   // Deep Charcoal (Stone 900)
          light: '#fff7ed',  // Light Orange Tint (Orange 50)
          mid: '#ea580c',    // Secondary Darker Orange (Orange 600)
          border: '#ffedd5', // Subtle Orange Border (Orange 100)
        },
      },
    },
  },
  plugins: [],
}
