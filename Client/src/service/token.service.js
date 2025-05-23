import { Cookies } from "react-cookie";
const cookies = new Cookies();

const getLocalAccessToken = () => {
  const user = getUser();
  return user?.token;
};

const getUser = () => {
  const user = cookies.get("user");
  return user;
};

const removeUser = () => {
  // ลบ jwt cookie
  cookies.remove("jwt", { path: "/" });
  // ลบ user cookie ก
  cookies.remove("user", { path: "/" });
};

const setUser = (user) => {
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