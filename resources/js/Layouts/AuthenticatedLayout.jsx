import { useState } from 'react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import { Link } from '@inertiajs/react';
import SidebarMenuItem from './SidebarMenuItem';
import { 
    Users, Building, Briefcase, Clock, LayoutDashboard, UserPlus, FileText, 
    CalendarDays, DollarSign, File, PlaneTakeoff, Menu
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
            return File; // Default icon
    }
}

export default function Authenticated({ user, header, children, auth, menu = [] }) {
    const [showingSidebar, setShowingSidebar] = useState(false);

    const candidatesSubmenu = menu.find(item => item.name === 'Candidates')?.submenu.map(subItem => ({
        title: subItem.name,
        path: route('candidates.page', { call: subItem.call, name: subItem.name }),
    })) || [];

    const toggleSidebar = () => {
        setShowingSidebar(!showingSidebar);
    };

    return (
        <div className="min-h-screen bg-gray-100 flex">
            {/* Hamburger button */}
            <button
                onClick={toggleSidebar}
                className="fixed top-4 left-4 z-50 p-2 rounded-md bg-white shadow-md"
            >
                <Menu size={24} />
            </button>

            {/* Sidebar */}
            <div className={`bg-white w-64 min-h-screen flex flex-col transition-all duration-300 ease-in-out ${showingSidebar ? 'translate-x-0' : '-translate-x-full'} fixed z-40 overflow-y-auto`}>
                <div className="flex items-center justify-center h-16 px-4">
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
                            submenu={menuItem.name === 'Candidates' 
                                ? candidatesSubmenu
                                : menuItem.submenu?.map(subItem => ({
                                    title: subItem.name,
                                    path: route(subItem.route || 'candidates.page', { 
                                        call: subItem.call, 
                                        name: subItem.name 
                                    }),
                                })) || []
                            }
                        />
                    ))}
                </nav>
                <div className="px-4 py-2 border-t border-gray-200">
                    <Dropdown>
                        <Dropdown.Trigger>
                            <span className="inline-flex rounded-md">
                                <button
                                    type="button"
                                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-500 bg-white hover:text-gray-700 focus:outline-none transition ease-in-out duration-150"
                                >
                                    {user?.name || 'Guest'}

                                    <svg
                                        className="ms-2 -me-0.5 h-4 w-4"
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </button>
                            </span>
                        </Dropdown.Trigger>

                        <Dropdown.Content>
                            <Dropdown.Link href={route('profile.edit')}>Profile</Dropdown.Link>
                            <Dropdown.Link href={route('logout')} method="post" as="button">
                                Log Out
                            </Dropdown.Link>
                        </Dropdown.Content>
                    </Dropdown>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-h-screen w-full">
                {/* Page Heading */}
                {header && (
                    <header className="bg-white shadow w-full mt-16">
                        <div className="py-6 px-4 sm:px-6 lg:px-8">{header}</div>
                    </header>
                )}

                {/* Page Content */}
                <main className="flex-1 bg-gray-100 w-full p-4">
                    {children}
                </main>
            </div>

            {/* Overlay */}
            {showingSidebar && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-30"
                    onClick={toggleSidebar}
                ></div>
            )}
        </div>
    );
}