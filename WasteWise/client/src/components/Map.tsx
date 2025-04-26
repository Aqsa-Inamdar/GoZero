import { useEffect, useRef } from "react";
import { DisposalCenter } from "@shared/schema";
import L from "leaflet";

interface MapProps {
  centers: DisposalCenter[];
  onCenterClick: (center: DisposalCenter) => void;
}

export default function Map({ centers, onCenterClick }: MapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!mapContainerRef.current) return;
    
    // Initialize map if it doesn't exist
    if (!mapRef.current) {
      mapRef.current = L.map(mapContainerRef.current).setView([37.7749, -122.4194], 12);
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(mapRef.current);
    }
    
    // Clear existing markers
    mapRef.current.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        mapRef.current?.removeLayer(layer);
      }
    });
    
    // Add markers for centers
    const markers: L.Marker[] = [];
    centers.forEach(center => {
      const marker = L.marker([center.latitude, center.longitude])
        .addTo(mapRef.current!)
        .bindPopup(center.name)
        .on('click', () => onCenterClick(center));
      
      markers.push(marker);
    });
    
    // Adjust view to fit all markers if we have any
    if (markers.length > 0) {
      const group = new L.FeatureGroup(markers);
      mapRef.current.fitBounds(group.getBounds(), { padding: [30, 30] });
    }
    
    // Cleanup
    return () => {
      // We don't destroy the map here to prevent re-initialization issues
      // It will be cleaned up when the component unmounts
    };
  }, [centers, onCenterClick]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);
  
  return (
    <div className="h-64 md:h-96 relative w-full">
      <div ref={mapContainerRef} className="w-full h-full" />
    </div>
  );
}
