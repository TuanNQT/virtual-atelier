import { useState, useEffect, useCallback } from 'react';

interface UseAdminReturn {
  isAdmin: boolean;
  currentView: 'home' | 'admin';
  setCurrentView: (view: 'home' | 'admin') => void;
}

export const useAdmin = (userEmail: string | null): UseAdminReturn => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentView, setCurrentView] = useState<'home' | 'admin'>('home');

  useEffect(() => {
    const checkAdmin = async () => {
      if (userEmail) {
        try {
          const res = await fetch('/api/admin/check', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: userEmail }),
          });
          const data = await res.json();
          setIsAdmin(data.isAdmin);
          if (!data.isAdmin) {
            setCurrentView('home');
          }
        } catch (e) {
          console.error('Admin check failed', e);
          setIsAdmin(false);
          setCurrentView('home');
        }
      } else {
        setIsAdmin(false);
        setCurrentView('home');
      }
    };
    checkAdmin();
  }, [userEmail]);

  return { isAdmin, currentView, setCurrentView };
};
