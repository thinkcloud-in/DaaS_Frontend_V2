import React from "react";
import { Info } from "lucide-react";

const About = () => {
    return (
        <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen text-left w-full select-none">
            <div className="flex items-center gap-3 pb-4 border-b border-gray-200 dark:border-gray-700 mb-6">
                <div className="h-9 w-9 rounded-lg bg-[#1a365d]/10 flex items-center justify-center flex-shrink-0">
                    <Info className="h-4 w-4 text-[#1a365d] dark:text-blue-300" />
                </div>
                <h1 className="text-xl font-bold text-[#1a365d] dark:text-blue-300">About</h1>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 w-full max-w-2xl p-6 space-y-4">
                <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Application</span>
                    <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">DaaS Platform</span>
                </div>
                <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Description</span>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                        Centralized management for Kubernetes clusters, Harbor registries, and application deployments.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default About;
