import { useState } from "react";
import Sidebar from "@/Components/Sidebar";
import { Bars3Icon } from "@heroicons/react/24/outline";

export default function Authenticated({ user, header, children }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden font-sans">
            {/* Sidebar Component */}
            <Sidebar user={user} open={sidebarOpen} setOpen={setSidebarOpen} />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                
                {/* Mobile Header Bar */}
                <header className="lg:hidden flex items-center justify-between px-6 py-4 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 z-20">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="p-2 -ml-2 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                        <Bars3Icon className="w-6 h-6" />
                    </button>
                    
                    <div className="flex items-center">
                        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white text-[10px] font-black mr-2">PS</div>
                        <span className="uppercase text-xs tracking-tighter font-black dark:text-white">
                            PAGEANT SYSTEM
                        </span>
                    </div>

                    <div className="w-8"></div> {/* Spacer for alignment */}
                </header>

                {/* Page Header (Breadcrumbs/Title) */}
                {header && (
                    <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 sticky top-0 z-10">
                        <div className="max-w-7xl mx-auto py-6 px-6 sm:px-8">
                            <div className="text-gray-800 dark:text-white">
                                {header}
                            </div>
                        </div>
                    </div>
                )}

                {/* Main Scrollable Content */}
                <main className="flex-1 overflow-y-auto scroll-smooth">
                    <div className="py-8 px-6 sm:px-8 max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>

                {/* Ambient glow effect (optional premium touch) */}
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl pointer-events-none"></div>
            </div>
        </div>
    );
}
