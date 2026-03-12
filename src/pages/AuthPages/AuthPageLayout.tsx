import React from "react";

import { Link } from "react-router";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex items-center justify-center min-h-screen w-full bg-white overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-[100%] bg-gradient-to-r from-[#3756A6] via-[#4A4DAF] to-[#E53E3E]" />
      <div className="relative z-10 bg-white rounded-2xl shadow-xl 
                      px-6 py-10
                      sm:px-10 sm:py-12 
                      w-full 
                      max-w-md sm:max-w-lg lg:max-w-xl 
                      flex flex-col items-center">
        <Link to="/" className="mb-4">
          <img
            src="/images/logo/ohSansi.svg"
            alt="Logo"
            width={200}
            height={48}
          />
        </Link>
        {children}
      </div>
    </div>
  );
}
