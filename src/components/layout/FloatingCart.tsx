import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";

export default function FloatingCart() {
  const { getTotalItems } = useCart();
  const router = useRouter();
  const totalItems = getTotalItems();
  const [isAnimating, setIsAnimating] = useState(false);
  const [prevTotalItems, setPrevTotalItems] = useState(0);

  // Animate when items are added to cart
  useEffect(() => {
    if (totalItems > prevTotalItems) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 600);
      return () => clearTimeout(timer);
    }
    setPrevTotalItems(totalItems);
  }, [totalItems, prevTotalItems]);

  const handleCartClick = () => {
    router.push('/cart');
  };

  // Don't show the floating cart if there are no items
  if (totalItems === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Button 
        onClick={handleCartClick}
        size="icon" 
        className={`
          rounded-full w-16 h-16 shadow-lg relative bg-blue-600 hover:bg-blue-700 
          transition-all duration-300 hover:scale-110 active:scale-95
          ${isAnimating ? 'animate-bounce scale-110' : ''}
        `}
      >
        <ShoppingCart className="h-7 w-7" />
        <span className={`
          absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full 
          h-7 w-7 flex items-center justify-center font-bold
          transition-all duration-300 border-2 border-white
          ${isAnimating ? 'animate-pulse scale-125' : ''}
        `}>
          {totalItems > 99 ? '99+' : totalItems}
        </span>
        
        {/* Pulse ring animation when items are added */}
        {isAnimating && (
          <div className="absolute inset-0 rounded-full bg-blue-400 opacity-30 animate-ping"></div>
        )}
      </Button>
    </div>
  );
}
