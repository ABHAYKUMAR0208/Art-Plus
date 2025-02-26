import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Eye, EyeOff } from "lucide-react";
import { loginUser, clearError } from "@/store/auth-slice";

const initialState = {
  email: "",
  password: "",
};

// Email validation function
const validateEmail = (email) => {
  const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return regex.test(email);
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

function AuthLogin() {
  const [formData, setFormData] = useState(initialState);
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const { error } = useSelector((state) => state.auth);

  const onSubmit = async (event) => {
    event.preventDefault();

    if (!validateEmail(formData.email)) {
      toast.error("Invalid email format!");
      return;
    }

    const passwordValidation = validatePassword(formData.password);
    if (passwordValidation !== true) {
      toast.error(passwordValidation);
      return;
    }

    try {
      const response = await dispatch(loginUser(formData)).unwrap();
      const { success, message } = response;
      if (success) {
        toast.success(message);
      } else {
        toast.error(message || "Login failed. Please try again.");
      }
    } catch (error) {
      console.error("Login Error:", error);
      toast.error(error.message || "An unexpected error occurred. Please try again.");
    }
  };

  return (
    <div className="w-full h-screen flex items-center justify-center bg-gradient-to-r from-blue-50 to-purple-50">
      <div className="w-[400px] p-8 bg-white rounded-2xl shadow-2xl transform transition-all duration-300 hover:scale-105 mt-[-100px]">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Sign In to Your Account</h2>
        <form onSubmit={onSubmit} className="w-full">
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2 text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              className="w-full p-3 rounded-lg bg-gray-50 border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
              placeholder="Enter your email"
            />
          </div>

          <div className="mb-6 relative">
            <label className="block text-sm font-medium mb-2 text-gray-700">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold text-sm hover:from-blue-600 hover:to-purple-700 transition-all transform hover:scale-105"
          >
            Sign In
          </button>
        </form>

        <p className="mt-4 text-center text-gray-600">
          Don't have an account?{' '}
          <Link to="/auth/register" className="text-blue-500 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}

export default AuthLogin;
