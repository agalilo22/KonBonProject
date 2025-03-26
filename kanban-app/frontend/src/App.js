import { useState } from "react";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import axios from "axios";
import KanbanBoard from "./KanbanBoard";
import "./App.css";

function App() {
  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem("user");
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (e) {
      console.error("Failed to parse user from localStorage:", e);
      return null;
    }
  });
  const API_BASE_URL = process.env.REACT_APP_API_URL || "https://konbonprojectbackend-production.up.railway.app";

  const handleLogin = async (response) => {
    try {
      const { data } = await axios.post(`${API_BASE_URL}/auth/google`, {
        token: response.credential,
      });
      console.log("Backend response:", data); // Debug: Check full response
      if (data && data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
        setUser(data.user);
        console.log("User set:", data.user); // Debug: Confirm user is set
      } else {
        console.error("No user data returned from backend:", data);
      }
    } catch (error) {
      console.error("Login failed:", error.response?.data || error.message);
    }
  };

  console.log("Current user state:", user); // Debug: Check state on render

  return (
    <div className="App">
      <header className="App-header">
        <h1>Kanban Productivity App</h1>
        {user ? <KanbanBoard /> : (
          <GoogleOAuthProvider clientId="975747761924-bfmcvsft1ekf1ocn31f2eecn9jgqrk4q.apps.googleusercontent.com">
            <GoogleLogin
              onSuccess={handleLogin}
              onError={(err) => console.error("Google Login Error:", err)}
            />
          </GoogleOAuthProvider>
        )}
      </header>
    </div>
  );
}

export default App;