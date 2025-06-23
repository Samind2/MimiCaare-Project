import React from "react";
import { Outlet, useLocation, Link } from "react-router-dom";
import NavBar from "../components/Navbar/NavBar";
import Footer from "../components/Footer";
import "./Main.css";
import { ChevronRight } from "lucide-react";

const Breadcrumbs = ({ shouldHide }) => {
  const location = useLocation();
  if (shouldHide) return null; // ถ้าต้องซ่อน breadcrumb ก็ไม่แสดง

  const paths = location.pathname.split("/").filter((path) => path);

  return (
     <nav className="py-3">
      <ol className="flex items-center space-x-2 text-gray-700 text-sm font-medium">
        <li>
          <Link
            to="/"
            className="flex items-center text-[#E51317] hover:text-[#b01013] transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-1"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2v-4H9v4a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V9z" />
            </svg>
            หน้าแรก
          </Link>
        </li>

        {paths.map((path, index) => {
          const to = `/${paths.slice(0, index + 1).join("/")}`;
          const isLast = index === paths.length - 1;
          return (
            <li key={to} className="flex items-center">
              <ChevronRight className="text-gray-400 h-4 w-4 mx-2" />
              <Link
                to={to}
                className={`capitalize ${
                  isLast
                    ? "text-gray-500"
                    : "text-[#114965] hover:text-[#0d3a4d]"
                } transition-colors`}
                aria-current={isLast ? "page" : undefined}
              >
                {decodeURIComponent(path)}
              </Link>
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

const Main = () => {
  const location = useLocation();
  const hiddenRoutes = ["/Signin", "/Signup"];
  const shouldHideNavbar = hiddenRoutes.includes(location.pathname);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar */}
      {!shouldHideNavbar && <NavBar />}

      {/* Breadcrumbs (วางไว้นอก <main> เพื่อให้ full width) */}
      {!shouldHideNavbar && (
        <div className="w-full bg-white shadow-md px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <Breadcrumbs />
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="flex-grow container mx-auto p-4">
        <Outlet />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};


export default Main;
