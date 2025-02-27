
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Bell, Mail, Filter, Clock } from "lucide-react";
import { toast } from "sonner";

const Jobs = () => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  
  const handleToggleNotifications = (checked: boolean) => {
    setNotificationsEnabled(checked);
    
    if (checked) {
      toast.success("Job notifications enabled");
    } else {
      toast.info("Job notifications disabled");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Job alert preferences saved");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Job Alerts</h1>
        <p className="text-muted-foreground">
          Set up notifications for new job opportunities
        </p>
      </div>

      <Card className="bg-background/50 border border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-neon" />
            Notification Settings
          </CardTitle>
          <CardDescription>
            Receive email alerts when new jobs matching your preferences are found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="notification-toggle">
                Email Notifications
              </Label>
              <p className="text-sm text-muted-foreground">
                {notificationsEnabled
                  ? "You will receive job alerts via email"
                  : "Enable to receive job alerts via email"}
              </p>
            </div>
            <Switch
              id="notification-toggle"
              checked={notificationsEnabled}
              onCheckedChange={handleToggleNotifications}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-background/50 border border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-neon" />
            Alert Preferences
          </CardTitle>
          <CardDescription>
            Customize the types of jobs you want to be notified about
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="job-title">Job Title</Label>
              <Input
                id="job-title"
                placeholder="e.g. Software Engineer, Product Manager"
                className="bg-background/50 border-border/50 focus:border-neon focus:ring-neon/20"
                disabled={!notificationsEnabled}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="e.g. Remote, New York, San Francisco"
                className="bg-background/50 border-border/50 focus:border-neon focus:ring-neon/20"
                disabled={!notificationsEnabled}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="frequency">Alert Frequency</Label>
              <select
                id="frequency"
                className="w-full rounded-md border border-border/50 bg-background/50 px-3 py-2 text-sm focus:border-neon focus:ring-neon/20 disabled:cursor-not-allowed disabled:opacity-50"
                defaultValue="daily"
                disabled={!notificationsEnabled}
              >
                <option value="instant">Instant</option>
                <option value="daily">Daily Digest</option>
                <option value="weekly">Weekly Digest</option>
              </select>
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-neon text-black hover:bg-neon/90 hover:text-black/90 transition-colors"
              disabled={!notificationsEnabled}
            >
              Save Preferences
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="bg-background/50 border border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-neon" />
            Recent Alerts
          </CardTitle>
          <CardDescription>
            Recent job notifications matching your preferences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Mail className="h-12 w-12 text-muted-foreground mb-3" />
            <h3 className="text-lg font-medium">No recent alerts</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-md">
              {notificationsEnabled
                ? "We'll notify you when new jobs matching your preferences are found"
                : "Enable notifications to start receiving job alerts"}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Jobs;
