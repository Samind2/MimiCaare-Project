import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const GuestRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div>Loading...</div>;

  // ถ้า login แล้ว → ไปหน้า Home
  if (user) return <Navigate to="/" replace />;

  return children;
};

export default GuestRoute;
