import { LayoutDashboard, ClipboardList, Tags, Users, Key } from "lucide-react";

const menuItems = [
  {
    icon: <ClipboardList size={20} />,
    label: "Solicitudes",
    path: "/Admin/entrepreneurship-applications",
  },
  {
    icon: <LayoutDashboard size={20} />,
    label: "Actividades",
    path: "/Admin/activity-management",
  },
  { icon: <Tags size={20} />, label: "Categorías", path: "/Admin/categories" },
  { icon: <Users size={20} />, label: "Usuarios", path: "/Admin/users" },
  { icon: <Key size={20} />, label: "Seguridad", path: "/Admin/security" },
];

export default function AdminSidebar() {
  return (
    <aside className="w-64 bg-white rounded-3xl shadow-xl p-6 h-fit sticky top-10 border border-gray-50">
      <h2 className="font-loubag text-[#557051] text-xl mb-8 px-2">
        Panel Admin
      </h2>
      <nav className="space-y-2">
        {menuItems.map((item) => (
          <a
            key={item.label}
            href={item.path}
            className="flex items-center gap-3 p-4 rounded-2xl text-gray-600 hover:bg-[#f4f4f2] hover:text-[#557051] transition-all font-montserrat text-sm"
          >
            {item.icon}
            <span className="font-medium">{item.label}</span>
          </a>
        ))}
      </nav>
    </aside>
  );
}
