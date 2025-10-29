import React from "react";
import { useNavigate } from "react-router-dom";
import { TrashIcon, PencilSquareIcon } from "@heroicons/react/24/solid";
import axiosInstance from "Services/AxiosInstane";
import { getEnv } from "utils/getEnv";
import { PoolContext } from "../../Context/PoolContext";
import { useContext } from "react";
import { deleteIpmiServer } from "Services/IPMI_Service";
const columnStyles = [
  "w-[20%] text-center", 
  "w-[20%] text-center", 
  "w-[20%] text-center", 
  "w-[20%] text-center", 
  "w-[20%] text-center", 
];
 
const ShowIPMI = ({ ipmiList = [], refreshIpmiList }) => {
  const backendUrl = getEnv("BACKEND_URL");
  const navigate = useNavigate();
  const [deletingIPMIId, setDeletingIPMIId] = React.useState(null);
  const pc = useContext(PoolContext);
  const token = pc.token;
  const userEmail = pc.tokenParsed.preferred_username;
 
  // const deleteIPMI = async (ipmi_id) => {
  //   setDeletingIPMIId(ipmi_id);
  //   try {
  //     await axiosInstance.delete(
  //       `${backendUrl}/v1/ipmi/delete_ipmi_server/${ipmi_id}`,{
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //         },
  //         data: { email: userEmail },
  //       }
  //     );
  //     toast.success("IPMI Server deleted successfully!");
  //     if (refreshIpmiList) refreshIpmiList();
  //   } catch (err) {
  //     toast.error("Delete failed.");
  //   } finally {
  //     setDeletingIPMIId(null);
  //   }
  // };
    const handleDeleteIPMI = async (ipmi_id) => {
    setDeletingIPMIId(ipmi_id);
    try {
      await deleteIpmiServer(token, ipmi_id, userEmail);
      if (refreshIpmiList) refreshIpmiList();
    } catch (error) {
      console.error("Error deleting IPMI:", error);
    } finally {
      setDeletingIPMIId(null);
    }
  };
  return (
    <div className="w-[98%] flex-1 mx-auto bg-white rounded-lg p-4 flex flex-col overflow-hidden">
      <div className="relative mb-4">
        <h2 className="text-lg font-semibold text-center text-gray-700">Available IPMI Devices</h2>
        <div className="absolute right-0 top-0">
          <button
            onClick={() => navigate("/ipmi/ipmi-create-form")}
            className="bg-[#1a365d]/80 hover:bg-[#1a365d] hover:text-white text-[#f5f5f5] rounded-md px-5 py-2 text-sm font-medium"
          >
            + New IPMI
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto rounded-md bg-white custom-scrollbar">
        <table className="min-w-full bg-white text-[0.9rem] border-collapse">
          <thead className="bg-[#F0F8FFCC] text-[#00000099] font-bold uppercase text-[0.8rem] leading-normal sticky top-0 z-10">
            <tr>
              <th className={`py-2 px-4 ${columnStyles[0]}`}>IPMI IP</th>
              <th className={`py-2 px-4 ${columnStyles[1]}`}>NAME</th>
              <th className={`py-2 px-4 ${columnStyles[2]}`}>USERNAME</th>
              <th className={`py-2 px-4 ${columnStyles[3]}`}>EDIT</th>
              <th className={`py-2 px-4 ${columnStyles[4]}`}>DELETE</th>
            </tr>
          </thead>
          <tbody>
            {ipmiList.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-8 text-gray-500">
                  No IPMI devices found.
                </td>
              </tr>
            ) : (
              ipmiList.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-gray-200 hover:bg-[#F0F8FFCC]"
                >
                  <td className={`py-2 px-4 ${columnStyles[0]}`}>{item.ipmi_server_ip}</td>
                  <td className={`py-2 px-4 ${columnStyles[1]}`}>{item.name || "-"}</td>
                  <td className={`py-2 px-4 ${columnStyles[2]}`}>{item.username}</td>
                  <td className={`py-2 px-4 ${columnStyles[3]} align-middle`}>
                    <PencilSquareIcon
                      className="h-5 w-5 text-[#4a38f0dc] hover:text-blue cursor-pointer mx-auto block"
                      title="Edit"
                      onClick={() => navigate(`/ipmi/edit-ipmi/${item.id}`)}
                      style={{ verticalAlign: "middle" }}
                    />
                  </td>
                  <td className={`py-2 px-4 ${columnStyles[4]}`}>
                    {deletingIPMIId === item.id ? (
                      <svg
                        className="inline w-5 h-5 text-gray-400 animate-spin"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C6.477 0 2 4.477 2 10h2zm2 5.291A7.962 7.962 0 014 12H2c0 2.042.784 3.895 2.059 5.291z"
                        ></path>
                      </svg>
                    ) : (
                      <button
                        onClick={() => !deletingIPMIId && handleDeleteIPMI(item.id)}
                        className={`text-[#f84545b9] hover:text-red-800 ${deletingIPMIId ? "opacity-60 cursor-not-allowed" : ""}`}
                        title="Delete IPMI"
                        aria-disabled={!!deletingIPMIId}
                        disabled={!!deletingIPMIId}
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
 
export default ShowIPMI;
 