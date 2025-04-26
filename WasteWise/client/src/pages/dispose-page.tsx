import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { DisposalCenter, Event } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import DisposalCenterCard from "@/components/DisposalCenter";
import Map from "@/components/Map";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

const disposalTypes = ["e-waste", "furniture", "clothes", "plastics", "food"];

export default function DisposePage() {
  const { toast } = useToast();
  const [selectedType, setSelectedType] = useState<string>("e-waste");
  const [userLocation, setUserLocation] = useState({ latitude: 37.7749, longitude: -122.4194 });
  const [selectedCenter, setSelectedCenter] = useState<DisposalCenter | null>(null);
  const [showCenterDetails, setShowCenterDetails] = useState(false);
  
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
          toast({
            title: "Location Error",
            description: "Could not get your location. Using default location instead.",
            variant: "destructive",
          });
        }
      );
    }
  }, [toast]);
  
  // Fetch disposal centers
  const { data: centers = [], isLoading: isLoadingCenters } = useQuery<DisposalCenter[]>({
    queryKey: ['/api/disposal-centers', selectedType, userLocation],
    queryFn: async () => {
      const res = await fetch(`/api/disposal-centers?type=${selectedType}&latitude=${userLocation.latitude}&longitude=${userLocation.longitude}&radius=10`);
      if (!res.ok) throw new Error('Failed to fetch disposal centers');
      return res.json();
    }
  });
  
  // Fetch upcoming events
  const { data: events = [], isLoading: isLoadingEvents } = useQuery<Event[]>({
    queryKey: ['/api/events'],
    queryFn: async () => {
      const res = await fetch('/api/events');
      if (!res.ok) throw new Error('Failed to fetch events');
      return res.json();
    }
  });
  
  const handleTypeChange = (value: string) => {
    setSelectedType(value);
  };
  
  const handleCenterClick = (center: DisposalCenter) => {
    setSelectedCenter(center);
  };
  
  const handleDetailsClick = (center: DisposalCenter) => {
    setSelectedCenter(center);
    setShowCenterDetails(true);
  };
  
  const handleDirectionsClick = (center: DisposalCenter) => {
    const { latitude, longitude } = center;
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`, '_blank');
  };
  
  return (
    <div id="dispose-view">
      <div className="bg-white shadow-sm p-4 sticky top-0 z-10">
        <h2 className="text-xl font-semibold">Help Me Dispose</h2>
      </div>
      
      <div className="p-4 md:p-8">
        {/* Category Tabs */}
        <ScrollArea className="w-full" orientation="horizontal">
          <div className="flex mb-6 pb-2">
            {disposalTypes.map((type) => (
              <button
                key={type}
                className={`whitespace-nowrap px-4 py-2 border-b-2 ${
                  selectedType === type 
                    ? 'border-primary-500 text-primary-500 font-medium' 
                    : 'border-transparent text-neutral-600'
                }`}
                onClick={() => handleTypeChange(type)}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </ScrollArea>
        
        {/* Map View */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          <div className="p-4 border-b border-neutral-200">
            <h3 className="font-semibold">
              {selectedType.charAt(0).toUpperCase() + selectedType.slice(1)} Disposal Centers Near You
            </h3>
          </div>
          
          {isLoadingCenters ? (
            <div className="h-64 md:h-96 flex items-center justify-center bg-neutral-100">
              <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin"></div>
            </div>
          ) : (
            <Map centers={centers} onCenterClick={handleCenterClick} />
          )}
        </div>
        
        {/* Disposal Centers List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoadingCenters ? (
            Array(3).fill(0).map((_, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
                <div className="w-full h-40 bg-neutral-200"></div>
                <div className="p-4 space-y-3">
                  <div className="h-5 bg-neutral-200 rounded w-3/4"></div>
                  <div className="h-4 bg-neutral-200 rounded w-full"></div>
                  <div className="h-4 bg-neutral-200 rounded w-2/3"></div>
                  <div className="h-10 bg-neutral-200 rounded w-full"></div>
                </div>
              </div>
            ))
          ) : centers.length === 0 ? (
            <div className="col-span-full bg-white rounded-lg shadow-md p-8 text-center">
              <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-map-marker-alt text-neutral-400 text-2xl"></i>
              </div>
              <h3 className="text-lg font-medium text-neutral-800 mb-2">No disposal centers found</h3>
              <p className="text-neutral-600">We couldn't find any disposal centers for {selectedType} in your area.</p>
            </div>
          ) : (
            centers.map((center) => (
              <DisposalCenterCard
                key={center.id}
                center={center}
                onDetails={() => handleDetailsClick(center)}
                onDirections={() => handleDirectionsClick(center)}
              />
            ))
          )}
        </div>
        
        {/* Disposal Guide */}
        <div className="mt-8 bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-4 border-b border-neutral-200">
            <h3 className="font-semibold">{selectedType.charAt(0).toUpperCase() + selectedType.slice(1)} Disposal Guide</h3>
          </div>
          <div className="p-4">
            {selectedType === "e-waste" && (
              <>
                <div className="mb-4">
                  <h4 className="font-medium text-neutral-800 mb-2">What is considered e-waste?</h4>
                  <p className="text-neutral-600">E-waste includes computers, TVs, printers, phones, tablets, batteries, and other electronic devices.</p>
                </div>
                <div className="mb-4">
                  <h4 className="font-medium text-neutral-800 mb-2">Why proper disposal matters</h4>
                  <p className="text-neutral-600">E-waste contains hazardous materials that can harm the environment if not disposed of properly. Many components can also be recycled and reused.</p>
                </div>
                <div>
                  <h4 className="font-medium text-neutral-800 mb-2">Before disposal</h4>
                  <ul className="list-disc pl-5 text-neutral-600">
                    <li className="mb-1">Back up your data</li>
                    <li className="mb-1">Factory reset devices to remove personal information</li>
                    <li className="mb-1">Remove batteries if possible (they may need separate recycling)</li>
                    <li>Check if the manufacturer has a take-back program</li>
                  </ul>
                </div>
              </>
            )}
            
            {selectedType === "furniture" && (
              <>
                <div className="mb-4">
                  <h4 className="font-medium text-neutral-800 mb-2">Donating usable furniture</h4>
                  <p className="text-neutral-600">If your furniture is still in good condition, consider donating it to local charities, shelters, or thrift stores before disposal.</p>
                </div>
                <div className="mb-4">
                  <h4 className="font-medium text-neutral-800 mb-2">Proper disposal options</h4>
                  <p className="text-neutral-600">Large furniture items often require special disposal. Many municipalities offer bulk item pickup services. Check with your local waste management department.</p>
                </div>
                <div>
                  <h4 className="font-medium text-neutral-800 mb-2">Recycling furniture</h4>
                  <ul className="list-disc pl-5 text-neutral-600">
                    <li className="mb-1">Wood can often be recycled or repurposed</li>
                    <li className="mb-1">Metal parts can be taken to scrap yards</li>
                    <li className="mb-1">Upholstered items may need special handling</li>
                    <li>Consider breaking down furniture into recyclable components</li>
                  </ul>
                </div>
              </>
            )}
            
            {selectedType === "clothes" && (
              <>
                <div className="mb-4">
                  <h4 className="font-medium text-neutral-800 mb-2">Donation options</h4>
                  <p className="text-neutral-600">Donate gently used clothing to local charities, shelters, or thrift stores. Many retailers also offer clothing recycling programs.</p>
                </div>
                <div className="mb-4">
                  <h4 className="font-medium text-neutral-800 mb-2">Textile recycling</h4>
                  <p className="text-neutral-600">Even damaged clothes can be recycled. Textiles can be transformed into industrial rags, furniture stuffing, insulation, and more.</p>
                </div>
                <div>
                  <h4 className="font-medium text-neutral-800 mb-2">Repurposing tips</h4>
                  <ul className="list-disc pl-5 text-neutral-600">
                    <li className="mb-1">Cut old t-shirts into cleaning rags</li>
                    <li className="mb-1">Use fabric from unwearable clothes for crafting</li>
                    <li className="mb-1">Consider clothing swaps with friends</li>
                    <li>Look for "take-back" programs from clothing brands</li>
                  </ul>
                </div>
              </>
            )}
            
            {selectedType === "plastics" && (
              <>
                <div className="mb-4">
                  <h4 className="font-medium text-neutral-800 mb-2">Understanding plastic recycling</h4>
                  <p className="text-neutral-600">Not all plastics are recyclable. Check the recycling number (1-7) on the bottom of containers to determine recyclability in your area.</p>
                </div>
                <div className="mb-4">
                  <h4 className="font-medium text-neutral-800 mb-2">Preparation for recycling</h4>
                  <p className="text-neutral-600">Rinse containers, remove lids, and flatten items when possible. Different types of plastics should be separated.</p>
                </div>
                <div>
                  <h4 className="font-medium text-neutral-800 mb-2">Reducing plastic usage</h4>
                  <ul className="list-disc pl-5 text-neutral-600">
                    <li className="mb-1">Use reusable shopping bags</li>
                    <li className="mb-1">Choose products with minimal packaging</li>
                    <li className="mb-1">Avoid single-use plastics when possible</li>
                    <li>Consider plastic alternatives like glass or metal</li>
                  </ul>
                </div>
              </>
            )}
            
            {selectedType === "food" && (
              <>
                <div className="mb-4">
                  <h4 className="font-medium text-neutral-800 mb-2">Composting basics</h4>
                  <p className="text-neutral-600">Food waste can be composted into nutrient-rich soil. Fruit and vegetable scraps, coffee grounds, and eggshells are excellent for composting.</p>
                </div>
                <div className="mb-4">
                  <h4 className="font-medium text-neutral-800 mb-2">Community composting options</h4>
                  <p className="text-neutral-600">Many cities offer community composting programs or pickup services. Check with your local waste management department for options.</p>
                </div>
                <div>
                  <h4 className="font-medium text-neutral-800 mb-2">Food waste reduction tips</h4>
                  <ul className="list-disc pl-5 text-neutral-600">
                    <li className="mb-1">Plan meals to reduce excess food</li>
                    <li className="mb-1">Store food properly to extend freshness</li>
                    <li className="mb-1">Use leftovers creatively</li>
                    <li>Donate unexpired excess food to local food banks</li>
                  </ul>
                </div>
              </>
            )}
          </div>
        </div>
        
        {/* Donation Drive Banner */}
        {events.length > 0 && (
          <div className="mt-8 bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg shadow-md overflow-hidden text-white">
            <div className="p-6 md:flex items-center">
              <div className="md:flex-1">
                <h3 className="font-semibold text-xl mb-2">{events[0].title}</h3>
                <p className="mb-4">{events[0].description}</p>
                <div className="flex items-center">
                  <i className="fas fa-calendar-day mr-2"></i>
                  <span>{new Date(events[0].date).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}, {new Date(events[0].date).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}</span>
                </div>
                <div className="flex items-center mt-2">
                  <i className="fas fa-map-marker-alt mr-2"></i>
                  <span>{events[0].location}</span>
                </div>
              </div>
              <div className="mt-4 md:mt-0 md:ml-6">
                <Button className="bg-white text-primary-500 hover:bg-neutral-100">
                  RSVP Now
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Disposal Center Detail Dialog */}
      <Dialog open={showCenterDetails} onOpenChange={setShowCenterDetails}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedCenter?.name}</DialogTitle>
            <DialogDescription>
              {selectedCenter?.type.charAt(0).toUpperCase() + selectedCenter?.type.slice(1)} Disposal Center
            </DialogDescription>
          </DialogHeader>
          
          {selectedCenter && (
            <div className="space-y-4">
              {selectedCenter.image && (
                <img 
                  src={selectedCenter.image} 
                  alt={selectedCenter.name} 
                  className="w-full h-48 object-cover rounded-md"
                />
              )}
              
              <div>
                <h4 className="font-medium mb-1">Description</h4>
                <p className="text-neutral-600">{selectedCenter.description}</p>
              </div>
              
              <div>
                <h4 className="font-medium mb-1">Address</h4>
                <p className="text-neutral-600">{selectedCenter.address}</p>
              </div>
              
              <div>
                <h4 className="font-medium mb-1">Opening Hours</h4>
                <p className="text-neutral-600">{selectedCenter.openHours || "Contact for hours"}</p>
              </div>
              
              <div>
                <h4 className="font-medium mb-1">Accepted Items</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedCenter.acceptedItems && selectedCenter.acceptedItems.map((item, index) => (
                    <span key={index} className="bg-primary-100 text-primary-700 px-2 py-1 rounded-full text-xs">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
              
              {selectedCenter.contactInfo && (
                <div>
                  <h4 className="font-medium mb-1">Contact Information</h4>
                  <p className="text-neutral-600">{selectedCenter.contactInfo}</p>
                </div>
              )}
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setShowCenterDetails(false)}>
                  Close
                </Button>
                <Button onClick={() => handleDirectionsClick(selectedCenter)}>
                  <i className="fas fa-directions mr-2"></i>
                  Get Directions
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
