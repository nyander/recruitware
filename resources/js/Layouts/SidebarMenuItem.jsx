import React, { useState } from 'react';
import { Link } from '@inertiajs/react';
import { ChevronDown, ChevronRight } from 'lucide-react';

const SidebarMenuItem = ({ icon: Icon, title, path, submenu }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSubmenu = () => {
    setIsOpen(!isOpen);
  };

  if (submenu) {
    return (
      <div>
        <button
          onClick={toggleSubmenu}
          className="w-full flex items-center justify-between px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:bg-gray-100 focus:text-gray-900"
        >
          <div className="flex items-center">
            {Icon && <Icon className="mr-3 h-5 w-5" />}
            <span>{title}</span>
          </div>
          {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </button>
        {isOpen && (
          <div className="pl-4">
            {submenu.map((item, index) => (
              <Link
                key={index}
                href={item.path}
                className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              >
                {item.title}
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <Link
      href={path}
      className="flex items-center px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900"
    >
      {Icon && <Icon className="mr-3 h-5 w-5" />}
      <span>{title}</span>
    </Link>
  );
};

export default SidebarMenuItem;