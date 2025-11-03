export function ComponentsSkeleton() {
  return (
    <div className="w-full bg-white rounded-md p-0 animate-pulse">
      <div className="flex flex-col divide-y divide-gray-200">
        {[...Array(9)].map((_, i) => (
          <div key={i} className="flex items-center h-10 px-4">
            <span className="h-4 w-4 rounded border-2 border-gray-300 bg-gray-200 mr-4" />
            <span className="h-4 w-32 bg-gray-200 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
export function UserRolesSkeleton() {
  return (
    <div className="w-full bg-[#fafbfc] rounded-lg p-4 animate-pulse flex items-center justify-between mb-2">
      <div className="flex items-center gap-3">
        <span className="h-2 w-2 rounded-full bg-gray-300 mr-2" />
        <span className="h-4 w-24 bg-gray-200 rounded" />
      </div>
      <span className="h-5 w-5 bg-gray-200 rounded" />
    </div>
  );
}
// UserManagementSkeleton.js


export function RolesSkeleton() {
  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-lg  p-6 animate-pulse">
    

        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center py-3 gap-2">
            <span className="h-4 w-4 rounded-full border-2 border-gray-300 bg-gray-200 mr-3" />
            <span className="h-4 w-32 bg-gray-200 rounded" />
            <span className="flex-1" />
            <span className="h-5 w-5 bg-gray-200 rounded" />
          </div>
        ))}

    </div>
  );
}

export function UsersSkeleton() {
  return (
    <div className="w-full h-[60vh] overflow-y-auto border rounded-md shadow-inner bg-white animate-pulse">
      <div className="flex flex-col divide-y divide-gray-200">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className={`h-10 flex items-center px-4 ${i === 12 ? "bg-[#e6eaf1]" : ""}`}
          >
            <div className={`h-4 w-2/3 rounded bg-gray-200 ${i === 12 ? "bg-[#cfd8e6]" : ""}`}></div>
          </div>
        ))}
      </div>
    </div>
  );
}
