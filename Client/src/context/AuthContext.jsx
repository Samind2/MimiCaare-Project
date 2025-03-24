import React, { createContext, useState } from "react";
import userService from "../service/user.service";

export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);

    // ฟังก์ชันสมัครสมาชิก
    const signup = async (userData) => {
        setLoading(true);
        try {
            const response = await userService.signup(userData); // Send the full object
            setUser(response.data);
        } catch (error) {
            console.error("Signup Error:", error);
        } finally {
            setLoading(false);
        }
    };

    const authInfo = {
        user,
        signup,
        loading
    };

    return (
        <AuthContext.Provider value={authInfo}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;
