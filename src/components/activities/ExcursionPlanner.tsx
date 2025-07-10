
import { useState, useMemo, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { usePlanning } from "@/contexts/PlanningContext"
import { SupabaseActivity, ScheduledActivity } from "@/types/activity"
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent, Active, Over } from "@dnd-kit/core"
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical, Trash2 } from "lucide-react"
import Image from "next/image"
import { WeeklyActivitySchedule } from "./WeeklyActivitySchedule"
import { MobileWeeklyActivitySchedule } from "./MobileWeeklyActivitySchedule"
import { useIsMobile } from "@/hooks/use-mobile"

interface ExcursionPlannerProps {
  activities: SupabaseActivity[]
  onPlanComplete: (plan: any) => void
}

function SortableActivityItem({ activity, onRemove }: { activity: SupabaseActivity; onRemove: (id: number) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: activity.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} className="flex items-center gap-4 p-2 bg-white rounded-lg shadow">
      <button {...listeners} className="cursor-grab">
        <GripVertical className="h-5 w-5 text-gray-400" />
      </button>
      <Image
        src={activity.image_url || "/placeholder.jpg"}
        alt={activity.title}
        width={64}
        height={64}
        className="rounded-md object-cover"
      />
      <div className="flex-grow">
        <h4 className="font-semibold">{activity.title}</h4>
        <p className="text-sm text-gray-500">{activity.category_name}</p>
      </div>
      <Button variant="ghost" size="icon" onClick={() => onRemove(activity.id)}>
        <Trash2 className="h-4 w-4 text-red-500" />
      </Button>
    </div>
  )
}

export function ExcursionPlanner({ activities, onPlanComplete }: ExcursionPlannerProps) {
  const {
    selectedActivities,
    scheduledActivities,
    addActivity,
    removeActivity,
    scheduleActivity,
    updateScheduledActivity,
    isActivitySelected,
  } = usePlanning()

  const [editingActivity, setEditingActivity] = useState<ScheduledActivity | null>(null)
  const [draggedActivity, setDraggedActivity] = useState<ScheduledActivity | null>(null)
  const isMobile = useIsMobile()

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  const handleDragStart = (event: any) => {
    const { active } = event;
    const activity = scheduledActivities.find(a => a.id === active.id);
    if (activity) {
      setDraggedActivity(activity);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setDraggedActivity(null);

    if (over && over.data.current) {
      const { day, hour } = over.data.current;
      if (day && typeof hour === 'number') {
        scheduleActivity(active.id as number, day, hour);
        return;
      }
    }
    
    if (active.id !== over?.id) {
      const oldIndex = selectedActivities.findIndex(a => a.id === active.id)
      const newIndex = selectedActivities.findIndex(a => a.id === over?.id)
      if (oldIndex !== -1 && newIndex !== -1) {
        // This part needs to update the context state, which is complex.
        console.log(`Move activity from index ${oldIndex} to ${newIndex}`)
      }
    }
  }

  const availableActivities = useMemo(() => {
    return activities.filter(activity => !isActivitySelected(activity.id))
  }, [activities, isActivitySelected])

  return (
    <DndContext 
      sensors={sensors} 
      collisionDetection={closestCenter} 
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="container mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Panel: Activity Selection */}
          <div className="lg:col-span-1 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Available Activities</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 max-h-96 overflow-y-auto">
                {availableActivities.map(activity => (
                  <div key={activity.id} className="flex items-center justify-between p-2 border rounded-lg">
                    <span>{activity.title}</span>
                    <Button size="sm" onClick={() => addActivity(activity)}>
                      Add
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Selected for Planning</CardTitle>
              </CardHeader>
              <CardContent>
                <SortableContext items={selectedActivities.map(a => a.id)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-2">
                    {selectedActivities.map(activity => (
                      <SortableActivityItem key={activity.id} activity={activity} onRemove={removeActivity} />
                    ))}
                  </div>
                </SortableContext>
                {selectedActivities.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">No activities selected yet.</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Panel: Weekly Schedule */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Weekly Excursion Plan</CardTitle>
              </CardHeader>
              <CardContent>
                {isMobile ? (
                  <MobileWeeklyActivitySchedule
                    scheduledActivities={scheduledActivities}
                    draggedActivity={draggedActivity}
                    onActivityClick={(activity: ScheduledActivity) => setEditingActivity(activity)}
                    onActivityRemove={(id) => removeActivity(Number(id))}
                  />
                ) : (
                  <WeeklyActivitySchedule
                    scheduledActivities={scheduledActivities}
                    draggedActivity={draggedActivity}
                    onActivityClick={(activity: ScheduledActivity) => setEditingActivity(activity)}
                    onActivityRemove={(id) => removeActivity(Number(id))}
                  />
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DndContext>
  )
}
  