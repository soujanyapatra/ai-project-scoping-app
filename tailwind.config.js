/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './resources/**/*.blade.php',
    './resources/js/**/*.{vue,js,ts,jsx,tsx}',
    './resources/css/**/*.css',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif']
      },
      colors: {
        brand: {
          50: '#f0f3ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#2563eb', // A bright blue for contrast if needed
          600: '#011268', // Main primary
          700: '#010e53',
          800: '#010b3e',
          900: '#000414',
          deep: '#010b3e',
          surface: '#000414',
          light: '#f8faff',
          input: '#f0f3ff'
        },
        accent: {
          blue: '#2563eb',
          /** Matches footer / logo burst (e.g. collapsed sidebar mark) */
          coral: '#ff4936',
          pink: '#ec4899',
          cyan: '#06b6d4',
          indigo: '#4f46e5',
          amber: '#f59e0b'
        },
        gradient: {
          start: '#c4b5fd',
          mid: '#93c5fd',
          end: '#f9a8d4'
        },
        /** PrimeVue toast overrides — reference via theme('colors.toast.*') */
        toast: {
          success: '#1FC16B',
          successAccent: '#159f56',
          error: '#dc2626',
          errorAccent: '#b91c1c',
          borderLight: 'rgba(255, 255, 255, 0.18)',
          text: '#ffffff',
          closeIcon: 'rgba(255, 255, 255, 0.92)',
          /** Default toast chrome (maps to spacing/borderRadius tokens in toast.css) */
          canvasBorder: 'rgba(0, 0, 0, 0.05)'
        }
      },
      /** Toast typography — same rem as text-sm / text-sm icons; theme('fontSize.toast-*') */
      fontSize: {
        'toast-detail': '0.875rem',
        /** Matches icon glyph inside compact close button */
        'toast-close-icon': '0.75rem'
      },
      keyframes: {
        drift: {
          '0%': { transform: 'translate(0,0) scale(1)' },
          '100%': { transform: 'translate(24px,36px) scale(1.1)' }
        },
        shimmer: {
          '0%': { backgroundPosition: '0% 0%' },
          '100%': { backgroundPosition: '200% 0%' }
        },
        'pulse-dot': {
          '0%,100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.5', transform: 'scale(0.7)' }
        },
        shine: {
          '0%': { left: '-100%' },
          '100%': { left: '150%' }
        },
        spin: {
          to: { transform: 'rotate(360deg)' }
        }
      },
      animation: {
        drift: 'drift 14s ease-in-out infinite alternate',
        shimmer: 'shimmer 4s linear infinite',
        'pulse-dot': 'pulse-dot 2s ease-in-out infinite',
        spin: 'spin 0.75s linear infinite'
      },
      backgroundImage: {
        'grid-white': 'linear-gradient(rgba(255,255,255,.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.025) 1px,transparent 1px)',
        'orb-primary': 'radial-gradient(circle, #011268 0%, transparent 70%)',
        'orb-blue': 'radial-gradient(circle, #010e53 0%, transparent 70%)',
        'orb-pink': 'radial-gradient(circle, #ec4899 0%, transparent 70%)',
        'orb-cyan': 'radial-gradient(circle, #06b6d4 0%, transparent 70%)',
        'orb-purple': 'radial-gradient(circle, #6366f1 0%, transparent 72%)',
        'login-gradient': 'linear-gradient(135deg, #011268, #1e3a8a)',
        'btn-gradient': 'linear-gradient(to bottom right, #011268, #010e53, #010b3e)',
        'shimmer-gradient': 'linear-gradient(90deg, #011268, #1e3a8a, #06b6d4, #011268)',
        'accent-gradient': 'linear-gradient(90deg, #c4b5fd 0%, #93c5fd 50%, #f9a8d4 100%)',
        'soft-blobs': 'radial-gradient(circle at 80% 20%, rgba(1,18,104,.06) 0%, transparent 50%), radial-gradient(circle at 20% 80%, rgba(30,58,138,.05) 0%, transparent 50%)',
        'login-right-mesh':
          'radial-gradient(ellipse 90% 70% at 90% 10%, rgba(99,102,241,0.09) 0%, transparent 55%), radial-gradient(ellipse 70% 50% at 10% 90%, rgba(1,18,104,0.06) 0%, transparent 50%), radial-gradient(ellipse 50% 40% at 50% 50%, rgba(236,72,153,0.04) 0%, transparent 45%)'
      },
      boxShadow: {
        'login-card':
          '0 0 0 1px rgba(15,23,42,0.06), 0 1px 2px rgba(15,23,42,0.04), 0 24px 48px -12px rgba(1,18,104,0.14), 0 12px 24px -8px rgba(15,23,42,0.06)',
        'login-btn': '0 4px 16px rgba(1,18,104,.4), 0 1px 3px rgba(0,0,0,.1)',
        'login-btn-hover': '0 8px 24px rgba(1,18,104,.5)',
        'logo-glow': '0 4px 12px rgba(1,18,104,.5)',
        'dot-glow': '0 0 6px #011268',
        'input-focus': '0 0 0 4px rgba(1,18,104,0.1)',
        'input-error': '0 0 0 4px rgba(239,68,68,0.1)'
      },
      backgroundSize: {
        '200': '200% 100%',
        /** Login hero mesh — larger cells read as clearer “cubes” on dark panels */
        'grid': '72px 72px'
      }
    }
  },
  plugins: []
}
