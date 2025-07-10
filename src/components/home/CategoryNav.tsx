import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { categoryService, Category } from "@/services/categoryService";
import { useLanguage } from "@/contexts/LanguageContext";

interface CategoryNavProps {
  selectedCategory: string | null;
  onSelectCategory: (categoryName: string | null) => void;
}

export function CategoryNav({ selectedCategory, onSelectCategory }: CategoryNavProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const { t } = useLanguage();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const fetchedCategories = await categoryService.getAllCategories();
        setCategories(fetchedCategories);
      } catch (error) {
        console.error("Failed to fetch categories", error);
      }
    };
    fetchCategories();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center w-full overflow-x-auto">
      <div className="flex flex-wrap justify-center gap-2 sm:gap-3 max-w-4xl mx-auto">
        <Button
          variant={!selectedCategory ? "default" : "outline"}
          className="whitespace-nowrap text-xs sm:text-sm px-2 sm:px-4 h-8 sm:h-10"
          onClick={() => onSelectCategory(null)}
        >
          {t("category.all")}
        </Button>
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={selectedCategory === category.name ? "default" : "outline"}
            className="whitespace-nowrap text-xs sm:text-sm px-2 sm:px-4 h-8 sm:h-10"
            onClick={() => onSelectCategory(category.name)}
          >
            {t(`category.${category.name.toLowerCase()}`, category.name)}
          </Button>
        ))}
      </div>
    </div>
  );
}
