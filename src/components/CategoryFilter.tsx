import { Button } from "@/components/ui/button";
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
  
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
        {t('categories.allItems')}
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
          {t(`categories.${category.toLowerCase().replace(/[\s&]+/g, '')}`, {defaultValue: category})}
        </Button>
      ))}
    </div>
  );
}
