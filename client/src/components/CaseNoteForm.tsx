import { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
// Removed auth dependencies for direct access
import { apiRequest } from "@/lib/queryClient";
import { insertCaseNoteSchema } from "@/types";
import { format } from "date-fns";
import { X, CloudUpload, Save, FileText, Image } from "lucide-react";
import { z } from "zod";

const formSchema = insertCaseNoteSchema.extend({
  translationProvided: z.boolean(),
});

type FormData = z.infer<typeof formSchema>;

interface CaseNoteFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function CaseNoteForm({ onClose, onSuccess }: CaseNoteFormProps) {
  const { toast } = useToast();
  // Default caseworker since no auth
  const queryClient = useQueryClient();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      caseNumber: '',
      programArea: 'RCA',
      caseworkerId: 'default-caseworker',
      clientName: '',
      clientAge: undefined,
      clientGender: undefined,
      notes: '',
      translationProvided: false,
      followUpRequired: false,
      followUpDate: undefined,
      priority: 'Medium',
    },
  });

  const createCaseNoteMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await apiRequest('POST', '/api/case-notes', data);
      return response.json();
    },
    onSuccess: async (newCaseNote) => {
      // Upload files if any
      if (selectedFiles.length > 0) {
        const formData = new FormData();
        selectedFiles.forEach(file => {
          formData.append('files', file);
        });

        try {
          await apiRequest('POST', `/api/case-notes/${newCaseNote.id}/attachments`, formData);
        } catch (error) {
          console.error('Error uploading files:', error);
          toast({
            title: "Warning",
            description: "Case note created but file upload failed",
            variant: "destructive",
          });
        }
      }

      queryClient.invalidateQueries({ queryKey: ['/api/case-notes'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard'] });
      onSuccess();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create case note",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    createCaseNoteMutation.mutate(data);
  };

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => {
      const isValidType = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp'
      ].includes(file.type);
      
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB
      
      if (!isValidType) {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not a supported file type`,
          variant: "destructive",
        });
      }
      
      if (!isValidSize) {
        toast({
          title: "File too large",
          description: `${file.name} is larger than 10MB`,
          variant: "destructive",
        });
      }
      
      return isValidType && isValidSize;
    });

    setSelectedFiles(prev => [...prev, ...validFiles]);
  }, [toast]);

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const displayName = 'Default Caseworker';
  const userRole = 'Caseworker';

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Create New Case Note
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Date and Time (Auto-filled) */}
              <div>
                <Label className="block text-sm font-medium text-gray-700 mb-2">
                  Date & Time
                </Label>
                <Input
                  value={format(new Date(), 'MMM d, yyyy \'at\' h:mm a')}
                  className="bg-gray-50 text-gray-600"
                  readOnly
                />
              </div>

              {/* Program Area */}
              <FormField
                control={form.control}
                name="programArea"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Program Area <span className="text-red-500">*</span>
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select program area" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="RCA">RCA (Refugee Cash Assistance)</SelectItem>
                        <SelectItem value="Medical">Medical</SelectItem>
                        <SelectItem value="SAS">SAS (Social Adjustment Services)</SelectItem>
                        <SelectItem value="EMP">EMP (Employment)</SelectItem>
                        <SelectItem value="ELI">ELI (English Language Instruction)</SelectItem>
                        <SelectItem value="RMA">RMA (Refugee Medical Assistance)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Caseworker (Auto-filled) */}
              <div>
                <Label className="block text-sm font-medium text-gray-700 mb-2">
                  Caseworker
                </Label>
                <Input
                  value={`${displayName} - ${userRole}`}
                  className="bg-gray-50 text-gray-600"
                  readOnly
                />
              </div>

              {/* Translation Provided */}
              <FormField
                control={form.control}
                name="translationProvided"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="block text-sm font-medium text-gray-700 mb-2">
                      Translation Provided?
                    </FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={(value) => field.onChange(value === 'true')}
                        value={field.value ? 'true' : 'false'}
                        className="flex items-center space-x-6"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="true" id="translation-yes" />
                          <Label htmlFor="translation-yes">Yes</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="false" id="translation-no" />
                          <Label htmlFor="translation-no">No</Label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Narrative Field */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Case Narrative <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      rows={6}
                      placeholder="Enter detailed case notes here..."
                      className="resize-none"
                    />
                  </FormControl>
                  <p className="text-sm text-gray-500">
                    Provide comprehensive details about the case interaction, services provided, and next steps.
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* File Attachments */}
            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-2">
                Attachments
              </Label>
              
              <div 
                className="border-2 border-gray-300 border-dashed rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer"
                onClick={() => document.getElementById('file-input')?.click()}
              >
                <input
                  id="file-input"
                  type="file"
                  multiple
                  onChange={handleFileSelect}
                  accept=".pdf,.docx,.jpg,.jpeg,.png,.gif,.webp"
                  className="hidden"
                />
                <div className="space-y-2">
                  <CloudUpload className="mx-auto h-8 w-8 text-gray-400" />
                  <div className="text-sm text-gray-600">
                    <span className="text-primary hover:text-primary/80 font-medium">
                      Click to upload
                    </span>{' '}
                    or drag and drop
                  </div>
                  <p className="text-xs text-gray-500">
                    PDF, DOCX, or image files up to 10MB each
                  </p>
                </div>
              </div>
              
              {/* File List */}
              {selectedFiles.length > 0 && (
                <div className="mt-4 space-y-2">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        {file.type.startsWith('image/') ? (
                          <Image className="h-5 w-5 text-blue-500" />
                        ) : (
                          <FileText className="h-5 w-5 text-red-500" />
                        )}
                        <span className="text-sm font-medium text-gray-700">{file.name}</span>
                        <span className="text-xs text-gray-500">
                          ({(file.size / 1024 / 1024).toFixed(1)} MB)
                        </span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={createCaseNoteMutation.isPending}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {createCaseNoteMutation.isPending ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </div>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Case Note
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
