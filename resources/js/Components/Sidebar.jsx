import { Link } from "@inertiajs/react";
import {
    HomeIcon,
    TrophyIcon,
    UsersIcon,
    ClipboardDocumentCheckIcon,
    UserCircleIcon,
    ArrowLeftOnRectangleIcon,
    XMarkIcon,
    Bars3Icon,
} from "@heroicons/react/24/outline";
import { cn } from "@/Utils/cn";

export default function Sidebar({ user, open, setOpen, collapsed, setCollapsed }) {
    const links = [
        {
            name: "Dashboard",
            href: route("dashboard"),
            icon: HomeIcon,
            active: route().current("dashboard"),
            show: true,
        },
        {
            name: "Pageants",
            href: route("pageants.index"),
            icon: TrophyIcon,
            active: route().current("pageants*"),
            show: user.role === "admin",
        },
        {
            name: "Judges",
            href: route("judges.index"),
            icon: UsersIcon,
            active: route().current("judges.index"),
            show: user.role === "admin",
        },
        {
            name: "Scoring",
            href: route("scoring.index"),
            icon: ClipboardDocumentCheckIcon,
            active: route().current("scoring.index"),
            show: user.role === "judge",
        },
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
                    "fixed inset-y-0 left-0 z-50 overflow-y-auto overflow-x-hidden transition-all duration-300 transform bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 lg:translate-x-0 lg:static lg:inset-0 flex flex-col",
                    open ? "translate-x-0 shadow-2xl" : "-translate-x-full",
                    collapsed ? "lg:w-16" : "lg:w-72",
                    "w-72"
                )}
            >
                {/* Header */}
                <div className={cn(
                    "flex items-center px-4 py-8",
                    collapsed ? "justify-center" : "justify-between px-6"
                )}>
                    {/* Logo + brand */}
                    <div className="flex items-center gap-3">
                        <Link
                            href="/"
                            className="flex-shrink-0 flex items-center bg-indigo-600 rounded-lg p-2 text-white shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/40 transition-shadow"
                            title={collapsed ? "Pageant System" : undefined}
                        >
                            <span className="uppercase text-lg tracking-widest font-black">PS</span>
                        </Link>
                        {!collapsed && (
                            <div className="hidden lg:block">
                                <span className="uppercase text-sm tracking-tighter font-extrabold dark:text-white">
                                    PAGEANT SYSTEM
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Desktop hamburger toggle */}
                    {!collapsed && (
                        <button
                            className="hidden lg:flex p-1 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                            onClick={() => setCollapsed(true)}
                            title="Collapse sidebar"
                        >
                            <Bars3Icon className="w-5 h-5" />
                        </button>
                    )}

                    {/* Mobile close button */}
                    <button
                        className="p-1 lg:hidden dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                        onClick={() => setOpen(false)}
                    >
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>

                {/* When collapsed on desktop — expand toggle */}
                {collapsed && (
                    <div className="hidden lg:flex justify-center px-4 mb-2">
                        <button
                            className="p-1 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                            onClick={() => setCollapsed(false)}
                            title="Expand sidebar"
                        >
                            <Bars3Icon className="w-5 h-5" />
                        </button>
                    </div>
                )}

                {/* Navigation */}
                <div className={cn("mt-4 flex-1", collapsed ? "px-2" : "px-4")}>
                    {!collapsed && (
                        <p className="px-4 text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
                            Main Menu
                        </p>
                    )}
                    <nav className="space-y-1">
                        {links.filter((l) => l.show).map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                title={collapsed ? link.name : undefined}
                                className={cn(
                                    "group flex items-center py-3 text-sm font-medium rounded-xl transition-all duration-200",
                                    collapsed ? "justify-center px-2" : "px-4 gap-3",
                                    link.active
                                        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                                        : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200"
                                )}
                            >
                                <link.icon
                                    className={cn(
                                        "flex-shrink-0 w-5 h-5 transition-colors",
                                        collapsed ? "" : "mr-0",
                                        link.active
                                            ? "text-white"
                                            : "text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300"
                                    )}
                                />
                                {!collapsed && link.name}
                            </Link>
                        ))}
                    </nav>
                </div>

                {/* User section */}
                <div className={cn("w-full p-4 space-y-4", collapsed ? "px-2" : "p-4")}>
                    <div className={cn(
                        "rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/50 backdrop-blur-sm",
                        collapsed ? "p-2 flex flex-col items-center gap-2" : "px-4 py-4"
                    )}>
                        {/* Avatar */}
                        <div
                            className={cn(
                                "flex-shrink-0 w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold shadow-inner",
                                collapsed ? "" : "mb-0"
                            )}
                            title={collapsed ? user.name : undefined}
                        >
                            {user.name.charAt(0)}
                        </div>

                        {!collapsed && (
                            <>
                                <div className="flex items-center mb-4 mt-0">
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
                            </>
                        )}

                        {collapsed && (
                            <>
                                <Link
                                    href={route("profile.edit")}
                                    title="Account Settings"
                                    className={cn(
                                        "flex items-center justify-center p-2 rounded-lg transition-colors",
                                        route().current("profile.edit")
                                            ? "bg-indigo-600 text-white"
                                            : "text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                                    )}
                                >
                                    <UserCircleIcon className="w-4 h-4" />
                                </Link>
                                <Link
                                    href={route("logout")}
                                    method="post"
                                    as="button"
                                    title="Sign Out"
                                    className="flex items-center justify-center p-2 text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                >
                                    <ArrowLeftOnRectangleIcon className="w-4 h-4" />
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </aside>
        </>
    );
}
