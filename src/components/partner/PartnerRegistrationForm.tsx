
import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Check } from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"

const createFormSchema = (t: (key: string) => string) => z.object({
  businessName: z.string().min(2, t('form.validation.businessName')),
  businessType: z.string(),
  hotelLicenseNumber: z.string().min(1, t('partner.form.validation.hotelLicense')),
  tourismLicenseNumber: z.string().min(1, t('partner.form.validation.tourismLicense')),
  ownerName: z.string().min(2, t('form.validation.ownerName')),
  email: z.string().email(t('form.validation.email')),
  phone: z.string().min(10, t('form.validation.phone')),
  address: z.string().min(10, t('form.validation.address')),
  roomCount: z.string().min(1, t('partner.form.validation.roomCount')),
  taxId: z.string().min(13, t('form.validation.taxId')),
  bankName: z.string().min(2, t('partner.form.validation.bankName')),
  bankAccount: z.string().min(10, t('partner.form.validation.bankAccount')),
  termsAccepted: z.boolean().refine((val) => val === true, {
    message: t('form.validation.terms'),
  }),
  commissionPackage: z.enum(['basic', 'premium']),
})

export const PartnerRegistrationForm = () => {
  const { t } = useLanguage()
  const formSchema = createFormSchema(t)
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      termsAccepted: false,
    },
  })

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    console.log(values)
    // Handle form submission
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <h4 className="font-medium text-yellow-800 mb-2">{t('partner.form.legal.title')}</h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• {t('partner.form.legal.requirement1')}</li>
              <li>• {t('partner.form.legal.requirement2')}</li>
              <li>• {t('partner.form.legal.requirement3')}</li>
              <li>• {t('partner.form.legal.requirement4')}</li>
            </ul>
          </div>

          <h3 className="text-lg font-medium">{t('form.section.business')}</h3>
          <FormField
            control={form.control}
            name="businessName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('form.field.businessName')}</FormLabel>
                <FormControl>
                  <Input placeholder={t('partner.form.placeholder.businessName')} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="businessType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('form.field.businessType')}</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t('form.placeholder.businessType')} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="hotel">{t('partner.form.businessType.hotel')}</SelectItem>
                    <SelectItem value="resort">{t('partner.form.businessType.resort')}</SelectItem>
                    <SelectItem value="guesthouse">{t('partner.form.businessType.guesthouse')}</SelectItem>
                    <SelectItem value="airbnb">{t('partner.form.businessType.airbnb')}</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="hotelLicenseNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('partner.form.field.hotelLicense')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('partner.form.placeholder.hotelLicense')} {...field} />
                  </FormControl>
                  <FormDescription>
                    {t('partner.form.description.hotelLicense')}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tourismLicenseNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('partner.form.field.tourismLicense')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('partner.form.placeholder.tourismLicense')} {...field} />
                  </FormControl>
                  <FormDescription>
                    {t('partner.form.description.tourismLicense')}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="ownerName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('form.field.ownerName')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('form.placeholder.ownerName')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('form.field.email')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('form.placeholder.email')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('form.field.phone')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('form.placeholder.phone')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="roomCount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('partner.form.field.roomCount')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('partner.form.placeholder.roomCount')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('form.field.address')}</FormLabel>
                <FormControl>
                  <Textarea placeholder={t('form.placeholder.address')} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Separator />

        <div className="space-y-4">
          <h3 className="text-lg font-medium">{t('partner.form.section.commission')}</h3>
          
          <div className='grid md:grid-cols-2 gap-6'>
            <Card 
              className={`relative cursor-pointer transition-colors ${form.watch('commissionPackage') === 'basic' ? 'border-primary' : 'hover:border-primary/50'}`}
              onClick={() => form.setValue('commissionPackage', 'basic')}
            >
              <CardHeader>
                <CardTitle>{t('partner.form.package.basic.title')}</CardTitle>
                <CardDescription>
                  {t('partner.form.package.basic.description')}
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                <ul className='space-y-2 text-sm mb-12'>
                  <li className='flex items-center gap-2'>
                    <Check className='h-4 w-4 text-primary' />
                    {t('partner.form.package.basic.feature1')}
                  </li>
                  <li className='flex items-center gap-2'>
                    <Check className='h-4 w-4 text-primary' />
                    {t('partner.form.package.basic.feature2')}
                  </li>
                  <li className='flex items-center gap-2'>
                    <Check className='h-4 w-4 text-primary' />
                    {t('partner.form.package.basic.feature3')}
                  </li>
                  <li className='flex items-center gap-2'>
                    <Check className='h-4 w-4 text-primary' />
                    {t('partner.form.package.basic.feature4')}
                  </li>
                </ul>
                <div className='absolute bottom-4 left-4'>
                  <FormField
                    control={form.control}
                    name='commissionPackage'
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            value={field.value}
                          >
                            <div className='flex items-center space-x-2'>
                              <RadioGroupItem value='basic' id='basic' />
                              <Label htmlFor='basic'>{t('partner.form.package.basic.select')}</Label>
                            </div>
                          </RadioGroup>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            <Card 
              className={`relative cursor-pointer transition-colors ${form.watch('commissionPackage') === 'premium' ? 'border-primary' : 'hover:border-primary/50'}`}
              onClick={() => form.setValue('commissionPackage', 'premium')}
            >
              <div className='absolute -top-3 right-4 px-3 py-1 bg-primary text-primary-foreground text-sm rounded-full'>
                {t('partner.form.package.recommended')}
              </div>
              <CardHeader>
                <CardTitle>{t('partner.form.package.premium.title')}</CardTitle>
                <CardDescription>
                  {t('partner.form.package.premium.description')}
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                <ul className='space-y-2 text-sm mb-12'>
                  <li className='flex items-center gap-2'>
                    <Check className='h-4 w-4 text-primary' />
                    {t('partner.form.package.premium.feature1')}
                  </li>
                  <li className='flex items-center gap-2'>
                    <Check className='h-4 w-4 text-primary' />
                    {t('partner.form.package.premium.feature2')}
                  </li>
                  <li className='flex items-center gap-2'>
                    <Check className='h-4 w-4 text-primary' />
                    {t('partner.form.package.premium.feature3')}
                  </li>
                  <li className='flex items-center gap-2'>
                    <Check className='h-4 w-4 text-primary' />
                    {t('partner.form.package.premium.feature4')}
                  </li>
                </ul>
                <div className='absolute bottom-4 left-4'>
                  <FormField
                    control={form.control}
                    name='commissionPackage'
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            value={field.value}
                          >
                            <div className='flex items-center space-x-2'>
                              <RadioGroupItem value='premium' id='premium' />
                              <Label htmlFor='premium'>{t('partner.form.package.premium.select')}</Label>
                            </div>
                          </RadioGroup>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
            <h4 className="font-medium text-blue-800 mb-2">{t('partner.form.materials.title')}</h4>
            <p className="text-sm text-blue-700 mb-2">
              {t('partner.form.materials.description')}
            </p>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• {t('partner.form.materials.item1')}</li>
              <li>• {t('partner.form.materials.item2')}</li>
              <li>• {t('partner.form.materials.item3')}</li>
              <li>• {t('partner.form.materials.item4')}</li>
            </ul>
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <h3 className="text-lg font-medium">{t('partner.form.section.payment')}</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="taxId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('form.field.taxId')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('partner.form.placeholder.taxId')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="bankName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('partner.form.field.bankName')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('partner.form.placeholder.bankName')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="bankAccount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('partner.form.field.bankAccount')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('partner.form.placeholder.bankAccount')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
            <h4 className="font-medium text-blue-800 mb-2">{t('partner.form.commission.title')}</h4>
            <p className="text-sm text-blue-700 mb-2">
              {t('partner.form.commission.description')}
            </p>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• {t('partner.form.commission.basic')}</li>
              <li>• {t('partner.form.commission.premium')}</li>
              <li>• {t('partner.form.commission.monthly')}</li>
              <li>• {t('partner.form.commission.tracking')}</li>
            </ul>
          </div>

          <FormField
            control={form.control}
            name="termsAccepted"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>
                    {t('form.field.terms')}
                  </FormLabel>
                  <FormDescription>
                    {t('partner.form.terms.description')}
                  </FormDescription>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" className="w-full">
          {t('form.button.submit')}
        </Button>
      </form>
    </Form>
  )
}
