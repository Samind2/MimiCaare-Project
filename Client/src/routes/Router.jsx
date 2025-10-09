import React from 'react';
import { createBrowserRouter } from "react-router-dom"; // 
import MainLayout from "../layouts/Main";
import ProtectedRoute from "../components/ProtectedRoute";
import Home from "../pages/Home/Index";
import SignUp from "../components/SignUp";
import Signin from "../components/Signin";
import ProfileChild from "../pages/ProfileChild/Index.jsx";
import ProfileParent from "../pages/ProfileParent/Index.jsx";
import Notification from "../pages/Notifications/Index.jsx";
import ProfileChildUpdate from '../pages/ProfileChild/ProfileChildUpdate.jsx';
import AddChild from '../pages/ManageChild/AddChild.jsx';
import AdminLayout from '../layouts/AdminLayout.jsx';
import AddDevelopment from '../pages/ManageDevelopment/AddDevelopment.jsx';
import Dashboard from '../pages/Dashboard/Index.jsx';
import AdminRoute from '../ProtectedRoutes/AdminRoute.jsx';
import AddVaccine from '../pages/ManageVac/AddVac.jsx';
import ViewVaccine from '../pages/User/Vaccine/Index.jsx';
import ViewDevelopment from '../pages/User/Development/Index.jsx';
import ManageRights from '../pages/ManageUser/ManageRights.jsx';
import AllUser from '../pages/ManageUser/AllUser.jsx';
import ResetPassword from '../pages/ManagePassword/ResetPassword.jsx';
// import MetaData from '../pages/ManageData/index.jsx'
import GuestRoute from '../ProtectedRoutes/GuestRoute.jsx';

const router = createBrowserRouter([
    {
        path: "/",
        element: <MainLayout />,
        children: [
            {
                path: "/",
                element: (
                    <ProtectedRoute allowedRoles={["user"]}>
                        <Home />
                    </ProtectedRoute>
                )
            },
            {
                path: "/signin",
                element: (
                    <GuestRoute>
                        <Signin />
                    </GuestRoute>
                )
            },
            {
                path: "/signup",
                element: (
                    <GuestRoute>
                        <SignUp />
                    </GuestRoute>
                )
            },
            {
                path: "/reset-password",
                element: <ResetPassword />
            },
            {
                path: "/ViewVaccine",
                element: (
                    <ProtectedRoute allowedRoles={["user"]}>
                        <ViewVaccine />
                    </ProtectedRoute>
                )
            },
            {
                path: "/ViewDevelopment",
                element: (
                    <ProtectedRoute allowedRoles={["user"]}>
                        <ViewDevelopment />
                    </ProtectedRoute>
                )
            },
            {
                path: "/profile-child",
                element: (
                    <ProtectedRoute allowedRoles={["user"]}>
                        <ProfileChild />
                    </ProtectedRoute>
                )
            },
            {
                path: "/profile-parent",
                element: (
                    <ProtectedRoute allowedRoles={["user"]}>
                        <ProfileParent />
                    </ProtectedRoute>
                )
            },
            {
                path: "/notification",
                element: (
                    <ProtectedRoute allowedRoles={["user"]}>
                        <Notification />
                    </ProtectedRoute>
                )
            },
            {
                path: "/addChild",
                element: (
                    <ProtectedRoute allowedRoles={["user"]}>
                        <AddChild />
                    </ProtectedRoute>
                )
            },
            {
                path: "/profile-child-update/:id",
                element: (
                    <ProtectedRoute allowedRoles={["user"]}>
                        <ProfileChildUpdate />
                    </ProtectedRoute>
                )
            },
            // {
            //     path: "/manage-data",
            //     element: (
            //         <ProtectedRoute>
            //             <MetaData />
            //         </ProtectedRoute>
            //     )
            // }

        ],
    },
    {
        path: "dashboard",
        element: (
            <AdminRoute>
                <AdminLayout />
            </AdminRoute>
        ),
        children: [
            {
                path: "",
                element: <Dashboard />,
            },
            {
                path: "add-vaccine",
                element: <AddVaccine />,
            },
            {
                path: "add-development",
                element: <AddDevelopment />,
            }, {
                path: "ManageRights",
                element: <ManageRights />,
            },
            {
                path: "AllUser",
                element:
                    <AllUser />
            },

        ],
    },
]);

export default router;