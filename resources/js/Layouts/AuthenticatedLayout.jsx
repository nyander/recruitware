import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import ApplicationLogo from "@/Components/ApplicationLogo";
import { Link } from "@inertiajs/react";
import SidebarMenuItem from "./SidebarMenuItem";
import {
    Users,
    Building,
    Briefcase,
    Clock,
    LayoutDashboard,
    UserPlus,
    FileText,
    CalendarDays,
    DollarSign,
    File,
    PlaneTakeoff,
    ChevronDown,
    Menu as MenuIcon,
    X,
    RefreshCw,
    HelpCircle,
    Search,
    Bell,
    Settings,
} from "lucide-react";

// Import the ActionPopup component
import ActionPopup from "../Components/Actionpopup.jsx";

function getIconForMenu(menuName) {
    switch (menuName) {
        case "Dashboard":
            return LayoutDashboard;
        case "Candidates":
            return Users;
        case "Clients":
            return Building;
        case "Human Resources":
            return Briefcase;
        case "Rota":
            return Clock;
        case "Planning":
            return CalendarDays;
        case "Payroll":
            return DollarSign;
        case "Invoicing":
            return File;
        case "Bookings":
            return FileText;
        case "Submit new Candidate":
            return UserPlus;
        case "Travel":
            return PlaneTakeoff;
        default:
            return File;
    }
}

const ActionButton = ({ icon: Icon, label, onClick, badge }) => (
    <button
        onClick={onClick}
        className="flex flex-col items-center justify-center px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
    >
        <div className="relative">
            <Icon className="h-6 w-6" />
            {badge && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                    {badge}
                </span>
            )}
        </div>
        <span className="text-xs mt-1">{label}</span>
    </button>
);

