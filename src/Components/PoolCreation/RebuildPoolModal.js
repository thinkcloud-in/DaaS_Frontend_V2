import { useState } from "react";

// Modal Component
export const RebuildPoolModal = ({
  isOpen,
  onClose,
  onConfirm,
  currentPath,
}) => {
  const [vhdPath, setVhdPath] = useState("");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <h2 className="text-lg font-semibold text-[#1a365d] mb-1">
          Rebuild Pool
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          Enter the VHD path to use for rebuilding this pool.
        </p>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1 [caret-shape:block]">
            Current Parent Disk Path
          </label>
          <div
            title={currentPath}
            className="w-full bg-gray-100 border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-500 break-all max-h-24 overflow-y-auto cursor-not-allowed"
          >
            {currentPath || "N/A"}
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            New VHD Path
          </label>
          <input
            type="text"
            value={vhdPath}
            onChange={(e) => setVhdPath(e.target.value)}
            placeholder="e.g. C:\VMs\Parent_VM.vhdx"
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a365d]"
          />
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-md border border-gray-300 text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (!vhdPath.trim()) return;
              onConfirm(vhdPath.trim());
            }}
            disabled={!vhdPath.trim()}
            className="px-4 py-2 text-sm rounded-md bg-[#1a365d] text-white hover:bg-[#1a365d]/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Rebuild
          </button>
        </div>
      </div>
    </div>
  );
};
