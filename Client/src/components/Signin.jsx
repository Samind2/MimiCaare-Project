import React, { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const Signin = () => {
  const { login, loading } = useContext(AuthContext);
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false); // State for showing/hiding password

  const handleSubmit = async (e) => {
    e.preventDefault();

    let newErrors = {};
    // Check if email is entered
    if (!email.trim()) newErrors.Email = "กรุณากรอกอีเมล";
    // Check if password is entered
    if (!password.trim()) newErrors.Password = "กรุณากรอกรหัสผ่าน";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors); // Store errors
      return; // Stop form submission if there are errors
    }

    const userData = { email, password };
    try {
      await login(userData); // Call the login function
      toast.success("เข้าสู่ระบบสำเร็จ!", {
        position: "top-center",
        autoClose: 1000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });

      // setTimeout(() => {
      //   navigate("/");  // Navigate to home page
      // }, 2000);

      navigate("/"); // Navigate to home page
    } catch (error) {
      const errorMessage = error.response?.data?.message || "เกิดข้อผิดพลาด";

      if (errorMessage === "ไม่พบผู้ใช้งาน") {
        setErrors({ Email: errorMessage });
      } else if (errorMessage === "รหัสผ่านไม่ถูกต้อง") {
        setErrors({ Password: errorMessage });
      } else if (errorMessage.includes("กรูณากรอกข้อมูล")) {
        setErrors({ Email: errorMessage, Password: errorMessage });
      } else {
        // ข้อผิดพลาดอื่น ๆ แสดงผ่าน toast
        toast.error(errorMessage, {
          position: "top-center",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      }

      console.error("Login error:", error);
    }
  };

  if (loading) {
    return <div>กำลังโหลด...</div>; // หากกำลังโหลดหรือยังไม่พร้อม ให้แสดงข้อความโหลด
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#EE8A8A] overflow-hidden">
      <div className="absolute top-0 left-0 w-96 h-96 bg-[#FFD2D1] opacity-80 rounded-xl rotate-6"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#FFD2D1] opacity-80 rounded-xl -rotate-6"></div>

      <div className="absolute top-10 left-10 opacity-60">
        <img src="/images/BG/BG-L.png" alt="children play" className="w-32 h-32" />
      </div>
      <div className="absolute bottom-10 right-10 opacity-60">
        <img src="/images/BG/BG-R.png" alt="syringe" className="w-32 h-32" />
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-lg w-96 text-center relative z-10">
        <h2 className="text-lg font-bold text-[#32403B] mb-4">
          เข้าสู่ระบบเพื่อเข้าถึงบริการสำหรับบันทึกวัคซีน และ ติดตามพัฒนาการของเด็ก
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-3 text-left">
            <label className="block text-sm font-medium text-gray-700">
              อีเมล <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              className={`input input-bordered w-full mt-1 ${errors.Email ? "border-red-500" : ""}`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {errors.Email && <p className="text-red-500 text-xs">{errors.Email}</p>}
          </div>
          <div className="mb-3 text-left">
            <label className="block text-sm font-medium text-gray-700">
              รหัสผ่าน <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                className={`input input-bordered w-full mt-1 ${errors.Password ? "border-red-500" : ""}`}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)} // Toggle password visibility
                className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-500"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />} {/* Button text based on visibility */}
              </button>
            </div>
            {errors.Password && <p className="text-red-500 text-xs">{errors.Password}</p>}
          </div>
          <p className="mt-3 text-sm text-gray-500 flex justify-end">
            หากคุณลืมรหัสผ่าน? <a href="/Signup" className="text-red-500">คลิ๊กที่นี่</a>
          </p>
          <button className="bg-[#FA5453] text-white px-4 py-2 rounded-lg w-full hover:bg-[#ff8686] transition duration-300 mt-4">
            เข้าสู่ระบบ
          </button>
        </form>

        <p className="mt-3 text-sm text-gray-500">
          หากคุณยังไม่มีบัญชีผู้ใช้? <a href="/Signup" className="text-red-500">สมัครสมาชิก</a>
        </p>
      </div>
      <ToastContainer />
    </div>
  );
};

export default Signin;
