import React from "react";
import { Mail, Phone, MapPin } from "lucide-react";
import logoVerde from "../images/mercaducaVerde.png";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    {
      name: "Instagram",
      href: "https://www.instagram.com/mercaduca?igsh=MXE1bGF5OWM1enNicg==",
      target: "blank",
      rel: "noopener noreferrer",
      label: "Instagram",
      color: "hover:text-pink-500",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
        </svg>
      ),
    },
    {
      name: "TikTok",
      href: "https://www.tiktok.com/@mercaduca?_t=ZM-90vw2a50RQm&_r=1",
      label: "TikTok",
      color: "hover:text-black",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
        </svg>
      ),
    },
  ];

  const quickLinks = [
    { name: "Inicio", href: "/" },
    { name: "Sobre Nosotros", href: "/sobreNosotros" },
    { name: "Catálogo", href: "/catalog" },
    { name: "Emprendimientos", href: "/emprendimientos" },
    { name: "Quiero vender", href: "/vender" },
  ];

  const categories = [
    { name: "Ropa", href: "/catalog?categories=17" },
    { name: "Joyería", href: "/catalog?categories=11" },
    { name: "Juguetes", href: "/catalog?categories=12" },
    { name: "Alimentos", href: "/catalog?categories=1" },
    { name: "Coleccionables", href: "/catalog?categories=2" },
  ];

  return (
    <footer className="bg-white text-gray-700 border-t border-gray-200 py-1">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-10 lg:py-12">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start lg:gap-12">
          {/* About Section */}
          <div className="lg:w-2/6 pb-7">
            <h3 className="text-[#557051] text-base md:text-lg font-bold mb-3 md:mb-4">
              Mercaduca
            </h3>
            <p className="text-gray-600 leading-relaxed text-sm md:text-base">
              Espacio dónde los estudiantes UCA pueden dar vida a sus proyectos
              y comercializar sus productos
            </p>
            <img
              src={logoVerde}
              alt="Logo Mercaduca"
              className="w-40 md:w-52 lg:w-58 h-auto mt-4 md:mt-6 lg:mt-10"
            ></img>
          </div>

          {/* Quick Links + Categorias */}
          <div className="w-full lg:w-2/6 grid grid-cols-2 gap-6 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 pb-4 md:pb-7">
            {/* Quick Links */}
            <div className="lg:w-1/6 pb-4 md:pb-7">
              <h4 className="font-poppins text-[#557051] text-base font-semibold whitespace-nowrap mb-4">
                Enlaces Rápidos
              </h4>
              <ul className="space-y-3 text-sm">
                {quickLinks.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      className="text-gray-600 hover:text-[#557051] transition-colors hover:font-bold duration-300 hover:translate-x-1 inline-block"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Categories */}
            <div className="lg:w-1/6 pb-4 md:pb-7">
              <h4 className="text-[#557051] text-base font-semibold font-poppins mb-4">
                Categorías
              </h4>
              <ul className="space-y-3 text-sm">
                {categories.map((category) => (
                  <li key={category.name}>
                    <a
                      href={category.href}
                      className="text-gray-600 hover:text-[#557051] hover:font-bold transition-colors duration-300 hover:translate-x-1 inline-block"
                    >
                      {category.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Contact Info */}
          <div className="lg:w-2/6">
            <h4 className="text-[#557051] text-base font-semibold font-poppins mb-4">
              Contacto
            </h4>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3 group">
                <MapPin
                  size={18}
                  className="text-[#557051] mt-1 flex-shrink-0 group-hover:scale-110 transition-transform"
                />
                <a
                  href="https://maps.google.com/?q=Universidad+Centroamericana+José+Simeón+Cañas,+San+Salvador,+El+Salvador"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-[#557051] hover:font-bold transition-colors"
                >
                  UCA, San Salvador, El Salvador
                </a>
              </li>
              <li className="flex items-start gap-3 group">
                <Phone
                  size={18}
                  className="text-[#557051] mt-1 flex-shrink-0 group-hover:scale-110 transition-transform"
                />
                <a
                  href="tel:+50312345678"
                  className="text-gray-600 hover:text-[#557051] hover:font-bold transition-colors"
                >
                  +503 2210- 6600, ext: 462
                </a>
              </li>
              <li className="flex items-start gap-3 group">
                <Mail
                  size={18}
                  className="text-[#557051] mt-1 flex-shrink-0 group-hover:scale-110 transition-transform"
                />
                <a
                  href="mailto:info@mercaduca.com"
                  className="text-gray-600 hover:text-[#557051] hover:font-bold  transition-colors"
                >
                  rjaguinada@uca.edu.sv
                </a>
              </li>
            </ul>
            <div className="flex gap-3 mt-5">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className={`bg-gray-100 p-2.5 rounded-full transition-all duration-300 ${social.color} hover:scale-110`}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
