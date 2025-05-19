
// Previous file content remains the same, just adding the final price field in the Pricing section
// Only showing the modified section for brevity:

            {/* Pricing */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Pricing</h2>
              
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
                    value={`${finalPrice} THB`}
                    disabled
                    className="bg-muted"
                  />
                  <FormDescription>
                    Automatically calculated based on price per person
                  </FormDescription>
                </FormItem>
              </div>
            </div>

// Rest of the file remains unchanged
