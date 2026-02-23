import React from "react";
import { Outlet } from "react-router-dom";
import AdminNav from "./AdminNav";

export default function AdminLayout() {
  return (
    <div className="bg-cream min-h-screen font-montserrat pt-10 pb-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="font-loubag text-3xl text-[#557051] font-bold">
            Panel de Administración
          </h1>
          <p className="text-gray-500 text-sm mt-1">Gestiona el MercadUCA</p>
        </div>

        <AdminNav />

        <div className="mt-4">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
