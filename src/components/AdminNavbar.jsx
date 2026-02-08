"use client";

import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";

const AdminNavbar = () => {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    const response = await fetch("/api/auth/logout", { method: "POST" });
    const result = await response.json();

    if (result.success) {
      toast.success(result.message);
      router.push("/admin");
    }
  };

  const navLinks = [
    { name: "Dashboard", href: "/admin/profile" },
    { name: "Manage Elections", href: "/admin/profile/manage/election" },
    { name: "Manage Voters", href: "/admin/profile/manage/voter" },
  ];

  return (
    <div className="navbar bg-base-100 shadow-xl rounded-box m-4 w-auto">
      <div className="navbar-start">
        <div className="dropdown">
          <div
            tabIndex={0}
            role="button"
            className="btn btn-ghost lg:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h8m-8 6h16"
              />
            </svg>
          </div>
          {isMenuOpen && (
            <ul
              tabIndex={0}
              className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52"
            >
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} onClick={() => setIsMenuOpen(false)}>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
        <Link href="/admin/profile" className="btn btn-ghost text-xl text-primary font-bold uppercase">
          Voting Admin
        </Link>
      </div>
      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal px-1 gap-2">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link href={link.href} className="font-medium hover:text-primary">
                {link.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <div className="navbar-end">
        <button
          className="btn btn-error btn-sm text-white"
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default AdminNavbar;
