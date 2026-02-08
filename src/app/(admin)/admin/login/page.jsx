"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

const page = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await fetch("/api/auth/admin/login", {
      method: "POST",
      body: JSON.stringify(formData),
      cache: "no-store",
    });
    const result = await response.json();

    if (!result.success) {
      toast.error(result.message);
    } else {
      toast.success(result.message);
      router.push("/admin/profile");
    }
  };

  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center p-4">
      <div className="card lg:card-side bg-base-100 shadow-xl max-w-4xl w-full overflow-hidden">
        <figure className="lg:w-1/2 bg-primary flex flex-col items-center justify-center p-8 text-primary-content">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-24 h-24 mb-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
            </svg>
            <h2 className="text-3xl font-bold text-center">Admin Portal</h2>
            <p className="mt-2 text-center text-primary-content/80">Secure access for election management.</p>
        </figure>
        <div className="card-body lg:w-1/2 justify-center">
            <div className="flex flex-col items-center mb-6">
                <img src="/ecp.png" alt="ECP Logo" className="h-20 mb-2 object-contain" />
                <h3 className="card-title text-2xl font-bold text-center">Admin Login</h3>
            </div>
          
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="form-control w-full">
              <label className="label pb-2">
                <span className="label-text font-semibold text-base">Username</span>
              </label>
              <input
                type="text"
                placeholder="Enter username"
                className="input input-bordered w-full"
                required
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
              />
            </div>
            <div className="form-control w-full">
              <label className="label pb-2">
                <span className="label-text font-semibold text-base">Password</span>
              </label>
              <input
                type="password"
                placeholder="Enter password"
                className="input input-bordered w-full"
                required
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
              />
            </div>
            <div className="form-control mt-4">
              <button className="btn btn-primary w-full text-lg">Login</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default page;
