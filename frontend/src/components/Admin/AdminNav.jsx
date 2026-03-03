import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  ClipboardList,
  Tags,
  Users,
  Settings,
  TicketPercent,
} from "lucide-react";

const menuItems = [
  {
    icon: <ClipboardList size={18} />,
    label: "Solicitudes",
    path: "/admin/entrepreneurship-applications",
  },
  {
    icon: <LayoutDashboard size={18} />,
    label: "Actividades",
    path: "/admin/activity-management",
  },
  {
    icon: <Tags size={18} />,
    label: "Categorías",
    path: "/admin/categories",
  },
  {
    icon: <Users size={18} />,
    label: "Administradores",
    path: "/admin/administrators",
  },
  {
    icon: <Users size={18} />,
    label: "Emprendedores",
    path: "/admin/entrepreneurs",
  },
  {
  icon: <TicketPercent size={18} />,
  label: "Cupones",
  path: "/admin/coupons",
},
];

export default function AdminNav() {
  return (
    <nav className="flex justify-center mb-8">
      <div className="bg-white p-2 rounded-2xl shadow-md border border-gray-100 flex gap-2 overflow-x-auto no-scrollbar max-w-full">
        {menuItems.map((item) => (
          <NavLink
            key={item.label}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all font-montserrat text-sm whitespace-nowrap ${
                isActive
                  ? "bg-[#557051] text-white shadow-sm"
                  : "text-gray-500 hover:bg-[#f4f4f2] hover:text-[#557051]"
              }`
            }
          >
            {item.icon}
            <span className="font-semibold">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
