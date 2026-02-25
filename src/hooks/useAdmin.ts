import { useState, useEffect, useCallback } from 'react';

const TOKEN_KEY = 'auth_token';

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
      if (!userEmail) {
        setIsAdmin(false);
        setCurrentView('home');
        return;
      }
      try {
        const token = localStorage.getItem(TOKEN_KEY);
        const res = await fetch('/api/admin/check', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setIsAdmin(data.isAdmin ?? false);
        if (!data.isAdmin) setCurrentView('home');
      } catch {
        setIsAdmin(false);
        setCurrentView('home');
      }
    };
    checkAdmin();
  }, [userEmail]);

  return { isAdmin, currentView, setCurrentView };
};
