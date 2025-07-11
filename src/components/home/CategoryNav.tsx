
import { Button } from "@/components/ui/button";

const categories = [
  "All",
  "Adventure",
  "Cultural",
  "Food & Drink",
  "Nature",
  "Water Sports",
  "City Tours",
  "Nightlife",
  "Wellness",
  "Family"
];

export default function CategoryNav() {
  return (
    <div className="px-4 md:px-8 lg:px-12 py-6">
      <div className="flex overflow-x-auto space-x-4 scrollbar-hide">
        {categories.map((category) => (
          <Button
            key={category}
            variant="ghost"
            className="flex-shrink-0 text-white hover:text-gray-300 hover:bg-gray-800/50 border border-gray-600 rounded-full px-6"
          >
            {category}
          </Button>
        ))}
      </div>
    </div>
  );
}
