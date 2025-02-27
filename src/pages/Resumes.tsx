
import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useResumes, Resume } from "@/contexts/ResumeContext";
import { FileText, Trash, Upload } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

const Resumes = () => {
  const { resumes, uploadResume, deleteResume, toggleResumeSelection, loading } = useResumes();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(file.type)) {
      toast.error("Please upload a PDF or Word document");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size should be less than 10MB");
      return;
    }

    try {
      await uploadResume(file);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      toast.error("Failed to upload resume");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteResume(id);
    } catch (error) {
      toast.error("Failed to delete resume");
    }
  };

  const handleToggleSelection = async (id: string) => {
    try {
      await toggleResumeSelection(id);
    } catch (error) {
      toast.error("Failed to update selection");
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    else return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Resumes</h1>
          <p className="text-muted-foreground">
            Upload and manage your resume documents
          </p>
        </div>
        <div className="flex gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept=".pdf,.doc,.docx"
          />
          <Button
            onClick={handleUploadClick}
            className="bg-neon text-black hover:bg-neon/90 hover:text-black/90 transition-colors"
            disabled={loading}
          >
            <Upload className="mr-2 h-4 w-4" />
            Upload Resume
          </Button>
        </div>
      </div>

      {resumes.length === 0 ? (
        <Card className="bg-background/50 border border-border/50 flex flex-col items-center justify-center p-8 text-center">
          <FileText className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-xl font-medium">No resumes yet</h3>
          <p className="text-muted-foreground mt-2 max-w-md">
            Upload your resume to start your job search journey. We support PDF and Word documents.
          </p>
          <Button
            onClick={handleUploadClick}
            className="mt-6 bg-neon text-black hover:bg-neon/90 hover:text-black/90 transition-colors"
          >
            <Upload className="mr-2 h-4 w-4" />
            Upload Resume
          </Button>
        </Card>
      ) : (
        <Card className="bg-background/50 border border-border/50 overflow-hidden">
          <div className="p-1">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-muted/5">
                  <TableHead className="w-[50px]">Select</TableHead>
                  <TableHead>File Name</TableHead>
                  <TableHead className="hidden md:table-cell">Size</TableHead>
                  <TableHead className="hidden md:table-cell">Date Uploaded</TableHead>
                  <TableHead className="w-[100px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {resumes.map((resume) => (
                  <TableRow key={resume.id} className="hover:bg-muted/5">
                    <TableCell>
                      <Checkbox
                        checked={resume.isSelected}
                        onCheckedChange={() => handleToggleSelection(resume.id)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="truncate max-w-[250px]">{resume.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {formatFileSize(resume.size)}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {formatDistanceToNow(new Date(resume.createdAt), { addSuffix: true })}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                        onClick={() => handleDelete(resume.id)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}
    </div>
  );
};

export default Resumes;
