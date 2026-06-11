import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Plus,
    Search,
    Layers,
    Cpu,
    Trash2,
    Download,
    FileText,
    CheckCircle
} from "lucide-react";
import { toast } from "react-toastify";

const LibraryList = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState("");

    // Mock Data for Library Packages
    const [packages, setPackages] = useState([
        {
            id: 1,
            baseOsName: "Ubuntu-22.04-LTS",
            baseOsFile: "ubuntu-22.04-desktop-amd64.iso",
            agentVersion: "v2.4.1-stable",
            devraqAgentFile: "devraq-agent-v2.4.1.tar.gz",
            syncDate: "2026-05-10",
            status: "Synced"
        },
        {
            id: 2,
            baseOsName: "CentOS-Stream-9",
            baseOsFile: "CentOS-Stream-9-latest-x86_64.qcow2",
            agentVersion: "v2.4.0-patch1",
            devraqAgentFile: "devraq-agent-v2.4.0.bin",
            syncDate: "2026-04-28",
            status: "Synced"
        },
        {
            id: 3,
            baseOsName: "Debian-12-Bookworm",
            baseOsFile: "debian-12.5.0-amd64-netinst.iso",
            agentVersion: "v2.3.9-legacy",
            devraqAgentFile: "devraq-agent-v2.3.9.zip",
            syncDate: "2026-03-15",
            status: "Synced"
        }
    ]);

    // Handle Delete Package
    const handleDelete = (id, name) => {
        if (window.confirm(`Are you sure you want to remove ${name} from the library?`)) {
            setPackages(packages.filter(pkg => pkg.id !== id));
            toast.success(`${name} removed successfully.`);
        }
    };

    // Filter packages based on search term
    const filteredPackages = packages.filter(pkg =>
        pkg.baseOsName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pkg.agentVersion.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6 bg-gray-50 h-auto text-left items-start flex flex-col w-full relative select-none">

            {/* Header Section */}
            <div className="pb-4 border-b border-gray-200 mb-6 w-full flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold text-[#1a365d]">Library Repository</h1>
                    <p className="text-xs text-gray-500 mt-0.5">View, manage, and download synchronized Base OS templates and Devraq Agent binaries.</p>
                </div>

                {/* Add New Package Button */}
                <button
                    onClick={() => navigate("/upload-library")} // Aap apne route ke mutabik change kar sakte hain
                    className="inline-flex items-center gap-2 rounded-md bg-[#1a365d] hover:bg-[#122744] px-4 py-2 text-xs font-bold text-white shadow-sm transition-all uppercase tracking-wider self-start sm:self-auto"
                >
                    <Plus className="h-4 w-4" />
                    <span>Add New Package</span>
                </button>
            </div>

            {/* Filter & Search Bar */}
            <div className="mb-4 w-full max-w-xl relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by OS Name or Agent Version..."
                    className="w-full rounded-md border border-gray-300 bg-white py-2 pl-9 pr-3 focus:border-[#1a365d] focus:ring-1 focus:ring-[#1a365d] focus:outline-none text-sm text-gray-900 transition-all shadow-2xs"
                />
            </div>

            {/* Table Container */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 w-full overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[800px] text-left border-collapse">

                        {/* Table Head */}
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="p-4 text-[11px] font-bold text-gray-500 uppercase tracking-wide w-[30%]">Base OS Configuration</th>
                                <th className="p-4 text-[11px] font-bold text-gray-500 uppercase tracking-wide w-[30%]">Devraq Agent Configuration</th>
                                <th className="p-4 text-[11px] font-bold text-gray-500 uppercase tracking-wide w-[15%]">Sync Date</th>
                                <th className="p-4 text-[11px] font-bold text-gray-500 uppercase tracking-wide w-[12%]">Status</th>
                                <th className="p-4 text-[11px] font-bold text-gray-500 uppercase tracking-wide w-[13%] text-right">Actions</th>
                            </tr>
                        </thead>

                        {/* Table Body */}
                        <tbody className="divide-y divide-gray-100">
                            {filteredPackages.length > 0 ? (
                                filteredPackages.map((pkg) => (
                                    <tr key={pkg.id} className="hover:bg-gray-50/50 transition-colors">

                                        {/* Base OS Details */}
                                        <td className="p-4">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-1.5 font-semibold text-sm text-gray-900">
                                                    <Layers className="h-3.5 w-3.5 text-[#1a365d]" />
                                                    {pkg.baseOsName}
                                                </div>
                                                <div className="flex items-center gap-1 text-[11px] text-gray-500 max-w-[250px] truncate">
                                                    <FileText className="h-3 w-3 text-gray-400 flex-shrink-0" />
                                                    <span className="truncate" title={pkg.baseOsFile}>{pkg.baseOsFile}</span>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Devraq Agent Details */}
                                        <td className="p-4">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-1.5 font-semibold text-sm text-gray-900">
                                                    <Cpu className="h-3.5 w-3.5 text-[#1a365d]" />
                                                    {pkg.agentVersion}
                                                </div>
                                                <div className="flex items-center gap-1 text-[11px] text-gray-500 max-w-[250px] truncate">
                                                    <FileText className="h-3 w-3 text-gray-400 flex-shrink-0" />
                                                    <span className="truncate" title={pkg.devraqAgentFile}>{pkg.devraqAgentFile}</span>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Sync Date */}
                                        <td className="p-4 text-xs font-medium text-gray-600">
                                            {pkg.syncDate}
                                        </td>

                                        {/* Status Badge */}
                                        <td className="p-4">
                                            <span className="inline-flex items-center gap-1 rounded bg-green-50 px-2 py-0.5 text-xs font-semibold text-green-700 ring-1 ring-inset ring-green-600/20">
                                                <CheckCircle className="h-3 w-3 text-green-600" />
                                                {pkg.status}
                                            </span>
                                        </td>

                                        {/* Action Buttons */}
                                        <td className="p-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => toast.info(`Downloading components for ${pkg.baseOsName}...`)}
                                                    title="Download Package"
                                                    className="p-1.5 text-gray-500 hover:text-[#1a365d] bg-white hover:bg-gray-100 rounded border border-gray-200 transition-colors shadow-2xs"
                                                >
                                                    <Download className="h-3.5 w-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(pkg.id, pkg.baseOsName)}
                                                    title="Delete Package"
                                                    className="p-1.5 text-gray-400 hover:text-red-600 bg-white hover:bg-red-50 rounded border border-gray-200 transition-colors shadow-2xs"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
                                        </td>

                                    </tr>
                                ))
                            ) : (
                                /* Empty State Row */
                                <tr>
                                    <td colSpan="5" className="p-8 text-center text-sm text-gray-500 font-medium bg-gray-50/20">
                                        No library packages found matching your criteria.
                                    </td>
                                </tr>
                            )}
                        </tbody>

                    </table>
                </div>
            </div>

        </div>
    );
};

export default LibraryList;