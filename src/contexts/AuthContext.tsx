import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase, logSupabaseError } from "@/lib/supabase";
import { Session, User, AuthError } from "@supabase/supabase-js";

type AuthUser = {
  id: string;
  email: string;
  username: string;
};

type AuthContextType = {
  user: AuthUser | null;
  session: Session | null;
  loading: boolean;
  login: (email: string, password: string, remember?: boolean) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (data: Partial<AuthUser>) => Promise<void>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true); // Start with true to indicate initial loading

  // Single useEffect for auth initialization
  useEffect(() => {
    const fetchUserProfile = async (authUser: User) => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .single();
        
        if (error) {
          logSupabaseError("fetchUserProfile", error);
          throw error;
        }
        
        setUser({
          id: authUser.id,
          email: authUser.email || '',
          username: data?.username || authUser.email?.split('@')[0] || 'user'
        });
      } catch (error) {
        console.error("Error fetching user profile:", error);
        toast.error("Failed to load user profile");
      } finally {
        setLoading(false);
      }
    };

    const getInitialSession = async () => {
      try {
        // Check if remember me was set to false
        const rememberMe = localStorage.getItem('rememberMe');
        if (rememberMe === 'false') {
          await supabase.auth.signOut();
          localStorage.removeItem('rememberMe');
        }
        
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          logSupabaseError("getSession", error);
          setLoading(false);
          return;
        }
        
        setSession(data.session);
        
        if (data.session?.user) {
          await fetchUserProfile(data.session.user);
        } else {
          setLoading(false); // No session, so we're done loading
        }
      } catch (error) {
        console.error("Unexpected error in getInitialSession:", error);
        setLoading(false);
      }
    };

    getInitialSession();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log("Auth state change:", event);
        
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          setLoading(true); // Set loading to true when auth state changes
        }
        
        if (currentSession) {
          setSession(currentSession);
          
          if (currentSession.user) {
            await fetchUserProfile(currentSession.user);
          }
        } else {
          setSession(null);
          setUser(null);
          setLoading(false);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Rebuilt login function
  const login = async (email: string, password: string, remember = false) => {
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }
    
    setLoading(true);
    
    try {
      // Store remember me preference
      localStorage.setItem('rememberMe', remember ? 'true' : 'false');
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password
      });
      
      if (error) throw error;
      
      if (!data?.user) {
        setLoading(false); // Reset loading if no user
        throw new Error("Authentication failed");
      }
      
      toast.success("Successfully logged in");
      
      // Auth state listener will handle the rest
      // Don't set loading to false here - let the auth state change handler do it
    } catch (error) {
      setLoading(false);
      
      if (error instanceof AuthError) {
        if (error.message.includes("Invalid login")) {
          toast.error("Invalid email or password");
        } else {
          toast.error(error.message);
        }
      } else {
        toast.error("Failed to log in");
      }
      
      console.error("Login error:", error);
    }
  };

  // Rebuilt signup function
  const signup = async (email: string, password: string) => {
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }
    
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    
    setLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });
      
      if (error) throw error;
      
      if (!data?.user) {
        throw new Error("Failed to create account");
      }
      
      // Generate username from email
      const username = email.split('@')[0];
      
      // Create profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          username,
          email: email.trim().toLowerCase()
        });
        
      if (profileError) {
        console.warn("Profile creation failed but signup succeeded");
      }

      toast.success("Account created successfully!");
      
      // Don't set loading to false here - let the auth state listener do it
      
    } catch (error) {
      setLoading(false);
      
      if (error instanceof AuthError) {
        if (error.message.includes("already registered")) {
          toast.error("This email is already registered");
        } else {
          toast.error(error.message);
        }
      } else {
        toast.error("Failed to create account");
      }
      
      console.error("Signup error:", error);
    }
  };

  // Rest of your functions remain the same
  const logout = async () => {
    try {
      setLoading(true); // Set loading to true during logout
      localStorage.removeItem('rememberMe');
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }
      
      toast.success("Logged out successfully");
      // The auth state listener will set loading to false
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to log out");
      setLoading(false);
    }
  };

  // Rest of your code...
  
  const contextValue = {
    user,
    session,
    loading,
    login,
    signup,
    logout,
    resetPassword: async (email: string) => {
      try {
        setLoading(true);
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth/reset-password`,
        });
        
        if (error) throw error;
        
        toast.success("Password reset email sent");
      } catch (error) {
        console.error("Reset password error:", error);
        toast.error("Failed to send password reset email");
      } finally {
        setLoading(false);
      }
    },
    updateProfile: async (data: Partial<AuthUser>) => {
      try {
        setLoading(true);
        if (!user) throw new Error("No user logged in");
        
        // Update the profile in the database
        const { error } = await supabase
          .from('profiles')
          .update(data)
          .eq('id', user.id);
          
        if (error) throw error;
        
        // Update local user state
        setUser(prev => prev ? { ...prev, ...data } : null);
        
        toast.success("Profile updated successfully");
      } catch (error) {
        console.error("Update profile error:", error);
        toast.error("Failed to update profile");
      } finally {
        setLoading(false);
      }
    },
    updatePassword: async (currentPassword: string, newPassword: string) => {
      try {
        setLoading(true);
        const { error } = await supabase.auth.updateUser({
          password: newPassword
        });
        
        if (error) throw error;
        
        toast.success("Password updated successfully");
      } catch (error) {
        console.error("Update password error:", error);
        toast.error("Failed to update password");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  
  return context;
};