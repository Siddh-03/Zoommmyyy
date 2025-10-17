import React from "react";
import withAuth from "../utils/withAuth";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import "../App.css";
import IconButton from "@mui/material/IconButton";
import RestoreIcon from "@mui/icons-material/Restore";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
function HomeComponent() {
  let navigate = useNavigate();

  const [meetingCode, setMeetingCode] = useState("");

  const { addToHistory } = useContext(AuthContext);
  let handleJoinVideoCall = async () => {
    await addToHistory(meetingCode);
    navigate(`/meet/${meetingCode}`);
  };

  const handleHistoryClick = () => {
    navigate("/history");
  };

  return (
    <>
      <div className="navBar">
        <div style={{ display: "flex", alignItems: "center" }}>
          <h2>Welcome to Zooomyyy</h2>
        </div>

        <div style={{ display: "flex", alignItems: "center" }}>
          <IconButton onClick={handleHistoryClick}>
            <RestoreIcon />
            <p>History</p>
          </IconButton>

          <Button
            onClick={() => {
              localStorage.removeItem("token");
              navigate("/auth");
            }}
          >
            Logout
          </Button>
        </div>
      </div>
      <div className="meetContainer">
        <div className="leftPannel">
          <h2>Providing Quality Video call just like Quality Websites</h2>

          <div style={{ display: "flex", gap: "10px" }}>
            <TextField
              onChange={(e) => setMeetingCode(e.target.value)}
              id="outlined-basic"
              label="Meeting Code"
              variant="outlined"
            />
            <Button onClick={handleJoinVideoCall} variant="contained">
              Join
            </Button>
          </div>
        </div>
        <div className="rightPannel">
          <img srcSet="/logo3.png" alt="" />
        </div>
      </div>
    </>
  );
}

export default withAuth(HomeComponent);
