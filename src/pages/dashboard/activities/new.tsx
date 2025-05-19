
import { useState, useEffect } from "react"
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
import { DashboardLayout } from "@/components/dashboard/layout/DashboardLayout"
import { useRouter } from "next/router"
import { useToast } from "@/hooks/use-toast"
import { formatCurrency } from "@/lib/utils"
import { supabase } from "@/integrations/supabase/client"

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  price: z.number().min(0, "Price must be a positive number"),
  category: z.string().min(1, "Category is required"),
  duration: z.number().min(0, "Duration must be a positive number").optional(),
  max_participants: z.number().min(1, "Maximum participants must be at least 1").optional(),
  min_participants: z.number().min(1, "Minimum participants must be at least 1").optional(),
  includes_hotel_pickup: z.boolean().optional(),
  language: z.string().optional(),
  meeting_point: z.string().optional(),
  highlights: z.string().array().optional(),
  included: z.string().array().optional(),
  not_included: z.string().array().optional(),
})

export default function NewActivityPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [finalPrice, setFinalPrice] = useState<number>(0)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      category: "",
      duration: undefined,
      max_participants: undefined,
      min_participants: undefined,
      includes_hotel_pickup: false,
      language: "",
      meeting_point: "",
      highlights: [],
      included: [],
      not_included: [],
    },
  })

  // Calculate final price whenever price changes
  useEffect(() => {
    const price = form.watch("price")
    if (price) {
      // Add 20% markup
      const withMarkup = price * 1.2
      // Add 7% VAT
      const withVAT = withMarkup * 1.07
      setFinalPrice(withVAT)
    } else {
      setFinalPrice(0)
    }
  }, [form.watch("price")])

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      // Include final price in the submission
      const dataToSubmit = {
        ...values,
        final_price: finalPrice,
      }

      const { error } = await supabase
        .from("activities")
        .insert([dataToSubmit])

      if (error) throw error

      toast({
        title: "Success",
        description: "Activity created successfully",
      })
      router.push("/dashboard/activities")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create activity",
        variant: "destructive",
      })
    }
  }

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto py-10">
        <h1 className="text-2xl font-bold mb-6">Create New Activity</h1>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Activity Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter activity name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter description"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price per Person (THB)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormItem>
                <FormLabel>Final Price (with 20% markup + 7% VAT)</FormLabel>
                <Input
                  type="text"
                  value={formatCurrency(finalPrice)}
                  disabled
                  className="bg-muted"
                />
                <FormDescription>
                  Automatically calculated based on price per person
                </FormDescription>
              </FormItem>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration (hours)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.5"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter category" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="min_participants"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Minimum Participants</FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="max_participants"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Maximum Participants</FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="language"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Language</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter language(s)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="meeting_point"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meeting Point</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter meeting point" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit">Create Activity</Button>
          </form>
        </Form>
      </div>
    </DashboardLayout>
  )
}
