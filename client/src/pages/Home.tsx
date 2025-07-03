import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import CaseNotesList from "@/components/CaseNotesList";
import SearchFilters from "@/components/SearchFilters";
import QuickStats from "@/components/QuickStats";
import CaseNoteForm from "@/components/CaseNoteForm";
import { useState } from "react";

export default function Home() {
  const { toast } = useToast();
  const [showNewCaseModal, setShowNewCaseModal] = useState(false);
  const [filters, setFilters] = useState({
    search: "",
    programArea: "",
    dateRange: "",
    sortBy: "newest" as const,
  });

  // Default user info since auth is removed
  const displayName = 'Case Worker';
  const initials = 'CW';

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Navigation Header */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-xl font-semibold text-gray-900">RCA Case Notes</h1>
              </div>
              <nav className="hidden md:ml-8 md:flex md:space-x-8">
                <a href="#" className="text-primary border-b-2 border-primary px-1 pt-1 pb-4 text-sm font-medium">
                  Case Notes
                </a>
                <a href="#" className="text-gray-500 hover:text-gray-700 px-1 pt-1 pb-4 text-sm font-medium">
                  Reports
                </a>
                <a href="#" className="text-gray-500 hover:text-gray-700 px-1 pt-1 pb-4 text-sm font-medium">
                  Settings
                </a>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => setShowNewCaseModal(true)}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <span className="mr-2">+</span>
                New Case Note
              </Button>
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-700">{displayName}</span>
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-primary">{initials}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <SearchFilters filters={filters} onFiltersChange={setFilters} />
        <CaseNotesList filters={filters} />
      </div>

      {/* Quick Stats Panel */}
      <QuickStats />

      {/* New Case Note Modal */}
      {showNewCaseModal && (
        <CaseNoteForm
          onClose={() => setShowNewCaseModal(false)}
          onSuccess={() => {
            setShowNewCaseModal(false);
            toast({
              title: "Success",
              description: "Case note created successfully",
            });
          }}
        />
      )}
    </div>
  );
}
