import { InterviewCard } from "@/components/trainer/InterviewCard";
import { ScoreInput } from "@/components/trainer/ScoreInput";
import { VideoPlayer } from "@/components/trainer/VideoPlayer";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { mockInterviews, mockQuestions } from "@/utils/mockQuestions";
import { ArrowLeft, Send, Users } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface ReviewData {
  questionId: number;
  scores: {
    grammar: number;
    fluency: number;
    relevance: number;
    expression: number;
  };
  comment: string;
}

const TrainerDashboard = () => {
  const { toast } = useToast();
  const [selectedInterview, setSelectedInterview] = useState<string | null>(
    null,
  );
  const [reviews, setReviews] = useState<Record<number, ReviewData>>({});

  const interview = selectedInterview
    ? mockInterviews.find((i) => i.id === selectedInterview)
    : null;

  const handleScoreChange = (
    questionId: number,
    category: keyof ReviewData["scores"],
    value: number,
  ) => {
    setReviews((prev) => ({
      ...prev,
      [questionId]: {
        questionId,
        scores: {
          ...(prev[questionId]?.scores || {
            grammar: 5,
            fluency: 5,
            relevance: 5,
            expression: 5,
          }),
          [category]: value,
        },
        comment: prev[questionId]?.comment || "",
      },
    }));
  };

  const handleCommentChange = (questionId: number, comment: string) => {
    setReviews((prev) => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        questionId,
        scores: prev[questionId]?.scores || {
          grammar: 5,
          fluency: 5,
          relevance: 5,
          expression: 5,
        },
        comment,
      },
    }));
  };

  const handleSubmitReview = () => {
    // Mock API call
    toast({
      title: "Review Submitted",
      description: `Review for ${interview?.candidateName} has been saved successfully.`,
    });
    setSelectedInterview(null);
    setReviews({});
  };

  if (selectedInterview && interview) {
    return (
      <div className="min-h-screen bg-background p-4 lg:p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <header className="flex items-center gap-4 mb-8">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSelectedInterview(null)}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {interview.candidateName}
              </h1>
              <p className="text-sm text-muted-foreground">{interview.date}</p>
            </div>
          </header>

          {/* Question Reviews */}
          <div className="space-y-8">
            {mockQuestions.map((question, index) => (
              <div key={question.id} className="interview-card">
                <div className="mb-4">
                  <span className="text-sm font-medium text-primary">
                    Question {index + 1} of {mockQuestions.length}
                  </span>
                  <p className="text-foreground mt-2">{question.text}</p>
                </div>

                <div className="grid lg:grid-cols-2 gap-6">
                  {/* Video Player */}
                  <VideoPlayer questionNumber={index + 1} />

                  {/* Scoring */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-foreground">
                      Evaluation Scores (0-10)
                    </h4>
                    <div className="interview-card p-4">
                      <ScoreInput
                        label="Grammar"
                        value={reviews[question.id]?.scores.grammar ?? 5}
                        onChange={(v) =>
                          handleScoreChange(question.id, "grammar", v)
                        }
                      />
                      <ScoreInput
                        label="Fluency"
                        value={reviews[question.id]?.scores.fluency ?? 5}
                        onChange={(v) =>
                          handleScoreChange(question.id, "fluency", v)
                        }
                      />
                      <ScoreInput
                        label="Relevance"
                        value={reviews[question.id]?.scores.relevance ?? 5}
                        onChange={(v) =>
                          handleScoreChange(question.id, "relevance", v)
                        }
                      />
                      <ScoreInput
                        label="Expression"
                        value={reviews[question.id]?.scores.expression ?? 5}
                        onChange={(v) =>
                          handleScoreChange(question.id, "expression", v)
                        }
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">
                        Comments
                      </label>
                      <Textarea
                        placeholder="Add your feedback for this response..."
                        value={reviews[question.id]?.comment || ""}
                        onChange={(e) =>
                          handleCommentChange(question.id, e.target.value)
                        }
                        className="min-h-25 bg-card border-border"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Submit Button */}
          <div className="sticky bottom-4 mt-8">
            <Button
              onClick={handleSubmitReview}
              size="lg"
              className="w-full h-14 text-lg font-semibold bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
            >
              <Send className="w-5 h-5" />
              Submit Review
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/" className="variant-ghost size-icon">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Trainer Dashboard
              </h1>
              <p className="text-sm text-muted-foreground">
                Review candidate interviews
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-card rounded-lg border border-border">
            <Users className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-foreground">
              {mockInterviews.length} Interviews
            </span>
          </div>
        </header>

        {/* Interview List */}
        <div className="space-y-4">
          {mockInterviews.map((interview) => (
            <InterviewCard
              key={interview.id}
              candidateName={interview.candidateName}
              date={interview.date}
              onReview={() => setSelectedInterview(interview.id)}
            />
          ))}
        </div>

        {mockInterviews.length === 0 && (
          <div className="text-center py-16">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              No Interviews Yet
            </h3>
            <p className="text-muted-foreground">
              Completed interviews will appear here for review.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrainerDashboard;
