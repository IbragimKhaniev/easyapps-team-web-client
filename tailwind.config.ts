import type { Config } from 'tailwindcss';
import animate from 'tailwindcss-animate';
import typography from '@tailwindcss/typography';

/**
 * Визуальный язык — референс №17 (Donezo, Fireart Studio) в фирменных цветах
 * easyapps: светло-серый холст, белые карточки с большим скруглением, одна
 * залитая «главная» плитка на ряд, капсулы-кнопки, штриховка для «ещё не
 * наступившего», крупные цифры. Цвета — шкала вокруг #3CC1F6.
 */
const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    container: { center: true, padding: '1rem', screens: { '2xl': '1440px' } },
    extend: {
      fontFamily: {
        sans: ['Manrope', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        canvas: 'hsl(var(--canvas))',
        panel: 'hsl(var(--panel))',
        primary: { DEFAULT: 'hsl(var(--primary))', foreground: 'hsl(var(--primary-foreground))' },
        secondary: { DEFAULT: 'hsl(var(--secondary))', foreground: 'hsl(var(--secondary-foreground))' },
        destructive: { DEFAULT: 'hsl(var(--destructive))', foreground: 'hsl(var(--destructive-foreground))' },
        muted: { DEFAULT: 'hsl(var(--muted))', foreground: 'hsl(var(--muted-foreground))' },
        accent: { DEFAULT: 'hsl(var(--accent))', foreground: 'hsl(var(--accent-foreground))' },
        popover: { DEFAULT: 'hsl(var(--popover))', foreground: 'hsl(var(--popover-foreground))' },
        card: { DEFAULT: 'hsl(var(--card))', foreground: 'hsl(var(--card-foreground))' },
        brand: {
          50: '#F0FAFE',
          100: '#DDF3FD',
          200: '#B9E8FB',
          300: '#86D8F9',
          400: '#5BCBF7',
          500: '#3CC1F6',
          DEFAULT: '#3CC1F6',
          600: '#16A2DD',
          700: '#0B82B5',
          800: '#0B6A92',
          900: '#0E5878',
          950: '#083A51',
        },
        ink: {
          DEFAULT: '#111827',
          soft: '#374151',
          muted: '#6B7280',
          faint: '#9CA3AF',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        card: '1.5rem',
        frame: '2rem',
      },
      boxShadow: {
        card: '0 1px 2px rgba(17, 24, 39, 0.04), 0 1px 1px rgba(17, 24, 39, 0.02)',
        lift: '0 18px 40px -18px rgba(11, 106, 146, 0.35)',
        float: '0 20px 50px -20px rgba(17, 24, 39, 0.28), 0 6px 18px -8px rgba(17, 24, 39, 0.12)',
        frame: '0 30px 80px -40px rgba(17, 24, 39, 0.18)',
      },
      fontSize: {
        kpi: ['3.25rem', { lineHeight: '1', letterSpacing: '-0.04em', fontWeight: '700' }],
        title: ['2.25rem', { lineHeight: '1.1', letterSpacing: '-0.03em', fontWeight: '700' }],
      },
      keyframes: {
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(6px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          from: { backgroundPosition: '200% 0' },
          to: { backgroundPosition: '-200% 0' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.35s cubic-bezier(0.22, 1, 0.36, 1) both',
        shimmer: 'shimmer 1.6s linear infinite',
      },
    },
  },
  plugins: [animate, typography],
};

export default config;
