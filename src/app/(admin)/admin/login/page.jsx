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
      return toast.error(result.message);
    } else {
      toast.success(result.message);
      router.push("/admin/profile");
    }
  };

  return (
    <>
      {/* Main Container */}
      <div className="flex flex-wrap w-screen h-screen m-0">
        {/* Image Section */}
        <div className="w-[50%] h-full object-contain bg-[#008b38]">
          {/* <img src={backgroundImage} alt="ECP Logo" /> */}
        </div>

        {/* Admin Section */}
        <div className="bg-white h-full right-0 w-[50%] py-0 px-4 flex justify-center items-center flex-col">
          <div className="mb-3">
            <img src={"/ecp.png"} alt="ECP Logo" className="h-[100px]" />
          </div>
          <h3 className="text-3xl font-semibold leading-7 tracking-tight mb-0 text-center uppercase text-[#464a53]">
            Admin Login
          </h3>
          <p className="text-[15px] mb-4 text-center font-normal">
            Welcome! Please enter your Credentials
          </p>
          <form className="w-70" onSubmit={handleSubmit}>
            <fieldset className="fieldset mb-2">
              <legend className="fieldset-legend text-lg">Username</legend>
              <input
                type="text"
                maxLength={30}
                id="username"
                value={formData.username}
                placeholder="Enter Username"
                className="bg-[#f8f9fa] input input-md"
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
              />
            </fieldset>

            <fieldset className="fieldset mb-2">
              <legend className="fieldset-legend text-lg">Password</legend>
              <input
                type="password"
                maxLength={50}
                id="password"
                value={formData.password}
                placeholder="Enter Password"
                className="bg-[#f8f9fa] input input-md"
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
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
      </div>
    </>
  );
};

export default page;
