"use client";

import AdminNavbar from "@/components/AdminNavbar";

const layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-base-200 font-sans">
      <AdminNavbar />
      <main className="container mx-auto p-4 md:p-6 pb-20 max-w-7xl">
        {children}
      </main>
    </div>
  );
};

export default layout;
