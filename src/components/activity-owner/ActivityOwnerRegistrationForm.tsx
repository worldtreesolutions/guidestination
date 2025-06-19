import { useState, useCallback } from "react"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from '@/hooks/use-toast'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { InfoIcon, MapPin } from 'lucide-react'
import { PlacesAutocomplete, PlaceData } from "@/components/ui/places-autocomplete"
import { useLanguage } from "@/contexts/LanguageContext"
import FileUploader, { UploadedFile } from "@/components/ui/file-uploader"

const createFormSchema = (t: (key: string) => string) => z.object({
  businessName: z.string().min(2, t('form.validation.businessName')),
  ownerName: z.string().min(2, t('form.validation.ownerName')),
  email: z.string().email(t('form.validation.email')),
  phone: z.string().min(10, t('form.validation.phone')),
  businessType: z.string().min(1, t('form.validation.businessType')),
  taxId: z.string().min(13, t('form.validation.taxId')),
  address: z.string().min(10, t('form.validation.address')),
  description: z.string().min(50, t('form.validation.description')),
  tourismLicenseNumber: z.string().min(1, t('form.validation.tourismLicense')),
  tatLicenseNumber: z.string().optional(),
  guideCardNumber: z.string().optional(),
  insurancePolicy: z.string().min(1, t('form.validation.insurancePolicy')),
  insuranceAmount: z.string().min(1, t('form.validation.insuranceAmount')),
  termsAccepted: z.boolean().refine((val) => val === true, {
    message: t('form.validation.terms'),
  }),
})

