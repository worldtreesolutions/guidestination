import { useState } from 'react';
import { useCurrency } from '@/context/CurrencyContext';
import { formatCurrency } from '@/utils/currency';
import { useRouter } from 'next/router';
import { useCart } from '@/contexts/CartContext';
import Navbar from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, Plus, Minus, Calendar, Clock, Users, MapPin, ShoppingBag } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function CartPage() {
  const router = useRouter();
  const { items, removeFromCart, updateQuantity, clearCart, getTotalPrice, getTotalItems } = useCart();
  const [isLoading, setIsLoading] = useState(false);

  const { currency, convert } = useCurrency();

  const handleCheckout = async () => {
    if (items.length === 0) return;
    
    setIsLoading(true);
    
    // Store checkout data in localStorage for the checkout page to access
    const checkoutData = {
      items: items,
      totalPrice: getTotalPrice(),
      totalItems: getTotalItems(),
      timestamp: new Date().toISOString()
    };
    
    localStorage.setItem('checkout-data', JSON.stringify(checkoutData));
    
    console.log('Proceeding to checkout with items:', items);
    
    // Navigate to checkout summary
    setTimeout(() => {
      setIsLoading(false);
      router.push('/checkout/summary');
    }, 1000);
  };



  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-white rounded-lg shadow-sm p-8">
              <ShoppingBag className="h-24 w-24 text-gray-300 mx-auto mb-6" />
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h1>
              <p className="text-gray-600 mb-8">
                Start exploring our amazing activities and add them to your cart!
              </p>
              <Link href="/">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                  Browse Activities
                </Button>
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Shopping Cart</h1>
            <p className="text-gray-600">
              {getTotalItems()} {getTotalItems() === 1 ? 'item' : 'items'} in your cart
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <Card key={item.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex flex-col sm:flex-row">
                      {/* Activity Image */}
                      <div className="w-full sm:w-48 h-48 sm:h-auto relative bg-gray-200">
                        {item.activity.image_url ? (
                          <Image
                            src={Array.isArray(item.activity.image_url) ? item.activity.image_url[0] : item.activity.image_url}
                            alt={item.activity.title}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            No Image
                          </div>
                        )}
                      </div>

                      {/* Activity Details */}
                      <div className="flex-1 p-6">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4">
                          <div className="flex-1">
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                              {item.activity.title}
                            </h3>
                            
                            {/* Schedule Details */}
                            <div className="space-y-2 text-sm text-gray-600">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                <span>
                                  {new Date(item.schedule.scheduled_date).toLocaleDateString('en-US', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                  })}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                <span>{item.schedule.start_time} - {item.schedule.end_time}</span>
                              </div>
                              {item.activity.location && (
                                <div className="flex items-center gap-2">
                                  <MapPin className="h-4 w-4" />
                                  <span>{item.activity.location}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Remove Button */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFromCart(item.id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        {/* Quantity and Price */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <span className="text-sm text-gray-600">Quantity:</span>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                disabled={item.quantity <= 1}
                                className="h-8 w-8 p-0"
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                              <span className="font-semibold min-w-[2rem] text-center">
                                {item.quantity}
                              </span>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="h-8 w-8 p-0"
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              <Users className="h-3 w-3" />
                              <span>{item.quantity} {item.quantity === 1 ? 'person' : 'people'}</span>
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="text-sm text-gray-600">
                              {formatCurrency(
                                convert(
                                  item.schedule.price_override || item.activity.final_price || item.activity.b_price || 0,
                                  currency
                                ),
                                currency
                              )} per person
                            </div>
                            <div className="text-lg font-bold text-blue-600">
                              {formatCurrency(
                                convert(
                                  (item.schedule.price_override || item.activity.final_price || item.activity.b_price || 0) * item.quantity,
                                  currency
                                ),
                                currency
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Clear Cart Button */}
              <div className="pt-4">
                <Button
                  variant="outline"
                  onClick={clearCart}
                  className="text-red-500 border-red-200 hover:bg-red-50 hover:border-red-300"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear Cart
                </Button>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    {items.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span className="text-gray-600">
                          {item.activity.title.length > 25 
                            ? item.activity.title.substring(0, 25) + '...' 
                            : item.activity.title
                          } × {item.quantity}
                        </span>
                        <span className="font-medium">
                          {formatCurrency(
                            convert(
                              (item.schedule.price_override || item.activity.final_price || item.activity.b_price || 0) * item.quantity,
                              currency
                            ),
                            currency
                          )}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center text-lg font-bold">
                      <span>Total:</span>
                      <span className="text-blue-600">
                        {formatCurrency(
                          convert(getTotalPrice(), currency),
                          currency
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3 pt-4">
                    <Button
                      onClick={handleCheckout}
                      disabled={isLoading}
                      className="w-full bg-blue-600 hover:bg-blue-700 font-semibold py-3"
                    >
                      {isLoading ? 'Processing...' : 'Proceed to Checkout'}
                    </Button>
                    
                    <Link href="/">
                      <Button variant="outline" className="w-full">
                        Continue Shopping
                      </Button>
                    </Link>
                  </div>

                  <div className="text-xs text-gray-500 text-center pt-4 border-t">
                    <p>Secure checkout with SSL encryption</p>
                    <p>Free cancellation available</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
