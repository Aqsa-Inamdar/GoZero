import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface CategoryFilterProps {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

export default function CategoryFilter({ 
  categories, 
  selectedCategory, 
  onSelectCategory 
}: CategoryFilterProps) {
  return (
    <div className="bg-white px-4 py-3 border-b border-neutral-200 overflow-x-auto hide-scrollbar">
      <ScrollArea className="whitespace-nowrap" orientation="horizontal">
        <div className="flex space-x-2">
          <button 
            onClick={() => onSelectCategory("All")}
            className={`whitespace-nowrap ${
              selectedCategory === "All" 
                ? "bg-primary-400 text-white" 
                : "bg-neutral-100 text-neutral-600"
            } px-4 py-2 rounded-full text-sm font-medium`}
          >
            All
          </button>
          
          {categories.map((category) => (
            <button 
              key={category}
              onClick={() => onSelectCategory(category)}
              className={`whitespace-nowrap ${
                selectedCategory === category 
                  ? "bg-primary-400 text-white" 
                  : "bg-neutral-100 text-neutral-600"
              } px-4 py-2 rounded-full text-sm font-medium`}
            >
              {category}
            </button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
