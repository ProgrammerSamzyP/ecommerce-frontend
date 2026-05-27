import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('token', token);
      try {
        const decoded = jwtDecode(token);
        setUser({ email: decoded.sub, role: decoded.role });
      } catch {
        setUser(null);
        setToken(null);
      }
    } else {
      delete axios.defaults.headers.common['Authorization'];
      localStorage.removeItem('token');
      setUser(null);
    }
  }, [token]);

  const register = async (email, password, name) => {
    await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/register`, { email, password, name });
  };

  const login = async (email, password) => {
    const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/login`, { email, password });
    setToken(res.data.token);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);