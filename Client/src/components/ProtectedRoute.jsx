import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext"; // ใช้ AuthContext ที่มีอยู่แล้ว

const ProtectedRoute = ({ children }) => {
    const { user, loading } = useContext(AuthContext); // นำค่า user และ loading มาจาก AuthContext

    if (loading) {
        return <div>Loading...</div>; // แสดงหน้าจอโหลดจนกว่าข้อมูลจะโหลดเสร็จ
    }

    if (!user) {
        return <Navigate to="/Signin" />; // ถ้าไม่มีผู้ใช้ให้ไปที่หน้าเข้าสู่ระบบ
    }

    return children; // ถ้ามีผู้ใช้ ให้แสดง children (หน้าเพจที่ต้องการเข้าถึง)
};

export default ProtectedRoute;
