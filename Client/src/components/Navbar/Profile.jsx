import React, { useContext } from 'react'
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";



const Profile = () => {
  const { logout, user } = useContext(AuthContext)
  const navigate = useNavigate(); 
  const handleLogout = () => {
    logout();
    navigate('/signin');  // รีไดเร็กต์ไปที่หน้า signin หลังจาก logout
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
            {user?.photoURL ? (<div className='w-10 rounded-full'><img src={user.photoURL} alt='User Photo Profile' /></div>) : (
              <img
                alt="Tailwind CSS Navbar component"
                src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
              />
            )}
          </div>
        </div>
        <ul
          tabIndex={0}
          className="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow"
        >
          {/* แสดงชื่อผู้ใช้ด้านบนของ Dropdown */}
          <li className="text-center font-medium text-gray-700 py-2 flex items-center justify-center gap-2">
            <span className="font-bold text-red">Welcome to our website</span> {user?.displayName || 'Guest'}
          </li>
          <div className="divider my-1"></div> {/* เส้นแบ่ง */}
          <li>
            <a className="justify-between" href='/profileUser'>
              Profile
              <span className="badge">New</span>
            </a>
          </li>
          <li>
            <a href='/UpdateProfile'>Settings</a>
          </li>
          <li>
          <a onClick={handleLogout}>Logout</a> {/* ใช้ handleLogout */}
          </li>
        </ul>
      </div>
    </div>
  )
}

export default Profile