
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { StarBorder } from "@/components/ui/star-border";

const Signup = () => {
  const navigate = useNavigate();
  const { signup, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password || !confirmPassword) {
      toast.error("Please fill in all fields");
      return;
    }
    
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await signup(email, password);
      // After signup, redirect to login
      setTimeout(() => {
        navigate("/login");
      }, 1000); // Small delay to ensure state updates
    } catch (error) {
      // Error is handled in the auth context
      console.error("Signup submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 animate-fade-in">
      <StarBorder as="div" className="w-full max-w-md" color="#FFFFFF">
        <div className="space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-neon">Create Account</h1>
            <p className="mt-2 text-muted-foreground">
              Register an account to manage your job applications
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
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
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-background/50 border-border/50 focus:border-neon focus:ring-neon/20"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="bg-background/50 border-border/50 focus:border-neon focus:ring-neon/20"
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="flex justify-center">
              <Button
                type="submit"
                variant="outline"
                className="bg-transparent border border-neon text-white hover:bg-neon/10 hover:text-neon px-8"
                disabled={isSubmitting || loading}
              >
                {isSubmitting || loading ? "Creating account..." : "Create Account"}
              </Button>
            </div>

            <div className="text-center text-sm">
              <span className="text-muted-foreground">Already have an account?</span>{" "}
              <Link to="/login" className="font-medium hover:text-neon transition-colors">
                Sign in
              </Link>
            </div>
          </form>
        </div>
      </StarBorder>
    </div>
  );
};

export default Signup;
