/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Design tokens — "field command center", not a generic
        // dark-mode SaaS palette. See docs/DESIGN.md.
        ink: {
          950: '#080B10', // page background
          900: '#0D131A', // panel background
          800: '#141C26', // raised panel / card
          700: '#1D2733', // borders / dividers
          600: '#2A3644', // hover borders
        },
        fog: {
          100: '#EDF1F5', // primary text
          300: '#B7C2CE', // secondary text
          500: '#7C8A99', // muted / placeholder
        },
        signal: {
          amber: '#F2A73B',  // active/attention status
          teal: '#2FD6C1',   // nominal/online status
          crimson: '#E14B4B', // critical/SOS status
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'sans-serif'],
        body: ['var(--font-body)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      letterSpacing: {
        tag: '0.14em',
      },
    },
  },
  plugins: [],
};
