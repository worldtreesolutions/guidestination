
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { WeeklyActivitySchedule } from "@/components/activities/WeeklyActivitySchedule"
import { MobileWeeklyActivitySchedule } from "@/components/activities/MobileWeeklyActivitySchedule"
import { SelectedActivitiesList } from "@/components/activities/SelectedActivitiesList"
import { BulkBookingWidget } from "@/components/activities/BulkBookingWidget"
import { usePlanning } from "@/contexts/PlanningContext"
import { DndContext, DragEndEvent, DragOverlay, useSensor, useSensors, PointerSensor, DragStartEvent } from "@dnd-kit/core"
import { useState, useCallback } from "react"
import Image from "next/image"
import { Calendar, Clock, MapPin, DollarSign, Menu } from "lucide-react"
import { useIsMobile } from "@/hooks/use-mobile"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

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
  const [isRemoving, setIsRemoving] = useState(false)
  const isMobile = useIsMobile()
  const [activeTab, setActiveTab] = useState<"calendar" | "activities">("calendar")

  const sensors = useSensors(useSensor(PointerSensor, {
    activationConstraint: {
      distance: isMobile ? 10 : 8,
      delay: isMobile ? 100 : 0,
      tolerance: isMobile ? 5 : 0
    },
  }))

  const handleDragStart = (event: DragStartEvent) => {
    // Don't start drag if we're in the process of removing an activity
    if (isRemoving) return
    
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
    
    // Don't process drag end if we're removing an activity
    if (isRemoving || !dragged || !event.over) return

    if (event.over.id === "selected-list") {
      // Move activity back to selected list
      const activity = scheduledActivities.find(a => a.id === dragged.id)
      if (activity) {
        scheduleActivity(dragged.id, "", 0)
      }
      return
    }

    const [day, hour] = event.over.id.toString().split("-")
    const hourNum = parseInt(hour)
    const endHour = hourNum + dragged.duration

    // Only schedule if within time limits and no conflicts
    if (endHour <= 17) {
      scheduleActivity(dragged.id, day, hourNum)
      
      // On mobile, switch to calendar view after dropping an activity
      if (isMobile) {
        setActiveTab("calendar")
      }
    } else {
      // If invalid placement, ensure activity stays in its original list
      const activity = scheduledActivities.find(a => a.id === dragged.id)
      if (activity) {
        scheduleActivity(dragged.id, activity.day, activity.hour)
      }
    }
  }

  // Enhanced removal handler that prevents drag operations during removal
  const handleActivityRemove = useCallback((activityId: string) => {
    // Set removing state to prevent drag operations
    setIsRemoving(true)
    
    // Remove the activity
    removeActivity(activityId)
    
    // Reset the removing state after a short delay
    setTimeout(() => {
      setIsRemoving(false)
    }, 100)
  }, [removeActivity])

  // Calculate total activities
  const totalActivities = selectedActivities.length + scheduledActivities.length

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="mb-4 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-primary">Mon Planning Excursion</h1>
          <p className="text-muted-foreground mt-2 text-sm sm:text-base">
            Organisez votre séjour en glissant-déposant les activités sur le calendrier
          </p>
        </div>

        {isMobile ? (
          // Mobile Layout
          <div className="space-y-4">
            {/* Mobile Navigation Tabs */}
            <div className="flex border-b border-gray-200">
              <button
                className={`flex-1 py-2 text-center font-medium ${
                  activeTab === "calendar" 
                    ? "text-primary border-b-2 border-primary" 
                    : "text-gray-500"
                }`}
                onClick={() => setActiveTab("calendar")}
              >
                <div className="flex items-center justify-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  Calendrier
                </div>
              </button>
              <button
                className={`flex-1 py-2 text-center font-medium ${
                  activeTab === "activities" 
                    ? "text-primary border-b-2 border-primary" 
                    : "text-gray-500"
                }`}
                onClick={() => setActiveTab("activities")}
              >
                <div className="flex items-center justify-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  Activités ({totalActivities})
                </div>
              </button>
            </div>

            {/* Mobile Calendar View */}
            {activeTab === "calendar" && (
              <Card className="border-primary/20 shadow-lg">
                <CardHeader className="pb-2 bg-primary/5 rounded-t-lg">
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2 text-primary" />
                    <CardTitle className="text-lg font-bold">Calendrier des Activités</CardTitle>
                  </div>
                  <CardDescription className="text-xs">
                    Glissez-déposez vos activités pour planifier votre semaine
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  <MobileWeeklyActivitySchedule
                    scheduledActivities={scheduledActivities}
                    draggedActivity={draggedActivity}
                    onActivitySelect={updateActivity}
                    onActivityRemove={handleActivityRemove}
                  />
                </CardContent>
              </Card>
            )}

            {/* Mobile Activities View */}
            {activeTab === "activities" && (
              <div className="space-y-4">
                <Card className="border-primary/20 shadow-lg">
                  <CardHeader className="pb-2 bg-primary/5 rounded-t-lg">
                    <div className="flex items-center">
                      <MapPin className="h-5 w-5 mr-2 text-primary" />
                      <CardTitle className="text-lg font-bold">Activités Sélectionnées</CardTitle>
                    </div>
                    <CardDescription className="text-xs">
                      {totalActivities} activité{totalActivities !== 1 ? 's' : ''} sélectionnée{totalActivities !== 1 ? 's' : ''}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <SelectedActivitiesList
                      activities={selectedActivities}
                      onActivityRemove={handleActivityRemove}
                    />
                  </CardContent>
                </Card>
                
                <Card className="border-primary/20 shadow-lg">
                  <CardHeader className="pb-2 bg-primary/5 rounded-t-lg">
                    <div className="flex items-center">
                      <DollarSign className="h-5 w-5 mr-2 text-primary" />
                      <CardTitle className="text-lg font-bold">Réservation</CardTitle>
                    </div>
                    <CardDescription className="text-xs">
                      Réservez toutes vos activités en un clic
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <BulkBookingWidget
                      activities={[...selectedActivities, ...scheduledActivities]}
                      onClearSelection={clearActivities}
                    />
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        ) : (
          // Desktop Layout
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card className="border-primary/20 shadow-lg">
                <CardHeader className="pb-2 bg-primary/5 rounded-t-lg">
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2 text-primary" />
                    <CardTitle className="text-xl font-bold">Calendrier des Activités</CardTitle>
                  </div>
                  <CardDescription>
                    Glissez-déposez vos activités pour planifier votre semaine
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  <WeeklyActivitySchedule
                    scheduledActivities={scheduledActivities}
                    draggedActivity={draggedActivity}
                    onActivitySelect={updateActivity}
                    onActivityRemove={handleActivityRemove}
                  />
                </CardContent>
              </Card>
            </div>
            
            <div className="space-y-6">
              <Card className="border-primary/20 shadow-lg">
                <CardHeader className="pb-2 bg-primary/5 rounded-t-lg">
                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 mr-2 text-primary" />
                    <CardTitle className="text-xl font-bold">Activités Sélectionnées</CardTitle>
                  </div>
                  <CardDescription>
                    {totalActivities} activité{totalActivities !== 1 ? 's' : ''} sélectionnée{totalActivities !== 1 ? 's' : ''}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  <SelectedActivitiesList
                    activities={selectedActivities}
                    onActivityRemove={handleActivityRemove}
                  />
                </CardContent>
              </Card>
              
              <Card className="border-primary/20 shadow-lg">
                <CardHeader className="pb-2 bg-primary/5 rounded-t-lg">
                  <div className="flex items-center">
                    <DollarSign className="h-5 w-5 mr-2 text-primary" />
                    <CardTitle className="text-xl font-bold">Réservation</CardTitle>
                  </div>
                  <CardDescription>
                    Réservez toutes vos activités en un clic
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  <BulkBookingWidget
                    activities={[...selectedActivities, ...scheduledActivities]}
                    onClearSelection={clearActivities}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        <DragOverlay dropAnimation={null}>
          {draggedActivity && !isRemoving && (
            <div className="relative w-[120px] h-[160px] sm:w-[150px] sm:h-[200px] rounded-lg overflow-hidden border-2 border-primary bg-white shadow-xl pointer-events-none">
              <Image
                src={draggedActivity.imageUrl}
                alt={draggedActivity.title}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/30">
                <div className="p-2 sm:p-3 text-white">
                  <div className="font-medium text-xs sm:text-sm line-clamp-2">{draggedActivity.title}</div>
                  <div className="flex flex-col gap-1 mt-1">
                    <div className="text-xs bg-primary/80 rounded-full px-2 py-1 inline-flex items-center gap-1 w-fit">
                      <Clock className="h-3 w-3" />
                      {draggedActivity.duration}h
                    </div>
                    <div className="text-xs bg-primary/80 rounded-full px-2 py-1 inline-flex items-center gap-1 w-fit">
                      <MapPin className="h-3 w-3" />
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
