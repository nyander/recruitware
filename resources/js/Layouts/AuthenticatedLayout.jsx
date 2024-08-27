import { useState } from 'react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import { Link } from '@inertiajs/react';
import SidebarMenuItem from './SidebarMenuItem';
import { 
    Users, Building, Briefcase, Clock, LayoutDashboard, UserPlus, FileText, 
    CalendarDays, DollarSign, File, PlaneTakeoff
} from 'lucide-react';

export default function Authenticated({ user, header, children }) {
    const [showingSidebar, setShowingSidebar] = useState(false);

    const candidatesSubmenu = [
        { title: 'Live', path: route('candidates.live') },
        { title: 'New', path: route('candidates.new') },
        { title: 'Audit', path: route('candidates.audit') },
        { title: 'Pending', path: route('candidates.pending') },
        { title: 'Leavers', path: route('candidates.leavers') },
        { title: 'Archive', path: route('candidates.archive') },
        { title: 'No Contact List', path: route('candidates.no-contact') },
    ];

    const clientsSubmenu = [
        { title: 'Clients', path: route('clients.index') },
        { title: 'Contacts', path: route('clients.contacts') },
        { title: 'Jobs', path: route('clients.jobs') },
        { title: 'Client Contracts', path: route('clients.contracts') },
        { title: '2nd Tier Contracts', path: route('clients.second-tier-contracts') },
        { title: 'Archive', path: route('clients.archive') },
    ];

    const humanResourcesSubmenu = [
        { title: 'Staff Details', path: route('hr.staff-details') },
        { title: 'Supplier Companies', path: route('hr.supplier-companies') },
        { title: 'Training', path: route('hr.training') },
        { title: 'Hot Arrivals', path: route('hr.hot-arrivals') },
        { title: 'Staff Reporting', path: route('hr.staff-reporting') },
        { title: 'Starters', path: route('hr.starters') },
        { title: 'Leavers', path: route('hr.leavers') },
        { title: 'Audit', path: route('hr.audit') },
    ];

    const rotaSubmenu = [
        { title: 'Staff Rota', path: route('rota.staff') },
        { title: 'Meetings', path: route('rota.meetings') },
        { title: 'Staff Hours', path: route('rota.staff-hours') },
    ];

    const planningSubmenu = [
        { title: 'Ad-hoc Planner', path: route('planning.ad-hoc') },
        { title: 'FTE Shifts', path: route('planning.fte-shifts') },
        { title: 'Daily Bookings', path: route('planning.daily-bookings') },
        { title: 'Unfilled Bookings', path: route('planning.unfilled-bookings') },
        { title: 'Unfilled Shifts', path: route('planning.unfilled-shifts') },
        { title: 'Cancelled Bookings', path: route('planning.cancelled-bookings') },
        { title: 'Timesheets', path: route('planning.timesheets') },
        { title: 'Oncall Sheets', path: route('planning.oncall-sheets') },
        { title: 'Payroll Issues', path: route('planning.payroll-issues') },
    ];

    const payrollSubmenu = [
        { title: 'Client Hours', path: route('payroll.client-hours') },
        { title: 'Costings', path: route('payroll.costings') },
        { title: 'Invoicing', path: route('payroll.invoicing') },
        { title: 'Payroll', path: route('payroll.payroll') },
        { title: 'Remittances', path: route('payroll.remittances') },
        { title: 'Reports', path: route('payroll.reports') },
    ];

    const invoicingSubmenu = [
        { title: 'Financial', path: route('invoicing.financial') },
        { title: 'HR Report', path: route('invoicing.hr-report') },
    ];

    return (
        <div className="min-h-screen bg-gray-100 flex">
            {/* Sidebar */}
            <div className={`bg-white w-64 min-h-screen flex flex-col transition-all duration-300 ease-in-out ${showingSidebar ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:static z-30 overflow-y-auto`}>
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
                    <SidebarMenuItem 
                        icon={Users}
                        title="Candidates"
                        submenu={candidatesSubmenu}
                    />
                    <SidebarMenuItem 
                        icon={Building}
                        title="Clients"
                        submenu={clientsSubmenu}
                    />
                    <SidebarMenuItem 
                        icon={Briefcase}
                        title="Human Resources"
                        submenu={humanResourcesSubmenu}
                    />
                    <SidebarMenuItem 
                        icon={Clock}
                        title="Rota"
                        submenu={rotaSubmenu}
                    />
                    <SidebarMenuItem 
                        icon={CalendarDays}
                        title="Planning"
                        submenu={planningSubmenu}
                    />
                    <SidebarMenuItem 
                        icon={DollarSign}
                        title="Payroll"
                        submenu={payrollSubmenu}
                    />
                    <SidebarMenuItem 
                        icon={File}
                        title="Invoicing"
                        submenu={invoicingSubmenu}
                    />
                    <SidebarMenuItem 
                        icon={FileText}
                        title="Bookings"
                        path={route('bookings.index')}
                    />
                    <SidebarMenuItem 
                        icon={UserPlus}
                        title="Submit new Candidate"
                        path={route('tablesubmissions.create')}
                    />
                </nav>
                <div className="px-4 py-2 border-t border-gray-200">
                    <Dropdown>
                        <Dropdown.Trigger>
                            <span className="inline-flex rounded-md">
                                <button
                                    type="button"
                                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-500 bg-white hover:text-gray-700 focus:outline-none transition ease-in-out duration-150"
                                >
                                    {user.name}

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
            <div className="flex-1 flex flex-col min-h-screen">
                {/* Top bar for mobile */}
                <div className="bg-white shadow lg:hidden">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between h-16">
                            <div className="flex">
                                <button
                                    onClick={() => setShowingSidebar((previousState) => !previousState)}
                                    className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 focus:text-gray-500 transition duration-150 ease-in-out"
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
                            </div>
                        </div>
                    </div>
                </div>

                {/* Page Heading */}
                {header && (
                    <header className="bg-white shadow">
                        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">{header}</div>
                    </header>
                )}

                {/* Page Content */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
                    <div className="container mx-auto px-6 py-8">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}