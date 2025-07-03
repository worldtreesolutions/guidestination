import { useRouter } from "next/router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { XCircle, ArrowLeft, Search } from "lucide-react";

export default function BookingCancelledPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
      <div className="max-w-md mx-auto px-4">
        <Card>
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
            <CardTitle className="text-2xl text-red-600">Booking Cancelled</CardTitle>
            <p className="text-gray-600">Your payment was cancelled and no charges were made.</p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h4 className="font-medium text-yellow-900 mb-2">What happened?</h4>
              <p className="text-yellow-800 text-sm">
                You cancelled the payment process before it was completed. 
                No charges have been made to your payment method.
              </p>
            </div>
            
            <div className="space-y-3">
              <Button 
                onClick={() => router.back()} 
                variant="outline" 
                className="w-full"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go Back to Activity
              </Button>
              
              <Button 
                onClick={() => router.push("/")} 
                className="w-full"
              >
                <Search className="w-4 h-4 mr-2" />
                Browse Other Activities
              </Button>
            </div>
            
            <div className="text-center text-sm text-gray-500">
              <p>Need help? Contact our support team</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}