import { useState } from "react";
import { Item, User } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";
import { useSwipe } from "@/hooks/use-swipe";

interface SwipeCardProps {
  item: Item;
  user: Partial<User>;
  onSwipeLeft: (item: Item) => void;
  onSwipeRight: (item: Item) => void;
  onInfo: (item: Item) => void;
  style?: React.CSSProperties;
  zIndex?: number;
}

export default function SwipeCard({ 
  item, 
  user, 
  onSwipeLeft, 
  onSwipeRight, 
  onInfo,
  style = {},
  zIndex = 0
}: SwipeCardProps) {
  const [animation, setAnimation] = useState<string>("");
  
  const handleSwipeLeft = () => {
    setAnimation("swipe-left");
    setTimeout(() => {
      onSwipeLeft(item);
    }, 300);
  };
  
  const handleSwipeRight = () => {
    setAnimation("swipe-right");
    setTimeout(() => {
      onSwipeRight(item);
    }, 300);
  };
  
  const { bind } = useSwipe({
    onSwipeLeft: handleSwipeLeft,
    onSwipeRight: handleSwipeRight
  });
  
  // Format expiry date
  const expiryDate = item.expiryDate ? new Date(item.expiryDate) : null;
  const expiryText = expiryDate 
    ? `Expires in ${formatDistanceToNow(expiryDate, { addSuffix: false })}`
    : null;
  
  return (
    <div 
      className={`swipe-card absolute w-full bg-white rounded-xl shadow-lg overflow-hidden ${animation}`}
      style={{ ...style, zIndex }}
      {...bind}
    >
      <div className="relative">
        <img 
          src={item.images && item.images.length > 0 ? item.images[0] : "https://images.unsplash.com/photo-1546548970-71785318a17b?w=800&auto=format&fit=crop&q=60"} 
          alt={item.title} 
          className="w-full h-64 object-cover"
        />
        <div className="absolute top-4 left-4">
          <span 
            className={`${item.type === 'donate' ? 'bg-primary-500' : 'bg-secondary-400'} text-white px-2 py-1 rounded-lg text-sm font-medium`}
          >
            {item.type === 'donate' ? 'Donation' : 'Selling'}
          </span>
        </div>
        {expiryText && (
          <div className="absolute top-4 right-4">
            <span className="bg-accent-400 text-white px-2 py-1 rounded-lg text-sm font-medium">
              {expiryText}
            </span>
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold">{item.title}</h3>
          <span className="bg-neutral-100 text-neutral-600 px-2 py-1 rounded text-sm">
            {item.location}
          </span>
        </div>
        <p className="text-neutral-600 mt-2">{item.description}</p>
        
        {item.type === 'sell' && item.price && (
          <div className="flex mt-2 items-center">
            <p className="font-bold text-neutral-800 text-lg">${item.price.toFixed(2)}</p>
          </div>
        )}
        
        <div className="flex flex-wrap gap-2 mt-3">
          {item.tags && item.tags.map((tag, index) => (
            <span key={index} className="bg-neutral-100 text-neutral-600 px-2 py-1 rounded text-xs">
              {tag}
            </span>
          ))}
        </div>
        
        <div className="mt-4 flex items-center">
          <div className="w-10 h-10 rounded-full bg-neutral-200 flex items-center justify-center overflow-hidden">
            {user.profileImage ? (
              <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <i className="fas fa-user text-neutral-400"></i>
            )}
          </div>
          <div className="ml-2">
            <p className="font-medium">{user.name || "User"}</p>
          </div>
        </div>
      </div>
      <div className="p-4 border-t border-neutral-200 flex justify-between">
        <button 
          onClick={handleSwipeLeft}
          className="swipe-left-btn w-14 h-14 bg-white border-2 border-red-500 rounded-full flex items-center justify-center shadow-md text-red-500 text-2xl"
        >
          <i className="fas fa-times"></i>
        </button>
        <button 
          onClick={() => onInfo(item)}
          className="swipe-info-btn w-14 h-14 bg-white border-2 border-blue-500 rounded-full flex items-center justify-center shadow-md text-blue-500 text-2xl"
        >
          <i className="fas fa-info"></i>
        </button>
        <button 
          onClick={handleSwipeRight}
          className="swipe-right-btn w-14 h-14 bg-white border-2 border-primary-500 rounded-full flex items-center justify-center shadow-md text-primary-500 text-2xl"
        >
          <i className="fas fa-heart"></i>
        </button>
      </div>
    </div>
  );
}
