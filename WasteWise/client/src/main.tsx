import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { ThemeProvider as NextThemesProvider } from "next-themes";

// Add custom styles to match the design reference
const customStyles = document.createElement('style');
customStyles.textContent = `
  :root {
    --primary-50: 236, 253, 245;
    --primary-100: 209, 250, 229;
    --primary-200: 167, 243, 208;
    --primary-300: 110, 231, 183;
    --primary-400: 52, 211, 153;
    --primary-500: 16, 185, 129;
    --primary-600: 5, 150, 105;
    --primary-700: 4, 120, 87;
    --secondary-400: 59, 130, 246;
    --secondary-500: 37, 99, 235;
    --secondary-600: 29, 78, 216;
    --accent-400: 245, 158, 11;
    --accent-500: 217, 119, 6;
    --accent-600: 180, 83, 9;
  }

  /* Swipe animation */
  @keyframes swipeRight {
    from { transform: translateX(0) rotate(0deg); opacity: 1; }
    to { transform: translateX(200px) rotate(10deg); opacity: 0; }
  }
  
  @keyframes swipeLeft {
    from { transform: translateX(0) rotate(0deg); opacity: 1; }
    to { transform: translateX(-200px) rotate(-10deg); opacity: 0; }
  }
  
  .swipe-right {
    animation: swipeRight 0.5s forwards;
  }
  
  .swipe-left {
    animation: swipeLeft 0.5s forwards;
  }
  
  /* Map marker styles */
  .map-marker {
    width: 24px;
    height: 24px;
    background-color: white;
    border: 3px solid hsl(var(--primary));
    border-radius: 50%;
    cursor: pointer;
  }
  
  /* Hide scrollbar but allow scrolling */
  .hide-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  
  .hide-scrollbar::-webkit-scrollbar {
    display: none;
  }
  
  /* Font families */
  .font-accent {
    font-family: 'Montserrat', sans-serif;
  }
`;
document.head.appendChild(customStyles);

createRoot(document.getElementById("root")!).render(
  <NextThemesProvider attribute="class" defaultTheme="light">
    <App />
  </NextThemesProvider>
);
