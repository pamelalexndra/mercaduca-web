import React from 'react';
import { Linkedin, Twitter, Mail, Phone, MapPin, Send } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { 
      name: 'Facebook',
      href: '#',
      label: 'Facebook',
      color: 'hover:text-blue-500',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      )
    },
    { 
      name: 'Instagram',
      href: 'https://www.instagram.com/mercaduca?igsh=MXE1bGF5OWM1enNicg==',
      target:'blank',
      rel: 'noopener noreferrer',
      label: 'Instagram',
      color: 'hover:text-pink-500',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
        </svg>
      )
    },
    { 
      name: 'Twitter',
      href: '#',
      label: 'Twitter',
      color: 'hover:text-sky-400',
      icon: <Twitter size={20} />
    },
    { 
      name: 'Tiktok',
      href: 'https://www.tiktok.com/@mercaduca?_t=ZM-90vw2a50RQm&_r=1',
      label: 'TikTok',
      color: 'hover:text-white-600',
      icon: <Linkedin size={20} />
    },
  ];

  const quickLinks = [
    { name: 'Inicio', href: '#' },
    { name: 'Sobre Nosotros', href: '#' },
    { name: 'Catalogo', href: '#' },
    { name: 'Emprendedores', href: '#' },
    { name: 'Quiero vender', href: '#' },
  ];

  const categories = [
    { name: 'Tecnología', href: '#' },
    { name: 'Alimentos', href: '#' },
    { name: 'Ropa', href: '#' },
    { name: 'Deportivos', href: '#' },
    { name: 'Otros', href: '#' },
  ];

  return (
    <footer className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-gray-300">
    {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* About Section */}
          <div>
            <h3 className="text-white text-xl font-bold mb-4">Mercaduca</h3>
            <p className="text-gray-400 mb-6 leading-relaxed">
              Emprendedores estudiantiles UCA
            </p>
            <div className="flex gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className={`bg-slate-700 p-2.5 rounded-full transition-all duration-300 ${social.color} hover:scale-110`}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white text-lg font-semibold mb-4">Enlaces Rápidos</h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-gray-400 hover:text-emerald-400 transition-colors duration-300 hover:translate-x-1 inline-block"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-white text-lg font-semibold mb-4">Categorías</h4>
            <ul className="space-y-3">
              {categories.map((category) => (
                <li key={category.name}>
                  <a
                    href={category.href}
                    className="text-gray-400 hover:text-emerald-400 transition-colors duration-300 hover:translate-x-1 inline-block"
                  >
                    {category.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-white text-lg font-semibold mb-4">Contacto</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 group">
                <MapPin size={20} className="text-emerald-500 mt-1 flex-shrink-0 group-hover:scale-110 transition-transform" />
                <span className="text-gray-400">
                  UCA, San Salvador, El Salvador
                </span>
              </li>
              <li className="flex items-start gap-3 group">
                <Phone size={20} className="text-emerald-500 mt-1 flex-shrink-0 group-hover:scale-110 transition-transform" />
                <a href="tel:+50312345678" className="text-gray-400 hover:text-emerald-400 transition-colors">
                  +503 2210- 6600, ext: 462
                </a>
              </li>
              <li className="flex items-start gap-3 group">
                <Mail size={20} className="text-emerald-500 mt-1 flex-shrink-0 group-hover:scale-110 transition-transform" />
                <a href="mailto:info@mercaduca.com" className="text-gray-400 hover:text-emerald-400 transition-colors">
                  rjaguinada@uca.edu.sv
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm text-center md:text-left">
              © {currentYear} Mercaduca. Todos los derechos reservados.
            </p>
            <div className="flex gap-6 text-sm">
              <a href="#" className="text-gray-400 hover:text-emerald-400 transition-colors">
                Política de Privacidad
              </a>
              <a href="#" className="text-gray-400 hover:text-emerald-400 transition-colors">
                Términos y Condiciones
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;