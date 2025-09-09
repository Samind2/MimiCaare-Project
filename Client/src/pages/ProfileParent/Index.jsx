import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../../context/AuthContext';
import userService from '../../service/user.service';
import { toast } from "react-toastify";
import './ProfileForm.css';

const ProfileForm = () => {
  const { user, updateProfile } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    picture: '',
  });

  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // โหลดข้อมูล user ลง formData **เฉพาะตอนไม่แก้ไข**
  useEffect(() => {
    if (user && !isEditing) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        picture: user.picture || '',
      });
    }
  }, [user, isEditing]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handlePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        setFormData(prev => ({ ...prev, picture: reader.result })); // อัปเดตเป็น base64 string
      };
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isEditing) return;

    const hasProfileChanged =
      formData.firstName !== user.firstName ||
      formData.lastName !== user.lastName ||
      formData.email !== user.email ||
      formData.picture !== user.picture;

    const { oldPassword, newPassword, confirmPassword } = passwordData;
    const hasPasswordChange = oldPassword && newPassword;

    if (!hasProfileChanged && !hasPasswordChange) {
      toast.info("คุณยังไม่ได้แก้ไขข้อมูลใดๆ");
      return;
    }

    setIsUpdating(true);

    try {
      // อัปเดตโปรไฟล์
      if (hasProfileChanged) {
        await updateProfile(formData);
        toast.success("อัปเดทโปรไฟล์สำเร็จ!", { autoClose: 1500 });
      }

      // อัปเดตรหัสผ่าน
      if (hasPasswordChange) {
        if (newPassword !== confirmPassword) {
          toast.error("รหัสผ่านใหม่ไม่ตรงกัน");
          return;
        }

        await userService.resetPassword({
          oldPassword,
          newPassword,
          repeatNewPassword: confirmPassword
        });

        toast.success("อัปเดตรหัสผ่านสำเร็จ!", { autoClose: 1500 });
        setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
      }

      setIsEditing(false);
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "เกิดข้อผิดพลาดในการอัปเดท", { autoClose: 1500 });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="profile-form-container">
      <form className="profile-form" onSubmit={handleSubmit}>
        <div className="profile-pic-section">
          <div className="profile-pic-wrapper">
            {isEditing ? (
              <>
                <input
                  id="profilePicInput"
                  type="file"
                  accept="image/*"
                  onChange={handlePictureChange}
                  style={{ display: 'none' }}
                />
                <label htmlFor="profilePicInput" className="cursor-pointer">
                  <img
                    src={formData.picture || '/images/UserPic/UserPic.png'}
                    alt="Profile"
                    className="profile-pic hover:opacity-80 transition"
                  />
                </label>
              </>
            ) : (
              <img
                src={formData.picture || '/images/UserPic/UserPic.png'}
                alt="Profile"
                className="profile-pic"
              />
            )}
          </div>
        </div>


        <div className="form-fields">
          <div className="form-row">
            <div className="form-group">
              <label>ชื่อ</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                readOnly={!isEditing}
                className={isEditing ? "" : "readonly-input"}
              />
            </div>
            <div className="form-group">
              <label>นามสกุล</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                readOnly={!isEditing}
                className={isEditing ? "" : "readonly-input"}
              />
            </div>
          </div>

          <div className="form-group">
            <label>อีเมล</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              readOnly={!isEditing}
              className={isEditing ? "" : "readonly-input"}
            />
          </div>

          {isEditing && (
            <>
              <div className="form-group">
                <label>รหัสผ่านเก่า</label>
                <input
                  type="password"
                  name="oldPassword"
                  value={passwordData.oldPassword}
                  onChange={handlePasswordChange}
                  placeholder="รหัสผ่านเก่า"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>รหัสผ่านใหม่</label>
                  <input
                    type="password"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    placeholder="รหัสผ่านใหม่"
                  />
                </div>
                <div className="form-group">
                  <label>ยืนยันรหัสผ่านใหม่</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    placeholder="ยืนยันรหัสผ่านใหม่"
                  />
                </div>
              </div>
            </>
          )}

          <div className="form-control mt-4">
            {isEditing ? (
              <button
                type="submit"
                disabled={isUpdating}
                className={`submit-button ${isUpdating ? "cursor-not-allowed bg-gray-400" : ""}`}
              >
                {isUpdating ? "กำลังอัปเดท..." : "บันทึก"}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="submit-button"
              >
                แก้ไข
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default ProfileForm;
