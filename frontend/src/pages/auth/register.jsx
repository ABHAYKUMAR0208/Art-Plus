import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Eye, EyeOff } from "lucide-react";
import { registerUser, sendOTP, clearError } from "@/store/auth-slice";

const initialState = {
  userName: "",
  email: "",
  password: "",
};

// Password validation function
const validatePassword = (password) => {
  const errors = [];
  if (password.length < 8) errors.push("Password must be at least 8 characters long.");
  if (!/[A-Z]/.test(password)) errors.push("Password must include at least one uppercase letter.");
  if (!/[a-z]/.test(password)) errors.push("Password must include at least one lowercase letter.");
  if (!/\d/.test(password)) errors.push("Password must include at least one number.");
  if (!/[@$!%*?&]/.test(password)) errors.push("Password must include at least one special character.");
  return errors.length === 0 ? true : errors.join(" ");
};

function AuthRegister() {
  const [formData, setFormData] = useState(initialState);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { error } = useSelector((state) => state.auth);

  // Handle form input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (e.target.name === "password") {
      const validationMessage = validatePassword(e.target.value);
      setPasswordError(validationMessage === true ? "" : validationMessage);
    }
  };

  // Form validation function
  const isFormValid = () => {
    if (!formData.userName.trim()) {
      toast.error("Username is required.");
      return false;
    }
    if (!formData.email.trim() || !/^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/.test(formData.email)) {
      toast.error("Please enter a valid email.");
      return false;
    }
    if (passwordError) {
      toast.error(passwordError);
      return false;
    }
    return true;
  };

  // Handle form submission
  const onSubmit = async (event) => {
    event.preventDefault();
    if (!isFormValid()) return;

    setIsSubmitting(true);
    try {
      // Dispatch registerUser action
      const registerResponse = await dispatch(registerUser(formData)).unwrap();
      if (registerResponse.success) {
        // Dispatch sendOTP action
        const otpResponse = await dispatch(sendOTP(formData.email)).unwrap();
        if (otpResponse.success) {
          toast.success("OTP sent to your email!");
          // Store email in localStorage
          localStorage.setItem("otpEmail", formData.email);
          navigate("/auth/verify-otp");
        } else {
          toast.error("Failed to send OTP. Please try again.");
        }
      } else {
        toast.error("Registration failed. Please try again.");
      }
    } catch (error) {
      console.error("Registration Error:", error);
      toast.error(error.message || "An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Clear error messages on component load or change
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  return (
    <div className="w-full h-screen flex items-center justify-center bg-gradient-to-r from-blue-50 to-purple-50">
      <div className="w-[400px] p-8 bg-white rounded-2xl shadow-2xl transform transition-all duration-300 hover:scale-105 mt-[-100px]">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Create New Account</h2>

        {error && (
          <div className="w-full p-3 mb-4 bg-red-100 border border-red-400 text-red-700 text-center rounded-lg animate-fade-in">
            {error}
          </div>
        )}

        <form onSubmit={onSubmit} className="w-full">
          {/* Username */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2 text-gray-700">Username</label>
            <input
              type="text"
              name="userName"
              value={formData.userName}
              onChange={handleChange}
              required
              className="w-full p-3 rounded-lg bg-gray-50 border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
              placeholder="Enter your username"
            />
          </div>

          {/* Email */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2 text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full p-3 rounded-lg bg-gray-50 border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
              placeholder="Enter your email"
            />
          </div>

          {/* Password */}
          <div className="mb-6 relative">
            <label className="block text-sm font-medium mb-2 text-gray-700">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full p-3 pr-10 rounded-lg bg-gray-50 border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                placeholder="Enter your password"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {passwordError && (
              <p className="text-red-500 text-sm mt-2">{passwordError}</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold text-sm hover:from-blue-600 hover:to-purple-700 transition-all transform hover:scale-105"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Processing..." : "Send OTP"}
          </button>
        </form>

        <p className="mt-4 text-center text-gray-600">
          Already have an account?{" "}
          <Link to="/auth/login" className="text-blue-500 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default AuthRegister;