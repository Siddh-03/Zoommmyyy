import { useState, useContext } from "react";
import {
  Button,
  FormControl,
  InputLabel,
  OutlinedInput,
  TextField,
  InputAdornment,
  IconButton,
  Box,
  Typography,
  Stack,
  Snackbar, // Used for button layout
} from "@mui/material";
import { AuthContext } from "../context/AuthContext";
import AccountCircle from "@mui/icons-material/AccountCircle";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { useNavigate } from "react-router-dom";

export default function Authentication() {
  const navigate = useNavigate();

  const { handleRegister, handleLogin } = useContext(AuthContext);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isSignUp, setIsSignUp] = useState(true);
  // const [Error, setError] = useState();
  const [open, setOpen] = useState();
  const [message, setMessage] = useState();

  let handleAuth = async (e) => {
    e.preventDefault();

    try {
      if (isSignUp) {
        // --- Handle Sign Up ---
        await handleRegister(name, username, password);
        setMessage("User created successfully! Please sign in.");
        setOpen(true);
        setName("");
        setUsername("");
        setPassword("");
        setIsSignUp(false); // Switch to sign-in form after registration
      } else {
        // --- Handle Sign In ---
        await handleLogin(username, password);
        setMessage("Login Successful!");
        navigate("/home");
        setOpen(true);
        setName("");
        setUsername("");
        setPassword("");
        // You would redirect here, e.g., navigate('/dashboard')
      }
    } catch (err) {
      // This will now safely handle network errors for both cases
      const errorMessage =
        err.response?.data?.message || "An unexpected error occurred.";
      setMessage(errorMessage);
      setOpen(true);
    }
  };

  // State for password visibility
  const [showPassword, setShowPassword] = useState(false);
  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  return (
    <Box
      component="form"
      sx={{
        display: "flex",
        flexDirection: "column",
        maxWidth: "400px",
        marginTop: "4rem",
        marginInline: "auto",
        padding: 4,
        borderRadius: 2,
        boxShadow: 3,
      }}
      noValidate
    >
      <h1
        style={{
          display: "flex",
          justifyContent: "center",
          color: "#1976d2",
          marginBottom: "1rem",
        }}
      >
        Join us
      </h1>

      <Stack direction="row" spacing={2} sx={{ mb: 5 }}>
        <Button
          fullWidth
          variant={!isSignUp ? "contained" : "outlined"}
          onClick={() => setIsSignUp(false)}
        >
          Sign In
        </Button>
        <Button
          fullWidth
          variant={isSignUp ? "contained" : "outlined"}
          onClick={() => setIsSignUp(true)}
        >
          Sign Up
        </Button>
      </Stack>
      {/* Conditionally render the Full Name field for Sign Up */}
      {isSignUp && (
        <TextField
          id="input-with-icon-fullname"
          label="Full Name"
          name="fullName"
          value={name}
          type="text"
          size="small"
          required
          fullWidth
          sx={{ mb: 2 }}
          variant="outlined"
          onChange={(e) => setName(e.target.value)}
        />
      )}

      {/* Email Field */}
      <TextField
        id="input-with-icon-textfield"
        label="username"
        name="username"
        type="text"
        value={username}
        size="small"
        required
        fullWidth
        variant="outlined"
        onChange={(e) => setUsername(e.target.value)}
      />

      {/* Password Field */}
      <FormControl sx={{ my: 2 }} fullWidth variant="outlined">
        <InputLabel size="small" htmlFor="outlined-adornment-password">
          Password
        </InputLabel>
        <OutlinedInput
          id="outlined-adornment-password"
          type={showPassword ? "text" : "password"}
          name="password"
          value={password}
          size="small"
          onChange={(e) => setPassword(e.target.value)}
          endAdornment={
            <InputAdornment position="end">
              <IconButton
                aria-label="toggle password visibility"
                onClick={handleClickShowPassword}
                onMouseDown={handleMouseDownPassword}
                edge="end"
                size="small"
              >
                {showPassword ? (
                  <VisibilityOff fontSize="inherit" />
                ) : (
                  <Visibility fontSize="inherit" />
                )}
              </IconButton>
            </InputAdornment>
          }
          label="Password"
        />
        <Snackbar open={open} autoHideDuration={1000} message={message} />
      </FormControl>

      {/* Submit Button */}
      <Button
        type="submit"
        variant="contained"
        size="large"
        disableElevation
        fullWidth
        sx={{ mt: 2 }}
        onClick={handleAuth}
      >
        {isSignUp ? "Sign Up" : "Sign In"}
      </Button>
    </Box>
  );
}
