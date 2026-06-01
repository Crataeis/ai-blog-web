import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#141414",
        paper: "#fbfaf7",
        line: "#dedad1",
        accent: "#1f7a68",
        amber: "#b7791f"
      }
    }
  },
  plugins: []
};

export default config;
