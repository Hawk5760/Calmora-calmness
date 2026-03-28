import { Card } from "@/components/ui/card";

export const CardSkeleton = ({ rows = 3 }: { rows?: number }) => (
  <Card className="p-5 bg-card/80 backdrop-blur-sm border-border/50 space-y-4 animate-pulse">
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg bg-muted" />
      <div className="h-4 w-32 rounded bg-muted" />
    </div>
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="h-12 rounded-xl bg-muted/50" />
    ))}
  </Card>
);

export const StatSkeleton = () => (
  <Card className="p-4 bg-card/80 backdrop-blur-sm border-border/50 animate-pulse text-center">
    <div className="w-9 h-9 rounded-lg bg-muted mx-auto mb-2" />
    <div className="h-6 w-12 rounded bg-muted mx-auto mb-1" />
    <div className="h-3 w-16 rounded bg-muted mx-auto" />
  </Card>
);
