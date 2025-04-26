import { Link } from "wouter";

interface MobileNavigationProps {
  activeView: string;
}

export default function MobileNavigation({ activeView }: MobileNavigationProps) {
  return (
    <div id="mobile-nav" className="fixed bottom-0 left-0 right-0 bg-white shadow-lg md:hidden z-50">
      <div className="flex justify-around items-center h-16">
        <Link href="/">
          <a className={`nav-item flex flex-col items-center py-2 px-3 ${activeView === 'discover' ? 'text-primary-500' : 'text-neutral-400'}`}>
            <i className="fas fa-compass text-xl"></i>
            <span className="text-xs mt-1">Discover</span>
          </a>
        </Link>
        <Link href="/sell">
          <a className={`nav-item flex flex-col items-center py-2 px-3 ${activeView === 'sell' ? 'text-primary-500' : 'text-neutral-400'}`}>
            <i className="fas fa-plus-circle text-xl"></i>
            <span className="text-xs mt-1">Sell/Share</span>
          </a>
        </Link>
        <Link href="/dispose">
          <a className={`nav-item flex flex-col items-center py-2 px-3 ${activeView === 'dispose' ? 'text-primary-500' : 'text-neutral-400'}`}>
            <i className="fas fa-recycle text-xl"></i>
            <span className="text-xs mt-1">Dispose</span>
          </a>
        </Link>
        <Link href="/chat">
          <a className={`nav-item flex flex-col items-center py-2 px-3 ${activeView === 'chat' ? 'text-primary-500' : 'text-neutral-400'}`}>
            <i className="fas fa-comments text-xl"></i>
            <span className="text-xs mt-1">Chat</span>
          </a>
        </Link>
        <Link href="/profile">
          <a className={`nav-item flex flex-col items-center py-2 px-3 ${activeView === 'profile' ? 'text-primary-500' : 'text-neutral-400'}`}>
            <i className="fas fa-user text-xl"></i>
            <span className="text-xs mt-1">Profile</span>
          </a>
        </Link>
      </div>
    </div>
  );
}
