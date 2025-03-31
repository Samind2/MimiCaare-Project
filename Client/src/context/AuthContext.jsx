import React, { createContext, useState, useEffect } from "react";
import userService from "../service/user.service"; // เรียกใช้ service
import TokenService from "../service/token.service"; // นำเข้า TokenService

export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // กำหนดสถานะการโหลดเริ่มต้นเป็น true

  useEffect(() => {
    const currentUser = TokenService.getUser();
    if (currentUser) {
      setUser(currentUser); // ตั้งค่า user ถ้ามีข้อมูล
    }
    setLoading(false); // ตั้งค่า loading เป็น false หลังจากโหลดข้อมูลเสร็จ
  }, []);

  // ฟังก์ชันสำหรับสมัครสมาชิก
  const signup = async (userData) => {
    setLoading(true);
    try {
      const response = await userService.signup(userData); // เรียกใช้งาน API
      const user = response.data;

      TokenService.setUser(user); // เก็บข้อมูลผู้ใช้ใน cookies
      setUser(user); // ตั้งค่า user ใน state
    } catch (error) {
      console.error("Signup Error:", error);
    } finally {
      setLoading(false);
    }
  };

  // ฟังก์ชันเข้าสู่ระบบ
  const login = async (userData) => {
    setLoading(true);
    try {
      const response = await userService.login(userData); // เรียกใช้งาน API
      const user = response.data;

      TokenService.setUser(user); // เก็บข้อมูลผู้ใช้ใน cookies
      setUser(user); // ตั้งค่า user ใน state
    } catch (error) {
      console.error("Login Error:", error);
    } finally {
      setLoading(false);
    }
  };

  // ฟังก์ชันออกจากระบบ
  const logout = () => {
    TokenService.removeUser(); // ลบข้อมูลผู้ใช้จาก cookies
    setUser(null); // รีเซ็ตข้อมูลผู้ใช้ใน Context
  };

  // ฟังก์ชันอัปเดตโปรไฟล์
  const updateProfile = async (firstName, lastName, picture) => {
    try {
      setLoading(true);
      const updatedUser = { ...user, firstName, lastName, picture };
      await userService.updateProfile(updatedUser); // อัปเดตโปรไฟล์ผ่าน API
      TokenService.setUser(updatedUser); // เก็บข้อมูลใหม่ใน cookies
      setUser(updatedUser); // อัปเดตข้อมูลใน state
      setLoading(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      setLoading(false);
      throw error;
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
