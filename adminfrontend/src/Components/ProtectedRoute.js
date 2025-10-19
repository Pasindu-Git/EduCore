import React from "react";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ element, allowedRoles }) {
  const role = localStorage.getItem("role");
  const token = localStorage.getItem("token");

  if (!token) {
    // User not logged in
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    // User logged in but doesn’t have permission
    return <Navigate to="/dashboard" replace />;
  }

  return element;
}
