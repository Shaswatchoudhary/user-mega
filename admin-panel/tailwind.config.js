/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
        outfit: ['Outfit', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      colors: {
        background: '#FFFFFF',
        surface: '#FAFAFA',
        "surface-light": '#F4F4F5',
        primary: '#1A1110', // Reddish-Black
        "reddish-950": "#0A0707",
        "reddish-900": "#1A1110",
        "reddish-800": "#2A1C1A",
        "accent-red": "#C41E3A", // Cardinal Red
        success: '#10B981', // Returning to standard success green for clarity
        warning: '#F59E0B', 
        danger: '#EF4444',
        "text-primary": '#18181B',
        "text-secondary": '#71717A',
        "text-muted": '#A1A1AA',
        border: '#E4E4E7',
      },
      boxShadow: {
        'soft': '0 2px 10px rgba(0, 0, 0, 0.05)',
        'premium': '0 20px 40px rgba(26, 17, 16, 0.08)',
        'red-glow': '0 0 20px rgba(196, 30, 58, 0.15)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.03)',
      },
      backgroundImage: {
        'reddish-gradient': 'linear-gradient(135deg, #1A1110 0%, #2A1C1A 100%)',
      }
    },
  },
  plugins: [],
}
