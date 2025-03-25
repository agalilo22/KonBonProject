import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import axios from "axios";
import KanbanBoard from "./KanbanBoard"; // Import the real KanbanBoard
import "./App.css";

function App() {
  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogin = async (response) => {
    try {
      const { data } = await axios.post("http://localhost:3001/auth/google", {
        token: response.credential,
      });
      localStorage.setItem("user", JSON.stringify(data.user));
      console.log("Logged in:", data.user);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Kanban Productivity App</h1>
        {user ? (
          <KanbanBoard /> // This now uses the imported KanbanBoard
        ) : (
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