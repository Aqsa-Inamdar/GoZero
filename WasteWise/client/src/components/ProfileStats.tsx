import { User } from "@shared/schema";

interface ProfileStatsProps {
  user: User;
}

export default function ProfileStats({ user }: ProfileStatsProps) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
      <div className="p-4 border-b border-neutral-200">
        <h3 className="font-semibold">Your Environmental Impact</h3>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3">
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto text-primary-500">
              <i className="fas fa-utensils"></i>
            </div>
            <p className="font-bold text-xl mt-2">{user.itemsShared}</p>
            <p className="text-neutral-600 text-sm">Items Shared</p>
          </div>
          <div className="text-center p-3">
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto text-primary-500">
              <i className="fas fa-recycle"></i>
            </div>
            <p className="font-bold text-xl mt-2">{user.itemsRecycled}</p>
            <p className="text-neutral-600 text-sm">Items Recycled</p>
          </div>
          <div className="text-center p-3">
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto text-primary-500">
              <i className="fas fa-hand-holding-heart"></i>
            </div>
            <p className="font-bold text-xl mt-2">{user.donationsMade}</p>
            <p className="text-neutral-600 text-sm">Donations Made</p>
          </div>
          <div className="text-center p-3">
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto text-primary-500">
              <i className="fas fa-seedling"></i>
            </div>
            <p className="font-bold text-xl mt-2">{user.co2Saved.toFixed(1)} kg</p>
            <p className="text-neutral-600 text-sm">CO₂ Saved</p>
          </div>
        </div>
      </div>
    </div>
  );
}
