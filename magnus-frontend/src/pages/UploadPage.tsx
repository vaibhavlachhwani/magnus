import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useQuery, useMutation } from "@tanstack/react-query"
import { studentService, documentService } from "@/api/services"
import { useToast } from "@/hooks/use-toast"
import { useSearchParams } from 'react-router-dom';
import { Upload, File, CheckCircle2, User } from "lucide-react"
import type { DocumentDTO } from "@/types"

export const UploadPage: React.FC = () => {
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [selectedStudent, setSelectedStudent] = React.useState<string>(searchParams.get("studentId") || "");
  const [file, setFile] = React.useState<File | null>(null);
  const [uploadResult, setUploadResult] = React.useState<DocumentDTO | null>(null);

  const { data: students, isLoading: loadingStudents } = useQuery({
    queryKey: ['students'],
    queryFn: studentService.listAll,
  });

  const uploadMutation = useMutation({
    mutationFn: ({ file, studentId }: { file: File, studentId: string }) => 
      documentService.upload(file, studentId),
    onSuccess: (data) => {
      setUploadResult(data);
      toast({
        title: "Upload Successful",
        description: `Document ${data.fileName} has been hashed and stored.`,
      });
      setFile(null);
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: error.response?.data?.message || "An error occurred during upload.",
      });
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setUploadResult(null);
    }
  };

  const handleUpload = () => {
    if (!file || !selectedStudent) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please select a student and a file.",
      });
      return;
    }
    uploadMutation.mutate({ file, studentId: selectedStudent });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Card className="bg-card border-border shadow-2xl overflow-hidden">
        <div className="h-1 bg-primary w-full" />
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Upload className="w-6 h-6 text-primary" />
            Issue Document
          </CardTitle>
          <CardDescription>Upload and sign a new document for a student</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <User className="w-4 h-4 text-primary" />
              Select Student
            </label>
            <Select onValueChange={setSelectedStudent} value={selectedStudent}>
              <SelectTrigger className="bg-background/50 border-border">
                <SelectValue placeholder={loadingStudents ? "Loading..." : "Choose a student"} />
              </SelectTrigger>
              <SelectContent>
                {students?.map((student) => (
                  <SelectItem key={student.id} value={student.id}>
                    {student.name} ({student.id.substring(0, 8)}...)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div 
            className={`border-2 border-dashed rounded-xl p-12 text-center transition-all ${
              file ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-accent/20"
            }`}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                setFile(e.dataTransfer.files[0]);
                setUploadResult(null);
              }
            }}
          >
            <input
              type="file"
              id="file-upload"
              className="hidden"
              onChange={handleFileChange}
            />
            <label htmlFor="file-upload" className="cursor-pointer space-y-4 block">
              <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <File className={`w-8 h-8 ${file ? "text-primary" : "text-muted-foreground"}`} />
              </div>
              <div>
                <p className="text-lg font-medium">
                  {file ? file.name : "Click to upload or drag and drop"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {file ? `Size: ${(file.size / 1024).toFixed(2)} KB` : "PDF, DOCX, or PNG (Max 10MB)"}
                </p>
              </div>
            </label>
          </div>

          <Button 
            className="w-full h-12 text-lg font-semibold" 
            size="lg" 
            onClick={handleUpload}
            disabled={uploadMutation.isPending || !file || !selectedStudent}
          >
            {uploadMutation.isPending ? "Processing..." : "Issue & Sign Document"}
          </Button>
        </CardContent>
      </Card>

      {uploadResult && (
        <Card className="bg-green-500/5 border-green-500/20 animate-in zoom-in-95 duration-300">
          <CardHeader className="flex flex-row items-center gap-4">
            <CheckCircle2 className="w-8 h-8 text-green-500" />
            <div>
              <CardTitle className="text-green-500">Document Issued Successfully</CardTitle>
              <CardDescription>Unique hash generated and stored in ledger</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-1">
                <span className="text-muted-foreground uppercase text-[10px] font-bold">Document ID</span>
                <p className="font-mono bg-background/50 p-2 rounded border border-border">{uploadResult.id}</p>
              </div>
              <div className="space-y-1">
                <span className="text-muted-foreground uppercase text-[10px] font-bold">SHA-512 Hash</span>
                <p className="font-mono bg-background/50 p-2 rounded border border-border truncate" title={uploadResult.hashValue}>
                  {uploadResult.hashValue.substring(0, 20)}...
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
