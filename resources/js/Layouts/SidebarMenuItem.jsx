import React, { useState } from "react";
import { Link, usePage } from "@inertiajs/react";
import { ChevronDown, ChevronRight } from "lucide-react";

const SidebarMenuItem = ({
    icon: Icon,
    title,
    path,
    submenu,
    isCollapsed,
    className = "",
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const { url } = usePage();

    const isActive = (itemPath) => {
        if (!itemPath) return false;
        return url.startsWith(itemPath);
    };

    const toggleSubmenu = () => {
        if (!isCollapsed) {
            setIsOpen(!isOpen);
        }
    };

    const getItemClasses = (itemPath) => {
        const active = isActive(itemPath);
        return `group flex items-center relative ${
            isCollapsed ? "justify-center" : ""
        } px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
            active
                ? "bg-white text-[#213341]"
                : "text-gray-300 hover:text-white hover:bg-[#2c4456]"
        } ${className}`;
    };

    const MenuItem = ({ item, isSubmenuItem = false }) => {
        const linkContent = (
            <>
                {!isSubmenuItem && Icon && (
                    <Icon
                        className={`h-5 w-5 ${isCollapsed ? "" : "mr-3"} ${
                            isActive(item.path)
                                ? "text-[#213341]"
                                : "text-gray-300"
                        }`}
                    />
                )}
                {(!isCollapsed || isSubmenuItem) && <span>{item.title}</span>}
            </>
        );

        return (
            <Link href={item.path} className={getItemClasses(item.path)}>
                {linkContent}
                {isCollapsed && !isSubmenuItem && (
                    <div className="absolute left-full ml-6 hidden group-hover:block px-2 py-1 bg-[#213341] text-white text-sm rounded-md whitespace-nowrap z-50">
                        {item.title}
                    </div>
                )}
            </Link>
        );
    };

    if (submenu) {
        const isSubmenuActive = submenu.some((item) => isActive(item.path));

        return (
            <div
                className="relative"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <button
                    onClick={toggleSubmenu}
                    className={`w-full group ${getItemClasses()} ${
                        isSubmenuActive ? "bg-[#2c4456]" : ""
                    }`}
                >
                    <Icon className={`h-5 w-5 ${isCollapsed ? "" : "mr-3"}`} />
                    {!isCollapsed && (
                        <>
                            <span className="flex-1 text-left">{title}</span>
                            {isOpen ? (
                                <ChevronDown className="h-4 w-4" />
                            ) : (
                                <ChevronRight className="h-4 w-4" />
                            )}
                        </>
                    )}
                    {isCollapsed && (
                        <div className="absolute left-full ml-6 hidden group-hover:block px-2 py-1 bg-[#213341] text-white text-sm rounded-md whitespace-nowrap z-50">
                            {title}
                        </div>
                    )}
                </button>

                {/* Submenu */}
                {isCollapsed
                    ? isHovered && (
                          <div className="absolute left-full top-0 ml-6 bg-[#213341] rounded-md py-2 min-w-[200px] z-50">
                              <div className="px-4 py-2 text-sm font-medium text-white border-b border-gray-700">
                                  {title}
                              </div>
                              {submenu.map((item, index) => (
                                  <MenuItem
                                      key={index}
                                      item={item}
                                      isSubmenuItem
                                  />
                              ))}
                          </div>
                      )
                    : isOpen && (
                          <div className="ml-4 mt-1">
                              {submenu.map((item, index) => (
                                  <MenuItem
                                      key={index}
                                      item={item}
                                      isSubmenuItem
                                  />
                              ))}
                          </div>
                      )}
            </div>
        );
    }

    return <MenuItem item={{ title, path }} />;
};

export default SidebarMenuItem;
