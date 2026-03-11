/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/*/.{js,jsx,ts,tsx}",
    "./src/components/*/.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: "#9E1E6F",
          white: "#E9E9E9",
        },
      },
    },
  },
  plugins: [],
};
