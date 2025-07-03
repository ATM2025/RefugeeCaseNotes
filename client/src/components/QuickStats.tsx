import { Card, CardContent } from "@/components/ui/card";
import { mockDashboardStats } from "@/data/mockData";

export default function QuickStats() {
  // Use mock data for demo
  const stats = mockDashboardStats;

  return (
    <Card className="fixed bottom-6 right-6 w-64 shadow-lg">
      <CardContent className="p-4">
        <h4 className="font-semibold text-gray-900 mb-3">Today's Summary</h4>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Total Notes</span>
            <span className="font-semibold text-gray-900">{stats.totalNotes}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Today's Notes</span>
            <span className="font-semibold text-gray-900">{stats.todayNotes}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">RCA Cases</span>
            <span className="font-semibold text-blue-600">{stats.rcaCases}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Translations</span>
            <span className="font-semibold text-green-600">{stats.translationsProvided}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
