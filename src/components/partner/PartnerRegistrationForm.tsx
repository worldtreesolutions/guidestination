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
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import FileUploader, { UploadedFile } from "@/components/ui/file-uploader"
import { PlacesAutocomplete } from "@/components/ui/places-autocomplete"
import { Check, FileText } from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"
import partnerService from "@/services/partnerService"
import uploadService from "@/services/uploadService"

const createFormSchema = (t: (key: string) => string) => z.object({
  businessName: z.string().min(2, t('form.validation.businessName')),
  ownerName: z.string().min(2, t('form.validation.ownerName')),
  email: z.string().email(t('form.validation.email')),
  phone: z.string().min(10, t('form.validation.phone')),
  address: z.string().min(10, t('form.validation.address')),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  placeId: z.string().optional(),
  supportingDocuments: z.array(z.any()).optional(),
  termsAccepted: z.boolean().refine((val) => val === true, {
    message: t('form.validation.terms'),
  }),
  commissionPackage: z.enum(['basic', 'premium']),
})

export const PartnerRegistrationForm = () => {
  const { t } = useLanguage()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [uploadProgress, setUploadProgress] = useState<string>("")
  const formSchema = createFormSchema(t)
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      termsAccepted: false,
      supportingDocuments: [],
      commissionPackage: 'premium',
    },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true)
    setUploadProgress("Starting submission...")
    
    try {
      let documentUrls: string[] = []
      
      // Upload supporting documents to Supabase CDN if any files are selected
      if (uploadedFiles.length > 0) {
        setUploadProgress("Uploading documents...")
        
        // Convert UploadedFile objects to File objects for upload
        const filesToUpload: File[] = []
        for (const uploadedFile of uploadedFiles) {
          // Check if the uploadedFile has the actual File object
          if (uploadedFile instanceof File) {
            filesToUpload.push(uploadedFile)
          } else if ('file' in uploadedFile && uploadedFile.file instanceof File) {
            filesToUpload.push(uploadedFile.file)
          } else {
            // Create a File object from the UploadedFile data if needed
            try {
              const response = await fetch(uploadedFile.url || uploadedFile.name)
              const blob = await response.blob()
              const file = new File([blob], uploadedFile.name, { type: uploadedFile.type })
              filesToUpload.push(file)
            } catch (error) {
              console.error(`Failed to process file ${uploadedFile.name}:`, error)
              throw new Error(`Failed to process file: ${uploadedFile.name}`)
            }
          }
        }
        
        // Generate unique partner ID for document organization
        const partnerId = `partner_${Date.now()}_${Math.random().toString(36).substring(2)}`
        
        // Upload to Supabase storage with CDN URLs
        documentUrls = await uploadService.uploadPartnerDocuments(filesToUpload, partnerId)
        
        if (documentUrls.length !== filesToUpload.length) {
          const failedCount = filesToUpload.length - documentUrls.length
          throw new Error(`${failedCount} document(s) failed to upload. Please try again.`)
        }
        
        setUploadProgress("Documents uploaded successfully to Supabase CDN!")
      }

      setUploadProgress("Creating partner registration...")

      // Create partner registration with user creation and email verification
      const registrationData = {
        business_name: values.businessName,
        owner_name: values.ownerName,
        email: values.email,
        phone: values.phone,
        address: values.address,
        latitude: values.latitude,
        longitude: values.longitude,
        place_id: values.placeId,
        commission_package: values.commissionPackage,
        supporting_documents: documentUrls,
      }

      const result = await partnerService.createPartnerRegistration(registrationData)
      
      setUploadProgress("Registration completed successfully!")
      
      // Show success message with email verification info
      alert(`${t('partner.form.success.message')}

${result.message}

Documents uploaded to Supabase CDN: ${documentUrls.length} files
CDN URLs generated for secure access and fast delivery.`)
      
      // Reset form
      form.reset()
      setUploadedFiles([])
      setUploadProgress("")
      
    } catch (error: any) {
      console.error('Error submitting partner registration:', error)
      setUploadProgress("")
      
      // Handle specific error cases
      if (error.message?.includes('User already registered')) {
        alert(t('form.error.accountExists'))
      } else if (error.message?.includes('Invalid email')) {
        alert(t('form.validation.email'))
      } else if (error.message?.includes('upload') || error.message?.includes('Failed to process file')) {
        alert(`Upload Error: ${error.message}`)
      } else {
        alert(t('partner.form.error.message'))
      }
    } finally {
      setIsSubmitting(false)
      setUploadProgress("")
    }
  }

  const handleFileUpload = (files: UploadedFile[]) => {
    setUploadedFiles(files)
    form.setValue('supportingDocuments', files)
  }

  const handlePlaceSelect = (placeData: PlaceData) => {
    if (placeData) {
      form.setValue('address', placeData.address)
      form.setValue('latitude', placeData.lat)
      form.setValue('longitude', placeData.lng)
      form.setValue('placeId', placeData.placeId)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {uploadProgress && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-800 font-medium">{uploadProgress}</p>
          </div>
        )}
        
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
                <FormLabel>Business Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your business name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

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

          <div className="grid md:grid-cols-1 gap-4">
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
          </div>

          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Business Address</FormLabel>
                <FormControl>
                  <PlacesAutocomplete
                    value={field.value || ""}
                    onChange={field.onChange}
                    onPlaceSelect={handlePlaceSelect}
                    placeholder="Enter business address"
                  />
                </FormControl>
                <FormDescription>
                  Please provide the complete address of your business
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Separator />

        <div className="space-y-4">
          <h3 className="text-lg font-medium">{t('partner.form.section.documents')}</h3>
          
          <FormField
            control={form.control}
            name="supportingDocuments"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('partner.form.field.supportingDocuments')}</FormLabel>
                <FormControl>
                  <FileUploader
                    onFilesChange={handleFileUpload}
                    maxFiles={5}
                    maxSize={10 * 1024 * 1024}
                    acceptedFileTypes={['.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx']}
                    label={t('partner.form.field.supportingDocuments')}
                    description="Upload documents - Business license, tax registration, hotel registration, etc. (PDF, JPG, PNG, DOC, DOCX - Max 10MB each)"
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-medium text-green-800 mb-2 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              {t('partner.form.documents.title')}
            </h4>
            <p className="text-sm text-green-700 mb-2">
              Files will be securely uploaded to Supabase CDN with fast global delivery. {t('partner.form.documents.description')}
            </p>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• {t('partner.form.documents.item1')}</li>
              <li>• {t('partner.form.documents.item2')}</li>
              <li>• {t('partner.form.documents.item3')}</li>
              <li>• {t('partner.form.documents.item4')}</li>
              <li>• CDN-enabled for fast, secure access worldwide</li>
            </ul>
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <h3 className="text-lg font-medium">{t('partner.form.section.commission')}</h3>
          
          <div className='grid md:grid-cols-2 gap-6'>
            {/* 
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
            */}

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

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (uploadProgress || t('form.button.submitting')) : t('form.button.submit')}
        </Button>
      </form>
    </Form>
  )
}
