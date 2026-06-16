import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FaTasks, FaRedo, FaMinus, FaExpand, FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { fetchFooterTasksThunk } from "../../redux/features/Footer/FooterThunks";
import { selectFooterTasks, selectFooterLoading } from "../../redux/features/Footer/FooterSelectors";
import { selectAuthTokenParsed } from '../../redux/features/Auth/AuthSelectors';

const Footer = () => {
  const dispatch = useDispatch();
  const data = useSelector(selectFooterTasks);
  const loading = useSelector(selectFooterLoading);

  const [isExpanded, setIsExpanded] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const tokenParsed = useSelector(selectAuthTokenParsed);
  const userName = tokenParsed?.preferred_username;

  const loadRecentTasks = async () => {
    setIsRefreshing(true);
    try {
      await dispatch(fetchFooterTasksThunk(userName));
    } finally {
      setIsRefreshing(false);
    }
  };

  const silentRefresh = () => { dispatch(fetchFooterTasksThunk(userName)); };

  useEffect(() => {
    loadRecentTasks();
  }, [userName]);

  // Auto-poll every 5s while any task is Running
  useEffect(() => {
    const hasRunning = data.some((t) => t.status === "Running");
    if (!hasRunning) return;
    const timer = setInterval(silentRefresh, 5000);
    return () => clearInterval(timer);
  }, [data]); // eslint-disable-line react-hooks/exhaustive-deps

  const getStatusColor = (status) => {
    switch (status) {
      case "Completed": return "green";
      case "Running": return "blue";
      case "Failed": return "red";
      default: return "gray";
    }
  };

  const latestStatus = data.length > 0 ? getStatusColor(data[0].status) : "gray";

  return (
    <footer className="sticky bottom-2 z-50 w-full rounded-3xl border border-white/40 glass-panel premium-shadow mt-auto mb-2">

      {/* Header */}
      <div
        className="flex justify-between items-center px-6 py-3 cursor-pointer select-none bg-white/40"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-xl text-white
            ${latestStatus === "green" ? "bg-green-500" :
              latestStatus === "blue" ? "bg-blue-500" :
              latestStatus === "red" ? "bg-red-500" : "bg-slate-700"}
          `}>
            <FaTasks size={16} />
          </div>
          <div className="flex flex-col">
            <h3 className="text-[#1e293b] text-[0.85rem] font-black tracking-widest uppercase flex items-center gap-2">
              Recent Tasks
              {loading && <AiOutlineLoading3Quarters className="animate-spin text-blue-500" size={12} />}
            </h3>
            {!isExpanded && data.length > 0 && (
              <span className="text-[0.68rem] text-gray-500 font-bold uppercase tracking-tighter">
                Last: <span className="text-[#334155]">{data[0].taskName}</span>
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={(e) => { e.stopPropagation(); loadRecentTasks(); }}
            className={`p-2 rounded-xl bg-white/50 hover:bg-white/80 transition-all
              ${isRefreshing ? "animate-spin text-blue-600" : "text-slate-600"}`}
          >
            <FaRedo size={13} />
          </button>
          <div className="h-5 w-[1px] bg-slate-300/50" />
          <button className="text-slate-600 hover:text-black transition-all">
            {isExpanded ? <FaMinus size={15} /> : <FaExpand size={15} />}
          </button>
        </div>
      </div>

      {/* Expandable Content */}
      {isExpanded && (
        <div className="bg-white/60 border-t border-white/30">
          {/* Scroll container - 3 rows fixed height, baaki scroll */}
          <div className="overflow-y-auto custom-scrollbar" style={{ maxHeight: "calc(3 * 48px + 45px)" }}>
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 z-10">
                <tr className="bg-slate-50/90 backdrop-blur-sm text-slate-500 text-[0.7rem] font-black uppercase tracking-widest border-b border-slate-200/50">
                  <th className="py-3 px-6">S.No</th>
                  <th className="py-3 px-6">Task Name</th>
                  <th className="py-3 px-6">Action</th>
                  <th className="py-3 px-6 text-center">Status</th>
                  <th className="py-3 px-6 text-center">Duration</th>
                  <th className="py-3 px-6 text-center">Start Time</th>
                  <th className="py-3 px-6 text-center">End Time</th>
                </tr>
              </thead>
              <tbody className="text-[0.75rem]">
                {loading && data.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-8 text-center">
                      <AiOutlineLoading3Quarters className="animate-spin text-blue-600 mx-auto" size={28} />
                    </td>
                  </tr>
                ) : data.length > 0 ? (
                  data.map((task, index) => (
                    <tr
                      key={index}
                      className="hover:bg-white/80 transition-all duration-200 border-b border-slate-100/50"
                    >
                      <td className="py-3 px-6 text-slate-400 font-mono text-[0.65rem]">
                        {String(index + 1).padStart(2, '0')}
                      </td>
                      <td className="py-3 px-6 font-bold text-slate-800">{task.taskName}</td>
                      <td className="py-3 px-6">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-bold text-[0.6rem] uppercase">
                          {task.action}
                        </span>
                      </td>
                      <td className="py-3 px-6">
                        <div className="flex items-center justify-center">
                          {task.status === "Completed" && (
                            <div className="px-3 py-1 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center gap-1.5 font-black">
                              <FaCheckCircle size={11} />
                              <span className="text-[0.62rem] uppercase">{task.status}</span>
                            </div>
                          )}
                          {task.status === "Running" && (
                            <div className="px-3 py-1 rounded-xl bg-sky-50 text-sky-600 border border-sky-100 flex items-center gap-1.5 font-black">
                              <AiOutlineLoading3Quarters size={11} className="animate-spin" />
                              <span className="text-[0.62rem] uppercase">{task.status}</span>
                            </div>
                          )}
                          {task.status === "Failed" && (
                            <div className="px-3 py-1 rounded-xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center gap-1.5 font-black">
                              <FaExclamationTriangle size={11} />
                              <span className="text-[0.62rem] uppercase">{task.status}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-6 text-center font-bold text-slate-500">{task.duration || "--"}</td>
                      <td className="py-3 px-6 text-center text-slate-400 tabular-nums">{task.startTime}</td>
                      <td className="py-3 px-6 text-center text-slate-400 tabular-nums">{task.endTime || "--"}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="py-10 text-center">
                      <div className="flex flex-col items-center text-slate-300">
                        <FaTasks size={36} className="opacity-20 mb-3" />
                        <span className="font-bold tracking-widest uppercase text-[0.75rem]">
                          No recent tasks available
                        </span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Footer row - total count */}
          {data.length > 3 && (
            <div className="px-6 py-2 border-t border-slate-100/50 bg-white/40">
              <span className="text-[0.65rem] text-slate-400 font-bold uppercase tracking-wider">
                Showing all {data.length} tasks — scroll to view more
              </span>
            </div>
          )}
        </div>
      )}
    </footer>
  );
};

export default Footer;