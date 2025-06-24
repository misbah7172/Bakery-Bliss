import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, TrendingUp, Package, Clock } from "lucide-react";
import { format } from "date-fns";

interface EarningsBreakdown {
  orderId: number;
  amount: string;
  percentage: string;
  bakerType: string;
  createdAt: string;
  orderNumber: string;
  orderTotal: string;
}

interface EarningsData {
  bakerId: number;
  totalEarnings: number;
  earningsBreakdown: EarningsBreakdown[];
}

export default function BakerEarnings() {
  const { data: earnings, isLoading } = useQuery<EarningsData>({
    queryKey: ["/api/my-earnings"],
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <DollarSign className="h-5 w-5 mr-2" />
            Earnings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <Clock className="h-8 w-8 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalEarnings = earnings?.totalEarnings || 0;
  const breakdown = earnings?.earningsBreakdown || [];

  // Calculate statistics
  const totalOrders = breakdown.length;
  const averageEarningsPerOrder = totalOrders > 0 ? totalEarnings / totalOrders : 0;
  const thisMonthEarnings = breakdown
    .filter(item => {
      const itemDate = new Date(item.createdAt);
      const now = new Date();
      return itemDate.getMonth() === now.getMonth() && itemDate.getFullYear() === now.getFullYear();
    })
    .reduce((sum, item) => sum + parseFloat(item.amount), 0);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                <p className="text-2xl font-bold text-gray-900">${totalEarnings.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">This Month</p>
                <p className="text-2xl font-bold text-gray-900">${thisMonthEarnings.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed Orders</p>
                <p className="text-2xl font-bold text-gray-900">{totalOrders}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg per Order</p>
                <p className="text-2xl font-bold text-gray-900">${averageEarningsPerOrder.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Earnings Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Earnings History</CardTitle>
        </CardHeader>
        <CardContent>
          {breakdown.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <DollarSign className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">No earnings yet</p>
              <p className="text-sm">Complete orders to start earning!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {breakdown.map((item, index) => (
                <div key={index} className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <Badge variant={item.bakerType === 'junior_baker' ? "secondary" : "default"}>
                        {item.bakerType === 'junior_baker' ? 'Junior Baker' : 'Main Baker'}
                      </Badge>
                      <span className="font-medium">Order {item.orderNumber}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-green-600">${parseFloat(item.amount).toFixed(2)}</p>
                      <p className="text-sm text-gray-500">{item.percentage}% of ${parseFloat(item.orderTotal).toFixed(2)}</p>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    <p>Earned on: {format(new Date(item.createdAt), 'PPP')}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
