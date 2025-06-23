import { Cookies } from "react-cookie"; //จัดการ cookies ใน browser
const cookies = new Cookies();

const getLocalAccessToken = () => { // ดึง token จาก cookies
  const user = getUser();
  return user?.token;
};

const getUser = () => { // ดึงข้อมูลผู้ใช้จาก cookies
  const user = cookies.get("user");
  return user;
};

const removeUser = () => { // ลบข้อมูลผู้ใช้และ token จาก cookies
  cookies.remove("jwt", { path: "/" });  // ลบ jwt cookie
  cookies.remove("user", { path: "/" }); // ลบ user cookie
};

const setUser = (user) => { // ตั้งค่าข้อมูลผู้ใช้และ token ลงใน cookies
  cookies.set("user", JSON.stringify(user), {
    path: "/",
    expires: new Date(Date.now() + 86400 * 1000), // 1 วัน
  });
};

const TokenService = {
  getLocalAccessToken,
  setUser,
  getUser,
  removeUser,
};

export default TokenService;