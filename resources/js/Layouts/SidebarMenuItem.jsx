import React, { useState } from 'react';
import { Link } from '@inertiajs/react';
import { ChevronDown, ChevronRight } from 'lucide-react';

const SidebarMenuItem = ({ icon: Icon, title, path, submenu, isCompact, showingSidebar }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const toggleSubmenu = () => {
    setIsOpen(!isOpen);
  };

  const MenuItem = ({ item, isSubmenuItem = false }) => (
    <Link
      href={item.path}
      className={`flex items-center px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 ${isSubmenuItem ? 'pl-12' : ''}`}
    >
      {!isSubmenuItem && Icon && <Icon className="mr-3 h-5 w-5" />}
      {(!isCompact || showingSidebar || isSubmenuItem || isHovered) && <span>{item.title}</span>}
    </Link>
  );

  if (submenu) {
    return (
      <div 
        className="relative" 
        onMouseEnter={() => setIsHovered(true)} 
        onMouseLeave={() => setIsHovered(false)}
      >
        <button
          onClick={toggleSubmenu}
          className="w-full flex items-center justify-between px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:bg-gray-100 focus:text-gray-900"
        >
          <div className="flex items-center">
            {Icon && <Icon className="mr-3 h-5 w-5" />}
            {(!isCompact || showingSidebar || isHovered) && <span>{title}</span>}
          </div>
          {(!isCompact || showingSidebar || isHovered) && (isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />)}
        </button>
        {(isOpen || (isCompact && !showingSidebar && isHovered)) && (
          <div className={`pl-4 ${isCompact && !showingSidebar ? 'absolute left-full top-0 bg-white shadow-lg rounded-r-md' : ''}`}>
            {submenu.map((item, index) => (
              <MenuItem key={index} item={item} isSubmenuItem />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      onMouseEnter={() => setIsHovered(true)} 
      onMouseLeave={() => setIsHovered(false)}
      className="relative"
    >
      <MenuItem item={{ title, path }} />
      {isCompact && !showingSidebar && isHovered && (
        <div className="absolute left-full top-0 bg-white shadow-lg rounded-r-md px-2 py-1 ml-2">
          {title}
        </div>
      )}
    </div>
  );
};

export default SidebarMenuItem;