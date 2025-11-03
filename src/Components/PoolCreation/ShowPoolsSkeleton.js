import React from "react";
import "./css/ShowPools.css";

const ShowPoolsSkeleton = () => {
  // Number of skeleton rows to show
  const skeletonRows = Array.from({ length: 5 });

  return (
    <div className="w-[98%] flex-1 m-auto bg-white rounded-lg p-4 flex flex-col overflow-hidden animate-pulse">
      {/* Top section skeleton: back button, header, and new pool button */}
      <div className="flex justify-between items-center mb-4">
        {/* Back button skeleton */}
        <div className="ml-2">
          <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
            <div className="w-4 h-4 bg-gray-300 rounded"></div>
          </div>
        </div>
        {/* Header skeleton */}
        <div className="flex-1 flex justify-center">
          <div className="h-6 w-40 bg-gray-200 rounded"></div>
        </div>
        {/* New Pool button skeleton */}
        <div className="flex gap-2 items-center">
          <div className="h-8 w-24 bg-gray-200 rounded"></div>
        </div>
      </div>
      {/* Table skeleton */}
      <div className="flex-1 overflow-y-auto rounded-md bg-white custom-scrollbar">
        <table className="min-w-full bg-white text-sm border-collapse">
          <thead className="bg-[#F0F8FFCC] text-[#00000099] font-bold uppercase text-[0.8rem] leading-normal sticky top-0 z-10">
            <tr>
              {["Name", "Type", "Cluster Name", "Entitled", "Machines"].map((header, index) => (
                <th
                  key={index}
                  className="py-2 px-3 text-left whitespace-nowrap"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {skeletonRows.map((_, idx) => (
              <tr key={idx} className="">
                {[...Array(5)].map((_, colIdx) => (
                  <td key={colIdx} className="py-2 px-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ShowPoolsSkeleton;
