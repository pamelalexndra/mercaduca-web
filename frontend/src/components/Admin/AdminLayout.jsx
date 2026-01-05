import React from "react";
import { Outlet } from "react-router-dom";
// import AdminSidebar from "./AdminSidebar"; 
import AdminNav from "./AdminNav";

/* export default function AdminLayout() {
  return (
    <div className="bg-cream min-h-screen flex font-montserrat">
      <div className="w-72 p-6 sticky top-0 h-screen hidden lg:block">
        <AdminSidebar />
      </div>

      <main className="flex-1 p-6 lg:p-10 overflow-y-auto">
        <Outlet /> 
      </main>
    </div>
  );
} */

export default function AdminLayout() {
  return (
    <div className="bg-cream min-h-screen font-montserrat pt-10 pb-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="font-loubag text-3xl text-[#557051] font-bold">
            Panel de Administración
          </h1>
          <p className="text-gray-500 text-sm mt-1">Gestiona los módulos de la plataforma</p>
        </div>

        <AdminNav />

        <div className="mt-4">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
