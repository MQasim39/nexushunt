
import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";
import { useAuth } from "./AuthContext";

export type Resume = {
  id: string;
  name: string;
  file: string; // Base64 encoded file
  fileType: string;
  size: number;
  createdAt: string;
  isSelected: boolean;
};

type ResumeContextType = {
  resumes: Resume[];
  loading: boolean;
  uploadResume: (file: File) => Promise<void>;
  deleteResume: (id: string) => Promise<void>;
  toggleResumeSelection: (id: string) => Promise<void>;
};

const ResumeContext = createContext<ResumeContextType | undefined>(undefined);

const getResumeStorageKey = (userId: string) => `neon_resume_hub_resumes_${userId}`;

export const ResumeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      const storedResumes = localStorage.getItem(getResumeStorageKey(user.id));
      if (storedResumes) {
        setResumes(JSON.parse(storedResumes));
      }
    } else {
      setResumes([]);
    }
    setLoading(false);
  }, [user]);

  const saveResumes = (updatedResumes: Resume[]) => {
    if (user) {
      localStorage.setItem(
        getResumeStorageKey(user.id),
        JSON.stringify(updatedResumes)
      );
      setResumes(updatedResumes);
    }
  };

  const uploadResume = async (file: File) => {
    if (!user) throw new Error("Not authenticated");
    
    setLoading(true);
    
    try {
      return new Promise<void>((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = () => {
          try {
            const base64Data = reader.result as string;
            
            // Create new resume object
            const newResume: Resume = {
              id: Date.now().toString(),
              name: file.name,
              file: base64Data,
              fileType: file.type,
              size: file.size,
              createdAt: new Date().toISOString(),
              isSelected: false,
            };
            
            const updatedResumes = [...resumes, newResume];
            saveResumes(updatedResumes);
            
            toast.success("Resume uploaded successfully");
            setLoading(false);
            resolve();
          } catch (err) {
            setLoading(false);
            reject(err);
          }
        };
        
        reader.onerror = () => {
          setLoading(false);
          reject(new Error("Failed to read file"));
        };
        
        reader.readAsDataURL(file);
      });
    } catch (error) {
      setLoading(false);
      toast.error(error instanceof Error ? error.message : "Upload failed");
      throw error;
    }
  };

  const deleteResume = async (id: string) => {
    if (!user) throw new Error("Not authenticated");
    
    setLoading(true);
    
    try {
      // Simulate network request
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const updatedResumes = resumes.filter(resume => resume.id !== id);
      saveResumes(updatedResumes);
      
      toast.success("Resume deleted successfully");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Delete failed");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const toggleResumeSelection = async (id: string) => {
    if (!user) throw new Error("Not authenticated");
    
    try {
      const updatedResumes = resumes.map(resume => 
        resume.id === id
          ? { ...resume, isSelected: !resume.isSelected }
          : resume
      );
      
      saveResumes(updatedResumes);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Selection update failed");
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
