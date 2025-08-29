import { ActivityWithDetails } from "@/types/activity";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle, MapPin, Users, Clock, Minus, Plus, ShoppingCart } from "lucide-react";
import { useState } from "react";
import { useCurrency } from "@/context/CurrencyContext";
import { formatCurrency } from "@/utils/currency";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

interface ActivityDetailsProps {
  activity: ActivityWithDetails;
  selectedSchedule?: any;
  onBookNow?: (quantity: number) => void;
  onAddToCart?: (quantity: number) => void;
}

const ListItem = ({ children }: { children: React.ReactNode }) => (
  <li className="flex items-start">
    <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-1 flex-shrink-0" />
    <span>{children}</span>
  </li>
);

const NotIncludedListItem = ({ children }: { children: React.ReactNode }) => (
    <li className="flex items-start">
        <XCircle className="h-5 w-5 text-red-500 mr-3 mt-1 flex-shrink-0" />
        <span>{children}</span>
    </li>
);

const parseStringToArray = (value: any): string[] => {
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') {
        try {
            const parsed = JSON.parse(value);
            if (Array.isArray(parsed)) return parsed;
        } catch (e) {
            // First try splitting by newlines, then by commas as fallback
            if (value.includes('\n')) {
                return value.split('\n').map(item => item.trim()).filter(Boolean);
            }
            return value.split(',').map(item => item.trim()).filter(Boolean);
        }
    }
    return [];
};

export function ActivityDetails({ activity, selectedSchedule, onBookNow, onAddToCart }: ActivityDetailsProps) {
  const { t } = useLanguage();
  const { currency, convert } = useCurrency();
  // Debugging: log currency and conversion results
  const debugRawPrice = Number(selectedSchedule?.price_override || activity.final_price || 0);
  const debugConverted = convert(debugRawPrice, currency);
  if (typeof window !== 'undefined') {
    console.log('[ActivityDetails] currency:', currency);
    console.log('[ActivityDetails] rawPrice:', debugRawPrice);
    console.log('[ActivityDetails] converted:', debugConverted);
  }
  const [quantity, setQuantity] = useState(1);


  const highlights = parseStringToArray(activity.highlights);
  const included = parseStringToArray(activity.included);
  const notIncluded = parseStringToArray(activity.not_included);
  const dynamicHighlights = parseStringToArray(activity.dynamic_highlights);
  const dynamicIncluded = parseStringToArray(activity.dynamic_included);
  const dynamicNotIncluded = parseStringToArray(activity.dynamic_not_included);

  const allHighlights = [...highlights, ...dynamicHighlights];
  const allIncluded = [...included, ...dynamicIncluded];
  const allNotIncluded = [...notIncluded, ...dynamicNotIncluded];

  const handleQuantityChange = (change: number) => {
    const newQuantity = quantity + change;
    const maxParticipants = activity.max_participants || 10;
    const availableSpots = selectedSchedule?.available_spots || maxParticipants;
    if (newQuantity >= 1 && newQuantity <= Math.min(maxParticipants, availableSpots)) {
      setQuantity(newQuantity);
    }
  };

  const getTotalPrice = () => {
    const price = selectedSchedule?.price_override || activity.final_price || 0;
    return Math.ceil(price * quantity);
  };

  return (
    <div className="space-y-8 py-8">
      {/* Activity Description and Locations Section */}
      <Card>
        <CardHeader>
          <CardTitle>{activity.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{activity.description ? activity.description : <span className="italic text-gray-400">Not Specified</span>}</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
            <div className="bg-white border rounded-lg p-4">
              <div className="font-semibold text-sm text-gray-600 mb-1">Meeting Location</div>
              <div className="text-gray-800 text-sm">
                {activity.meeting_point ? activity.meeting_point.replace(/_/g, ' ') : <span className="italic text-gray-400">Not Specified</span>}
              </div>
            </div>
            <div className="bg-white border rounded-lg p-4">
              <div className="font-semibold text-sm text-gray-600 mb-1">Pick Up Location</div>
              <div className="text-gray-800 text-sm">
                {activity.pickup_location_formatted_address ? activity.pickup_location_formatted_address.replace(/_/g, ' ') : <span className="italic text-gray-400">Not Specified</span>}
              </div>
            </div>
            <div className="bg-white border rounded-lg p-4">
              <div className="font-semibold text-sm text-gray-600 mb-1">Drop Off Location</div>
              <div className="text-gray-800 text-sm">
                {activity.dropoff_location_formatted_address ? activity.dropoff_location_formatted_address.replace(/_/g, ' ') : <span className="italic text-gray-400">Not Specified</span>}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Booking Controls - Only show when a date is selected */}
      {selectedSchedule && (
        <Card className="sticky top-4 z-10 bg-white shadow-lg border-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">{t('activity.details.bookThisActivity')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="text-sm text-gray-600">{t('activity.details.selectedDateTime')}</div>
              <div className="font-semibold">
                {new Date(selectedSchedule.scheduled_date).toLocaleDateString('en-US', { 
                  weekday: 'short', 
                  month: 'short', 
                  day: 'numeric' 
                })} at {selectedSchedule.start_time} - {selectedSchedule.end_time}
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-sm text-gray-600">{t('activity.details.numberOfParticipants')}</div>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                  className="h-8 w-8 p-0"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="font-semibold text-lg min-w-[2rem] text-center">{quantity}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuantityChange(1)}
                  disabled={quantity >= Math.min(activity.max_participants || 10, selectedSchedule.available_spots || 10)}
                  className="h-8 w-8 p-0"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="text-xs text-gray-500">
                {t('activity.details.maxParticipants')}: {Math.min(activity.max_participants || 10, selectedSchedule.available_spots || 10)} {t('activity.details.participants')}
              </div>
            </div>
            <div className="border-t pt-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">{t('activity.details.pricePerPerson')}:</span>
                <span className="font-semibold">
                  {formatCurrency(
                    convert(Number(selectedSchedule?.price_override || activity.final_price || 0), currency),
                    currency
                  )}
                  {/* Debug: [cur: {currency}, raw: {debugRawPrice}, conv: {debugConverted}] */}
                </span>
              </div>
              <div className="flex justify-between items-center text-lg font-bold">
                <span>{t('activity.details.totalPrice')}:</span>
                <span className="text-blue-600">
                  {formatCurrency(
                    convert(Number(getTotalPrice()), currency),
                    currency
                  )}
                  {/* Debug: [cur: {currency}] */}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <Button 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3"
                onClick={() => onBookNow?.(quantity)}
              >
                {t('activity.details.bookNow')}
              </Button>
              <Button 
                variant="outline" 
                className="w-full border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold py-3"
                onClick={() => onAddToCart?.(quantity)}
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                {t('activity.details.addToCart')}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
