import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { verifyOTP } from "@/store/auth-slice";

const VerifyOTP = () => {
    const [otp, setOtp] = useState("");
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // Handle OTP submission
    const onSubmit = async (event) => {
        event.preventDefault();
        if (!otp) {
            toast.error("Please enter the OTP.");
            return;
        }

        const storedEmail = localStorage.getItem('otpEmail');
        if (!storedEmail) {
            toast.error("No email found. Please register again.");
            navigate("/auth/register");
            return;
        }

        try {
            const response = await dispatch(verifyOTP({ email: storedEmail, otp })).unwrap();
            if (response.success) {
                toast.success("OTP verified successfully!");
                localStorage.removeItem('otpEmail');
                navigate("/auth/login");
            } else {
                toast.error("Invalid OTP. Please try again.");
            }
        } catch (error) {
            console.error("OTP Verification Error:", error);
            toast.error(error.message || "An unexpected error occurred. Please try again.");
        }
    };

    return (
        <div className="w-full h-screen flex items-center justify-center bg-gradient-to-r from-blue-50 to-purple-50">
            <div className="w-[400px] p-8 bg-white rounded-2xl shadow-2xl transform transition-all duration-300 hover:scale-105 mt-[-100px]">
                <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Verify OTP</h2>
                <form onSubmit={onSubmit} className="w-full">
                    <div className="mb-6">
                        <label className="block text-sm font-medium mb-2 text-gray-700">Enter OTP</label>
                        <input
                            type="text"
                            className="w-full p-3 rounded-lg bg-gray-50 border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                            placeholder="Enter OTP"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold text-sm hover:from-blue-600 hover:to-purple-700 transition-all transform hover:scale-105"
                    >
                        Verify OTP
                    </button>
                </form>
            </div>
        </div>
    );
};

export default VerifyOTP;
