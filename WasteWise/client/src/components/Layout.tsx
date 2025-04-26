import { ReactNode, useState, useEffect } from "react";
import { useLocation } from "wouter";
import MobileNavigation from "./MobileNavigation";
import DesktopNavigation from "./DesktopNavigation";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  const [activeView, setActiveView] = useState<string>("");
  
  // Set the active view based on the current location
  useEffect(() => {
    if (location === "/") {
      setActiveView("discover");
    } else {
      // Remove the leading slash
      setActiveView(location.substring(1));
    }
  }, [location]);

  return (
    <div className="font-sans bg-neutral-50 text-neutral-800">
      {/* Mobile Navigation */}
      <MobileNavigation activeView={activeView} />
      
      {/* Desktop Navigation */}
      <DesktopNavigation activeView={activeView} />
      
      {/* Main Content Area */}
      <div id="main-content" className="md:ml-64 pb-16 md:pb-0 min-h-screen">
        {children}
      </div>
    </div>
  );
}
