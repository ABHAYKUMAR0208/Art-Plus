import { motion } from "framer-motion";
import logo from "@/assets/logo.jpg"; // Ensure correct path

const LoadingScreen = () => {
  return (
    <div className="w-full h-[600px] flex flex-col justify-center items-center bg-gray-100">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, repeat: Infinity, repeatType: "reverse" }}
      >
        <img src={logo} alt="Loading Logo" className="w-24 h-24" />
      </motion.div>
      <p className="text-lg font-medium text-gray-500 mt-4">Loading...</p>
    </div>
  );
};

export default LoadingScreen;
