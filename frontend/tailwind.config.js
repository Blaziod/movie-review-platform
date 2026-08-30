module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#080808',
        surface: '#17171A',
        'surface-light': '#232326',
        input: '#2A2A2D',
        border: '#2E2E32',
        brand: {
          orange: '#FFA500',
          'orange-dark': '#E69500',
          blue: '#3C5A82',
        },
        success: { DEFAULT: '#22C55E', bg: '#16782E' },
        danger: { DEFAULT: '#EF4444', bg: '#7C150F' },
        warning: { DEFAULT: '#D9A441', bg: '#784A16' },
      },
      borderRadius: {
        pill: '9999px',
      },
    },
  },
  plugins: [],
};
