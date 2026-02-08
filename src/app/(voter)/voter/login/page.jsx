"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

const page = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    cnic: "",
    dob: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await fetch("/api/auth/voter/login", {
      method: "POST",
      body: JSON.stringify(formData),
      cache: "no-store",
    });
    const result = await response.json();

    if (!result.success) {
      toast.error(result.message);
    } else {
      toast.success(result.message);
      router.push("/voter/profile");
    }
  };

  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center p-4">
      <div className="card lg:card-side bg-base-100 shadow-xl max-w-4xl w-full overflow-hidden">
        <figure className="lg:w-1/2 bg-success flex flex-col items-center justify-center p-8 text-success-content">
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-24 h-24 mb-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
            <h2 className="text-3xl font-bold text-center">Voter Portal</h2>
            <p className="mt-2 text-center text-success-content/80">Cast your vote securely specifically for your elections.</p>
        </figure>
        <div className="card-body lg:w-1/2 justify-center">
            <div className="flex flex-col items-center mb-6">
                <img src="/ecp.png" alt="ECP Logo" className="h-20 mb-2 object-contain" />
                <h3 className="card-title text-2xl font-bold text-center">Voter Login</h3>
            </div>
          
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="form-control w-full">
              <label className="label pb-2">
                <span className="label-text font-semibold text-base">CNIC (Without Dashes)</span>
              </label>
              <input
                type="text"
                placeholder="Ex. 1234512345671"
                className="input input-bordered w-full"
                required
                maxLength={13}
                value={formData.cnic}
                onChange={(e) =>
                  setFormData({ ...formData, cnic: e.target.value })
                }
              />
            </div>
            <div className="form-control w-full">
              <label className="label pb-2">
                <span className="label-text font-semibold text-base">Date of Birth</span>
              </label>
              <input
                type="date"
                className="input input-bordered w-full"
                required
                value={formData.dob}
                onChange={(e) =>
                  setFormData({ ...formData, dob: e.target.value })
                }
              />
            </div>
            <div className="form-control mt-4">
              <button className="btn btn-success text-white w-full text-lg">Login</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default page;
