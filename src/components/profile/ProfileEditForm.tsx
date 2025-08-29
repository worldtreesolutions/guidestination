
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { User, Phone } from "lucide-react";
import { Customer } from "@/services/customerService";
import { useLanguage } from "@/contexts/LanguageContext";

interface ProfileEditFormProps {
  customer: Customer;
  onUpdate: (customer: Customer) => void;
}

export default function ProfileEditForm({
  customer,
  onUpdate,
}: ProfileEditFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: customer.full_name || "",
    phone: customer.phone || "",
    email: customer.email || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const supabaseAny = supabase as any;
      const { data, error } = await supabaseAny
        .from("customers")
        .update({
          full_name: formData.full_name,
          phone: formData.phone,
          email: formData.email,
        })
        .eq("cus_id", user.id)
        .select()
        .single();

      if (error) throw error;

      toast({ title: t('profile.editForm.toast.updateSuccess') });
      if (data) {
        onUpdate(data as Customer);
      }
    } catch (error) {
      toast({
        title: t('profile.editForm.toast.updateError'),
        description: (error as Error).message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          {t('profile.editForm.title')}
        </CardTitle>
        <CardDescription>{t('profile.editForm.description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="full_name">{t('profile.editForm.fields.fullName')}</Label>
            <Input
              id="full_name"
              value={formData.full_name}
              onChange={(e) => handleChange("full_name", e.target.value)}
              placeholder={t('profile.editForm.placeholders.fullName')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">{t('profile.editForm.fields.email')}</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              placeholder={t('profile.editForm.placeholders.email')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              {t('profile.editForm.fields.phoneNumber')}
            </Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone || ""}
              onChange={(e) => handleChange("phone", e.target.value)}
              placeholder={t('profile.editForm.placeholders.phone')}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={loading}>
              {loading ? t('profile.editForm.buttons.saving') : t('profile.editForm.buttons.saveChanges')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
