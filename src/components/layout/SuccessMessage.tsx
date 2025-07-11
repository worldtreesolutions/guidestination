
import { CheckCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface SuccessMessageProps {
  title: string;
  message: string;
  onClose?: () => void;
  actionButton?: {
    text: string;
    onClick: () => void;
  };
}

export default function SuccessMessage({ 
  title, 
  message, 
  onClose, 
  actionButton 
}: SuccessMessageProps) {
  return (
    <Card className="border-green-200 bg-green-50">
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-green-900 mb-2">{title}</h3>
            <p className="text-green-800 mb-4">{message}</p>
            {actionButton && (
              <Button 
                onClick={actionButton.onClick}
                className="bg-green-600 hover:bg-green-700"
              >
                {actionButton.text}
              </Button>
            )}
          </div>
          {onClose && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-green-600 hover:text-green-800"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
