import { useState, useCallback, useEffect } from 'react';

const TOKEN_KEY = 'auth_token';

interface UseAuthReturn {
  userEmail: string | null;
  isVerifying: boolean;
  authError: string | null;
  emailInput: string;
  setEmailInput: (email: string) => void;
  handleVerifyEmail: (e: React.FormEvent) => Promise<void>;
  handleLogout: () => void;
  getAuthHeaders: () => Record<string, string>;
}

export const useAuth = (): UseAuthReturn => {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);

  // Khi app load: xác thực lại token với server thay vì tin localStorage
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return;

    fetch('/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (res.ok) return res.json();
        // Token hết hạn hoặc không hợp lệ
        localStorage.removeItem(TOKEN_KEY);
        return null;
      })
      .then((data) => {
        if (data?.email) setUserEmail(data.email);
      })
      .catch(() => localStorage.removeItem(TOKEN_KEY));
  }, []);

  const handleVerifyEmail = useCallback(
    async (e: React.FormEvent) => {
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
          // Lưu token, không lưu email raw
          localStorage.setItem(TOKEN_KEY, data.token);
          setUserEmail(data.email);
          setEmailInput('');
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
    },
    [emailInput]
  );

  const handleLogout = useCallback(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      fetch('/api/auth/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => {});
    }
    localStorage.removeItem(TOKEN_KEY);
    setUserEmail(null);
    setEmailInput('');
    setAuthError(null);
  }, []);

  const getAuthHeaders = useCallback((): Record<string, string> => {
    const token = localStorage.getItem(TOKEN_KEY);
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  return {
    userEmail,
    isVerifying,
    authError,
    emailInput,
    setEmailInput,
    handleVerifyEmail,
    handleLogout,
    getAuthHeaders,
  };
};
