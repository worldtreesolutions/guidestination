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
            className="flex-shrink-0 text-gray-700 hover:text-black hover:bg-gray-100 border border-gray-200 rounded-full px-6"
          >
            {category}
          </Button>
        ))}
      </div>
    </div>
  );
}
