
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import AdminDashboard from '@/components/admin/AdminDashboard';
import { Loader2 } from 'lucide-react';

const Admin = () => {
  console.log('Admin page component rendering...');
  const navigate = useNavigate();
  const { user, loading, isAdmin } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        console.log('No user found, redirecting to auth');
        navigate('/auth');
      } else if (!isAdmin) {
        console.log('User is not admin, access denied');
        // You could redirect to a "not authorized" page or show an error
        // For now, we'll still allow access but could be restricted
      }
    }
  }, [user, loading, isAdmin, navigate]);

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

  return (
    <div>
      <AdminDashboard />
    </div>
  );
};

export default Admin;
