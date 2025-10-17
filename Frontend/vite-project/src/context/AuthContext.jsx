import { Children, createContext, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import httpStatus from "http-status";
import { useEffect } from "react";

export const AuthContext = createContext({});

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL, 
});

export const AuthProvider = ({ children }) => {
  const authContext = useContext(AuthContext);

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); 

  useEffect(() => {
    const checkUserSession = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          // You need a server endpoint that verifies a token and returns the user
          // Let's assume you have a '/me' endpoint for this.
          const response = await client.get("/me", {
            headers: { Authorization: `Bearer ${token}` },
          });
          setUser(response.data.user);
        } catch (error) {
          // Token is invalid or expired
          localStorage.removeItem("token");
          console.error("Session check failed:", error);
        }
      }
      // Stop loading after the check is complete
      setLoading(false);
    };

    checkUserSession();
  }, []);

  const handleRegister = async (name, username, password) => {
    try {
      let request = await client.post("/register", {
        name: name,
        username: username,
        password: password,
      });
      if (request.status === httpStatus.CREATED) {
        return request.data;
      }
    } catch (err) {
      throw err;
    }
  };

  // In AuthContext.jsx

const getHistoryOfUser = async () => {
  try {
    const token = localStorage.getItem("token");

    let request = await client.get("/get_all_activity", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (request.status === httpStatus.OK) {
      return Array.isArray(request.data) ? request.data : [];
    }
  } catch (err) {
    console.error("Error fetching history:", err);
    throw err;
  }
};

  const handleLogin = async (username, password) => {
    try {
      let request = await client.post("/login", {
        username: username,
        password: password,
      });
      if (request.status === httpStatus.OK) {
        localStorage.setItem("token", request.data.token);
        setUser(request.data.user);
      }
    } catch (err) {
      throw err;
    }
  };


const addToHistory = async (meetingCode) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No token found, cannot add to history.");
      return;
    }
    
    let request = await client.post("/add_to_activity", 
      { meetingCode: meetingCode }, 
      { 
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    return request;
  } catch (e) {
    console.error("Error in addToHistory:", e.response?.data || e.message);
    throw e;
  }
};

  const router = useNavigate();

  const data = {
    user,
    setUser,
    loading,
    handleRegister,
    handleLogin,
    getHistoryOfUser,
    addToHistory
  };

  return <AuthContext.Provider value={data}>{children}</AuthContext.Provider>;
};
