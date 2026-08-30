module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0A0A0B',
        surface: '#17171A',
        'surface-light': '#232326',
        input: '#2A2A2D',
        border: '#2E2E32',
        brand: {
          orange: '#F0A63E',
          'orange-dark': '#D98F2B',
          blue: '#3C5A82',
        },
        success: { DEFAULT: '#22C55E', bg: '#123822' },
        danger: { DEFAULT: '#EF4444', bg: '#3A1418' },
        warning: { DEFAULT: '#D9A441', bg: '#3A2A12' },
      },
      borderRadius: {
        pill: '9999px',
      },
    },
  },
  plugins: [],
};
