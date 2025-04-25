import React from 'react';
import { createBrowserRouter } from "react-router-dom"; // ✅ ใช้ react-router-dom
import MainLayout from "../layouts/Main";
import ProtectedRoute from "../components/ProtectedRoute";
import Home from "../pages/Home/Index";
import SignUp from "../components/SignUp";
import Signin from "../components/Signin";
import Vaccine from "../pages/Vaccine/Index.jsx";
import Development from "../pages/Development/Index.jsx";
import ProfileChild from "../pages/ProfileChild/Index.jsx";
import ProfileParent from "../pages/ProfileParent/Index.jsx";
import ProfileUpdate from "../components/Navbar/ProfileUpdate.jsx";
import Notification from "../pages/Notifications/Index.jsx";
import ProfileChildUpdate from '../pages/ProfileChild/ProfilechildUpdate.jsx';
import AddChild from '../pages/ManageChild/AddChild.jsx';

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
                path: "/signup",
                element: <SignUp />
            },
            {
                path: "/signin", 
                element: <Signin />
            },
            {
                path: "/vaccine",
                element: (
                    <ProtectedRoute>
                        <Vaccine />
                    </ProtectedRoute>
                )
            },
            {
                path: "/development",
                element: (
                    <ProtectedRoute>
                        <Development />
                    </ProtectedRoute>
                )
            },
            {
                path: "/profile-child",
                element: (
                    <ProtectedRoute>
                        <ProfileChild />
                    </ProtectedRoute>
                )
            },
            {
                path: "/profile-parent",
                element: (
                    <ProtectedRoute>
                        <ProfileParent />
                    </ProtectedRoute>
                )
            },
            {
                path: "/profile-update",
                element: (
                    <ProtectedRoute>
                        <ProfileUpdate />
                    </ProtectedRoute>
                )
            },
            {
                path: "/notification",
                element: (
                    <ProtectedRoute>
                        <Notification />
                    </ProtectedRoute>
                )
            },
            {
                path: "/addChild",
                element: (
                    <ProtectedRoute>
                        <AddChild />
                    </ProtectedRoute>
                )
            },
            {
                path: "/profile-child-update/:id",
                element: (
                    <ProtectedRoute>
                        <ProfileChildUpdate />
                    </ProtectedRoute>
                )
            },
        ],
    },
]);

export default router;
