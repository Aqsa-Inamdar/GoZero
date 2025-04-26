import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Item } from "@shared/schema";
import ProfileStats from "@/components/ProfileStats";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [showItemDetails, setShowItemDetails] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  
  // Fetch user items
  const { data: items = [], isLoading: isLoadingItems } = useQuery<Item[]>({
    queryKey: ["/api/users", user?.id, "items"],
    queryFn: async () => {
      if (!user) return [];
      const res = await fetch(`/api/users/${user.id}/items`);
      if (!res.ok) throw new Error("Failed to fetch user items");
      return res.json();
    },
    enabled: !!user,
  });
  
  const filteredItems = activeTab === "all" 
    ? items 
    : items.filter(item => item.type === activeTab);
  
  const handleItemClick = (item: Item) => {
    setSelectedItem(item);
    setShowItemDetails(true);
  };
  
  if (!user) {
    return <div>Loading...</div>;
  }
  
  return (
    <div id="profile-view">
      <div className="bg-white shadow-sm p-4 sticky top-0 z-10">
        <h2 className="text-xl font-semibold">My Profile</h2>
      </div>
      
      <div className="p-4 md:p-8 max-w-2xl mx-auto">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-primary-400 to-primary-500 h-32"></div>
          <div className="px-6 pt-0 pb-6 relative">
            <div className="absolute -top-16 left-6">
              <div className="w-32 h-32 rounded-full border-4 border-white overflow-hidden bg-white">
                {user.profileImage ? (
                  <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-neutral-200 flex items-center justify-center">
                    <i className="fas fa-user text-neutral-400 text-4xl"></i>
                  </div>
                )}
              </div>
            </div>
            <div className="pt-20">
              <h2 className="text-2xl font-bold">{user.name}</h2>
              <p className="text-neutral-600">
                Joined {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}
              </p>
              <div className="mt-4 flex items-center flex-wrap gap-4">
                <div className="flex items-center">
                  <i className="fas fa-leaf text-primary-500 mr-2"></i>
                  <div>
                    <p className="font-medium">GreenPoints</p>
                    <p className="text-neutral-600">{user.greenPoints} points</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <i className="fas fa-medal text-accent-400 mr-2"></i>
                  <div>
                    <p className="font-medium">Impact Maker</p>
                    <p className="text-neutral-600">
                      Level {Math.floor(user.greenPoints / 100) + 1}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Impact Stats */}
        <ProfileStats user={user} />
        
        {/* My Listings */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          <div className="p-4 border-b border-neutral-200 flex justify-between items-center">
            <h3 className="font-semibold">My Listings</h3>
            <Tabs 
              defaultValue="all" 
              value={activeTab} 
              onValueChange={setActiveTab}
            >
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="sell">Selling</TabsTrigger>
                <TabsTrigger value="donate">Donating</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          <div className="divide-y divide-neutral-200">
            {isLoadingItems ? (
              // Loading skeleton
              Array(2).fill(0).map((_, index) => (
                <div key={index} className="p-4 flex animate-pulse">
                  <div className="w-20 h-20 bg-neutral-200 rounded-lg"></div>
                  <div className="ml-4 flex-1">
                    <div className="h-4 bg-neutral-200 rounded w-1/2 mb-2"></div>
                    <div className="h-3 bg-neutral-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-neutral-200 rounded w-1/4"></div>
                  </div>
                </div>
              ))
            ) : filteredItems.length === 0 ? (
              <div className="p-6 text-center">
                <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-box-open text-neutral-400 text-xl"></i>
                </div>
                <h3 className="font-medium text-neutral-800">No listings found</h3>
                <p className="text-neutral-600 mt-1">
                  {activeTab === "all" 
                    ? "You haven't created any listings yet."
                    : activeTab === "sell"
                      ? "You don't have any items for sale."
                      : "You don't have any donation listings."
                  }
                </p>
                <Button className="mt-4" asChild>
                  <a href="/sell">Create a Listing</a>
                </Button>
              </div>
            ) : (
              filteredItems.map((item) => (
                <div key={item.id} className="p-4 flex cursor-pointer hover:bg-neutral-50" onClick={() => handleItemClick(item)}>
                  <img 
                    src={item.images && item.images.length > 0 ? item.images[0] : "https://via.placeholder.com/80"} 
                    alt={item.title} 
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  <div className="ml-4 flex-1">
                    <div className="flex justify-between">
                      <h4 className="font-medium">{item.title}</h4>
                      <Badge 
                        variant={item.type === "donate" ? "default" : "secondary"}
                      >
                        {item.type === "donate" ? "Donation" : `$${item.price?.toFixed(2)}`}
                      </Badge>
                    </div>
                    <p className="text-neutral-600 text-sm mt-1">{item.description}</p>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs text-neutral-500">
                        Listed {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                      </span>
                      <div className="flex items-center text-neutral-600 text-sm">
                        <i className="fas fa-eye mr-1"></i>
                        <span>{item.views} views</span>
                        <i className="fas fa-comments ml-3 mr-1"></i>
                        <span>{item.inquiries} inquiries</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        
        {/* Settings Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-4 border-b border-neutral-200">
              <h3 className="font-semibold">Account Settings</h3>
            </div>
            <div className="p-4">
              <a href="#" className="flex items-center justify-between py-3 border-b border-neutral-100">
                <div className="flex items-center">
                  <i className="fas fa-user-circle w-8 text-neutral-500"></i>
                  <span>Edit Profile</span>
                </div>
                <i className="fas fa-chevron-right text-neutral-400"></i>
              </a>
              <a href="#" className="flex items-center justify-between py-3 border-b border-neutral-100">
                <div className="flex items-center">
                  <i className="fas fa-lock w-8 text-neutral-500"></i>
                  <span>Privacy & Security</span>
                </div>
                <i className="fas fa-chevron-right text-neutral-400"></i>
              </a>
              <a href="#" className="flex items-center justify-between py-3 border-b border-neutral-100">
                <div className="flex items-center">
                  <i className="fas fa-bell w-8 text-neutral-500"></i>
                  <span>Notifications</span>
                </div>
                <i className="fas fa-chevron-right text-neutral-400"></i>
              </a>
              <a href="#" className="flex items-center justify-between py-3">
                <div className="flex items-center">
                  <i className="fas fa-map-marker-alt w-8 text-neutral-500"></i>
                  <span>Location Settings</span>
                </div>
                <i className="fas fa-chevron-right text-neutral-400"></i>
              </a>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-4 border-b border-neutral-200">
              <h3 className="font-semibold">Support</h3>
            </div>
            <div className="p-4">
              <a href="#" className="flex items-center justify-between py-3 border-b border-neutral-100">
                <div className="flex items-center">
                  <i className="fas fa-question-circle w-8 text-neutral-500"></i>
                  <span>Help Center</span>
                </div>
                <i className="fas fa-chevron-right text-neutral-400"></i>
              </a>
              <a href="#" className="flex items-center justify-between py-3 border-b border-neutral-100">
                <div className="flex items-center">
                  <i className="fas fa-file-alt w-8 text-neutral-500"></i>
                  <span>Terms of Service</span>
                </div>
                <i className="fas fa-chevron-right text-neutral-400"></i>
              </a>
              <a href="#" className="flex items-center justify-between py-3 border-b border-neutral-100">
                <div className="flex items-center">
                  <i className="fas fa-shield-alt w-8 text-neutral-500"></i>
                  <span>Privacy Policy</span>
                </div>
                <i className="fas fa-chevron-right text-neutral-400"></i>
              </a>
              <button 
                onClick={logout}
                className="w-full flex items-center justify-between py-3 text-left hover:bg-neutral-50"
              >
                <div className="flex items-center">
                  <i className="fas fa-sign-out-alt w-8 text-neutral-500"></i>
                  <span>Log Out</span>
                </div>
                <i className="fas fa-chevron-right text-neutral-400"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Item Detail Dialog */}
      <Dialog open={showItemDetails} onOpenChange={setShowItemDetails}>
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
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-1">Category</h4>
                  <p className="text-neutral-600">{selectedItem.category}</p>
                </div>
                
                <div>
                  <h4 className="font-medium mb-1">Status</h4>
                  <Badge variant={selectedItem.status === 'available' ? 'success' : selectedItem.status === 'reserved' ? 'warning' : 'secondary'}>
                    {selectedItem.status.charAt(0).toUpperCase() + selectedItem.status.slice(1)}
                  </Badge>
                </div>
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
              
              {selectedItem.tags && selectedItem.tags.length > 0 && (
                <div>
                  <h4 className="font-medium mb-1">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedItem.tags.map((tag, index) => (
                      <Badge key={index} variant="outline">{tag}</Badge>
                    ))}
                  </div>
                </div>
              )}
              
              <div>
                <h4 className="font-medium mb-1">Statistics</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-neutral-100 p-2 rounded">
                    <p className="text-sm text-neutral-500">Views</p>
                    <p className="font-semibold">{selectedItem.views}</p>
                  </div>
                  <div className="bg-neutral-100 p-2 rounded">
                    <p className="text-sm text-neutral-500">Inquiries</p>
                    <p className="font-semibold">{selectedItem.inquiries}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setShowItemDetails(false)}>
                  Close
                </Button>
                <Button variant="destructive">
                  <i className="fas fa-trash-alt mr-2"></i>
                  Delete Listing
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
