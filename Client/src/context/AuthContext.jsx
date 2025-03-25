import React, { createContext, useState, useEffect } from "react";
import userService from "../service/user.service";
import TokenService from "../service/token.service"; // นำเข้า TokenService

export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const storedUser = TokenService.getUser(); // ดึงข้อมูลผู้ใช้จาก localStorage
        if (storedUser) {
            setUser(storedUser);
        }
    }, []);

    // ฟังก์ชันสมัครสมาชิก
    const signup = async (userData) => {
        setLoading(true);
        try {
            const response = await userService.signup(userData); // Send the full object
            const user = response.data;

            TokenService.setUser(user); // เก็บข้อมูลผู้ใช้ใน localStorage
            setUser(user);
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
            const response = await userService.login(userData); // Send the full object
            const user = response.data;

            TokenService.setUser(user); // เก็บข้อมูลผู้ใช้ใน localStorage
            setUser(user);
        }
        catch (error) {
            console.error("Login Error:", error);
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
      TokenService.removeUser(); // ลบข้อมูลผู้ใช้จาก localStorage
      setUser(null); // รีเซ็ตผู้ใช้ใน Context
  };

    const authInfo = {
        user,
        signup,
        login,
        logout,
        loading
    };

    return (
        <AuthContext.Provider value={authInfo}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;
