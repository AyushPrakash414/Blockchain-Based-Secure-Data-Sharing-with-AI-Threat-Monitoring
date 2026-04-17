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
        cream: 'var(--bg)',
        creamdark: 'var(--bg-surface)',
        terracotta: 'var(--accent)',
        sage: 'var(--accent-2)',
        charcoal: 'var(--text)',
        inkborder: 'var(--border)',
        
        surface: 'var(--bg-surface)',
        'surface-strong': 'var(--bg-surface-strong)',
        'surface-inset': 'var(--bg-inset)',
        
        base: 'var(--border)',
        'base-strong': 'var(--border-strong)',
        
        accent: 'var(--accent)',
        'accent-strong': 'var(--bg-accent-strong)',
        
        success: 'var(--success)',
        warning: 'var(--warning)',
        danger: 'var(--danger)',
        info: 'var(--info)'
      },
      textColor: {
        'base-strong': 'var(--text)',
        'base-muted': 'var(--text-muted)',
        'base-soft': 'var(--text-soft)',
        'base-faint': 'var(--text-faint)'
      }
    },
  },
  plugins: [],
}
