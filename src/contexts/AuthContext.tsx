
import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";

type User = {
  id: string;
  email: string;
  username: string;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string, remember?: boolean) => Promise<void>;
  signup: (email: string, username: string, password: string) => Promise<void>;
  logout: () => void;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock user storage - In a real app, this would be handled by a backend
const USERS_STORAGE_KEY = "neon_resume_hub_users";
const CURRENT_USER_KEY = "neon_resume_hub_current_user";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem(CURRENT_USER_KEY);
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const getUsers = (): Record<string, User & { password: string }> => {
    const users = localStorage.getItem(USERS_STORAGE_KEY);
    return users ? JSON.parse(users) : {};
  };

  const saveUsers = (users: Record<string, User & { password: string }>) => {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  };

  const login = async (email: string, password: string, remember = false) => {
    setLoading(true);
    
    // Simulate network request
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    try {
      const users = getUsers();
      const userRecord = Object.values(users).find(u => u.email === email);
      
      if (!userRecord || userRecord.password !== password) {
        throw new Error("Invalid email or password");
      }
      
      const { password: _, ...userWithoutPassword } = userRecord;
      setUser(userWithoutPassword);
      
      if (remember) {
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userWithoutPassword));
      } else {
        sessionStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userWithoutPassword));
      }
      
      toast.success("Successfully logged in");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Login failed");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email: string, username: string, password: string) => {
    setLoading(true);
    
    // Simulate network request
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    try {
      const users = getUsers();
      
      // Check if email already exists
      if (Object.values(users).some(u => u.email === email)) {
        throw new Error("Email already in use");
      }
      
      const newUser = {
        id: Date.now().toString(),
        email,
        username,
        password,
      };
      
      // Save new user
      users[newUser.id] = newUser;
      saveUsers(users);
      
      const { password: _, ...userWithoutPassword } = newUser;
      setUser(userWithoutPassword);
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userWithoutPassword));
      
      toast.success("Account created successfully");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Signup failed");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(CURRENT_USER_KEY);
    sessionStorage.removeItem(CURRENT_USER_KEY);
    toast.success("Logged out successfully");
  };

  const resetPassword = async (email: string) => {
    setLoading(true);
    
    // Simulate network request
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    try {
      const users = getUsers();
      const userExists = Object.values(users).some(u => u.email === email);
      
      if (!userExists) {
        throw new Error("No account found with that email");
      }
      
      // In a real app, this would send a password reset email
      toast.success("Password reset link sent to your email");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Password reset failed");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (data: Partial<User>) => {
    if (!user) throw new Error("Not authenticated");
    
    setLoading(true);
    
    // Simulate network request
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    try {
      const users = getUsers();
      const currentUser = users[user.id];
      
      if (!currentUser) {
        throw new Error("User not found");
      }
      
      // Update user data
      const updatedUser = {
        ...currentUser,
        ...data,
      };
      
      users[user.id] = updatedUser;
      saveUsers(users);
      
      const { password: _, ...userWithoutPassword } = updatedUser;
      setUser(userWithoutPassword);
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userWithoutPassword));
      
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Profile update failed");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updatePassword = async (currentPassword: string, newPassword: string) => {
    if (!user) throw new Error("Not authenticated");
    
    setLoading(true);
    
    // Simulate network request
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    try {
      const users = getUsers();
      const userRecord = users[user.id];
      
      if (!userRecord) {
        throw new Error("User not found");
      }
      
      // Verify current password
      if (userRecord.password !== currentPassword) {
        throw new Error("Current password is incorrect");
      }
      
      // Update password
      userRecord.password = newPassword;
      users[user.id] = userRecord;
      saveUsers(users);
      
      toast.success("Password updated successfully");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Password update failed");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
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
