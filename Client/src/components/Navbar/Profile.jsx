import React, { useContext } from 'react'
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";



const Profile = () => {
  const { logout, user } = useContext(AuthContext)
  const navigate = useNavigate();
  const handleLogout = () => {
    logout();
    toast.success("ออกจากระบบสำเร็จ!", {
      position: "top-center",
      autoClose: 1000,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });

    setTimeout(() => {
      navigate("/"); // รีไดเร็กต์ไปหน้า login
    }, 1000);
  };

  return (
    <div>

      <div className="dropdown dropdown-end">
        <div
          tabIndex={0}
          role="button"
          className="btn btn-ghost btn-circle avatar"
        >
          <div className="w-10 rounded-full">
            <img
              src={user?.picture || "/images/UserPic/UserPic.png"}
              alt="User Photo Profile"
              className="w-10 h-10 rounded-full object-cover"
            />
          </div>
        </div>
        <ul
          tabIndex={0}
          className="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow"
        >
          <li className="text-center font-medium text-gray-700 py-2 flex items-center justify-center gap-2">
            <span className="font-bold text-red">Welcome to our website</span>
            {user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : 'Guest'}
          </li>
          <div className="divider my-1"></div>
          <li>
            <a className="justify-center text-[#E51317]" href='/profile-parent'>
              Profile
            </a>
          </li>
          <li>
            <button onClick={handleLogout} className='justify-center text-[#E51317] w-full'>
              Logout
            </button>
          </li>
        </ul>
      </div>
        <ToastContainer />
    </div>
  )
}

export default Profile