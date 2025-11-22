import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface LineItem {
  description: string;
  quantity: number;
  unit_price: string;
  total: string;
}

interface LineItemsTableProps {
  items: LineItem[];
}

export const LineItemsTable = ({ items }: LineItemsTableProps) => {
  if (!items || items.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Line Items</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No line items available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Line Items</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[200px]">Description</TableHead>
                <TableHead className="min-w-[100px]">Quantity</TableHead>
                <TableHead className="min-w-[100px]">Unit Price</TableHead>
                <TableHead className="min-w-[100px]">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item, i) => (
                <TableRow key={i}>
                  <TableCell className="font-medium">{item.description}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell className="whitespace-nowrap">{item.unit_price}</TableCell>
                  <TableCell className="whitespace-nowrap">{item.total}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
