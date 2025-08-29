import { useState } from 'react';
import { useCurrency } from '@/context/CurrencyContext';
import { formatCurrency } from '@/utils/currency';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ShoppingCart, Plus, Minus, Trash2, X } from 'lucide-react';
import { useRouter } from 'next/router';
import Image from 'next/image';

export function CartDrawer() {
  const router = useRouter();
  const { items, removeFromCart, updateQuantity, getTotalItems, getTotalPrice } = useCart();
  const { currency, convert } = useCurrency();
  const [isOpen, setIsOpen] = useState(false);

  // Use global currency and conversion
  const formatPrice = (priceTHB: number) => {
    return formatCurrency(convert(priceTHB, currency), currency);
  };

  const handleViewCart = () => {
    setIsOpen(false);
    router.push('/cart');
  };

  const handleCheckout = () => {
    setIsOpen(false);
    router.push('/checkout');
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="relative"
        >
          <ShoppingCart className="h-4 w-4 mr-2" />
          Cart
          {getTotalItems() > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {getTotalItems()}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between">
            <span>Shopping Cart ({getTotalItems()})</span>
          </SheetTitle>
        </SheetHeader>
        
        <div className="mt-6 flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <ShoppingCart className="h-16 w-16 text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg">Your cart is empty</p>
              <p className="text-gray-400 text-sm">Add some activities to get started!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="border rounded-lg p-4">
                  <div className="flex gap-3">
                    {/* Activity Image */}
                    <div className="w-16 h-16 relative bg-gray-200 rounded-md overflow-hidden flex-shrink-0">
                      {(() => {
                        const imageUrl = item.activity.image_url as any;
                        const firstImage = Array.isArray(imageUrl) 
                          ? (imageUrl.length > 0 ? imageUrl[0] : null)
                          : imageUrl;
                        
                        return firstImage ? (
                          <Image
                            src={firstImage}
                            alt={item.activity.title}
                            fill
                            className="object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "/placeholder-activity.jpg";
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                            No Image
                          </div>
                        );
                      })()}
                    </div>

                    {/* Activity Details */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate">
                        {item.activity.title}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(item.schedule.scheduled_date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric'
                        })} • {item.schedule.start_time}
                      </p>
                      
                      {/* Quantity Controls */}
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className="h-6 w-6 p-0"
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="text-sm font-medium min-w-[1.5rem] text-center">
                            {item.quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="h-6 w-6 p-0"
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFromCart(item.id)}
                          className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                      
                      {/* Price */}
                      <div className="text-right mt-1">
                        <span className="text-sm font-semibold text-blue-600">
                          {formatPrice(
                            (item.schedule.price_override || item.activity.final_price || item.activity.b_price || 0) * item.quantity
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Cart Footer */}
        {items.length > 0 && (
          <div className="border-t pt-4 mt-6 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold">Total:</span>
              <span className="text-lg font-bold text-blue-600">
                {formatPrice(getTotalPrice())}
              </span>
            </div>
            
            <div className="space-y-2">
              <Button 
                onClick={handleCheckout}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Checkout
              </Button>
              <Button 
                onClick={handleViewCart}
                variant="outline" 
                className="w-full"
              >
                View Full Cart
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
