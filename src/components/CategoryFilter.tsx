
import { Button } from "@/components/ui/button";

interface CategoryFilterProps {
  categories: string[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

export default function CategoryFilter({ 
  categories, 
  activeCategory, 
  onCategoryChange 
}: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      <Button
        variant={activeCategory === "All Items" ? "default" : "outline"}
        className={`rounded-full ${
          activeCategory === "All Items" 
            ? "bg-brand-blue text-white" 
            : "bg-white text-text-dark hover:bg-gray-50"
        }`}
        onClick={() => onCategoryChange("All Items")}
      >
        All Items
      </Button>

      {categories.map((category) => (
        <Button
          key={category}
          variant={activeCategory === category ? "default" : "outline"}
          className={`rounded-full ${
            activeCategory === category 
              ? "bg-brand-blue text-white" 
              : "bg-white text-text-dark hover:bg-gray-50"
          }`}
          onClick={() => onCategoryChange(category)}
        >
          {category}
        </Button>
      ))}
    </div>
  );
}
