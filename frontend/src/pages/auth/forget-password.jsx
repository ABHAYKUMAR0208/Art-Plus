import { useState } from "react";
import axios from "axios";

const ForgetPassword = () => {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Ensure this matches the backend route
      const url = `http://localhost:5000/api/reset-password/forget`; // Ensure the URL matches the route
      const { data } = await axios.post(url, { email });
      
      setMsg(data.message);
      setError(""); // Clear error if the request was successful
      setEmail(""); // Optionally clear the email input after submission
    } catch (error) {
      if (error.response && error.response.data.message) {
        setError(error.response.data.message);
        setMsg(""); // Clear success message on error
      } else {
        setError("An unexpected error occurred.");
        setMsg(""); // Clear success message on error
      }
    }
  };

  return (
    <div className="w-full h-screen flex items-center justify-center bg-gray-50">
      <form
        className="w-[400px] p-6 bg-white rounded-xl flex flex-col items-center shadow-lg"
        onSubmit={handleSubmit}
      >
        <h1 className="text-xl font-semibold mb-4">Forget Password</h1>
        <input
          type="email"
          placeholder="Email"
          name="email"
          onChange={(e) => setEmail(e.target.value)}
          value={email}
          required
          className="w-full p-4 mb-4 rounded-lg bg-[#edf5f3] text-sm"
        />
        {error && (
          <div className="w-full p-4 mb-4 bg-red-600 text-white text-center rounded-lg">
            {error}
          </div>
        )}
        {msg && (
          <div className="w-full p-4 mb-4 bg-green-500 text-white text-center rounded-lg">
            {msg}
          </div>
        )}
        <button
          type="submit"
          className="w-[180px] py-3 bg-[#3bb19b] text-white rounded-full font-semibold text-sm mt-4"
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default ForgetPassword;
