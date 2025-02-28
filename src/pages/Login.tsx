
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { StarBorder } from "@/components/ui/star-border";

const Login = () => {
  const navigate = useNavigate();
  const { login, loading, session } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Redirect if already logged in
  useEffect(() => {
    if (session) {
      console.log("User already logged in, redirecting to dashboard");
      navigate('/dashboard');
    }
  }, [session, navigate]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      console.log("Submitting login form");
      await login(email, password);
      
      // Login is handled by the auth context
      // If successful, we should get redirected by the useEffect above
      console.log("Login function completed");
    } catch (error) {
      console.error("Login form submission error:", error);
      // The error toast is displayed in the auth context
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center p-4 animate-fade-in">
      <StarBorder 
        as="div" 
        className="w-full max-w-md" 
        color="#00FF41"
      >
        <div className="space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-neon">Welcome back</h1>
            <p className="mt-2 text-muted-foreground">
              Sign in to your account to continue
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
                  onChange={e => setEmail(e.target.value)} 
                  className="bg-background/50 border-border/50 focus:border-neon focus:ring-neon/20" 
                  required 
                  disabled={isSubmitting || loading}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link to="/reset-password" className="text-xs hover:text-neon transition-colors">
                    Forgot password?
                  </Link>
                </div>
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="••••••••" 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  className="bg-background/50 border-border/50 focus:border-neon focus:ring-neon/20" 
                  required 
                  disabled={isSubmitting || loading}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="remember" 
                  checked={rememberMe} 
                  onCheckedChange={checked => setRememberMe(checked === true)} 
                  disabled={isSubmitting || loading}
                />
                <Label htmlFor="remember" className="text-sm font-normal">
                  Remember me
                </Label>
              </div>
            </div>

            <div className="flex justify-center">
              <Button 
                type="submit" 
                variant="neon"
                className="px-8 border border-neon text-neon hover:bg-neon/10" 
                disabled={isSubmitting || loading}
              >
                {isSubmitting || loading ? "Signing in..." : "Sign in"}
              </Button>
            </div>

            <div className="text-center text-sm">
              <span className="text-muted-foreground">Don't have an account?</span>{" "}
              <Link to="/signup" className="font-medium hover:text-neon transition-colors">
                Create one
              </Link>
            </div>
          </form>
        </div>
      </StarBorder>
    </div>
  );
};

export default Login;
