import React from "react";
import { Headset } from "lucide-react";

const ContactSupport = () => {
    return (
        <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen text-left w-full select-none">
            <div className="flex items-center gap-3 pb-4 border-b border-gray-200 dark:border-gray-700 mb-6">
                <div className="h-9 w-9 rounded-lg bg-[#1a365d]/10 flex items-center justify-center flex-shrink-0">
                    <Headset className="h-4 w-4 text-[#1a365d] dark:text-blue-300" />
                </div>
                <h1 className="text-xl font-bold text-[#1a365d] dark:text-blue-300">Contact Support</h1>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 w-full max-w-2xl p-6 space-y-4">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                    Need help? Reach out to your system administrator or the support team for assistance with this platform.
                </p>
            </div>
        </div>
    );
};

export default ContactSupport;
