import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          50:  '#F0EFFE',
          100: '#D4CFFE',
          200: '#B0A8FC',
          300: '#9488F8',
          400: '#7B6EF5',
          500: '#6354E0',
          600: '#4F3FCC',
          700: '#3D2FAD',
          800: '#2E1F99',
          900: '#150D5C',
        },
        gold: {
          50:  '#FDF5E4',
          100: '#FCDFA0',
          200: '#F8C352',
          300: '#F0AE2E',
          400: '#E8960F',
          600: '#B5700A',
          800: '#7A4A06',
          900: '#3D2200',
        },
        carbon: {
          50:  '#F7F7FA',
          100: '#E4E3F0',
          200: '#C8C6E0',
          300: '#A8A5C9',
          400: '#8F8CAF',
          500: '#6F6C92',
          600: '#555275',
          700: '#3E3B61',
          800: '#2A2748',
          900: '#131128',
          950: '#0A0917',
        },
        paper: {
          DEFAULT: '#FAFAF8',
          pure:    '#FFFFFF',
          surface: '#F3F3F0',
          border:  '#E8E8E5',
        },
        night:  '#0A0917',
        panel:  '#131128',
        panel2: '#1E1A42',
      },
      fontFamily: {
        sans:    ['var(--font-sans)', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
        quote:   ['var(--font-quote)', 'Georgia', 'serif'],
        mono:    ['var(--font-mono)', 'monospace'],
        body:    ['var(--font-body)', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        // Scale: colossal > mega > hero > display
        'colossal': ['clamp(4rem, 12.5vw, 14rem)',  { lineHeight: '0.86', letterSpacing: '-0.05em' }],
        'mega':     ['clamp(3.25rem, 10vw, 11rem)',  { lineHeight: '0.88', letterSpacing: '-0.045em' }],
        'hero':     ['clamp(2.75rem, 7vw, 6rem)',    { lineHeight: '0.94', letterSpacing: '-0.04em' }],
        'display':  ['clamp(2rem, 4.5vw, 3.75rem)', { lineHeight: '1.02', letterSpacing: '-0.03em' }],
      },
      borderRadius: {
        'xl2': '1.25rem',
        'xl3': '1.75rem',
      },
      maxWidth: {
        '8xl': '88rem',
        '9xl': '96rem',
      },
      animation: {
        'marquee':         'marquee 40s linear infinite',
        'marquee-reverse': 'marquee-reverse 40s linear infinite',
        'drift-up':        'drift-up 32s linear infinite',
        'drift-down':      'drift-down 32s linear infinite',
        'float':           'float 6s ease-in-out infinite',
        'shimmer':         'shimmer 2.5s linear infinite',
        'glow-pulse':      'glow-pulse 5s ease-in-out infinite',
        'scroll-line':     'scroll-line 2.2s ease-in-out infinite',
        'ping-slow':       'ping 2.4s cubic-bezier(0,0,0.2,1) infinite',
      },
      keyframes: {
        marquee: {
          '0%':   { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'marquee-reverse': {
          '0%':   { transform: 'translateX(-50%)' },
          '100%': { transform: 'translateX(0)' },
        },
        'drift-up': {
          '0%':   { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(-50%)' },
        },
        'drift-down': {
          '0%':   { transform: 'translateY(-50%)' },
          '100%': { transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-12px)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'glow-pulse': {
          '0%, 100%': { opacity: '0.3' },
          '50%':      { opacity: '0.55' },
        },
        'scroll-line': {
          '0%':   { transform: 'translateY(-100%)', opacity: '0' },
          '25%':  { opacity: '1' },
          '75%':  { opacity: '1' },
          '100%': { transform: 'translateY(280%)', opacity: '0' },
        },
      },
    },
  },
  plugins: [],
}

export default config
