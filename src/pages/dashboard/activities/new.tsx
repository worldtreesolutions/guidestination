{ // Add type 'FormValues' to the data parameter
    if (!user) return

    setIsSubmitting(true)
... existing code ...
      // Calculate finalPrice (example: basePrice + 20% commission)
      // This logic might belong in the service or backend ideally
      const finalPrice = data.basePrice * 1.2; // Use 'data' instead of 'FormValues'
      const creationData = { ...activityData, finalPrice };

      await activityService.createActivity(creationData as Partial<Activity>); // Cast as Partial<Activity> for service
... existing code ...
"></update_file_sections>