import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';
import SidebarMenuItem from './SidebarMenuItem';
import { 
    Users, Building, Briefcase, Clock, LayoutDashboard, UserPlus, FileText, 
    CalendarDays, DollarSign, File, PlaneTakeoff, ChevronDown
} from 'lucide-react';

function getIconForMenu(menuName) {
    switch (menuName) {
        case 'Dashboard':
            return LayoutDashboard;
        case 'Candidates':
            return Users;
        case 'Clients':
            return Building;
        case 'Human Resources':
            return Briefcase;
        case 'Rota':
            return Clock;
        case 'Planning':
            return CalendarDays;
        case 'Payroll':
            return DollarSign;
        case 'Invoicing':
            return File;
        case 'Bookings':
            return FileText;
        case 'Submit new Candidate':
            return UserPlus;
        case 'Travel':
            return PlaneTakeoff;
        default:
            return File;
    }
}

export default function Authenticated({ user, header, children, auth, menu = [] }) {
    const [showingSidebar, setShowingSidebar] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (showUserMenu && !event.target.closest('.user-menu')) {
                setShowUserMenu(false);
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, [showUserMenu]);

    const handleLogout = (e) => {
        e.preventDefault();
        window.location.href = '/login';
    };

    const UserMenu = () => (
        <div className="relative user-menu">
            <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-500 bg-white hover:text-gray-700 focus:outline-none transition ease-in-out duration-150"
            >
                {user?.name || 'Guest'}
                <ChevronDown className="ml-2 h-4 w-4" />
            </button>

            {showUserMenu && (
                <div className="absolute bottom-full right-0 mb-2 py-1 w-48 bg-white rounded-md shadow-lg border border-gray-200">
                    
                    <Link
                        href={route('external-logout')}
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

    return (
        <div className="min-h-screen bg-gray-100 flex">
            {/* Sidebar */}
            <div className={`bg-white w-64 min-h-screen flex flex-col transition-all duration-300 ease-in-out ${showingSidebar ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:static z-30 overflow-y-auto`}>
                <div className="flex items-center justify-center h-16 px-4 border-b border-gray-200">
                    <Link href="/">
                        <ApplicationLogo className="block h-9 w-auto fill-current text-gray-800" />
                    </Link>
                </div>
                <nav className="flex-1 px-2 py-4 space-y-1">
                    <SidebarMenuItem
                        icon={LayoutDashboard}
                        title="Dashboard"
                        path={route('dashboard')}
                    />
                    {menu.map((menuItem, index) => (
                        <SidebarMenuItem
                            key={index}
                            icon={getIconForMenu(menuItem.name)}
                            title={menuItem.name}
                            submenu={menuItem.submenu?.map(subItem => ({
                                title: subItem.name,
                                path: route(subItem.route || 'candidates.page', { 
                                    call: subItem.call, 
                                    name: subItem.name 
                                }),
                            })) || []}
                        />
                    ))}
                </nav>
                <div className="px-4 py-2 border-t border-gray-200">
                    <UserMenu />
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-h-screen w-full">
                {/* Top bar for mobile and desktop */}
                <div className="bg-white shadow w-full">
                    <div className="mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center h-16">
                            <div className="flex items-center">
                                <button
                                    onClick={() => setShowingSidebar((previousState) => !previousState)}
                                    className="lg:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 focus:text-gray-500 transition duration-150 ease-in-out"
                                >
                                    <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                                        <path
                                            className={!showingSidebar ? 'inline-flex' : 'hidden'}
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M4 6h16M4 12h16M4 18h16"
                                        />
                                        <path
                                            className={showingSidebar ? 'inline-flex' : 'hidden'}
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    </svg>
                                </button>
                                <div className="flex items-center ml-4">
                                    <Link href="/" className="lg:hidden">
                                        <ApplicationLogo className="block h-8 w-auto fill-current text-gray-800" />
                                    </Link>
                                </div>
                            </div>
                            <div className="flex items-center">
                                <div className="hidden sm:flex items-center space-x-4">
                                </div>
                                <div className="ml-4 flex items-center">
                                    <span className="hidden sm:inline-flex text-sm text-gray-500 mr-2">
                                        Welcome, {user?.name || 'Guest'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Page Heading */}
                {header && (
                    <header className="bg-white shadow w-full">
                        <div className="py-6 px-4 sm:px-6 lg:px-8">{header}</div>
                    </header>
                )}

                {/* Page Content */}
                <main className="flex-1 bg-gray-100 w-full">
                    {children}
                </main>
            </div>
        </div>
    );
}