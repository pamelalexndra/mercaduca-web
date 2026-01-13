import React from "react";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, requiredRole }) {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userRole = user?.Rol || user?.role;

  if (!token) {
    return <Navigate to="/vender" />;
  }

  if (requiredRole && userRole !== requiredRole) {
    return <Navigate to="/forbidden" />;
  }

  return children;
}