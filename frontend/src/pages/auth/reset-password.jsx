import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";

const ResetPasswordPage = () => {
  const { id, token } = useParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    axios
      .get(`http://localhost:5000/api/reset-password/reset/${id}/${token}`)
      .then(() => {
        setIsValid(true);
      })
      .catch(() => {
        setError("Invalid or expired link");
      });
  }, [id, token]);

  const handlePasswordReset = (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    axios
      .post(`http://localhost:5000/api/reset-password/reset/${id}/${token}`, { password })
      .then((response) => {
        setMessage(response.data.message);
        setError("");
      })
      .catch((error) => {
        setError(error.response?.data?.message || "An error occurred");
      });
  };

  return (
    <div className="w-full h-screen flex items-center justify-center bg-gray-50">
      <div className="w-[400px] p-6 bg-white rounded-xl flex flex-col items-center shadow-lg">
        <h2 className="text-xl font-semibold mb-4">Reset Password</h2>

        {error && <div className="w-full p-2 mb-4 bg-red-600 text-white text-center rounded-lg">{error}</div>}
        {message && <div className="w-full p-2 mb-4 bg-green-500 text-white text-center rounded-lg">{message}</div>}

        {isValid ? (
          <form onSubmit={handlePasswordReset} className="w-full">
            {/* New Password */}
            <div className="mb-4 relative">
              <label className="block text-sm font-medium mb-2">New Password</label>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full p-2 pr-10 rounded-lg bg-[#edf5f3] text-sm"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-3 mt-8 flex items-center text-gray-600"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={22} /> : <Eye size={20} />}
              </button>
            </div>

            {/* Confirm New Password */}
            <div className="mb-4 relative">
              <label className="block text-sm font-medium mb-2">Confirm New Password</label>
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full p-2 pr-10 rounded-lg bg-[#edf5f3] text-sm"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-3 mt-8 flex items-center text-gray-600"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff size={22} /> : <Eye size={20} />}
              </button>
            </div>

            <button type="submit" className="w-full py-2 bg-[#3bb19b] text-white rounded-full font-semibold text-sm mt-4">
              Reset Password
            </button>
          </form>
        ) : (
          <p className="text-red-600">The reset link is invalid or expired.</p>
        )}
      </div>
    </div>
  );
};

export default ResetPasswordPage;
