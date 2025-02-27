
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { StarBorder } from "@/components/ui/star-border";

const ResetPassword = () => {
  const { resetPassword, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error("Please enter your email");
      return;
    }
    
    try {
      await resetPassword(email);
      setSubmitted(true);
    } catch (error) {
      // Error is handled in the auth context
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 animate-fade-in">
        <StarBorder as="div" className="w-full max-w-md" color="#00FF41">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-neon">Check Your Email</h1>
            <p className="mt-4 text-muted-foreground">
              We've sent a password reset link to <span className="text-neon">{email}</span>
            </p>
            <p className="mt-2 text-muted-foreground">
              Click the link in the email to reset your password. The link will expire in 1 hour.
            </p>
            <Button 
              variant="neon"
              className="mt-6"
              asChild
            >
              <Link to="/login">Back to Login</Link>
            </Button>
          </div>
        </StarBorder>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 animate-fade-in">
      <StarBorder as="div" className="w-full max-w-md" color="#00FF41">
        <div className="space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-neon">Reset Password</h1>
            <p className="mt-2 text-muted-foreground">
              Enter your email and we'll send you a link to reset your password
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-background/50 border-border/50 focus:border-neon focus:ring-neon/20"
                required
              />
            </div>

            <Button
              type="submit"
              variant="neon"
              className="w-full"
              disabled={loading}
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </Button>

            <div className="text-center text-sm">
              <Link to="/login" className="font-medium hover:text-neon transition-colors">
                Back to login
              </Link>
            </div>
          </form>
        </div>
      </StarBorder>
    </div>
  );
};

export default ResetPassword;
