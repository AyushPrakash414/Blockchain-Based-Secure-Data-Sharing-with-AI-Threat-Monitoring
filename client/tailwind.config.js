/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"IBM Plex Sans"', 'sans-serif'],
        serif: ['"Newsreader"', 'serif'],
      },
      colors: {
        cream: '#FCF9F3',
        creamdark: '#F6F3ED',
        terracotta: '#C05C39',
        sage: '#8E9B84',
        charcoal: '#1C1C18',
        inkborder: 'rgba(220, 193, 184, 0.25)',
        
        surface: '#F6F3ED',
        'surface-strong': '#F0EDE5',
        'surface-inset': '#F6F3ED',
        
        base: 'rgba(220, 193, 184, 0.25)',
        'base-strong': 'rgba(220, 193, 184, 0.4)',
        
        accent: '#C05C39',
        'accent-strong': 'rgba(192, 92, 57, 0.15)',
        
        success: '#8E9B84',
        warning: '#C05C39',
        danger: '#A34025',
        info: '#8E9B84'
      },
      textColor: {
        'base-strong': '#1C1C18',
        'base-muted': 'rgba(28, 28, 24, 0.8)',
        'base-soft': 'rgba(28, 28, 24, 0.6)',
        'base-faint': 'rgba(28, 28, 24, 0.4)'
      }
    },
  },
  plugins: [],
}
