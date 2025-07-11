import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Star } from "lucide-react"
import { Review } from "@/types/activity"

interface ActivityReviewsProps {
  reviews: Review[];
}

const ratingDistribution = [
  { stars: 5, percentage: 85 },
  { stars: 4, percentage: 10 },
  { stars: 3, percentage: 3 },
  { stars: 2, percentage: 1 },
  { stars: 1, percentage: 1 },
]

export function ActivityReviews({ reviews }: ActivityReviewsProps) {
  const [visibleReviews, setVisibleReviews] = useState(2)

  const showMoreReviews = () => {
    setVisibleReviews(reviews.length)
  }

  if (!reviews || reviews.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
            <span>
              0.0 (0 reviews)
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="text-center">
            <Button variant="outline" onClick={showMoreReviews}>
              Show all 0 reviews
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Ensure safe values with proper fallbacks
  const safeRating = typeof reviews[0].rating === 'number' && !isNaN(reviews[0].rating) && isFinite(reviews[0].rating) ? reviews[0].rating : 0;
  const safeReviewCount = typeof reviews.length === 'number' && !isNaN(reviews.length) && isFinite(reviews.length) ? reviews.length : 0;

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
          {reviews.slice(0, visibleReviews).map((review) => (
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

        {visibleReviews < reviews.length && (
          <div className="text-center">
            <Button variant="outline" onClick={showMoreReviews}>
              Show all {reviews.length} reviews
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
