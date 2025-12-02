import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Progress } from "../../components/ui/progress";
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
  const progressPercentage = (amountRaised / targetAmount) * 100;

  return (
    <Card className="overflow-hidden card-elevated hover:scale-[1.02] transition-all duration-300">
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
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="font-semibold">
                ${amountRaised.toLocaleString()} raised
              </span>
              <span className="text-muted-foreground">
                of ${targetAmount.toLocaleString()}
              </span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>

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
            
            <Button size="sm" className="rounded-full">
              View Campaign
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};
