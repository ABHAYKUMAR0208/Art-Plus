import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "@/store/auth-slice";
import {
  getSearchResults,
  resetSearchResults,
} from "@/store/shop/search-slice";
import { Button } from "./ui/button";
import { toast } from "react-toastify";
import logo from "@/assets/logo.jpg";

const Header = () => {
  const messages = [
    "FREE & FAST global shipping* on all orders",
    "Buy Cat Cave with 10% Discount",
    "FREE 4PCS Toy Ball on purchase of any Cat Cave",
  ];

  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [searchKeyword, setSearchKeyword] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Accessing the correct state slice
  const { isLoading = false, searchResults = [] } = useSelector(
    (state) => state.shopSearch || {}
  );
  const isLoggedIn = useSelector((state) => state.auth.isAuthenticated);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessageIndex((prevIndex) => (prevIndex + 1) % messages.length);
    }, 2000);

    return () => clearInterval(interval);
  }, [messages.length]);

  const handleLogout = () => {
    dispatch(logoutUser());
    toast.error("You have been logged out.");
  };

  const handleSearch = () => {
    if (searchKeyword.trim()) {
      dispatch(getSearchResults(searchKeyword)); // Dispatch action to fetch results
      navigate("/shop/search"); // Navigate to the search page
    } else {
      dispatch(resetSearchResults()); // Reset results if search is empty
      navigate("/shop/search"); // Navigate to the search page even if there's no keyword
    }
  };

  const handleSearchKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <header className="font-sans text-gray-800">
      <div className="bg-gray-100 p-3 flex justify-between items-center text-bold">
        <span className="hidden lg:block">{messages[currentMessageIndex]}</span>
        <nav className="hidden md:flex space-x-4">
        
          <Link
            to="/about/blogs"
            className="text-gray-800 hover:text-indigo-900 text-md font-semibold transform hover:scale-105 "
          >
            Blog
          </Link>
        
          <Link
            to="/useful-links/shipping-return"
            className="text-gray-800 hover:text-indigo-900 text-md font-semibold transform hover:scale-105"
          >
            Shipping & Returns
          </Link>
          <Link
            to="/useful-links/faqs"
            className="text-gray-800 hover:text-indigo-900 text-md font-semibold transform hover:scale-105"
          >
            FAQs
          </Link>
          <Link
            to="/useful-links/contact-us"
            className="text-gray-800 hover:text-indigo-900 text-md font-semibold transform hover:scale-105"
          >
            Contact Us
          </Link>
          <Link
            to="/useful-links/wholesale"
            className="text-gray-800 hover:text-indigo-900 text-md font-semibold transform hover:scale-105"
          >
            Apply for Wholesale
          </Link>
        </nav>
      </div>

      <div className="flex items-center justify-between p-5">
        <div className="flex justify-start w-full lg:w-auto">
          <img src={logo} alt="Art-Plus Logo" className="h-24 w-24" />
        </div>

        <div className="flex items-center">
          <input
            type="text"
            placeholder="Search our catalog"
            className="p-2 border border-gray-300 rounded-l-md"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            onKeyDown={handleSearchKeyPress}
          /> 
          <button
            onClick={handleSearch}
            className="p-2 bg-blue-900 hover:bg-purple-800 text-white rounded-r-md transform hover:scale-105"
            disabled={isLoading}
          >
            {isLoading ? "Searching..." : "Search"}
          </button>
        </div>

        {/* <div className="hidden lg:flex space-x-3">
          <img src="path/to/iso.png" alt="ISO Certification" className="h-10" />
          <img
            src="path/to/sedex.png"
            alt="Sedex Membership"
            className="h-10"
          />
          <img
            src="path/to/goodweave.png"
            alt="GoodWeave Certification"
            className="h-10"
          />
        </div> */}

        <div className="hidden lg:flex space-x-4">
        {isLoggedIn ? (
    <button
        onClick={handleLogout}
        className="inline-flex gap-2 items-center rounded-md px-4 py-2 text-sm font-medium shadow bg-purple-700 text-white transition-transform transform hover:scale-105"
    >
        Logout
    </button>
) : (
    <>
        <Button className="bg-blue-900 hover:bg-purple-800 transition-transform transform hover:scale-105">
            <Link
                to="/auth/login"
                className="text-sm text-white no-underline"
            >
                Login
            </Link>
        </Button>
        <Button className="bg-blue-900 hover:bg-purple-800 transition-transform transform hover:scale-105">
            <Link
                to="/auth/register"
                className="text-sm text-white no-underline"
            >
                Sign up
            </Link>
        </Button>
    </>
)}


        </div>
      </div>
    </header>
  );
};

export default Header;
