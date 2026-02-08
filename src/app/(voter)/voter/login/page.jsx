"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

import toast from "react-hot-toast";

const page = () => {
  const router = useRouter();
  const [dobType, setDobType] = useState("text");
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
      return toast.error(result.message);
    } else {
      toast.success(result.message);
      return router.push("/voter/profile");
    }
  };

  return (
    <div>
      {/* Main Container */}
      <div className="flex flex-wrap w-screen h-screen m-0">
        {/* Voter Section */}
        <div className="bg-white h-full left-0 w-[50%] py-0 px-4 flex justify-center items-center flex-col">
          <div className="mb-3">
            <img src={"/ecp.png"} alt="ECP Logo" className="h-[100px]" />
          </div>
          <h3 className="text-3xl font-semibold leading-7 tracking-tight mb-0 text-center uppercase text-[#464a53]">
            Voter Login
          </h3>
          <p className="text-[15px] mb-4 text-center font-normal">
            Welcome! Please enter your Credentials
          </p>
          <form className="w-70" onSubmit={handleSubmit}>
            <fieldset className="fieldset mb-2">
              <legend className="fieldset-legend text-lg">CNIC</legend>
              <input
                type="text"
                maxLength={15}
                id="cnic"
                value={formData.cnic}
                placeholder="Enter CNIC"
                className="bg-[#f8f9fa] input input-md"
                onChange={(e) =>
                  setFormData({ ...formData, cnic: e.target.value })
                }
              />
            </fieldset>

            <fieldset className="fieldset mb-2">
              <legend className="fieldset-legend text-lg">Date of Birth</legend>
              <input
                type={dobType}
                onFocus={() => setDobType("date")}
                onBlur={() => setDobType("text")}
                max="2007-12-31"
                min="2000-01-01"
                id="dob"
                value={formData.dob}
                placeholder="Enter Date of Birth"
                className="bg-[#f8f9fa] input input-md"
                onChange={(e) =>
                  setFormData({ ...formData, dob: e.target.value })
                }
              />
            </fieldset>

            <button
              type="submit"
              className="btn btn-success w-full font-semibold mt-2"
            >
              LOG IN
            </button>
          </form>
        </div>

        {/* Image Section */}
        <div className="w-[50%] h-full object-contain bg-[#008b38]">
          {/* <img src={"/login-bg.jpg"} alt="Login Image" /> */}
        </div>
      </div>
    </div>
  );
};

export default page;
