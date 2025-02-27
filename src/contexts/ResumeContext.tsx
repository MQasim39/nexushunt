
import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";
import { useAuth } from "./AuthContext";
import { supabase } from "@/lib/supabase";

export type Resume = {
  id: string;
  name: string;
  fileType: string;
  size: number;
  createdAt: string;
  isSelected: boolean;
  url?: string;
};

type ResumeContextType = {
  resumes: Resume[];
  loading: boolean;
  uploadResume: (file: File) => Promise<void>;
  deleteResume: (id: string) => Promise<void>;
  toggleResumeSelection: (id: string) => Promise<void>;
};

const ResumeContext = createContext<ResumeContextType | undefined>(undefined);

export const ResumeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);

  // Load resumes when user changes
  useEffect(() => {
    if (user) {
      fetchResumes();
    } else {
      setResumes([]);
      setLoading(false);
    }
  }, [user]);

  const fetchResumes = async () => {
    if (!user) return;
    
    setLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('resumes')
        .select('*')
        .eq('user_id', user.id)
        .order('uploaded_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      // Transform to our Resume type
      const transformedResumes: Resume[] = await Promise.all(
        data.map(async (resume) => {
          // Get signed URL for each resume file
          const { data: urlData } = await supabase
            .storage
            .from('resumes')
            .createSignedUrl(resume.file_path, 3600); // 1 hour expiry
          
          return {
            id: resume.id,
            name: resume.filename,
            fileType: resume.file_type || '',
            size: resume.file_size || 0,
            createdAt: resume.uploaded_at,
            isSelected: resume.is_selected || false,
            url: urlData?.signedUrl,
          };
        })
      );
      
      setResumes(transformedResumes);
    } catch (error: any) {
      console.error("Error fetching resumes:", error);
      toast.error("Failed to load resumes");
    } finally {
      setLoading(false);
    }
  };

  const uploadResume = async (file: File) => {
    if (!user) throw new Error("Not authenticated");
    
    setLoading(true);
    
    try {
      // Create a unique file path
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;
      
      // Upload file to storage
      const { error: uploadError } = await supabase
        .storage
        .from('resumes')
        .upload(filePath, file);
      
      if (uploadError) {
        throw uploadError;
      }
      
      // Add entry to resumes table
      const { error: dbError } = await supabase
        .from('resumes')
        .insert({
          user_id: user.id,
          filename: file.name,
          file_path: filePath,
          file_type: file.type,
          file_size: file.size,
          is_selected: false,
        });
      
      if (dbError) {
        // Clean up the uploaded file if the database insert fails
        await supabase.storage.from('resumes').remove([filePath]);
        throw dbError;
      }
      
      // Reload the resumes
      await fetchResumes();
      
      toast.success("Resume uploaded successfully");
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(error.message || "Upload failed");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteResume = async (id: string) => {
    if (!user) throw new Error("Not authenticated");
    
    setLoading(true);
    
    try {
      // First, get the file path
      const { data: resumeData, error: fetchError } = await supabase
        .from('resumes')
        .select('file_path')
        .eq('id', id)
        .single();
      
      if (fetchError) {
        throw fetchError;
      }
      
      // Delete the file from storage
      const { error: storageError } = await supabase
        .storage
        .from('resumes')
        .remove([resumeData.file_path]);
      
      if (storageError) {
        throw storageError;
      }
      
      // Delete the database record
      const { error: dbError } = await supabase
        .from('resumes')
        .delete()
        .eq('id', id);
      
      if (dbError) {
        throw dbError;
      }
      
      // Update local state
      setResumes(resumes.filter(resume => resume.id !== id));
      
      toast.success("Resume deleted successfully");
    } catch (error: any) {
      console.error("Delete error:", error);
      toast.error(error.message || "Delete failed");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const toggleResumeSelection = async (id: string) => {
    if (!user) throw new Error("Not authenticated");
    
    try {
      // Find the current resume to toggle
      const resume = resumes.find(r => r.id === id);
      if (!resume) return;
      
      const newIsSelected = !resume.isSelected;
      
      // Update the database
      const { error } = await supabase
        .from('resumes')
        .update({ is_selected: newIsSelected })
        .eq('id', id);
      
      if (error) {
        throw error;
      }
      
      // Update local state
      setResumes(resumes.map(r => 
        r.id === id ? { ...r, isSelected: newIsSelected } : r
      ));
    } catch (error: any) {
      console.error("Selection update error:", error);
      toast.error(error.message || "Selection update failed");
      throw error;
    }
  };

  const value = {
    resumes,
    loading,
    uploadResume,
    deleteResume,
    toggleResumeSelection,
  };

  return (
    <ResumeContext.Provider value={value}>{children}</ResumeContext.Provider>
  );
};

export const useResumes = () => {
  const context = useContext(ResumeContext);
  if (context === undefined) {
    throw new Error("useResumes must be used within a ResumeProvider");
  }
  return context;
};
