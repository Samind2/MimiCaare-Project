import React from 'react';
import { createBrowserRouter } from "react-router";
import MainLayout from "../layouts/Main";
import Home from "../pages/Home/Index";
import SignUp from "../components/SignUp";
import Signin from "../components/Signin";
import GetComponent from '../pages/get';

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
    path: "/GetComponent",
    element: <GetComponent />
   },
  ],
 },
]);
export default router;