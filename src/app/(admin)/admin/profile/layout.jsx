"use client";

import AdminNavbar from "@/components/AdminNavbar";

const layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-100">
      <AdminNavbar />
      <main className="p-6">{children}</main>
    </div>
  );
};

export default layout;
