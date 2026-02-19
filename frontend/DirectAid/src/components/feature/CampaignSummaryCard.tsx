import { Card } from "../../components/ui/card";
import { Users, MapPin, Clock, Heart, ChevronRight } from "lucide-react";
import { Button } from "../ui/Button";

interface CampaignSummaryCardProps {
  id: string;
  title: string;
  description: string;
  organizerName: string;
  amountRaised: number;
  targetAmount: number;
  donorCount: number;
  category: string;
  location: string;
  deadline: string;
  imageUrl?: string;
  onClick?: () => void;
  onDonate?: (e: React.MouseEvent) => void;
}

export const CampaignSummaryCard = ({
  id: _id,
  title,
  description,
  organizerName,
  amountRaised,
  targetAmount,
  donorCount,
  category,
  location,
  deadline,
  imageUrl,
  onClick,
  onDonate,
}: CampaignSummaryCardProps) => {
  const progressPercentage = Math.min((amountRaised / targetAmount) * 100, 100);

  const daysLeft = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  return (
    <Card
      className="overflow-hidden border border-white/10 glass-morphism hover:glass-morphism-strong group transition-all duration-500 flex flex-col h-full"
      onClick={onClick}
    >
      {/* Visual Header */}
      <div className="relative h-48 overflow-hidden bg-muted flex items-center justify-center">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10">
            <Heart className="w-16 h-16 text-primary opacity-20 transition-transform duration-500 group-hover:scale-125" />
          </div>
        )}

        {/* Badges Over Image */}
        <div className="absolute top-4 left-4 flex flex-wrap gap-2">
          <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-black/60 backdrop-blur-md text-primary border border-primary/30">
            {category}
          </span>
        </div>

        <div className="absolute bottom-4 right-4 animate-pulse-slow">
          <div className="bg-primary/20 backdrop-blur-md rounded-full px-3 py-1 border border-primary/40 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(0,255,255,0.8)]" />
            <span className="text-[10px] font-bold text-white uppercase tracking-widest">Live</span>
          </div>
        </div>
      </div>

      <div className="p-6 flex flex-col flex-1">
        {/* Content Section */}
        <div className="flex-1">
          <h3 className="text-xl font-bold mb-2 line-clamp-1 group-hover:text-primary transition-colors duration-300">
            {title}
          </h3>
          <p className="text-xs text-muted-foreground mb-3 flex items-center gap-1 font-medium italic">
            by {organizerName}
          </p>
          <p className="text-sm text-foreground/70 line-clamp-2 mb-4 h-10">
            {description}
          </p>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="flex items-center gap-2 text-xs text-muted-foreground/80">
              <MapPin className="w-3.5 h-3.5 text-primary/70" />
              <span className="truncate">{location}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground/80 justify-end">
              <Clock className="w-3.5 h-3.5 text-primary/70" />
              <span>{daysLeft(deadline)} days left</span>
            </div>
          </div>
        </div>

        {/* Progress Section */}
        <div className="space-y-3 mb-6">
          <div className="flex justify-between items-end">
            <div className="space-y-0.5">
              <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Raised</p>
              <p className="text-lg font-bold text-white">${amountRaised.toLocaleString()}</p>
            </div>
            <div className="text-right space-y-0.5">
              <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Goal</p>
              <p className="text-sm font-semibold opacity-80">${targetAmount.toLocaleString()}</p>
            </div>
          </div>

          <div className="relative group/progress">
            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary via-accent to-primary-foreground transition-all duration-1000 ease-out shadow-[0_0_12px_rgba(0,255,255,0.3)]"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <div
              className="absolute -top-7 px-2 py-0.5 rounded bg-primary text-[10px] font-bold text-black opacity-0 group-hover/progress:opacity-100 transition-opacity duration-300 pointer-events-none"
              style={{ left: `calc(${progressPercentage}% - 12px)` }}
            >
              {Math.round(progressPercentage)}%
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-auto">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
            <Users className="w-4 h-4" />
            <span>{donorCount} Donors</span>
          </div>

          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="hidden sm:flex rounded-full px-4 border border-white/10 hover:border-primary/50 hover:bg-primary/5 text-xs"
              onClick={onClick}
            >
              Details
            </Button>
            <Button
              className="rounded-full px-5 btn-cta h-9 flex items-center gap-1.5 group/btn"
              onClick={onDonate}
            >
              <span>Donate</span>
              <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-1" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};
