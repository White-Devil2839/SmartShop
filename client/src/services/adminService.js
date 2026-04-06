const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

export const getAdminStats = async () => {
    const token = localStorage.getItem('smartshop_token');
    const res = await fetch(`${API_URL}/api/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Failed to fetch stats');
    return res.json();
};
