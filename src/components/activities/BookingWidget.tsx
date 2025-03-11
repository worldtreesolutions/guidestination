import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendlyIntegration } from './CalendlyIntegration'

export const BookingWidget = () => {
  const [participants, setParticipants] = useState('1')

  return (
    <Card className='sticky top-24'>
      <CardContent className='p-6'>
        <div className='flex justify-between items-center mb-6'>
          <div className='text-sm text-muted-foreground'>From</div>
          <div className='text-2xl font-bold'>฿1,442</div>
        </div>

        <div className='space-y-4'>
          <div>
            <label className='text-sm font-medium mb-2 block'>
              Select participants
            </label>
            <Select value={participants} onValueChange={setParticipants}>
              <SelectTrigger>
                <SelectValue placeholder='Select participants' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='1'>1 Adult</SelectItem>
                <SelectItem value='2'>2 Adults</SelectItem>
                <SelectItem value='3'>3 Adults</SelectItem>
                <SelectItem value='4'>4 Adults</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button 
            className='w-full' 
            size='lg'
          >
            Check availability
          </Button>
        </div>

        <div className='mt-6 pt-6 border-t space-y-4'>
          <div className='flex items-center gap-2'>
            <span className='text-sm'>★ 4.4</span>
            <span className='text-sm text-muted-foreground'>(4888 reviews)</span>
          </div>

          <div className='text-sm text-muted-foreground'>
            Free cancellation up to 24 hours before the activity starts
          </div>
        </div>
      </CardContent>
    </Card>
  )
}