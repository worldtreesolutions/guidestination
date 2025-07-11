import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Star } from "lucide-react"

interface ActivityReviewsProps {
  activityId: string
  rating: number
  reviewCount: number
}

const mockReviews = [
  {
    id: "rev-1",
    author: "Emily R.",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    date: "May 2025",
    rating: 5,
    text: "Absolutely amazing experience! The views from Doi Suthep were breathtaking, and our guide was so knowledgeable. The Hmong village visit was a real cultural immersion. Highly recommended!",
  },
  {
    id: "rev-2",
    author: "John D.",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    date: "April 2025",
    rating: 4,
    text: "A great half-day tour. Well-organized and informative. The temple is beautiful, but can be crowded. The lunch provided was delicious. Good value for money.",
  },
  {
    id: "rev-3",
    author: "Maria S.",
    avatar: "https://randomuser.me/api/portraits/women/65.jpg",
    date: "April 2025",
    rating: 5,
    text: "I loved this tour! Our guide, 'Sunny', was fantastic and made the trip so much fun. Learning about the local traditions was the highlight for me. Don't miss this if you're in Chiang Mai.",
  },
]

const ratingDistribution = [
  { stars: 5, percentage: 85 },
  { stars: 4, percentage: 10 },
  { stars: 3, percentage: 3 },
  { stars: 2, percentage: 1 },
  { stars: 1, percentage: 1 },
]

export function ActivityReviews({
  activityId,
  rating,
  reviewCount,
}: ActivityReviewsProps) {
  const [visibleReviews, setVisibleReviews] = useState(2)

  const showMoreReviews = () => {
    setVisibleReviews(mockReviews.length)
  }

  // Provide default values to prevent undefined errors
  const safeRating = rating || 0;
  const safeReviewCount = reviewCount || 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
          <span>
            {safeRating.toFixed(1)} ({safeReviewCount} reviews)
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Rating Distribution */}
        <div className="space-y-2">
          {ratingDistribution.map((item) => (
            <div key={item.stars} className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground w-12">
                {item.stars} star{item.stars > 1 ? "s" : ""}
              </span>
              <Progress value={item.percentage} className="flex-1" />
              <span className="text-sm text-muted-foreground w-8 text-right">
                {item.percentage}%
              </span>
            </div>
          ))}
        </div>

        {/* Individual Reviews */}
        <div className="space-y-6">
          {mockReviews.slice(0, visibleReviews).map((review) => (
            <div key={review.id} className="flex items-start gap-4">
              <Avatar>
                <AvatarImage src={review.avatar} alt={review.author} />
                <AvatarFallback>
                  {review.author.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{review.author}</p>
                    <p className="text-sm text-muted-foreground">
                      {review.date}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < review.rating
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-muted-foreground"
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <p className="mt-2 text-muted-foreground">{review.text}</p>
              </div>
            </div>
          ))}
        </div>

        {visibleReviews < mockReviews.length && (
          <div className="text-center">
            <Button variant="outline" onClick={showMoreReviews}>
              Show all {mockReviews.length} reviews
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
