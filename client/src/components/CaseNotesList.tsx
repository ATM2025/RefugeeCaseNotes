import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Paperclip, Edit, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { useState, useMemo } from "react";
import type { CaseNoteWithDetails } from "@/types";
import { mockCaseNotes } from "@/data/mockData";

interface CaseNotesListProps {
  filters: {
    search: string;
    programArea: string;
    dateRange: string;
    sortBy: string;
  };
}

const PROGRAM_COLORS = {
  RCA: "bg-blue-100 text-blue-800",
  "Legal Aid": "bg-purple-100 text-purple-800",
  "Community Outreach": "bg-green-100 text-green-800",
  "Emergency Response": "bg-red-100 text-red-800",
  Microfinance: "bg-yellow-100 text-yellow-800",
};

export default function CaseNotesList({ filters }: CaseNotesListProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter and sort mock data based on filters
  const filteredNotes = useMemo(() => {
    let filtered = [...mockCaseNotes];

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(note => 
        note.caseNumber.toLowerCase().includes(searchLower) ||
        note.clientName.toLowerCase().includes(searchLower) ||
        note.notes.toLowerCase().includes(searchLower) ||
        note.caseworker?.firstName.toLowerCase().includes(searchLower) ||
        note.caseworker?.lastName.toLowerCase().includes(searchLower)
      );
    }

    // Apply program area filter
    if (filters.programArea) {
      filtered = filtered.filter(note => note.programArea === filters.programArea);
    }

    // Apply date range filter
    if (filters.dateRange) {
      const now = new Date();
      let startDate: Date | undefined;

      switch (filters.dateRange) {
        case 'today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'quarter':
          const quarter = Math.floor(now.getMonth() / 3);
          startDate = new Date(now.getFullYear(), quarter * 3, 1);
          break;
      }

      if (startDate) {
        filtered = filtered.filter(note => new Date(note.createdAt) >= startDate!);
      }
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'program':
          return a.programArea.localeCompare(b.programArea);
        case 'caseworker':
          const aName = `${a.caseworker?.firstName || ''} ${a.caseworker?.lastName || ''}`;
          const bName = `${b.caseworker?.firstName || ''} ${b.caseworker?.lastName || ''}`;
          return aName.localeCompare(bName);
        case 'newest':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

    return filtered;
  }, [filters]);

  // Pagination
  const totalNotes = filteredNotes.length;
  const totalPages = Math.ceil(totalNotes / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentNotes = filteredNotes.slice(startIndex, endIndex);

  // Demo functions
  const handleDelete = (id: number) => {
    alert(`Demo: Would delete case note ${id}`);
  };

  const handleEdit = (id: number) => {
    alert(`Demo: Would edit case note ${id}`);
  };

  if (currentNotes.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-gray-500">No case notes found matching your filters.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Results Summary */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-600">
          Showing {startIndex + 1} to {Math.min(endIndex, totalNotes)} of {totalNotes} case notes
        </p>
      </div>

      {/* Case Notes Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Case Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Program
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Notes
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Attachments
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Caseworker
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentNotes.map((note: CaseNoteWithDetails) => (
                  <tr key={note.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <div className="text-sm font-medium text-gray-900">
                          {note.caseNumber}
                        </div>
                        <div className="text-sm text-gray-500">
                          {format(new Date(note.createdAt), "MMM d, yyyy")}
                        </div>
                        {note.priority && (
                          <Badge 
                            variant={note.priority === 'Urgent' ? 'destructive' : 
                                   note.priority === 'High' ? 'default' : 'secondary'}
                            className="mt-1 w-fit"
                          >
                            {note.priority}
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <div className="text-sm font-medium text-gray-900">
                          {note.clientName}
                        </div>
                        {note.clientAge && (
                          <div className="text-sm text-gray-500">
                            Age: {note.clientAge}
                          </div>
                        )}
                        {note.clientGender && (
                          <div className="text-sm text-gray-500">
                            {note.clientGender}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge 
                        className={PROGRAM_COLORS[note.programArea as keyof typeof PROGRAM_COLORS] || "bg-gray-100 text-gray-800"}
                      >
                        {note.programArea}
                      </Badge>
                      <div className="mt-2 space-y-1">
                        {note.translationProvided && (
                          <Badge variant="outline" className="text-xs">
                            Translation
                          </Badge>
                        )}
                        {note.followUpRequired && (
                          <Badge variant="outline" className="text-xs">
                            Follow-up
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {note.notes}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {note.attachments && note.attachments.length > 0 ? (
                        <div className="flex items-center space-x-1">
                          <Paperclip className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {note.attachments.length} file{note.attachments.length > 1 ? 's' : ''}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">None</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {note.caseworker ? `${note.caseworker.firstName} ${note.caseworker.lastName}` : 'Unknown'}
                      </div>
                      {note.caseworker?.role && (
                        <div className="text-sm text-gray-500">
                          {note.caseworker.role}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(note.id)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(note.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
          
          <span className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </span>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      )}
    </div>
  );
}