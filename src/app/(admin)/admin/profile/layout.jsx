"use client";

import AdminNavbar from "@/components/AdminNavbar";

const layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-base-200">
      <AdminNavbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-20">
        {children}
      </main>
    </div>
  );
};

export default layout;
