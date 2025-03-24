import React from 'react';
import { createBrowserRouter } from "react-router";
import MainLayout from "../layouts/Main";
import Home from "../pages/Home/Index";
import SignUp from "../components/SignUp";
import Signin from "../components/Signin";
import Vaccine from "../pages/Vaccine/Index.jsx";
import Development from "../pages/Development/Index.jsx";
import ProfileChild from "../pages/ProfileChild/Index.jsx";

const router = createBrowserRouter([
 {
  path: "/",
  element: <MainLayout />,
  children: [
   {
    path: "/",
    element: <Home />
   },
   {
    path: "/SignUp",
    element: <SignUp />
   },
   {
    path: "/Signin",
    element: <Signin />
   },
   {
    path: "/Vaccine",
    element: <Vaccine />
   },
   {
    path: "/Development",
    element: <Development />
   },
   {
    path: "/ProfileChild",
    element: <ProfileChild />
   },
  ],
 },
]);
export default router;