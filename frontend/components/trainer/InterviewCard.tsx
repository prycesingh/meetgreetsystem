import { Calendar, User, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface InterviewCardProps {
  candidateName: string;
  date: string;
  onReview: () => void;
}

export function InterviewCard({ candidateName, date, onReview }: InterviewCardProps) {
  return (
    <div className="interview-card flex items-center justify-between hover:border-primary/50 transition-colors">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
          <User className="w-6 h-6 text-muted-foreground" />
        </div>
        <div>
          <h3 className="font-medium text-foreground">{candidateName}</h3>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>{date}</span>
          </div>
        </div>
      </div>
      <Button onClick={onReview} variant="outline" className="gap-2">
        Review
        <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  );
}