export default function Authenticated({
    user,
    header,
    children,
    auth,
    menu = [],
}) {
    const [showingSidebar, setShowingSidebar] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [activePopup, setActivePopup] = useState(null);
    const collapseTimeout = useRef(null);

    const handleMouseEnter = () => {
        if (collapseTimeout.current) {
            clearTimeout(collapseTimeout.current);
        }
        setIsExpanded(true);
    };

    const handleMouseLeave = () => {
        collapseTimeout.current = setTimeout(() => {
            setIsExpanded(false);
        }, 100); // Changed from 2000 to 100
    };

    const handlePopup = (popupName) => {
        setActivePopup(activePopup === popupName ? null : popupName);
    };

    useEffect(() => {
        return () => {
            if (collapseTimeout.current) {
                clearTimeout(collapseTimeout.current);
            }
        };
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (showUserMenu && !event.target.closest(".user-menu")) {
                setShowUserMenu(false);
            }
        };

        document.addEventListener("click", handleClickOutside);
        return () => {
            document.removeEventListener("click", handleClickOutside);
        };
    }, [showUserMenu]);

    const handleRefresh = () => {
        window.location.reload();
    };

    const UserMenu = () => (
        <div className="relative user-menu">
            <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className={`flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-200 hover:text-white focus:outline-none transition ease-in-out duration-150 ${
                    !isExpanded ? "justify-center w-full" : ""
                }`}
            >
                {isExpanded && (user?.name || "Guest")}
                <ChevronDown
                    className={`${!isExpanded ? "" : "ml-2"} h-4 w-4`}
                />
            </button>

            {showUserMenu && (
                <div
                    className={`absolute py-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50 ${
                        !isExpanded
                            ? "left-12 top-0"
                            : "right-0 bottom-full mb-2"
                    }`}
                >
                    <Link
                        href={route("external-logout")}
                        method="post"
                        as="button"
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                        Log Out
                    </Link>
                </div>
            )}
        </div>
    );

    const HelpContent = () => (
        <div className="text-gray-600">
            <h3 className="font-medium mb-2 text-red-600">
                This section is under development, placeholder below
            </h3>
            <h4 className="font-medium mb-2">Quick Help Guide</h4>

            <ul className="space-y-2">
                <li>
                    • Use the sidebar to navigate between different sections
                </li>
                <li>• Hover over the sidebar to expand it</li>
                <li>• Click the refresh button to update the current page</li>
                <li>• Use the search function to find specific items</li>
                <li>• Check notifications for important updates</li>
            </ul>
            <div className="mt-4">
                <p>Need more help? Contact support:</p>
                <p className="text-blue-600">support@example.com</p>
            </div>
        </div>
    );

    const SearchContent = () => (
        <div>
            <div className="mb-4">
                <h3 className="font-medium mb-2 text-red-600">
                    This section is under development, placeholder below
                </h3>
                <input
                    type="text"
                    placeholder="Search..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D99038] focus:border-transparent"
                />
            </div>
            <div className="space-y-2">
                <p className="text-sm text-gray-600">Recent searches:</p>
                <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-gray-100 rounded-full text-sm">
                        Candidate #1234
                    </span>
                    <span className="px-3 py-1 bg-gray-100 rounded-full text-sm">
                        Marketing
                    </span>
                    <span className="px-3 py-1 bg-gray-100 rounded-full text-sm">
                        London Office
                    </span>
                </div>
            </div>
        </div>
    );

    const NotificationsContent = () => (
        <div className="space-y-4">
            <h3 className="font-medium mb-2 text-red-600">
                This section is under development, placeholder below
            </h3>
            <div className="flex items-center justify-between pb-2 border-b">
                <span className="font-medium">New Notifications</span>
                <button className="text-sm text-blue-600">
                    Mark all as read
                </button>
            </div>
            <div className="space-y-4">
                {[
                    {
                        title: "New Candidate Application",
                        time: "2 minutes ago",
                        unread: true,
                    },
                    {
                        title: "Interview Schedule Updated",
                        time: "1 hour ago",
                        unread: true,
                    },
                    {
                        title: "Meeting Reminder",
                        time: "3 hours ago",
                        unread: false,
                    },
                ].map((notification, index) => (
                    <div
                        key={index}
                        className={`flex items-start space-x-3 ${
                            notification.unread ? "bg-blue-50" : ""
                        } p-2 rounded`}
                    >
                        <div className="flex-grow">
                            <p className="font-medium">{notification.title}</p>
                            <p className="text-sm text-gray-500">
                                {notification.time}
                            </p>
                        </div>
                        {notification.unread && (
                            <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );

    const SettingsContent = () => (
        <div className="space-y-4">
            <h3 className="font-medium mb-2 text-red-600">
                This section is under development, placeholder below
            </h3>
            <div className="border-b pb-4">
                <h4 className="font-medium mb-2">Theme Preferences</h4>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md">
                    <option>Light Mode</option>
                    <option>Dark Mode</option>
                    <option>System Default</option>
                </select>
            </div>
            <div className="border-b pb-4">
                <h4 className="font-medium mb-2">Notifications</h4>
                <div className="space-y-2">
                    <label className="flex items-center">
                        <input
                            type="checkbox"
                            className="rounded text-[#D99038]"
                        />
                        <span className="ml-2">Email Notifications</span>
                    </label>
                    <label className="flex items-center">
                        <input
                            type="checkbox"
                            className="rounded text-[#D99038]"
                        />
                        <span className="ml-2">Push Notifications</span>
                    </label>
                </div>
            </div>
            <div>
                <h4 className="font-medium mb-2">Language</h4>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md">
                    <option>English (UK)</option>
                    <option>English (US)</option>
                    <option>French</option>
                    <option>German</option>
                </select>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#E7E7E6] flex">
            {/* Mobile menu button */}
            <div className="lg:hidden fixed top-4 left-4 z-50">
                <button
                    onClick={() => setShowingSidebar(!showingSidebar)}
                    className="inline-flex items-center justify-center p-2 rounded-md text-gray-200 bg-[#213341] hover:text-white hover:bg-[#2c4456] focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                >
                    <span className="sr-only">Open main menu</span>
                    {showingSidebar ? (
                        <X className="block h-6 w-6" aria-hidden="true" />
                    ) : (
                        <MenuIcon
                            className="block h-6 w-6"
                            aria-hidden="true"
                        />
                    )}
                </button>
            </div>

            {/* Sidebar */}
            <div
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                className={`bg-[#213341] flex flex-col transition-all duration-300 ease-in-out ${
                    showingSidebar ? "translate-x-0" : "-translate-x-full"
                } lg:translate-x-0 fixed lg:sticky top-0 z-40 h-screen ${
                    isExpanded ? "w-64" : "w-20"
                }`}
            >
                {/* Sidebar Header */}
                <div className="flex items-center justify-center h-16 px-4 border-b border-gray-700">
                    <Link
                        href="/"
                        className={`overflow-hidden transition-all duration-300 ${
                            !isExpanded ? "w-12" : "w-32"
                        }`}
                    >
                        <ApplicationLogo className="h-9 w-auto fill-current text-white" />
                    </Link>
                </div>

                {/* Sidebar Content */}
                <div className="flex-1 flex flex-col overflow-y-auto">
                    <nav className="flex-1 px-2 py-4 space-y-1">
                        {[
                            {
                                icon: LayoutDashboard,
                                title: "Dashboard",
                                path: route("dashboard"),
                            },
                            ...menu.map((menuItem, index) => ({
                                icon: getIconForMenu(menuItem.name),
                                title: menuItem.name,
                                submenu:
                                    menuItem.submenu?.map((subItem) => ({
                                        title: subItem.name,
                                        path: route(
                                            subItem.route || "candidates.page",
                                            {
                                                call: subItem.call,
                                                name: subItem.name,
                                            }
                                        ),
                                    })) || [],
                            })),
                        ].map((item, index) => (
                            <SidebarMenuItem
                                key={index}
                                {...item}
                                isCollapsed={!isExpanded}
                                className="text-white hover:text-gray-300 transition-colors duration-200"
                            />
                        ))}
                    </nav>

                    {/* User Menu at bottom */}
                    <div className="px-2 py-4 border-t border-gray-700">
                        <UserMenu />
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-h-screen">
                {/* Page Heading */}
                {header && (
                    <header className="shadow-none flex justify-between items-center bg-[#E7E7E6]">
                        <div className="py-6 px-4 sm:px-6 lg:px-8">
                            {header}
                        </div>
                        <div className="py-6 px-4 sm:px-6 lg:px-8 flex items-center space-x-2">
                            <ActionButton
                                icon={RefreshCw}
                                label="Refresh"
                                onClick={handleRefresh}
                            />
                            <ActionButton
                                icon={HelpCircle}
                                label="Help"
                                onClick={() => handlePopup("help")}
                            />
                            <ActionButton
                                icon={Search}
                                label="Search"
                                onClick={() => handlePopup("search")}
                            />
                            <ActionButton
                                icon={Bell}
                                label="Notifications"
                                onClick={() => handlePopup("notifications")}
                                badge="3"
                            />
                            <ActionButton
                                icon={Settings}
                                label="Settings"
                                onClick={() => handlePopup("settings")}
                            />
                        </div>
                    </header>
                )}

                {/* Page Content */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-[#E7E7E6] p-4">
                    {children}
                </main>
            </div>

            {/* Popups */}
            <ActionPopup
                isOpen={activePopup === "help"}
                onClose={() => setActivePopup(null)}
                title="Help Center"
            >
                <HelpContent />
            </ActionPopup>

            <ActionPopup
                isOpen={activePopup === "search"}
                onClose={() => setActivePopup(null)}
                title="Search"
            >
                <SearchContent />
            </ActionPopup>

            <ActionPopup
                isOpen={activePopup === "notifications"}
                onClose={() => setActivePopup(null)}
                title="Notifications"
            >
                <NotificationsContent />
            </ActionPopup>

            <ActionPopup
                isOpen={activePopup === "settings"}
                onClose={() => setActivePopup(null)}
                title="Settings"
            >
                <SettingsContent />
            </ActionPopup>

            {/* Overlay for mobile */}
            {showingSidebar && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
                    onClick={() => setShowingSidebar(false)}
                ></div>
            )}
        </div>
    );
}
