import { Card } from "../../components/ui/card";
import { Users, Target } from "lucide-react";

interface CampaignSummaryCardProps {
  title: string;
  description: string;
  organizerName: string;
  amountRaised: number;
  targetAmount: number;
  donorCount: number;
  imageUrl?: string;
}

export const CampaignSummaryCard = ({
  title,
  description,
  organizerName,
  amountRaised,
  targetAmount,
  donorCount,
  imageUrl,
}: CampaignSummaryCardProps) => {
  const progressPercentage = Math.min((amountRaised / targetAmount) * 100, 100);

  return (
    <Card className="overflow-hidden rounded-lg shadow-md hover:shadow-lg hover:scale-[1.02] transition-all duration-300 bg-card text-card-foreground ">
      {imageUrl && (
        <div className="h-48 overflow-hidden">
          <img 
            src={imageUrl} 
            alt={title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      
      <div className="p-6">
        <div className="mb-4">
          <h3 className="text-xl font-bold mb-2 line-clamp-1">{title}</h3>
          <p className="text-sm text-muted-foreground mb-2">by {organizerName}</p>
          <p className="text-sm text-foreground/80 line-clamp-2">{description}</p>
        </div>

        <div className="space-y-4">
          {/* Progress Section */}
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="font-semibold">
                ${amountRaised.toLocaleString()} raised
              </span>
              <span className="text-muted-foreground">
                of ${targetAmount.toLocaleString()}
              </span>
            </div>
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-[var(--color-accent)] transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>

          {/* Donors & Action */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>{donorCount} donors</span>
              </div>
              <div className="flex items-center gap-1">
                <Target className="w-4 h-4" />
                <span>{Math.round(progressPercentage)}%</span>
              </div>
            </div>
            
            <button className="bg-[var(--color-accent)] text-black font-medium text-sm px-2 py-2 rounded-full shadow-md hover:bg-primary/90 transition-colors duration-300 ">
              View Campaign
            </button>
          </div>
        </div>
      </div>
    </Card>
  );
};
