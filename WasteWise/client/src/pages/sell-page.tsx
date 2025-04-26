import ItemForm from "@/components/ItemForm";

export default function SellPage() {
  return (
    <div id="sell-view">
      <div className="bg-white shadow-sm p-4 sticky top-0 z-10">
        <h2 className="text-xl font-semibold">Sell or Share</h2>
      </div>
      
      <div className="p-4 md:p-8 max-w-2xl mx-auto">
        <ItemForm />
      </div>
    </div>
  );
}
