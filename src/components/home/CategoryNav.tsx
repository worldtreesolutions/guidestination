import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { categoryService, Category } from "@/services/categoryService";

interface CategoryNavProps {
  onCategorySelect?: (categoryId: number | null) => void;
  selectedCategoryId?: number | null;
}

export default function CategoryNav({ onCategorySelect, selectedCategoryId }: CategoryNavProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await categoryService.getAllCategories();
        setCategories(data);
      } catch (err) {
        console.error("Error fetching categories:", err);
        setError("Failed to load categories");
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleCategoryClick = (categoryId: number | null) => {
    if (onCategorySelect) {
      onCategorySelect(categoryId);
    }
  };

  if (loading) {
    return (
      <div className="px-4 md:px-8 lg:px-12 py-6">
        <div className="flex overflow-x-auto space-x-4 scrollbar-hide">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="flex-shrink-0 h-10 w-24 bg-gray-200 rounded-full animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 md:px-8 lg:px-12 py-6">
        <p className="text-red-500 text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="px-4 md:px-8 lg:px-12 py-6">
      <div className="flex overflow-x-auto space-x-4 scrollbar-hide">
        <Button
          key="all"
          variant="ghost"
          className={`flex-shrink-0 text-gray-700 hover:text-black hover:bg-gray-100 border border-gray-200 rounded-full px-6 ${
            selectedCategoryId === null ? 'bg-gray-100 text-black' : ''
          }`}
          onClick={() => handleCategoryClick(null)}
        >
          All
        </Button>
        {categories.map((category) => (
          <Button
            key={category.id}
            variant="ghost"
            className={`flex-shrink-0 text-gray-700 hover:text-black hover:bg-gray-100 border border-gray-200 rounded-full px-6 ${
              selectedCategoryId === category.id ? 'bg-gray-100 text-black' : ''
            }`}
            onClick={() => handleCategoryClick(category.id)}
          >
            {category.name}
          </Button>
        ))}
      </div>
    </div>
  );
}
