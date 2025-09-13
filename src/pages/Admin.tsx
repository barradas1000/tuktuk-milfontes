import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "@/contexts/AuthContextInstance";
import AdminDashboard from "@/components/admin/AdminDashboard";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const Admin = () => {
  console.log("Admin page component rendering...");
  const navigate = useNavigate();
  const { user, loading, signOut, isAdmin } = useContext(AuthContext);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        console.log("No user found, redirecting to auth");
        navigate("/auth");
      } else {
        console.log("User authenticated, allowing admin access");
        // You can add admin role checking here later
      }
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to auth
  }

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <div className="relative min-h-screen">
      <div className="absolute top-4 right-4 z-10">
        <Button variant="outline" onClick={handleLogout}>
          Terminar Sessão
        </Button>
      </div>

      <AdminDashboard />
    </div>
  );
};

export default Admin;
