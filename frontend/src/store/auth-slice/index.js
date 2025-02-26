import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-toastify";

const initialState = {
  isAuthenticated: false,
  isLoading: true,
  user: null,
  token: null,
  error: null,
  otpSent: false,
  isVerified: false,
};

// Register User
export const registerUser = createAsyncThunk(
  "/auth/register",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/register`,
        formData,
        { withCredentials: true }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Registration failed");
    }
  }
);

// Send OTP
export const sendOTP = createAsyncThunk(
  "auth/send-otp",
  async (email, { rejectWithValue }) => {
      try {
          const response = await axios.post(
              `${import.meta.env.VITE_API_URL}/api/auth/send-otp`,
              { email }
          );
          return response.data;
      } catch (error) {
          return rejectWithValue(error.response?.data?.message || "Failed to send OTP");
      }
  }
);

// Verify OTP
export const verifyOTP = createAsyncThunk(
  "auth/verify-otp",
  async ({ email, otp }, { rejectWithValue }) => {
      try {
          const response = await axios.post(
              `${import.meta.env.VITE_API_URL}/api/auth/verify-otp`,
              { email, otp: otp.trim() }
          );
          return response.data;
      } catch (error) {
          return rejectWithValue(error.response?.data?.message || "OTP verification failed");
      }
  }
);

//Login
export const loginUser = createAsyncThunk(
  "/auth/login",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/login`,
        formData,
        { withCredentials: true }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Login failed");
    }
  }
);

//Logout
export const logoutUser = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
      try {
          const response = await axios.post(
              `${import.meta.env.VITE_API_URL}/api/auth/logout`,
              {},
              { withCredentials: true }
          );
          return response.data;
      } catch (error) {
          return rejectWithValue(error.response?.data?.message || "Logout failed");
      }
  }
);

//Check Auhentication
export const checkAuth = createAsyncThunk(
  "auth/checkAuth",
  async (_, { rejectWithValue }) => {
      try {
          const response = await axios.get(
              `${import.meta.env.VITE_API_URL}/api/auth/check-auth`,
              { withCredentials: true }
          );
          return response.data;
      } catch (error) {
          return rejectWithValue(error.response?.data?.message || "Auth check failed");
      }
  }
);

//Auth Slice
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
      setUser: (state, action) => {
          state.user = action.payload;
          state.isAuthenticated = !!action.payload;
      },
      clearError: (state) => {
          state.error = null;
      },
  },
  extraReducers: (builder) => {
      // Register User
      builder
          .addCase(registerUser.pending, (state) => {
              state.isLoading = true;
              state.error = null;
          })
          .addCase(registerUser.fulfilled, (state) => {
              state.isLoading = false;
              state.isAuthenticated = false;
              toast.success("Registration successful! Please verify your email.");
          })
          .addCase(registerUser.rejected, (state, action) => {
              state.isLoading = false;
              state.isAuthenticated = false;
              state.error = action.payload;
              toast.error(action.payload || "Registration failed");
          });

      // Login User
      builder
          .addCase(loginUser.pending, (state) => {
              state.isLoading = true;
              state.error = null;
          })
          .addCase(loginUser.fulfilled, (state, action) => {
              state.isLoading = false;
              state.user = action.payload.user;
              state.isAuthenticated = true;
              toast.success("Login successful!");
          })
          .addCase(loginUser.rejected, (state, action) => {
              state.isLoading = false;
              state.user = null;
              state.isAuthenticated = false;
              state.error = action.payload;
              toast.error(action.payload || "Login failed");
          });

      // Logout User
      builder
          .addCase(logoutUser.pending, (state) => {
              state.isLoading = true;
          })
          .addCase(logoutUser.fulfilled, (state) => {
              state.isLoading = false;
              state.user = null;
              state.isAuthenticated = false;
              toast.success("Logged out successfully!");
          })
          .addCase(logoutUser.rejected, (state, action) => {
              state.isLoading = false;
              state.error = action.payload;
              toast.error(action.payload || "Logout failed");
          });

      // Check Authentication
      builder
          .addCase(checkAuth.pending, (state) => {
              state.isLoading = true;
          })
          .addCase(checkAuth.fulfilled, (state, action) => {
              state.isLoading = false;
              state.user = action.payload.user;
              state.isAuthenticated = true;
          })
          .addCase(checkAuth.rejected, (state) => {
              state.isLoading = false;
              state.user = null;
              state.isAuthenticated = false;
          });
  },
});

export const { setUser, resetTokenAndCredentials, clearError } = authSlice.actions;
export default authSlice.reducer;
