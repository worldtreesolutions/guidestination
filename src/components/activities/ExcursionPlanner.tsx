import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { WeeklyActivitySchedule } from "@/components/activities/WeeklyActivitySchedule"
import { SelectedActivitiesList } from "@/components/activities/SelectedActivitiesList"
import { BulkBookingWidget } from "@/components/activities/BulkBookingWidget"
import { usePlanning } from "@/contexts/PlanningContext"
import { DndContext, DragEndEvent, DragOverlay, useSensor, useSensors, PointerSensor, DragStartEvent } from "@dnd-kit/core"
import { useState } from "react"
import Image from "next/image"

export interface ScheduledActivity {
  id: string
  title: string
  imageUrl: string
  day: string
  hour: number
  duration: number
  price: number
  participants: number
  availableSlots?: {
    [key: string]: number[]
  }
}

export const ExcursionPlanner = () => {
  const { selectedActivities, scheduledActivities, updateActivity, removeActivity, clearActivities, scheduleActivity } = usePlanning()
  const [draggedActivity, setDraggedActivity] = useState<ScheduledActivity | null>(null)

  const sensors = useSensors(useSensor(PointerSensor, {
    activationConstraint: {
      distance: 8,
      delay: 0,
      tolerance: 0
    },
  }))

  const handleDragStart = (event: DragStartEvent) => {
    const activity = [...selectedActivities, ...scheduledActivities].find(
      a => a.id === event.active.id
    )
    if (activity) {
      setDraggedActivity(activity)
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const dragged = draggedActivity
    setDraggedActivity(null)
    
    if (!dragged || !event.over) return

    if (event.over.id === 'selected-list') {
      // Move activity back to selected list
      const activity = scheduledActivities.find(a => a.id === dragged.id)
      if (activity) {
        scheduleActivity(dragged.id, '', 0)
      }
      return
    }

    const [day, hour] = event.over.id.toString().split('-')
    const hourNum = parseInt(hour)
    const endHour = hourNum + dragged.duration

    // Only schedule if within time limits and no conflicts
    if (endHour <= 17) {
      scheduleActivity(dragged.id, day, hourNum)
    } else {
      // If invalid placement, ensure activity stays in its original list
      const activity = scheduledActivities.find(a => a.id === dragged.id)
      if (activity) {
        scheduleActivity(dragged.id, activity.day, activity.hour)
      }
    }
  }

  return (
    <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <Card>
          <CardHeader>
            <CardTitle className='text-2xl font-bold'>Mon Planning Excursion</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
              <div className='lg:col-span-2'>
                <WeeklyActivitySchedule
                  scheduledActivities={scheduledActivities}
                  draggedActivity={draggedActivity}
                  onActivitySelect={updateActivity}
                  onActivityRemove={removeActivity}
                />
              </div>
              <div className='space-y-6'>
                <SelectedActivitiesList
                  activities={selectedActivities}
                  onActivityRemove={removeActivity}
                />
                <BulkBookingWidget
                  activities={[...selectedActivities, ...scheduledActivities]}
                  onClearSelection={clearActivities}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <DragOverlay dropAnimation={null}>
          {draggedActivity && (
            <div className='relative w-[150px] h-[200px] rounded-lg overflow-hidden border-2 border-primary bg-white shadow-lg pointer-events-none'>
              <Image
                src={draggedActivity.imageUrl}
                alt={draggedActivity.title}
                fill
                className='object-cover'
              />
              <div className='absolute inset-0 bg-black/50'>
                <div className='p-3 text-white'>
                  <div className='font-medium text-sm line-clamp-2'>{draggedActivity.title}</div>
                  <div className='flex flex-col gap-1 mt-1'>
                    <div className='text-xs bg-black/30 rounded px-2 py-1 inline-block'>
                      {draggedActivity.duration}h
                    </div>
                    <div className='text-xs bg-black/30 rounded px-2 py-1 inline-block'>
                      ฿{draggedActivity.price.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </div>
  )
}