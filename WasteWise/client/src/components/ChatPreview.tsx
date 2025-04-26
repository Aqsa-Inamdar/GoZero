import { formatDistanceToNow } from "date-fns";

interface ChatPreviewProps {
  id: number;
  otherUser: {
    id: number;
    name: string;
    profileImage?: string;
  };
  lastMessage?: {
    content: string;
    createdAt: Date;
  };
  itemTitle?: string;
  onClick: (chatId: number) => void;
  active?: boolean;
}

export default function ChatPreview({ 
  id, 
  otherUser, 
  lastMessage, 
  itemTitle,
  onClick, 
  active = false 
}: ChatPreviewProps) {
  const timeAgo = lastMessage?.createdAt 
    ? formatDistanceToNow(new Date(lastMessage.createdAt), { addSuffix: true }) 
    : "";
  
  return (
    <div 
      className={`p-4 border-b border-neutral-100 hover:bg-neutral-50 cursor-pointer ${active ? 'bg-neutral-50' : ''}`}
      onClick={() => onClick(id)}
    >
      <div className="flex items-center">
        <div className="w-12 h-12 rounded-full bg-neutral-200 flex items-center justify-center overflow-hidden">
          {otherUser.profileImage ? (
            <img 
              src={otherUser.profileImage} 
              alt={otherUser.name} 
              className="w-full h-full object-cover"
            />
          ) : (
            <i className="fas fa-user text-neutral-400"></i>
          )}
        </div>
        <div className="ml-3 flex-1">
          <div className="flex justify-between items-center">
            <h4 className="font-medium">{otherUser.name}</h4>
            {lastMessage && (
              <span className="text-xs text-neutral-500">{timeAgo}</span>
            )}
          </div>
          <p className="text-neutral-600 text-sm line-clamp-1">
            {lastMessage ? lastMessage.content : itemTitle ? `About: ${itemTitle}` : "Start a conversation..."}
          </p>
        </div>
      </div>
    </div>
  );
}