export const ActivityOwnerRegistrationForm = () => {
  const { t } = useLanguage()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [registrationStatus, setRegistrationStatus] = useState<{
    type: 'success' | 'error' | 'info' | null;
    message: string | null;
    isNewUser?: boolean;
  }>({ type: null, message: null })
  const [locationData, setLocationData] = useState<PlaceData | null>(null)
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const { toast } = useToast()
  
  const formSchema = createFormSchema(t)
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      businessName: '',
      ownerName: '',
      email: '',
      phone: '',
      businessType: '',
      taxId: '',
      address: '',
      description: '',
      tourismLicenseNumber: '',
      tatLicenseNumber: '',
      guideCardNumber: '',
      insurancePolicy: '',
      insuranceAmount: '',
      termsAccepted: false,
    },
  })

  const handlePlaceSelect = useCallback((placeData: PlaceData) => {
    setLocationData(placeData)
    form.setValue('address', placeData.address, { shouldValidate: true, shouldDirty: true })
  }, [form])

  const handleFilesChange = useCallback((files: UploadedFile[]) => {
    setUploadedFiles(files)
  }, [])

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    setRegistrationStatus({ type: null, message: null });
    
    try {
      // Since the provider dashboard is separated, show info message
      setRegistrationStatus({
        type: 'info',
        message: t('form.info.providerDashboardSeparated') || 'Provider registration has been moved to a separate dashboard. Please contact support for provider registration.'
      });
      
      toast({
        title: t('form.info.title') || 'Information',
        description: t('form.info.providerDashboardSeparated') || 'Provider registration has been moved to a separate dashboard. Please contact support for provider registration.',
      });
      
    } catch (error) {
      let errorMessage = t('form.error.unexpected');
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null && 'message' in error) {
         errorMessage = (error as any).message;
      }
      
      setRegistrationStatus({
        type: 'error',
        message: errorMessage
      });
      
      toast({
        title: t('form.error.title'),
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
        {registrationStatus.type && registrationStatus.message && (
          <Alert variant={registrationStatus.type === 'error' ? 'destructive' : (registrationStatus.type === 'info' ? 'default' : 'default')} className={registrationStatus.type === 'success' ? 'border-green-500 bg-green-50' : (registrationStatus.type === 'info' ? 'border-blue-500 bg-blue-50' : '')}>
            <InfoIcon className={`h-4 w-4 ${registrationStatus.type === 'success' ? 'text-green-700' : (registrationStatus.type === 'info' ? 'text-blue-700' : '')}`} />
            <AlertTitle className={registrationStatus.type === 'success' ? 'text-green-800' : (registrationStatus.type === 'info' ? 'text-blue-800' : '')}>
              {registrationStatus.type === 'success' 
                ? t('form.success.title')
                : registrationStatus.type === 'info' 
                  ? t('form.info.title')
                  : t('form.error.title')}
            </AlertTitle>
            <AlertDescription className={registrationStatus.type === 'success' ? 'text-green-700' : (registrationStatus.type === 'info' ? 'text-blue-700' : '')}>
              {registrationStatus.message}
            </AlertDescription>
          </Alert>
        )}
        
        <div className='space-y-4'>
          <div className='bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6'>
            <h4 className='font-medium text-yellow-800 mb-2'>{t('form.legal.title')}</h4>
            <ul className='text-sm text-yellow-700 space-y-1'>
              <li>• {t('form.legal.requirement1')}</li>
              <li>• {t('form.legal.requirement2')}</li>
              <li>• {t('form.legal.requirement3')}</li>
              <li>• {t('form.legal.requirement4')}</li>
            </ul>
          </div>

          <h3 className='text-lg font-medium'>{t('form.section.business')}</h3>
          <FormField
            control={form.control}
            name='businessName'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('form.field.businessName')}</FormLabel>
                <FormControl>
                  <Input placeholder={t('form.placeholder.businessName')} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='businessType'
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
                    <SelectItem value='tour_operator'>{t('form.businessType.tourOperator')}</SelectItem>
                    <SelectItem value='activity_provider'>{t('form.businessType.activityProvider')}</SelectItem>
                    <SelectItem value='experience_host'>{t('form.businessType.experienceHost')}</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
           <FormField
            control={form.control}
            name='taxId'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('form.field.taxId')}</FormLabel>
                <FormControl>
                  <Input placeholder={t('form.placeholder.taxId')} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className='grid md:grid-cols-2 gap-4'>
            <FormField
              control={form.control}
              name='tourismLicenseNumber'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('form.field.tourismLicense')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('form.placeholder.tourismLicense')} {...field} />
                  </FormControl>
                  <FormDescription>
                    {t('form.description.tourismLicense')}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='tatLicenseNumber'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('form.field.tatLicense')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('form.placeholder.tatLicense')} {...field} />
                  </FormControl>
                  <FormDescription>
                    {t('form.description.tatLicense')}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
           <FormField
            control={form.control}
            name='description'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('form.field.description')}</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder={t('form.placeholder.description')}
                    className='min-h-[120px]'
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Separator />

        <div className='space-y-4'>
          <h3 className='text-lg font-medium'>{t('form.section.contact')}</h3>
          <div className='grid md:grid-cols-2 gap-4'>
            <FormField
              control={form.control}
              name='ownerName'
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
              name='email'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('form.field.email')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('form.placeholder.email')} type='email' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name='phone'
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
            name='address'
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center">
                  {t('form.field.address')} <MapPin className="ml-1 h-4 w-4 text-muted-foreground" />
                </FormLabel>
                <FormControl>
                  <PlacesAutocomplete 
                    value={field.value}
                    onChange={field.onChange}
                    onPlaceSelect={handlePlaceSelect}
                    placeholder={t('form.placeholder.address')}
                    disabled={isSubmitting}
                  />
                </FormControl>
                {locationData && (
                  <FormDescription>
                    {t('form.description.coordinates')}: {locationData.lat.toFixed(6)}, {locationData.lng.toFixed(6)}
                  </FormDescription>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Separator />

        <div className='space-y-4'>
          <h3 className='text-lg font-medium'>{t('form.section.legal')}</h3>
          <div className='grid md:grid-cols-2 gap-4'>
            <FormField
              control={form.control}
              name='insurancePolicy'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('form.field.insurancePolicy')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('form.placeholder.insurancePolicy')} {...field} />
                  </FormControl>
                  <FormDescription>
                    {t('form.description.insurancePolicy')}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='insuranceAmount'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('form.field.insuranceAmount')}</FormLabel>
                  <FormControl>
                    <Input type='number' placeholder={t('form.placeholder.insuranceAmount')} {...field} />
                  </FormControl>
                  <FormDescription>
                    {t('form.description.insuranceAmount')}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name='guideCardNumber'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('form.field.guideCard')}</FormLabel>
                <FormControl>
                  <Input placeholder={t('form.placeholder.guideCard')} {...field} />
                </FormControl>
                <FormDescription>
                  {t('form.description.guideCard')}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className='bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4'>
            <h4 className='font-medium text-blue-800 mb-2'>{t('form.compliance.title')}</h4>
            <p className='text-sm text-blue-700'>
              {t('form.compliance.description')}
            </p>
          </div>

          <FileUploader
            onFilesChange={handleFilesChange}
            maxFiles={10}
            maxSize={15 * 1024 * 1024} // 15MB
            acceptedFileTypes={[".pdf", ".jpg", ".jpeg", ".png", ".doc", ".docx"]}
            label={t('form.field.supportingDocuments') || "Supporting Documents"}
            description={t('form.description.supportingDocuments') || "Upload insurance documents, licenses, certifications, and other required paperwork (PDF, JPG, PNG, DOC, DOCX - Max 15MB each)"}
            disabled={isSubmitting}
          />

          <FormField
            control={form.control}
            name='termsAccepted'
            render={({ field }) => (
              <FormItem className='flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow'>
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    id='terms'
                  />
                </FormControl>
                <div className='space-y-1 leading-none'>
                  <FormLabel htmlFor='terms'>
                    {t('form.field.terms')}
                  </FormLabel>
                  <FormDescription>
                    {t('form.description.terms')}
                  </FormDescription>
                   <FormMessage />
                </div>
              </FormItem>
            )}
          />
        </div>

        <div className='flex flex-col gap-4 pt-4'>
          <Button type='submit' className='w-full' disabled={isSubmitting}>
            {isSubmitting ? t('form.button.submitting') : t('form.button.submit')}
          </Button>
        </div>
      </form>
    </Form>
  )
}
