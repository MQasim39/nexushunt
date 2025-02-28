
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
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (data: Partial<AuthUser>) => Promise<void>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state
  useEffect(() => {
    const getInitialSession = async () => {
      try {
        console.log("Getting initial session...");
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          logSupabaseError("getSession", error);
          setLoading(false);
          return;
        }
        
        console.log("Initial session retrieved:", data.session ? "exists" : "none");
        setSession(data.session);
        
        if (data.session?.user) {
          await fetchUserProfile(data.session.user);
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error("Unexpected error in getInitialSession:", error);
        setLoading(false);
      }
    };

    getInitialSession();
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log("Auth state change:", event);
        
        if (currentSession) {
          console.log("New session detected, user ID:", currentSession.user?.id);
          setSession(currentSession);
          
          if (currentSession.user) {
            await fetchUserProfile(currentSession.user);
          }
        } else {
          console.log("No session in auth change event");
          setSession(null);
          setUser(null);
          setLoading(false);
        }
      }
    );

    return () => {
      console.log("Cleaning up auth subscription");
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (authUser: User) => {
    try {
      console.log("Fetching profile for user:", authUser.id);
      
      // First try to get the profile from the profiles table
      const { data, error } = await supabase
        .from('profiles')
        .select('username, email')
        .eq('id', authUser.id)
        .maybeSingle();

      if (error) {
        logSupabaseError("fetchProfile", error);
        
        // If there's no profile, create one
        if (error.code === 'PGRST116') {
          console.log("Profile not found, creating new profile");
          
          const username = authUser.email?.split('@')[0] || 'user';
          
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: authUser.id,
              username,
              email: authUser.email
            });
            
          if (insertError) {
            logSupabaseError("createProfile", insertError);
            throw insertError;
          }
          
          setUser({
            id: authUser.id,
            email: authUser.email || '',
            username
          });
        } else {
          throw error;
        }
      } else {
        console.log("Profile data retrieved:", data);
        setUser({
          id: authUser.id,
          email: authUser.email || '',
          username: data?.username || authUser.email?.split('@')[0] || 'user'
        });
      }
    } catch (error) {
      console.error("Error in fetchUserProfile:", error);
      toast.error("Failed to load user profile");
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }
    
    setLoading(true);
    console.log("Attempting login with:", email);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password
      });
      
      if (error) {
        logSupabaseError("login", error);
        throw error;
      }
      
      if (!data?.user) {
        throw new Error("User data not returned from authentication");
      }
      
      console.log("Login successful, user ID:", data.user.id);
      toast.success("Successfully logged in");
      
      // The auth listener will handle updating the user state
    } catch (error) {
      if (error instanceof AuthError) {
        // Handle specific auth errors
        if (error.message.includes("Invalid login")) {
          toast.error("Invalid email or password");
        } else if (error.message.includes("Email not confirmed")) {
          toast.error("Please verify your email before logging in");
        } else {
          toast.error(error.message);
        }
      } else {
        toast.error("Failed to log in");
      }
      console.error("Login error:", error);
      setLoading(false);
      throw error;
    }
  };

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
    console.log("Attempting signup with:", email);
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });
      
      if (error) {
        logSupabaseError("signup", error);
        throw error;
      }
      
      if (!data?.user) {
        throw new Error("User data not returned from signup");
      }
      
      console.log("Signup successful, user ID:", data.user.id);
      
      // Generate username from email
      const username = email.split('@')[0];
      
      // Only create a profile if we didn't get a session (email confirmation required)
      if (!data.session) {
        console.log("Creating user profile for new signup");
        
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            username,
            email: email.trim().toLowerCase()
          });
          
        if (profileError) {
          logSupabaseError("createProfileAfterSignup", profileError);
          console.warn("Profile creation failed but signup succeeded");
        }
      }

      toast.success("Account created successfully! Check your email to verify your account.");
      setLoading(false);
      
    } catch (error) {
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
      setLoading(false);
      throw error;
    }
  };

  const logout = async () => {
    try {
      console.log("Logging out user");
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        logSupabaseError("logout", error);
        throw error;
      }
      
      toast.success("Logged out successfully");
      
      // The auth listener will clear the user state
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to log out");
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    if (!email) {
      toast.error("Please enter your email");
      return;
    }
    
    setLoading(true);
    console.log("Requesting password reset for:", email);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        email.trim().toLowerCase(),
        {
          redirectTo: `${window.location.origin}/reset-password-confirm`,
        }
      );
      
      if (error) {
        logSupabaseError("resetPassword", error);
        throw error;
      }
      
      toast.success("Password reset link sent to your email");
      setLoading(false);
    } catch (error) {
      console.error("Password reset error:", error);
      toast.error("Failed to send password reset email");
      setLoading(false);
      throw error;
    }
  };

  const updateProfile = async (data: Partial<AuthUser>) => {
    if (!user) {
      toast.error("You must be logged in to update your profile");
      throw new Error("Not authenticated");
    }
    
    setLoading(true);
    console.log("Updating profile for user:", user.id);
    
    try {
      // Update profile in the database
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          username: data.username,
          email: data.email
        })
        .eq('id', user.id);
      
      if (profileError) {
        logSupabaseError("updateProfile", profileError);
        throw profileError;
      }
      
      // If email was changed, update it in auth
      if (data.email && data.email !== user.email) {
        console.log("Updating email in auth system");
        
        const { error: authError } = await supabase.auth.updateUser({
          email: data.email.trim().toLowerCase()
        });
        
        if (authError) {
          logSupabaseError("updateUserEmail", authError);
          throw authError;
        }
      }
      
      // Update local user state
      setUser(prev => prev ? { ...prev, ...data } : null);
      toast.success("Profile updated successfully");
      setLoading(false);
    } catch (error) {
      console.error("Update profile error:", error);
      toast.error("Failed to update profile");
      setLoading(false);
      throw error;
    }
  };

  const updatePassword = async (currentPassword: string, newPassword: string) => {
    if (!user) {
      toast.error("You must be logged in to change your password");
      throw new Error("Not authenticated");
    }
    
    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }
    
    setLoading(true);
    console.log("Updating password for user:", user.id);
    
    try {
      // Verify current password
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword
      });
      
      if (signInError) {
        logSupabaseError("verifyCurrentPassword", signInError);
        throw new Error("Current password is incorrect");
      }
      
      // Update to new password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (updateError) {
        logSupabaseError("updatePassword", updateError);
        throw updateError;
      }
      
      toast.success("Password updated successfully");
      setLoading(false);
    } catch (error) {
      console.error("Update password error:", error);
      
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Failed to update password");
      }
      
      setLoading(false);
      throw error;
    }
  };

  const contextValue = {
    user,
    session,
    loading,
    login,
    signup,
    logout,
    resetPassword,
    updateProfile,
    updatePassword
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
