import { useState, useCallback, useEffect } from 'react';

interface UseAuthReturn {
  userEmail: string | null;
  isVerifying: boolean;
  authError: string | null;
  emailInput: string;
  setEmailInput: (email: string) => void;
  handleVerifyEmail: (e: React.FormEvent) => Promise<void>;
  handleLogout: () => void;
}

export const useAuth = (): UseAuthReturn => {
  const [userEmail, setUserEmail] = useState<string | null>(localStorage.getItem('user_email'));
  const [isVerifying, setIsVerifying] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);

  const handleVerifyEmail = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput) return;

    setIsVerifying(true);
    setAuthError(null);
    try {
      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailInput }),
      });

      if (response.ok) {
        const data = await response.json();
        setUserEmail(data.email);
        setEmailInput('');
        localStorage.setItem('user_email', data.email);
      } else {
        const error = await response.json();
        setAuthError(error.error || 'Email không có quyền truy cập!');
      }
    } catch (error) {
      console.error('Verification failed:', error);
      setAuthError('Lỗi kết nối máy chủ! Vui lòng thử lại sau.');
    } finally {
      setIsVerifying(false);
    }
  }, [emailInput]);

  const handleLogout = useCallback(() => {
    setUserEmail(null);
    localStorage.removeItem('user_email');
    setEmailInput('');
    setAuthError(null);
  }, []);

  return {
    userEmail,
    isVerifying,
    authError,
    emailInput,
    setEmailInput,
    handleVerifyEmail,
    handleLogout,
  };
};
