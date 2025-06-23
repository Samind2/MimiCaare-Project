import React, { useContext, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ProfileUpdate = () => {
    const { user, updateProfile } = useContext(AuthContext);
    const [firstName, setFirstName] = useState(user?.firstName || '');
    const [lastName, setLastName] = useState(user?.lastName || '');
    const [email, setEmail] = useState(user?.email || '');
    const [picture, setPicture] = useState(user?.picture || '');
    const navigate = useNavigate();

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.readAsDataURL(file);

        reader.onload = () => {
            setPicture(reader.result); // อัปเดตรูปภาพเป็น Base64
        };
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const userData = { firstName, lastName, email, picture };  // ส่งข้อมูลอีเมลไปด้วย
            await updateProfile(userData);  // อัปเดตข้อมูลโปรไฟล์
            console.log("Toast showing");
            toast.success("อัพเดทโปรไฟล์สำเร็จ!",  { autoClose: 1500 });

            setTimeout(() => {
                navigate("/profile-parent");
            }, 2000);
        } catch (error) {
            toast.error("เกิดข้อผิดพลาดในการอัพเดทโปรไฟล์!",  { autoClose: 1500 });
            console.error("Error in profile update:", error); // เพิ่ม log เพื่อดู error
        }
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <div className="card w-96 bg-white shadow-lg">
                <div className="card-body">
                    <h3 className="text-lg font-bold text-center">อัปเดตโปรไฟล์</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text" >ชื่อผู้ใช้</span>
                            </label>
                            <input
                                id='PU-01'
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
                                id='PU-02'
                                type="text"
                                placeholder="Last Name"
                                className="input input-bordered w-full"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                            />
                            <label className="label">
                                <span className="label-text">อีเมล</span>
                            </label>
                            <input
                                id='PU-03'
                                type="email"
                                placeholder="Email"
                                className="input input-bordered w-full"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}  // แก้ไขอีเมล
                            />
                        </div>

                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">อัพโหลดรูปภาพโปรไฟล์</span>
                            </label>
                            <input
                                id='PU-04'
                                type="file"
                                accept="image/*"
                                className="file-input w-full"
                                onChange={handleImageUpload}
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
        </div>
    );
};

export default ProfileUpdate;

