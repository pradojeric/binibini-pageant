import { Link } from "@inertiajs/react";
import {
    HomeIcon,
    TrophyIcon,
    UsersIcon,
    ClipboardDocumentCheckIcon,
    UserCircleIcon,
    ArrowLeftOnRectangleIcon,
    XMarkIcon
} from "@heroicons/react/24/outline";
import { cn } from "@/Utils/cn";

export default function Sidebar({ user, open, setOpen }) {
    const links = [
        {
            name: "Dashboard",
            href: route("dashboard"),
            icon: HomeIcon,
            active: route().current("dashboard"),
            show: true
        },
        {
            name: "Pageants",
            href: route("pageants.index"),
            icon: TrophyIcon,
            active: route().current("pageants*"),
            show: user.role === "admin"
        },
        {
            name: "Judges",
            href: route("judges.index"),
            icon: UsersIcon,
            active: route().current("judges.index"),
            show: user.role === "admin"
        },
        {
            name: "Scoring",
            href: route("scoring.index"),
            icon: ClipboardDocumentCheckIcon,
            active: route().current("scoring.index"),
            show: user.role === "judge"
        }
    ];

    return (
        <>
            {/* Mobile overlay */}
            <div
                className={cn(
                    "fixed inset-0 z-40 bg-gray-900/50 backdrop-blur-sm transition-opacity duration-300 lg:hidden",
                    open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                )}
                onClick={() => setOpen(false)}
            ></div>

            <aside
                className={cn(
                    "fixed inset-y-0 left-0 z-50 w-72 overflow-y-auto transition-transform duration-300 transform bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 lg:translate-x-0 lg:static lg:inset-0",
                    open ? "translate-x-0 shadow-2xl" : "-translate-x-full"
                )}
            >
                <div className="flex items-center justify-between px-6 py-8">
                    <div className="flex items-center gap-3">
                        <Link href="/" className="flex items-center bg-indigo-600 rounded-lg p-2 text-white shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/40 transition-shadow">
                             {/* <ApplicationLogo className="w-8 h-8 fill-current" /> */}
                             <span className="uppercase text-lg tracking-widest font-black">PS</span>
                        </Link>
                        <div className="hidden lg:block">
                            <span className="uppercase text-sm tracking-tighter font-extrabold dark:text-white">
                                PAGEANT SYSTEM
                            </span>
                        </div>
                    </div>
                    <button
                        className="p-1 lg:hidden dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                        onClick={() => setOpen(false)}
                    >
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>

                <div className="px-4 mt-4">
                    <p className="px-4 text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Main Menu</p>
                    <nav className="space-y-1">
                        {links.filter(l => l.show).map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className={cn(
                                    "group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200",
                                    link.active
                                        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                                        : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200"
                                )}
                            >
                                <link.icon className={cn(
                                    "w-5 h-5 mr-3 transition-colors",
                                    link.active ? "text-white" : "text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300"
                                )} />
                                {link.name}
                            </Link>
                        ))}
                    </nav>
                </div>

                <div className="absolute bottom-0 w-full p-4 space-y-4">
                    <div className="px-4 py-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/50 backdrop-blur-sm">
                        <div className="flex items-center mb-4">
                            <div className="flex-shrink-0">
                                <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold shadow-inner">
                                    {user.name.charAt(0)}
                                </div>
                            </div>
                            <div className="ml-3 overflow-hidden">
                                <p className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate">{user.name}</p>
                                <p className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">{user.role}</p>
                            </div>
                        </div>
                        
                        <div className="space-y-1">
                             <Link
                                href={route("profile.edit")}
                                className={cn(
                                    "flex items-center px-3 py-2 text-xs font-medium rounded-lg transition-colors",
                                    route().current("profile.edit")
                                    ? "bg-indigo-600 text-white"
                                    : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                                )}
                            >
                                <UserCircleIcon className="w-4 h-4 mr-2" />
                                Account Settings
                            </Link>
                            <Link
                                href={route("logout")}
                                method="post"
                                as="button"
                                className="w-full flex items-center px-3 py-2 text-xs font-medium text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            >
                                <ArrowLeftOnRectangleIcon className="w-4 h-4 mr-2" />
                                Sign Out
                            </Link>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
}
