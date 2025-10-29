
import { useState, useRef } from "react";
import axiosInstance from "Services/AxiosInstane";
import { FaTasks, FaRedo, FaMinus, FaExpand, FaCheckCircle } from "react-icons/fa";
import { AiOutlineLoading3Quarters, AiOutlineCloseCircle } from "react-icons/ai";
import {fetchFooterTasks} from "Services/FooterService";



const Footer = ({ tokenParsed }) => {
  const [data, setData] = useState([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const refreshTimerRef = useRef(null);
  const userName = tokenParsed?.preferred_username || "N/A";

  const loadRecentTasks = async () => {
    setIsRefreshing(true);
    try {
      const recentTasks = await fetchFooterTasks(userName);
      setData(recentTasks);
    } catch (error) {
      console.error("Error loading recent tasks:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <footer
  className={`bottom-0 w-[98%] mx-auto mt-2 transition-all duration-500 ease-in-out ${isExpanded ? "flex flex-col" : ""}`}
  style={{
    ...(isExpanded
      ? { height: "200px" }
      : {}),
    backgroundColor: "white",
    overflow: "hidden",
  }}
>
      {/* Header */}
      <div className="flex justify-between items-center border-b border-gray-200 px-3 py-2">
        <div className="flex items-center space-x-2">
          <FaTasks className="text-[#000000EA]" size={14} />
          <span className="text-[#000000EA] text-[0.75rem] font-semibold tracking-wide">
            Recent Tasks
          </span>
        </div>
        <div className="flex items-center space-x-3">
          <FaRedo
            className={`cursor-pointer text-[#000000EA] hover:text-gray-400 transition ${
              isRefreshing ? "animate-spin" : ""
            }`}
            size={12}
            onClick={loadRecentTasks}
          />
          {isExpanded ? (
            <FaMinus
              className="cursor-pointer text-[#000000EA] hover:text-gray-500 transition"
              size={12}
              onClick={() => setIsExpanded(false)}
            />
          ) : (
            <FaExpand
              className="cursor-pointer text-[#000000EA] hover:text-gray-500 transition"
              size={12}
              onClick={() => setIsExpanded(true)}
            />
          )}
        </div>
      </div>
      {isExpanded && (
        <div className="w-full bg-white flex-1">
          <div className="max-h-[165px] overflow-y-auto custom-scrollbar">
            <table className="w-full border-collapse text-[0.72rem]">
              <thead className="sticky top-0 bg-gray-50 shadow-sm">
                <tr className="text-gray-700 border-b border-gray-300 font-semibold uppercase text-[0.62rem]">
                  <th className="py-2 px-3 text-left">S.No</th>
                  <th className="py-2 px-3 text-left">Task Name</th>
                  <th className="py-2 px-3 text-left">Action</th>
                  <th className="py-2 px-3 text-center">Status</th>
                  <th className="py-2 px-3 text-center">Duration</th>
                  <th className="py-2 px-3 text-center">Start Time</th>
                  <th className="py-2 px-3 text-center">End Time</th>
                </tr>
              </thead>
              <tbody>
                {data.length > 0 ? (
                  data.map((task, index) => (
                    <tr
                      key={index}
                      className="hover:bg-gray-50 transition border-b border-gray-100 text-center"
                    >
                      <td className="py-2 px-3 text-left">{index + 1}</td>
                      <td className="py-2 px-3 text-left">{task.taskName}</td>
                      <td className="py-2 px-3 text-left">{task.action}</td>
                      <td className="py-2 px-3 font-medium flex items-center justify-center gap-1">
                        {task.status === "Completed" && (
                          <span className="text-green-600 flex items-center gap-1">
                            <FaCheckCircle className="text-green-500 text-[0.75rem]" /> {task.status}
                          </span>
                        )}
                        {task.status === "Running" && (
                          <span className="text-blue-600 flex items-center gap-1">
                            <AiOutlineLoading3Quarters className="animate-spin text-blue-500 text-[0.75rem]" />{" "}
                            {task.status}
                          </span>
                        )}
                        {task.status === "Failed" && (
                          <span className="text-red-600 flex items-center gap-1">
                            <AiOutlineCloseCircle className="text-red-500 text-[0.75rem]" /> {task.status}
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-3">{task.duration}</td>
                      <td className="py-2 px-3">{task.startTime}</td>
                      <td className="py-2 px-3">{task.endTime}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="p-3 text-center text-[0.75rem] text-gray-500 italic">
                      No recent tasks available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {!isExpanded && data.length > 0 && (
        <div className="px-3 py-2 text-xs border-t border-gray-200 flex items-center justify-between">
          <span>
            Last task: <strong>{data[0].taskName}</strong>
          </span>
          <span
            className={`font-medium ${
              data[0].status === "Completed" ? "text-green-600" : "text-red-600"
            }`}
          >
            {data[0].status}
          </span>
        </div>
      )}
    </footer>
  );
};

export default Footer;
