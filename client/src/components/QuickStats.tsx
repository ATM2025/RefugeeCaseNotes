import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function QuickStats() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['/api/dashboard/stats'],
    queryFn: async () => {
      const response = await fetch('/api/dashboard/stats', {
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error(`${response.status}: ${response.statusText}`);
      }
      return response.json();
    },
    retry: false,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  return (
    <Card className="fixed bottom-6 right-6 w-64 shadow-lg">
      <CardContent className="p-4">
        <h4 className="font-semibold text-gray-900 mb-3">Today's Summary</h4>
        
        {isLoading ? (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-8" />
            </div>
            <div className="flex justify-between items-center">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-8" />
            </div>
            <div className="flex justify-between items-center">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-8" />
            </div>
          </div>
        ) : stats ? (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">New Notes</span>
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
        ) : (
          <div className="text-sm text-gray-500">No data available</div>
        )}
      </CardContent>
    </Card>
  );
}
