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
      setUser(currentUser); // อัพเดทข้อมูล user ใหม่จาก cookies
    }
    setLoading(false); // ตั้งค่า loading เป็น false หลังจากโหลดข้อมูลเสร็จ
  }, []); // ทำงานเมื่อแอพโหลดครั้งแรก

  // ฟังก์ชันสำหรับสมัครสมาชิก
  const signup = async (userData) => {
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
  const updateProfile = async (userData) => {
    try {
        const response = await userService.updateProfile(userData);
        const updatedUser = response.data;

        console.log("Updated User Data:", updatedUser);

        // สร้าง object ใหม่ เพื่อให้ React ตรวจจับการเปลี่ยนแปลง
        const newUserData = { ...user, ...updatedUser };

        // บันทึกลง localStorage และอัปเดต Context
        TokenService.setUser(newUserData);
        setUser({ ...newUserData }); // บังคับให้ React รีเรนเดอร์

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