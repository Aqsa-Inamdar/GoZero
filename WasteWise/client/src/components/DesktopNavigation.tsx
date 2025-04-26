import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";

interface DesktopNavigationProps {
  activeView: string;
}

export default function DesktopNavigation({ activeView }: DesktopNavigationProps) {
  const { user } = useAuth();
  
  return (
    <div id="desktop-nav" className="hidden md:flex fixed left-0 top-0 bottom-0 w-64 bg-white shadow-lg flex-col z-50">
      <div className="p-4 border-b border-neutral-200">
        <h1 className="text-2xl font-bold text-primary-500 font-accent">GoZero</h1>
        <p className="text-sm text-neutral-500">Surplus & Waste Management</p>
      </div>
      
      <div className="flex-1 py-6">
        <Link href="/">
          <a className={`nav-item w-full flex items-center px-6 py-3 ${activeView === 'discover' ? 'text-primary-500 bg-primary-50' : 'text-neutral-600 hover:bg-neutral-100'}`}>
            <i className="fas fa-compass w-6"></i>
            <span className="ml-3">Discover</span>
          </a>
        </Link>
        <Link href="/sell">
          <a className={`nav-item w-full flex items-center px-6 py-3 ${activeView === 'sell' ? 'text-primary-500 bg-primary-50' : 'text-neutral-600 hover:bg-neutral-100'}`}>
            <i className="fas fa-plus-circle w-6"></i>
            <span className="ml-3">Sell/Share</span>
          </a>
        </Link>
        <Link href="/dispose">
          <a className={`nav-item w-full flex items-center px-6 py-3 ${activeView === 'dispose' ? 'text-primary-500 bg-primary-50' : 'text-neutral-600 hover:bg-neutral-100'}`}>
            <i className="fas fa-recycle w-6"></i>
            <span className="ml-3">Dispose</span>
          </a>
        </Link>
        <Link href="/chat">
          <a className={`nav-item w-full flex items-center px-6 py-3 ${activeView === 'chat' ? 'text-primary-500 bg-primary-50' : 'text-neutral-600 hover:bg-neutral-100'}`}>
            <i className="fas fa-comments w-6"></i>
            <span className="ml-3">Chat</span>
          </a>
        </Link>
        <Link href="/profile">
          <a className={`nav-item w-full flex items-center px-6 py-3 ${activeView === 'profile' ? 'text-primary-500 bg-primary-50' : 'text-neutral-600 hover:bg-neutral-100'}`}>
            <i className="fas fa-user w-6"></i>
            <span className="ml-3">Profile</span>
          </a>
        </Link>
      </div>
      
      <div className="p-4 border-t border-neutral-200">
        <div className="bg-primary-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-primary-600">GreenPoints</h3>
            <span className="text-accent-400 font-bold">{user?.greenPoints || 0}</span>
          </div>
          <div className="mt-2 bg-white rounded-full h-2">
            <div 
              className="bg-primary-400 h-2 rounded-full" 
              style={{ width: `${Math.min(100, ((user?.greenPoints || 0) / 400) * 100)}%` }}
            ></div>
          </div>
          <p className="text-xs text-neutral-500 mt-2">
            {400 - (user?.greenPoints || 0)} more points until next reward
          </p>
        </div>
      </div>
    </div>
  );
}
