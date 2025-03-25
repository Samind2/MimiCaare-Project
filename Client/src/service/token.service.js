const getLocalAccessToken = () => {
    const user = getUser(); // Assuming getUser retrieves the user object with the token
    return user?.accessToken; 
  };
  
  const getUserRole = () => {
    const user = getUser(); // Assuming getUser retrieves the user object with the token
    return user?.roles || []; // Return user roles, or empty array if no roles found
  };
  
  const setUser = (user) => {
    localStorage.setItem("user", JSON.stringify(user));
  };
  
  const getUser = () => {
    return JSON.parse(localStorage.getItem("user"));
  };
  
  const removeUser = () => {
    localStorage.removeItem("user"); // ลบข้อมูลผู้ใช้ที่เก็บใน local storage
    localStorage.removeItem("accessToken"); // ลบ accessToken ออกจาก local storage (ถ้าเก็บ accessToken แยกต่างหาก)
  };
  
  const TokenService = {
    getLocalAccessToken,
    getUserRole, // เพิ่มฟังก์ชันนี้เพื่อใช้ตรวจสอบบทบาท
    setUser,
    getUser,
    removeUser,
  };
  
  export default TokenService;