import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Item, User } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import CardStack from "@/components/CardStack";
import CategoryFilter from "@/components/CategoryFilter";
import { Slider } from "@/components/ui/slider";

const categories = [
  "Food",
  "Furniture",
  "Electronics",
  "Clothes",
  "Books",
  "Other"
];

export default function DiscoverPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [radius, setRadius] = useState(5); // in km
  const [userLocation, setUserLocation] = useState({ latitude: 0, longitude: 0 });
  
  // Get user's location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          console.error("Error getting location:", error);
          // Default location if geolocation fails
          setUserLocation({ latitude: 37.7749, longitude: -122.4194 });
        }
      );
    }
  }, []);
  
  // Fetch items
  const { data: items, isLoading, error } = useQuery<Item[]>({
    queryKey: ["/api/items", selectedCategory, radius, userLocation],
    queryFn: async () => {
      const res = await fetch(`/api/items?category=${selectedCategory}&radius=${radius}&latitude=${userLocation.latitude}&longitude=${userLocation.longitude}`);
      if (!res.ok) throw new Error("Failed to fetch items");
      return res.json();
    },
    enabled: userLocation.latitude !== 0 && userLocation.longitude !== 0,
  });
  
  // Fetch details of users who posted the items
  const { data: itemUsers = {}, isLoading: isLoadingUsers } = useQuery<Record<number, Partial<User>>>({
    queryKey: ["/api/item-users", items],
    queryFn: async () => {
      if (!items || items.length === 0) return {};
      
      // Get unique user IDs
      const userIds = [...new Set(items.map(item => item.userId))];
      
      // Fetch user details for each unique user ID
      const userPromises = userIds.map(async (userId) => {
        try {
          const res = await fetch(`/api/users/${userId}`);
          if (!res.ok) return [userId, { id: userId, name: "Unknown User" }];
          const userData = await res.json();
          return [userId, userData];
        } catch (error) {
          return [userId, { id: userId, name: "Unknown User" }];
        }
      });
      
      const userEntries = await Promise.all(userPromises);
      return Object.fromEntries(userEntries);
    },
    enabled: Boolean(items && items.length > 0),
  });
  
  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
  };
  
  const handleRadiusChange = (values: number[]) => {
    setRadius(values[0]);
  };
  
  const handleSwipeEnd = () => {
    toast({
      title: "No more items",
      description: "You've seen all available items in this category. Try changing filters or check back later!",
    });
  };
  
  return (
    <div id="discover-view">
      {/* Mobile Header */}
      <div className="md:hidden bg-white shadow-sm p-4 flex items-center justify-between sticky top-0 z-10">
        <h1 className="text-xl font-bold text-primary-500 font-accent">GoZero</h1>
        <div className="flex items-center">
          <button className="p-2 text-neutral-600">
            <i className="fas fa-sliders-h"></i>
          </button>
          <div className="ml-2 bg-neutral-100 rounded-full px-3 py-1 flex items-center text-sm">
            <i className="fas fa-map-marker-alt text-primary-500 mr-1"></i>
            <span>{radius} km</span>
          </div>
        </div>
      </div>
      
      {/* Desktop Header */}
      <div className="hidden md:flex bg-white shadow-sm p-4 items-center justify-between sticky top-0 z-10">
        <h2 className="text-xl font-semibold">Discover Items</h2>
        <div className="flex items-center">
          <div className="relative mr-4">
            <input type="text" placeholder="Search items..." className="pl-9 pr-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400" />
            <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400"></i>
          </div>
          <button className="p-2 text-neutral-600 hover:bg-neutral-100 rounded-md">
            <i className="fas fa-sliders-h"></i>
          </button>
          <div className="ml-2 bg-neutral-100 rounded-full px-3 py-2 flex items-center">
            <i className="fas fa-map-marker-alt text-primary-500 mr-1"></i>
            <span>{radius} km</span>
            <i className="fas fa-chevron-down ml-1 text-neutral-400 text-xs"></i>
          </div>
        </div>
      </div>
      
      {/* Category Filter */}
      <CategoryFilter 
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={handleCategorySelect}
      />
      
      {/* Radius Slider (Desktop) */}
      <div className="hidden md:block bg-white border-b border-neutral-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-neutral-700">Distance: {radius} km</span>
          <div className="w-64">
            <Slider
              defaultValue={[radius]}
              max={50}
              min={1}
              step={1}
              onValueChange={handleRadiusChange}
            />
          </div>
        </div>
      </div>
      
      {/* Swipeable Cards Area */}
      <div className="swipe-container p-4 md:p-8 max-w-md mx-auto">
        {isLoading || isLoadingUsers ? (
          <div className="flex flex-col items-center justify-center h-[500px]">
            <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin"></div>
            <p className="mt-4 text-neutral-600">Loading items...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-[500px] bg-white rounded-xl shadow-md p-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <i className="fas fa-exclamation-triangle text-red-500 text-2xl"></i>
            </div>
            <h3 className="text-lg font-medium text-neutral-800 mb-2">Error loading items</h3>
            <p className="text-neutral-600 text-center">Something went wrong. Please try again later.</p>
          </div>
        ) : items && items.length > 0 ? (
          <CardStack 
            items={items} 
            users={itemUsers} 
            onSwipeEnd={handleSwipeEnd} 
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-[500px] bg-white rounded-xl shadow-md p-6">
            <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mb-4">
              <i className="fas fa-search text-neutral-400 text-2xl"></i>
            </div>
            <h3 className="text-lg font-medium text-neutral-800 mb-2">No items found</h3>
            <p className="text-neutral-600 text-center">Try adjusting your filters or check back later for new listings.</p>
          </div>
        )}
        
        {/* Swipe Instructions */}
        <div className="mt-6 text-center text-neutral-500">
          <p className="mb-2">Swipe right to add to your interests</p>
          <p>Swipe left to skip</p>
        </div>
      </div>
    </div>
  );
}
