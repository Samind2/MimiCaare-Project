import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div>Loading...</div>;

  if (!user) return <Navigate to="/Signin" replace />;

  if (allowedRoles && !allowedRoles.includes(user.role)) {

    if (user.role === "admin") {
      return <Navigate to="/dashboard" replace />;
    } else {
      return <Navigate to="/" replace />; // user ปกติพยายามเข้า page admin
    }
  }

  return children;
};

export default ProtectedRoute;
