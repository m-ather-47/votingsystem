import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import Link from "next/link";

const AdminNavbar = () => {
  const router = useRouter();

  const handleLogout = async () => {
    const response = await fetch("/api/auth/logout", { method: "POST" });
    const result = await response.json();

    if (result.success) {
      toast.success(result.message);
      router.push("/admin");
    }
  };

  return (
    <header className="bg-blue-600 text-white px-6 py-4 flex justify-between items-center">
      <h1 className="text-xl font-bold">Admin Dashboard</h1>
      <nav className="flex space-x-4">
        <Link
          href="/admin/profile"
          className="bg-white text-blue-600 px-4 py-2 rounded-lg shadow"
        >
          Profile
        </Link>
        <Link
          href="/admin/profile/manage/election"
          className="bg-white text-blue-600 px-4 py-2 rounded-lg shadow"
        >
          Manage Elections
        </Link>

        <Link
          href="/admin/profile/manage/voter"
          className="bg-white text-blue-600 px-4 py-2 rounded-lg shadow"
        >
          Manage Voters
        </Link>
        <button
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg shadow"
          onClick={handleLogout}
        >
          Logout
        </button>
      </nav>
    </header>
  );
};

export default AdminNavbar;
