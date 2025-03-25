import React, { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const SignUp = () => {
  const { signup } = useContext(AuthContext);
  const navigate = useNavigate();
  const [FirstName, setFirstName] = useState("");
  const [LastName, setLastName] = useState("");
  const [Email, setEmail] = useState("");
  const [Password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();

    let newErrors = {};
    if (!FirstName.trim()) newErrors.FirstName = "กรุณากรอกชื่อ";
    if (!LastName.trim()) newErrors.LastName = "กรุณากรอกนามสกุล";
    if (!Email.trim()) newErrors.Email = "กรุณากรอกอีเมล";
    if (!Password.trim()) newErrors.Password = "กรุณากรอกรหัสผ่าน";
    if (Password !== confirmPassword)
      newErrors.confirmPassword = "รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน"; // ตรวจสอบรหัสผ่าน

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const userData = { FirstName, LastName, Email, Password };
    console.log("User Data:", userData);
    try {
      await signup(userData);
      toast.success("สมัครสมาชิกสำเร็จ!", {
        position: "top-center",
        autoClose: 1000,
        hideProgressBar: true, // ซ่อน progress bar(แถบสถานะ)
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      setTimeout(() => {
        navigate("/"); // ไปที่หน้า home
      }, 1000); // 1000ms = 1 วินาที
    } catch (error) {
      toast.error("เกิดข้อผิดพลาดในการสมัครสมาชิก!", {
        position: "top-right",
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
      {/* ลวดลายพื้นหลังแบบสี่เหลี่ยม */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-[#C1E3D6] opacity-80 rounded-xl rotate-6"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#C1E3D6] opacity-80 rounded-xl -rotate-6"></div>

      {/* ไอคอนตกแต่งพื้นหลัง */}
      <div className="absolute top-10 left-10 opacity-60">
        <img
          src="/images/BG/BG-L.png"
          alt="children play"
          className="w-32 h-32"
        />
      </div>
      <div className="absolute bottom-10 right-10 opacity-60">
        <img src="/images/BG/BG-R.png" alt="syringe" className="w-32 h-32" />
      </div>
      <div className="bg-white p-8 rounded-2xl shadow-lg w-96 text-center relative z-10">
        <h2 className="text-lg font-bold text-[#32403B] mb-4">
          สร้างบัญชีเพื่อเข้าถึงบริการสำหรับบันทึกวัคซีน
          และติดตามพัฒนาการของเด็ก
        </h2>
        <form onSubmit={handleSubmit}>
          {/* กรอกชื่อ & นามสกุล */}
          <div className="flex gap-3 mb-3">
            <div className="w-1/2 text-left">
              <label className="block text-sm font-medium text-gray-700">
                ชื่อ <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="input input-bordered w-full mt-1"
                value={FirstName}
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
                value={LastName}
                onChange={(e) => setLastName(e.target.value)}
              />
              {errors.lastName && (
                <p className="text-red-500 text-xs">{errors.lastName}</p>
              )}
            </div>
          </div>
          {/* กรอกอีเมล */}
          <div className="mb-3 text-left">
            <label className="block text-sm font-medium text-gray-700">
              อีเมลที่ใช้อยู่ปัจจุบัน <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              className="input input-bordered w-full mt-1"
              value={Email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {errors.email && (
              <p className="text-red-500 text-xs">{errors.email}</p>
            )}
          </div>
          {/* กรอกรหัสผ่าน */}
          <div className="mb-3 text-left">
            <label className="block text-sm font-medium text-gray-700">
              รหัสผ่าน <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              className="input input-bordered w-full mt-1"
              value={Password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {errors.password && (
              <p className="text-red-500 text-xs">{errors.password}</p>
            )}
          </div>
          {/* เช็ครหัสผ่านอีกรอบ */}
          <div className="mb-3 text-left">
            <label className="block text-sm font-medium text-gray-700">
              ยืนยันรหัสผ่าน <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              className="input input-bordered w-full mt-1"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
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
        {/* ไปหน้าเข้าสู่ระบบ */}
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