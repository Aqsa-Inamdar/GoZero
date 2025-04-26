import { useState, useEffect } from "react";
import { Item, User } from "@shared/schema";
import SwipeCard from "./SwipeCard";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";

interface CardStackProps {
  items: Item[];
  users: Record<number, Partial<User>>;
  onSwipeEnd?: () => void;
}

export default function CardStack({ items, users, onSwipeEnd }: CardStackProps) {
  const [stack, setStack] = useState<Item[]>(items);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showDialog, setShowDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  
  useEffect(() => {
    setStack(items);
    setCurrentIndex(0);
  }, [items]);
  
  const handleSwipeLeft = (item: Item) => {
    if (currentIndex < stack.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Notify parent that we've run out of cards
      if (onSwipeEnd) onSwipeEnd();
    }
  };
  
  const handleSwipeRight = async (item: Item) => {
    // Add item to user's interests, create a chat with the item owner
    try {
      if (user) {
        await apiRequest("POST", "/api/chats", {
          userId1: user.id,
          userId2: item.userId,
          itemId: item.id
        });
        
        toast({
          title: "Added to interests",
          description: `${item.title} has been added to your interests. You can now chat with the owner.`,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not add item to interests. Please try again.",
        variant: "destructive",
      });
    }
    
    if (currentIndex < stack.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Notify parent that we've run out of cards
      if (onSwipeEnd) onSwipeEnd();
    }
  };
  
  const handleInfoClick = (item: Item) => {
    setSelectedItem(item);
    setShowDialog(true);
  };
  
  const handleStartChat = async () => {
    if (!selectedItem || !user) return;
    
    try {
      await apiRequest("POST", "/api/chats", {
        userId1: user.id,
        userId2: selectedItem.userId,
        itemId: selectedItem.id
      });
      
      toast({
        title: "Chat created",
        description: `You can now chat with ${users[selectedItem.userId]?.name || 'the owner'} about ${selectedItem.title}.`,
      });
      
      // Close the dialog
      setShowDialog(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not create chat. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // If we have no items
  if (stack.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 p-6 bg-white rounded-xl shadow-md">
        <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mb-4">
          <i className="fas fa-search text-neutral-400 text-2xl"></i>
        </div>
        <h3 className="text-lg font-medium text-neutral-800 mb-2">No items found</h3>
        <p className="text-neutral-600 text-center">Try adjusting your filters or check back later for new listings.</p>
      </div>
    );
  }
  
  // Render the current card and the next card (for visual stack effect)
  return (
    <>
      <div className="relative h-[500px] md:h-[600px]">
        {stack.slice(currentIndex, currentIndex + 3).map((item, index) => (
          <SwipeCard
            key={item.id}
            item={item}
            user={users[item.userId] || {}}
            onSwipeLeft={handleSwipeLeft}
            onSwipeRight={handleSwipeRight}
            onInfo={handleInfoClick}
            zIndex={2 - index}
            style={{
              transform: index > 0 ? `scale(${1 - index * 0.05}) translateY(-${index * 10}px)` : undefined
            }}
          />
        ))}
      </div>
      
      {/* Item details dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedItem?.title}</DialogTitle>
            <DialogDescription>
              {selectedItem?.type === 'donate' ? 'Donation' : `$${selectedItem?.price?.toFixed(2)}`}
            </DialogDescription>
          </DialogHeader>
          
          {selectedItem && (
            <div className="space-y-4">
              {selectedItem.images && selectedItem.images.length > 0 && (
                <img
                  src={selectedItem.images[0]}
                  alt={selectedItem.title}
                  className="w-full h-48 object-cover rounded-md"
                />
              )}
              
              <div>
                <h4 className="font-medium mb-1">Description</h4>
                <p className="text-neutral-600">{selectedItem.description}</p>
              </div>
              
              <div>
                <h4 className="font-medium mb-1">Location</h4>
                <p className="text-neutral-600">{selectedItem.location}</p>
              </div>
              
              {selectedItem.expiryDate && (
                <div>
                  <h4 className="font-medium mb-1">Expiry Date</h4>
                  <p className="text-neutral-600">
                    {new Date(selectedItem.expiryDate).toLocaleDateString()}
                  </p>
                </div>
              )}
              
              <div>
                <h4 className="font-medium mb-1">Posted by</h4>
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-neutral-200 flex items-center justify-center overflow-hidden mr-2">
                    {users[selectedItem.userId]?.profileImage ? (
                      <img 
                        src={users[selectedItem.userId]?.profileImage} 
                        alt={users[selectedItem.userId]?.name} 
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      <i className="fas fa-user text-neutral-400"></i>
                    )}
                  </div>
                  <span>{users[selectedItem.userId]?.name || "User"}</span>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setShowDialog(false)}>
                  Close
                </Button>
                <Button onClick={handleStartChat}>
                  <i className="fas fa-comments mr-2"></i>
                  Start Chat
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
