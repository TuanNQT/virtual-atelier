import React, { useState, useCallback, useEffect } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import { User } from '../../types';

const TOKEN_KEY = 'auth_token';

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem(TOKEN_KEY);
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

interface AdminPageProps {
  adminEmail: string;
}

export const AdminPage: React.FC<AdminPageProps> = ({ adminEmail }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [newEmail, setNewEmail] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);

  const fetchUsers = useCallback(async () => {
    try {
      // ✅ Đổi sang GET, không gửi adminEmail trong body nữa
      const res = await fetch('/api/admin/list-users', {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (data.users) setUsers(data.users);
    } catch (e) {
      console.error('Failed to fetch users', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail) return;
    setIsAdding(true);
    try {
      const res = await fetch('/api/admin/add-user', {
        method: 'POST',
        headers: getAuthHeaders(),
        // ✅ Không gửi adminEmail — server tự xác thực qua token
        body: JSON.stringify({ email: newEmail }),
      });
      if (res.ok) {
        setNewEmail('');
        fetchUsers();
      } else {
        const data = await res.json();
        alert(data.error || 'Lỗi khi thêm user');
      }
    } catch {
      alert('Lỗi kết nối');
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteUser = async (email: string) => {
    if (!confirm(`Bạn có chắc muốn xóa user ${email}?`)) return;
    try {
      const res = await fetch('/api/admin/delete-user', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        fetchUsers();
      } else {
        const data = await res.json();
        alert(data.error || 'Lỗi khi xóa user');
      }
    } catch {
      alert('Lỗi kết nối');
    }
  };

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <h2 className="serif text-4xl mb-4">Quản trị hệ thống</h2>
          <p className="text-sm text-black/40 uppercase tracking-[0.2em] font-black">Quản lý người dùng & Thống kê</p>
        </div>

        <form onSubmit={handleAddUser} className="flex gap-3">
          <input
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            placeholder="Email người dùng mới"
            className="px-6 py-4 rounded-2xl bg-white border border-black/5 focus:ring-2 focus:ring-black/10 transition-all text-sm min-w-[300px]"
            required
          />
          <button
            type="submit"
            disabled={isAdding}
            className="px-8 py-4 bg-[#1a1a1a] text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-black transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {isAdding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            Thêm
          </button>
        </form>
      </div>

      <div className="bg-white rounded-[40px] overflow-hidden shadow-2xl shadow-black/5 border border-black/5">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-black/5">
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest opacity-40">Email</th>
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest opacity-40">Số lượt request</th>
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest opacity-40 text-right">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5">
            {isLoading ? (
              <tr>
                <td colSpan={3} className="px-8 py-20 text-center">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto opacity-20" />
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-8 py-20 text-center opacity-40 text-sm italic">
                  Chưa có người dùng nào được thêm.
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.email} className="hover:bg-black/[0.02] transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-black/5 flex items-center justify-center text-xs font-bold">
                        {user.email[0].toUpperCase()}
                      </div>
                      <span className="text-sm font-medium">{user.email}</span>
                      {user.email.toLowerCase() === adminEmail.toLowerCase() && (
                        <span className="px-2 py-0.5 bg-orange-100 text-orange-600 text-[8px] font-black uppercase tracking-widest rounded-full">
                          Admin
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-serif italic">{user.request_count}</span>
                      <span className="text-[10px] font-black uppercase tracking-widest opacity-20">lượt</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    {user.email.toLowerCase() !== adminEmail.toLowerCase() && (
                      <button
                        onClick={() => handleDeleteUser(user.email)}
                        className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
