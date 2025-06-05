
    export const convertDurationStringToHours = (durationString: string | null | undefined): number | null => {
      if (!durationString) return null;
      switch (durationString) {
        case "1_hour": return 1;
        case "2_hours": return 2;
        case "half_day": return 4;
        case "full_day": return 8;
        default:
          // Try to parse if it's already a number string like "3"
          const numericDuration = parseInt(durationString, 10);
          return !isNaN(numericDuration) ? numericDuration : null;
      }
    };
    
    export const toTimestamp = (timeString: string): string => {
      const today = new Date();
      const [hours, minutes] = timeString.split(':');
      today.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
      return today.toISOString(); // Format as 'YYYY-MM-DDTHH:mm:ss.sssZ'
    };
  