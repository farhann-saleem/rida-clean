import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DocumentSummaryCardProps {
  summary: string | null;
}

export const DocumentSummaryCard = ({ summary }: DocumentSummaryCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {summary || "No summary available"}
        </p>
      </CardContent>
    </Card>
  );
};
