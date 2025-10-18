import React from "react";
import GridShape from "../../components/common/GridShape";
import { Link } from "react-router";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative p-6 bg-white z-1 dark:bg-gray-900 sm:p-0">
      
      <div className="relative flex flex-col justify-center w-full h-screen lg:flex-row dark:bg-gray-900 sm:p-0">
        {children}
        
        <div className="hidden lg:grid items-center justify-center w-full h-full lg:w-1/2 bg-gradient-to-br from-[#3756A6] via-[#4A4DAF] to-[#E53E3E]">
        
          <div className="relative flex items-center justify-center z-1">
            {/* <!-- ===== Common Grid Shape Start ===== --> */}
            <GridShape />
            <div className="flex flex-col items-center max-w-xs">
              
              <Link to="/" className="block mb-4">
                <img
                  width={231}
                  height={48}
                  src="/images/logo/ohSansi.svg"
                  alt="Logo"
                />
              </Link>
              
              <p className="text-center text-gray-400 ">
                Sistema de calificaciones Oh!Sansi
              </p>
              
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
