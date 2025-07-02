import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, Download } from "lucide-react";

interface SearchFiltersProps {
  filters: {
    search: string;
    programArea: string;
    dateRange: string;
    sortBy: string;
  };
  onFiltersChange: (filters: any) => void;
}

export default function SearchFilters({ filters, onFiltersChange }: SearchFiltersProps) {
  const updateFilter = (key: string, value: string) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFiltersChange({
      search: "",
      programArea: "",
      dateRange: "",
      sortBy: "newest",
    });
  };

  const exportResults = () => {
    // TODO: Implement export functionality
    console.log("Exporting results...");
  };

  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search Input */}
          <div className="md:col-span-2">
            <Label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
              Search case notes
            </Label>
            <div className="relative">
              <Input
                type="text"
                id="search"
                value={filters.search}
                onChange={(e) => updateFilter('search', e.target.value)}
                className="pl-10"
                placeholder="Search by keyword, case number, or narrative..."
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
            </div>
          </div>

          {/* Program Area Filter */}
          <div>
            <Label htmlFor="program-filter" className="block text-sm font-medium text-gray-700 mb-2">
              Program Area
            </Label>
            <Select value={filters.programArea} onValueChange={(value) => updateFilter('programArea', value)}>
              <SelectTrigger>
                <SelectValue placeholder="All Programs" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Programs</SelectItem>
                <SelectItem value="RCA">RCA</SelectItem>
                <SelectItem value="Medical">Medical</SelectItem>
                <SelectItem value="SAS">SAS</SelectItem>
                <SelectItem value="EMP">EMP</SelectItem>
                <SelectItem value="ELI">ELI</SelectItem>
                <SelectItem value="RMA">RMA</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date Range Filter */}
          <div>
            <Label htmlFor="date-filter" className="block text-sm font-medium text-gray-700 mb-2">
              Date Range
            </Label>
            <Select value={filters.dateRange} onValueChange={(value) => updateFilter('dateRange', value)}>
              <SelectTrigger>
                <SelectValue placeholder="All Dates" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Dates</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="quarter">This Quarter</SelectItem>
                <SelectItem value="custom">Custom Range</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">Sort by:</span>
            <Select value={filters.sortBy} onValueChange={(value) => updateFilter('sortBy', value)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="program">Program Area</SelectItem>
                <SelectItem value="caseworker">Caseworker</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              onClick={clearFilters}
              className="text-sm text-primary hover:text-primary/80"
            >
              Clear Filters
            </Button>
            <Button
              variant="outline"
              onClick={exportResults}
              className="text-sm"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
