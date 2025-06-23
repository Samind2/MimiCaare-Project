import React from 'react';
import { Navigate, useLocation } from "react-router";
import { AuthContext } from "../context/AuthContext";
import { useContext } from "react";

const AdminRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext); // ✅ ใช้ loading แทน isLoading
  const location = useLocation();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (user && user?.role === "admin") {
    return children;
  }

  return <Navigate to="/" state={{ from: location }} replace />;
};

export default AdminRoute;
