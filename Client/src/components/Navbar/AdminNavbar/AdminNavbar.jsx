import React from "react";

const AdminNavbar = () => {
  return (
    <nav className="bg-red-500 p-4 text-white">
      <ul className="flex space-x-4">
        <li>Dashboard</li>
        <li>Manage Users</li>
        <li>Reports</li>
      </ul>
    </nav>
  );
};

export default AdminNavbar;
