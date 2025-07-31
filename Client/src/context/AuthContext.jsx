import React, { createContext, useState, useEffect } from "react";
import userService from "../service/user.service";
import TokenService from "../service/token.service";

export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = TokenService.getUser();
    if (currentUser) {
      setUser(currentUser);
    }
    setLoading(false);
  }, []);

  const signup = async (userData) => {
    setLoading(true);
    try {
      const response = await userService.signup(userData);
      const user = response.data;

      TokenService.setUser(user);
      setUser(user);
    } catch (error) {
      console.error("Signup Error:", error);
          throw error;
    } finally {
      setLoading(false);
    }
  };


 const login = async (userData) => {
  setLoading(true);
  try {
    const response = await userService.login(userData);
    const user = response.data; // user มี role ด้วย

    TokenService.setUser(user);  // เก็บ user รวม role
    //console.log("login response:", response.data);
    setUser(user);               // set state user รวม role

    return user;
  } catch (error) {
    console.error("Login Error:", error);
    throw error;
  } finally {
    setLoading(false);
  }
};


  const logout = () => {
    TokenService.removeUser();
    userService.logout(); // เรียก API logout ด้วยไอสัส By E'Pashon
    setUser(null);
  };

  const updateProfile = async (userData) => {
    try {
      const response = await userService.updateProfile(userData);
      const updatedUser = response.data;

      console.log("Updated User Data:", updatedUser);

      const newUserData = { ...user, ...updatedUser };

      TokenService.setUser(newUserData);
      setUser({ ...newUserData });
    } catch (error) {
      console.error("Error updating profile:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const authInfo = {
    user,
    signup,
    login,
    logout,
    updateProfile,
    loading,
  };

  return (
    <AuthContext.Provider value={authInfo}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
