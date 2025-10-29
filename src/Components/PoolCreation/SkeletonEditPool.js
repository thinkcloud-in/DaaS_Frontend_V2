import React from "react";

const SkeletonEditPool = () => {
  return (
    <div className="animate-pulse w-[98%] h-[80vh] m-auto flex-1 mx-auto bg-white rounded-lg p-4 flex flex-col">
      <div className="flex justify-start mt-5">
        <div className="ml-4 bg-gray-300 rounded-md w-24 h-8 " />
      </div>
      <div className="pool-creation-form flex-1 overflow-y-auto rounded-md bg-white custom-scrollbar">
        <div className="space-y-5 m-2">
          <div className="w-full mx-auto p-3 rounded-md bg-white">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-4" />
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-2" />
            <div className="h-10 bg-gray-200 rounded w-full mb-4" />
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-2" />
            <div className="h-10 bg-gray-200 rounded w-full mb-4" />
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-2" />
            <div className="h-10 bg-gray-200 rounded w-full mb-4" />
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-2" />
            <div className="h-10 bg-gray-200 rounded w-full mb-4" />
          </div>
          <div className="w-full rounded-md bg-white">
            <div className="flex space-x-4 mb-4">
              <div className="h-8 w-24 bg-gray-200 rounded" />
              
            </div>
            <div className="h-40 bg-gray-200 rounded w-full" />
          </div>
        </div>
        <div className="mb-5 pl-5 flex items-start justify-start">
          <div className="rounded-md mb-4 px-3 py-2 text-sm font-semibold bg-gray-300 w-32 h-10" />
        </div>
      </div>
    </div>
  );
};

export default SkeletonEditPool;
