import { useState, useEffect, useContext } from "react";
import axiosInstance from "Services/AxiosInstane";
import { PoolContext } from "../../Context/PoolContext";
import { FaCheckCircle } from "react-icons/fa";
import {
  AiOutlineLoading3Quarters,
  AiOutlineCloseCircle,
} from "react-icons/ai";
import "./Task.css";
import dayjs from "dayjs";
import { getEnv } from "utils/getEnv";
import {fetchWorkflows} from "Services/TaskService";

const SkeletonLoader = () => (
  <tr>
    {[...Array(8)].map((_, i) => (
      <td key={i} className="py-4 px-3">
        <div className="h-6 w-24 bg-gray-200 rounded animate-pulse"></div>
      </td>
    ))}
  </tr>
);

const Tasks = (props) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  let userName = props.tokenParsed.name;
  const pc = useContext(PoolContext);
  const [days, setDays] = useState(1);

  useEffect(() => {
    const getTasks = async () => {
      if (isNaN(days) || days < 0) return;
      setLoading(true);
      const tasks = await fetchWorkflows(userName, days);
      setData(tasks);
      setLoading(false);
    };
    getTasks();
  }, [userName, days]);

  return (
    <div className="w-[98%] h-[90vh] m-auto min-h-[75vh] mt-4 bg-white rounded-lg p-4 shadow-md flex flex-col overflow-hidden">
      <div className="relative mb-4">
        <h2 className="text-lg font-semibold text-center text-gray-700">
          Task List
        </h2>
        <div className="absolute right-0 top-0">
          <input
            type="number"
            min="0"
            className="border border-gray-200 rounded px-2 py-1 w-20 text-sm focus:outline-none hover:cursor-pointer transition duration-150 ease-in-out"
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            placeholder="Days"
          />
          <span className="text-[0.8rem] text-gray-500">days</span>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto rounded-md bg-white custom-scrollbar">
        <table className="min-w-full bg-white text-[0.75rem] border-collapse">
          <thead className="bg-[#F0F8FFCC] text-[#00000099] font-bold uppercase text-[0.8rem] leading-normal sticky top-0 z-10">
            <tr>
              <th className="py-2 px-3">S.No</th>
              <th className="py-2 px-3">Task Name</th>
              <th className="py-2 px-3">Action</th>
              <th className="py-2 px-3">Status</th>
              <th className="py-2 px-3">Initiator</th>
              <th className="py-2 px-3">Duration</th>
              <th className="py-2 px-3">Start Time</th>
              <th className="py-2 px-3">End Time</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [...Array(5)].map((_, index) => <SkeletonLoader key={index} />)
            ) : data.length > 0 ? (
              data.map((task, index) => (
                <tr
                  key={index}
                  className="text-center border-b border-gray-200"
                >
                  <td className="py-2 px-3">{task.sNo}</td>
                  <td className="py-2 px-3">{task.taskName}</td>
                  <td className="py-2 px-3">{task.action}</td>
                  <td className="py-2 px-3 font-semibold flex items-center justify-center gap-1">
                    {task.status === "Completed" && (
                      <span className="text-green-600 flex items-center gap-1">
                        <FaCheckCircle className="text-green-500 text-sm" />{" "}
                        {task.status}
                      </span>
                    )}
                    {task.status === "Running" && (
                      <span className="text-blue-600 flex items-center gap-1">
                        <AiOutlineLoading3Quarters className="animate-spin text-blue-500 text-sm" />{" "}
                        {task.status}
                      </span>
                    )}
                    {task.status === "Failed" && (
                      <span className="text-red-600 flex items-center gap-1">
                        <AiOutlineCloseCircle className="text-red-500 text-sm" />{" "}
                        {task.status}
                      </span>
                    )}
                  </td>
                  <td className="py-2 px-3">{task.initiator}</td>
                  <td className="py-2 px-3">{task.duration}</td>
                  <td className="py-2 px-3">{task.startTime}</td>
                  <td className="py-2 px-3">{task.endTime}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="text-center py-4 text-gray-500">
                  No tasks available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Tasks;
