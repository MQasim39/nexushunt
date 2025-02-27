
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useResumes } from "@/contexts/ResumeContext";
import { FileText, Upload, Bot, User, Clock } from "lucide-react";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const { user } = useAuth();
  const { resumes } = useResumes();
  
  const selectedResumes = resumes.filter(resume => resume.isSelected);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome, {user?.username}</h1>
          <p className="text-muted-foreground">
            Here's an overview of your job search progress.
          </p>
        </div>
        <Button asChild className="bg-neon text-black hover:bg-neon/90 hover:text-black/90 transition-colors">
          <Link to="/resumes">
            <Upload className="mr-2 h-4 w-4" />
            Upload Resume
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="bg-background/50 border border-border/50 hover:border-neon/30 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Resumes</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-neon">{resumes.length}</div>
            <p className="text-xs text-muted-foreground">
              {resumes.length === 1 ? "Document" : "Documents"} uploaded
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-background/50 border border-border/50 hover:border-neon/30 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Selected Resumes</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-neon">{selectedResumes.length}</div>
            <p className="text-xs text-muted-foreground">
              {selectedResumes.length === 1 ? "Resume" : "Resumes"} active for job search
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-background/50 border border-border/50 hover:border-neon/30 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Agent</CardTitle>
            <Bot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">Inactive</div>
            <p className="text-xs text-muted-foreground">
              Enable to start your job search
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="bg-background/50 border border-border/50 hover:border-neon/30 transition-colors">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your recent actions and updates</CardDescription>
          </CardHeader>
          <CardContent>
            {resumes.length > 0 ? (
              <div className="space-y-4">
                {resumes.slice(0, 3).map((resume) => (
                  <div key={resume.id} className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                      <FileText className="h-5 w-5 text-neon" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {resume.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Uploaded on {new Date(resume.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mb-3" />
                <h3 className="text-lg font-medium">No resumes yet</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Upload your first resume to get started
                </p>
                <Button 
                  asChild 
                  className="mt-4 bg-neon text-black hover:bg-neon/90 hover:text-black/90 transition-colors"
                >
                  <Link to="/resumes">
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Resume
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card className="bg-background/50 border border-border/50 hover:border-neon/30 transition-colors">
          <CardHeader>
            <CardTitle>Account Overview</CardTitle>
            <CardDescription>Your account information and settings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                  <User className="h-5 w-5 text-neon" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.username}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                  <Clock className="h-5 w-5 text-neon" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">Account Status</p>
                  <p className="text-xs text-muted-foreground">Active</p>
                </div>
              </div>
              
              <div className="pt-4">
                <Button 
                  asChild 
                  variant="outline" 
                  className="w-full"
                >
                  <Link to="/settings">
                    Manage Account
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
