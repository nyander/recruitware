import { useState } from 'react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { Link } from '@inertiajs/react';

export default function Authenticated({ user, header, children }) {
    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);

    return (
        <div className="min-h-screen bg-gray-100">
            <nav className="bg-white border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex">
                            <div className="shrink-0 flex items-center">
                                <Link href="/">
                                    <ApplicationLogo className="block h-9 w-auto fill-current text-gray-800" />
                                </Link>
                            </div>

                            <div className="hidden space-x-8 sm:-my-px sm:ms-10 sm:flex">
                                <NavLink href={route('dashboard')} active={route().current('dashboard')}>
                                    Dashboard
                                </NavLink>
                                <NavLink href={route('tablesubmissions.index')} active={route().current('tablesubmissions.index')}>
                                    Candidates
                                </NavLink>
                                <NavLink href={route('bookings.index')} active={route().current('bookings.index')}>
                                    Bookings
                                </NavLink>
                                <NavLink href={route('clients.index')} active={route().current('clients.index')}>
                                    Clients
                                </NavLink>
                                <NavLink href={route('tablesubmissions.create')} active={route().current('tablesubmissions.create')}>
                                    Submit new Candidate
                                </NavLink>
                            </div>
                        </div>

                        {/* ... rest of the navbar code ... */}

                    </div>
                </div>

                <div className={(showingNavigationDropdown ? 'block' : 'hidden') + ' sm:hidden'}>
                    <div className="pt-2 pb-3 space-y-1">
                        <ResponsiveNavLink href={route('dashboard')} active={route().current('dashboard')}>
                            Dashboard
                        </ResponsiveNavLink>
                        <ResponsiveNavLink href={route('tablesubmissions.index')} active={route().current('tablesubmissions.index')}>
                            Candidates
                        </ResponsiveNavLink>
                        <ResponsiveNavLink href={route('bookings.index')} active={route().current('bookings.index')}>
                            Bookings
                        </ResponsiveNavLink>
                        <ResponsiveNavLink href={route('clients.index')} active={route().current('clients.index')}>
                            Clients
                        </ResponsiveNavLink>
                    </div>

                    {/* ... rest of the mobile menu code ... */}

                </div>
            </nav>

            {header && (
                <header className="bg-white shadow">
                    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">{header}</div>
                </header>
            )}

            <main>{children}</main>
        </div>
    );
}