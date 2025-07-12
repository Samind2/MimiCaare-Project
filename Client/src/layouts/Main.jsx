import React from "react";
import { Outlet, useLocation, Link } from "react-router-dom";
import NavBar from "../components/Navbar/NavBar";
import Footer from "../components/Footer";
import "./Main.css";
import Breadcrumbs from "../components/Breadcrumbs";

const Main = () => {
  const location = useLocation();
  const hiddenRoutes = ["/Signin", "/Signup"];
  const shouldHideNavbar = hiddenRoutes.includes(location.pathname);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar */}
      {!shouldHideNavbar && <NavBar />}

      {/* Breadcrumbs */}
      {!shouldHideNavbar && (
        <div className="w-full bg-white shadow-md px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <Breadcrumbs shouldHide={shouldHideNavbar} />
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
