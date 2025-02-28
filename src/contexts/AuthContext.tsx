
import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { Session, User } from "@supabase/supabase-js";

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
  signup: (email: string, password: string) => Promise<void>; // Removed username parameter
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (data: Partial<AuthUser>) => Promise<void>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        fetchUserProfile(session.user);
      } else {
        setLoading(false);
      }
    });

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      if (session) {
        await fetchUserProfile(session.user);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    // Clean up subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (authUser: User) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('username, email')
        .eq('id', authUser.id)
        .single();

      if (error) {
        throw error;
      }

      setUser({
        id: authUser.id,
        email: authUser.email || '',
        username: data?.username || '',
      });
    } catch (error) {
      console.error('Error fetching user profile:', error);
      toast.error('Failed to load user profile');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string, remember = false) => {
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }
    
    setLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });
      
      if (error) throw error;
      
      if (!data?.user) {
        throw new Error("Authentication failed");
      }

      toast.success("Successfully logged in");
      
      // Wait for auth state to update fully
      await fetchUserProfile(data.user);
      
      // Navigate to dashboard after successful login
      window.location.href = '/dashboard';
      
    } catch (error: any) {
      console.error("Login error:", error);
      setLoading(false);
      toast.error(error.message || "Login failed");
    }
  };

  const signup = async (email: string, password: string) => {
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }
    
    setLoading(true);
    
    try {
      // First, create the auth user
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
      });
      
      if (error) throw error;
      if (!data?.user?.id) throw new Error('Failed to create user account');

      // Generate a username from the email
      const username = email.split('@')[0];

      // Then create the profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([{
          id: data.user.id,
          username,
          email: email.trim().toLowerCase(),
        }]);
          
      if (profileError) {
        console.error('Profile creation failed:', profileError);
        toast.error('Account created but profile setup failed. Please contact support.');
        return;
      }

      toast.success("Account created successfully! Please log in.");
      
      // Navigate to login page
      window.location.href = '/login';
      
    } catch (error: any) {
      console.error("Signup error:", error);
      toast.error(error.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }
      
      toast.success("Logged out successfully");
    } catch (error: any) {
      toast.error(error.message || "Logout failed");
    }
  };

  const resetPassword = async (email: string) => {
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password-confirm`,
      });
      
      if (error) {
        throw error;
      }
      
      toast.success("Password reset link sent to your email");
    } catch (error: any) {
      toast.error(error.message || "Password reset failed");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (data: Partial<AuthUser>) => {
    if (!user) throw new Error("Not authenticated");
    
    setLoading(true);
    
    try {
      // Update the username in the profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          username: data.username,
          email: data.email,
        })
        .eq('id', user.id);
      
      if (profileError) {
        throw profileError;
      }
      
      // If email was changed, update it in auth.users
      if (data.email && data.email !== user.email) {
        const { error: authError } = await supabase.auth.updateUser({
          email: data.email,
        });
        
        if (authError) {
          throw authError;
        }
      }
      
      // Update local user state
      setUser(prev => prev ? { ...prev, ...data } : null);
      
      toast.success("Profile updated successfully");
    } catch (error: any) {
      toast.error(error.message || "Profile update failed");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updatePassword = async (currentPassword: string, newPassword: string) => {
    if (!user) throw new Error("Not authenticated");
    
    setLoading(true);
    
    try {
      // With Supabase, we need to first verify the current password by signing in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });
      
      if (signInError) {
        throw new Error("Current password is incorrect");
      }
      
      // Then update to the new password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });
      
      if (updateError) {
        throw updateError;
      }
      
      toast.success("Password updated successfully");
    } catch (error: any) {
      toast.error(error.message || "Password update failed");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    session,
    loading,
    login,
    signup,
    logout,
    resetPassword,
    updateProfile,
    updatePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
