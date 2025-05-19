
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
import { DashboardLayout } from "@/components/dashboard/layout/DashboardLayout"
import { useRouter } from "next/router"
import { useToast } from "@/hooks/use-toast"
import { formatCurrency } from "@/lib/utils"

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  price: z.number().min(0, "Price must be a positive number"),
  category: z.string().min(1, "Category is required"),
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

      // Your existing submission logic here
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
                    <Input placeholder="Enter description" {...field} />
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

            <Button type="submit">Create Activity</Button>
          </form>
        </Form>
      </div>
    </DashboardLayout>
  )
}
