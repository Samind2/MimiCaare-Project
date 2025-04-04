import React, { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const SignUp = () => {
  const { signup } = useContext(AuthContext);
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});
  
  // State สำหรับจัดการการแสดงรหัสผ่าน
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let newErrors = {};
    if (!firstName.trim()) newErrors.firstName = "กรุณากรอกชื่อ";
    if (!lastName.trim()) newErrors.lastName = "กรุณากรอกนามสกุล";
    if (!email.trim()) newErrors.email = "กรุณากรอกอีเมล";
    if (email && !validateEmail(email)) newErrors.email = "อีเมลไม่ถูกต้อง";
    if (!password.trim()) newErrors.password = "กรุณากรอกรหัสผ่าน";
    if (password !== confirmPassword)
      newErrors.confirmPassword = "รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน"; // ตรวจสอบรหัสผ่าน

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const userData = { firstName, lastName, email, password };
    try {
      await signup(userData);
      toast.success("สมัครสมาชิกสำเร็จ!", {
        position: "top-center",
        autoClose: 1000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      setTimeout(() => {
        navigate("/"); // ไปที่หน้า home
      }, 1000);
    } catch (error) {
      toast.error("เกิดข้อผิดพลาดในการสมัครสมาชิก!", {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#A7D7C5] overflow-hidden">
      <div className="absolute top-0 left-0 w-96 h-96 bg-[#C1E3D6] opacity-80 rounded-xl rotate-6"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#C1E3D6] opacity-80 rounded-xl -rotate-6"></div>

      <div className="bg-white p-8 rounded-2xl shadow-lg w-96 text-center relative z-10">
        <h2 className="text-lg font-bold text-[#32403B] mb-4">
          สร้างบัญชีเพื่อเข้าถึงบริการสำหรับบันทึกวัคซีน
          และติดตามพัฒนาการของเด็ก
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="flex gap-3 mb-3">
            <div className="w-1/2 text-left">
              <label className="block text-sm font-medium text-gray-700">
                ชื่อ <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="input input-bordered w-full mt-1"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
              {errors.firstName && (
                <p className="text-red-500 text-xs">{errors.firstName}</p>
              )}
            </div>
            <div className="w-1/2 text-left">
              <label className="block text-sm font-medium text-gray-700">
                นามสกุล <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="input input-bordered w-full mt-1"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
              {errors.lastName && (
                <p className="text-red-500 text-xs">{errors.lastName}</p>
              )}
            </div>
          </div>
          <div className="mb-3 text-left">
            <label className="block text-sm font-medium text-gray-700">
              อีเมลที่ใช้อยู่ปัจจุบัน <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              className="input input-bordered w-full mt-1"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {errors.email && (
              <p className="text-red-500 text-xs">{errors.email}</p>
            )}
          </div>
          <div className="mb-3 text-left">
            <label className="block text-sm font-medium text-gray-700">
              รหัสผ่าน <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                className="input input-bordered w-full mt-1"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-xs">{errors.password}</p>
            )}
          </div>
          <div className="mb-3 text-left">
            <label className="block text-sm font-medium text-gray-700">
              ยืนยันรหัสผ่าน <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                className="input input-bordered w-full mt-1"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <button
                type="button"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-red-500 text-xs">{errors.confirmPassword}</p>
            )}
          </div>
          <button
            type="submit"
            className="bg-[#84C7AE] text-white px-4 py-2 rounded-lg w-full hover:bg-[#9fe0c8] transition duration-300"
          >
            สร้างบัญชี
          </button>
        </form>
        <p className="mt-3 text-sm text-gray-500">
          มีบัญชีอยู่แล้ว?{" "}
          <a href="/Signin" className="text-red-500">
            เข้าสู่ระบบ
          </a>
        </p>
      </div>
      <ToastContainer />
    </div>
  );
};

export default SignUp;
