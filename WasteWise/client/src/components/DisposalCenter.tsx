import { DisposalCenter } from "@shared/schema";

interface DisposalCenterCardProps {
  center: DisposalCenter;
  onDetails: (center: DisposalCenter) => void;
  onDirections: (center: DisposalCenter) => void;
}

export default function DisposalCenterCard({ 
  center, 
  onDetails, 
  onDirections 
}: DisposalCenterCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <img 
        src={center.image || "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b"} 
        alt={center.name} 
        className="w-full h-40 object-cover"
      />
      <div className="p-4">
        <h3 className="font-semibold">{center.name}</h3>
        <div className="flex items-center text-sm text-neutral-500 mt-1">
          <i className="fas fa-map-marker-alt mr-1"></i>
          <span>{center.address}</span>
        </div>
        <div className="flex items-center text-sm text-neutral-500 mt-1">
          <i className="fas fa-clock mr-1"></i>
          <span>Open: {center.openHours || "Contact for hours"}</span>
        </div>
        
        <div className="flex flex-wrap items-center mt-2">
          {center.acceptedItems && center.acceptedItems.map((item, index) => (
            <span 
              key={index} 
              className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded-full mr-2 mb-1"
            >
              {item}
            </span>
          ))}
        </div>
        
        <div className="mt-4 flex justify-between">
          <button 
            onClick={() => onDetails(center)}
            className="text-primary-500 font-medium flex items-center"
          >
            <i className="fas fa-info-circle mr-1"></i>
            <span>Details</span>
          </button>
          <button 
            onClick={() => onDirections(center)}
            className="text-secondary-500 font-medium flex items-center"
          >
            <i className="fas fa-directions mr-1"></i>
            <span>Directions</span>
          </button>
        </div>
      </div>
    </div>
  );
}
