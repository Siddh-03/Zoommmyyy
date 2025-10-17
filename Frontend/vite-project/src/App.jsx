import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Authentication from "./pages/Authentication";
import { AuthProvider } from "./context/AuthContext";
import VideoComponent from "./pages/VideoComponent";
import History from "./pages/History";
import Home from "./pages/Home";

function App() {
  return (
    <>
      <Router>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Landing />}></Route>
            <Route path="/home" element={<Home />}></Route>
            <Route path="/auth" element={<Authentication />}></Route>
            <Route path="/history" element={<History />}></Route>
            <Route path="/meet/:url" element={<VideoComponent />}></Route>
          </Routes>
        </AuthProvider>
      </Router>
    </>
  );
}

export default App;
