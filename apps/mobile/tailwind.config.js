/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,ts,tsx}', './components/**/*.{js,ts,tsx}', "./features/**/*.{js,ts,tsx}"],

  presets: [require('nativewind/preset')],
  theme: {
    extend: {
        colors: {
              primary: {
              DEFAULT: "#537CF2",  
            },
            secondary: {
              DEFAULT: "#13161E",   
            },
            background: {
              DEFAULT: "#090A0D",
            },
        },
      },
  },
  plugins: [],
};
