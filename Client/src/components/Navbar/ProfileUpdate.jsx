import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ProfileUpdate = () => {
    const { user, updateProfile } = useContext(AuthContext);
    const [firstName, setFirstName] = useState(user?.firstName || '');
    const [lastName, setLastName] = useState(user?.lastName || '');
    const [picture, setPicture] = useState(user?.picture || '');
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            setFirstName(user.firstName || '');
            setLastName(user.lastName || '');
            setPicture(user.picture || '');
        }
    }, [user]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const userData = { firstName, lastName, picture };
            await updateProfile(userData);
            toast.success("อัพเดทโปรไฟล์สำเร็จ!", {
                position: "top-center",
                autoClose: 1000,
                hideProgressBar: true,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });

            setTimeout(() => {
                navigate("/profile-parent");
            }, 1000);
        } catch (error) {
            toast.error("เกิดข้อผิดพลาดในการอัพเดทโปรไฟล์!", {
                position: "top-center",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
            console.error("Error in profile update:", error); // เพิ่ม log เพื่อดู error
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <div className="card w-96 bg-white shadow-lg">
                <div className="card-body">
                    <h3 className="text-lg font-bold text-center">อัปเดตโปรไฟล์</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">ชื่อผู้ใช้</span>
                            </label>
                            <input
                                type="text"
                                placeholder="First Name"
                                className="input input-bordered w-full"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                            />
                            <label className="label">
                                <span className="label-text">นามสกุล</span>
                            </label>
                            <input
                                type="text"
                                placeholder="Last Name"
                                className="input input-bordered w-full"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                            />
                        </div>

                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">URL รูปภาพโปรไฟล์</span>
                            </label>
                            <input
                                type="text"
                                placeholder="ใส่ URL รูปภาพ"
                                className="input input-bordered w-full"
                                value={picture}
                                onChange={(e) => setPicture(e.target.value)}
                            />
                        </div>

                        {/* แสดงตัวอย่างรูปภาพ */}
                        {picture && (
                            <div className="mt-3 text-center">
                                <img
                                    src={picture}
                                    alt="Profile Preview"
                                    className="w-32 h-32 rounded-full object-cover mx-auto"
                                />
                            </div>
                        )}

                        <div className="form-control mt-6">
                            <button type="submit" className="btn bg-red text-white w-full">
                                อัปเดตโปรไฟล์
                            </button>
                        </div>
                    </form>
                </div>
            </div>
            <ToastContainer />
        </div>
    );
};

export default ProfileUpdate;
