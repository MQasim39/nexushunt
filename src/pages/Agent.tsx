
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Bot, Search, Briefcase, Award } from "lucide-react";
import { toast } from "sonner";

const Agent = () => {
  const [agentEnabled, setAgentEnabled] = useState(false);
  
  const handleToggleAgent = (checked: boolean) => {
    setAgentEnabled(checked);
    
    if (checked) {
      toast.success("AI Agent activated successfully");
    } else {
      toast.info("AI Agent deactivated");
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">AI Job Agent</h1>
        <p className="text-muted-foreground">
          Let our AI agent find the perfect job matches for you
        </p>
      </div>

      <Card className="bg-background/50 border border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-neon" />
            AI Agent Status
          </CardTitle>
          <CardDescription>
            Enable our AI agent to automatically search for jobs based on your resume
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="agent-toggle">
                {agentEnabled ? "Active" : "Inactive"}
              </Label>
              <p className="text-sm text-muted-foreground">
                {agentEnabled
                  ? "Agent is currently scanning job boards for matches"
                  : "Enable to start automated job matching"}
              </p>
            </div>
            <Switch
              id="agent-toggle"
              checked={agentEnabled}
              onCheckedChange={handleToggleAgent}
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="bg-background/50 border border-border/50 hover:border-neon/30 transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5 text-neon" />
              Intelligent Search
            </CardTitle>
            <CardDescription>
              Our AI scans thousands of job listings to find matches
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              The agent analyzes your resume and searches for jobs that match your skills and experience.
            </p>
            <Button className="mt-4 w-full" variant="outline" disabled={!agentEnabled}>
              Customize Search
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-background/50 border border-border/50 hover:border-neon/30 transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-neon" />
              Personalized Matches
            </CardTitle>
            <CardDescription>
              Get job recommendations tailored to your profile
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Our AI learns from your preferences and applications to improve recommendations over time.
            </p>
            <Button className="mt-4 w-full" variant="outline" disabled={!agentEnabled}>
              View Matches
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-background/50 border border-border/50 hover:border-neon/30 transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-neon" />
              Application Assistance
            </CardTitle>
            <CardDescription>
              Get help preparing your application materials
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Our AI can suggest customizations to your resume and cover letter for each job application.
            </p>
            <Button className="mt-4 w-full" variant="outline" disabled={!agentEnabled}>
              Get Assistance
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Agent;
