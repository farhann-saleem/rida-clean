import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DocumentDetailsCardProps {
  extractedData: Record<string, any> | null;
}

export const DocumentDetailsCard = ({ extractedData }: DocumentDetailsCardProps) => {
  if (!extractedData || Object.keys(extractedData).length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Key Details</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No extracted data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Key Details</CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="space-y-3">
          {Object.entries(extractedData).map(([key, value]) => (
            <div key={key} className="flex flex-col gap-1 border-b pb-3 last:border-0 sm:flex-row sm:justify-between">
              <dt className="text-sm font-medium capitalize">{key.replace(/_/g, " ")}</dt>
              <dd className="text-sm text-muted-foreground">{String(value)}</dd>
            </div>
          ))}
        </dl>
      </CardContent>
    </Card>
  );
};
