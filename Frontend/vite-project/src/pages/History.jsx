import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  Snackbar,
  Card,
  CardContent,
  Typography,
  IconButton,
  CircularProgress, // For the loading indicator
  Box,
} from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";

export default function History() {
  const { getHistoryOfUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true); // <-- Add loading state
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const history = await getHistoryOfUser();
        setMeetings(history);
      } catch (error) {
        console.error("Failed to fetch history:", error);
        setSnackbarMessage("Failed to load meeting history.");
        setSnackbarOpen(true);
      } finally {
        setLoading(false); // <-- Stop loading in both success and error cases
      }
    };
    fetchHistory();
  }, [getHistoryOfUser]);

  // Show a loading spinner while fetching data
  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <div>
      <IconButton onClick={() => navigate("/home")} aria-label="go to home">
        <HomeIcon />
      </IconButton>

      {/* Check if there are no meetings AFTER loading is complete */}
      {!loading && meetings.length === 0 ? (
        <Typography sx={{ textAlign: "center", marginTop: 4 }}>
          No meeting history found.
        </Typography>
      ) : (
        meetings.map((meeting, index) => (
          <Card key={meeting.id || index} variant="outlined" sx={{ margin: 2 }}>
            <CardContent>
              <Typography
                sx={{ fontSize: 14 }}
                color="text.secondary"
                gutterBottom
              >
                {/* Replace with your actual meeting data */}
                Meeting on {new Date(meeting.date).toLocaleDateString()}
              </Typography>
              <Typography color="text.secondary">
                Room ID: {meeting.meetingCode}
              </Typography>
            </CardContent>
          </Card>
        ))
      )}

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
      />
    </div>
  );
}
