import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FaTasks, FaRedo, FaMinus, FaExpand, FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";
import { AiOutlineLoading3Quarters, AiOutlineCloseCircle } from "react-icons/ai";
import {
  fetchFooterTasksThunk,
} from "../../redux/features/Footer/FooterThunks";
import {
  selectFooterTasks,
  selectFooterLoading,
} from "../../redux/features/Footer/FooterSelectors";
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

  useEffect(() => {
    loadRecentTasks();
  }, [userName]);

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
    <footer
      className={`
        glass-panel premium-shadow smooth-transition sticky bottom-2 z-50
        w-full rounded-3xl overflow-hidden mt-auto mb-2 border border-white/40
        ${isExpanded ? "max-h-[500px] shadow-2xl scale-[1.005]" : "max-h-[60px] scale-100"}
      `}
    >
      {/* Dynamic Glow Header */}
      <div 
        className={`
          flex justify-between items-center px-8 py-4 cursor-pointer select-none
          transition-all duration-500 relative overflow-hidden
          ${isExpanded ? "bg-white/40 border-b border-white/20" : "bg-transparent"}
        `}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {/* Shimmer Effect when Loading */}
        {loading && <div className="absolute inset-0 shimmer opacity-30"></div>}

        <div className="flex items-center space-x-4">
          <div className={`
            p-2 rounded-xl text-white transition-all duration-500 transform
            ${isExpanded ? "rotate-0 scale-110" : "-rotate-12 scale-100"}
            ${latestStatus === "green" ? "bg-green-500 glow-green" : 
              latestStatus === "blue" ? "bg-blue-500 glow-blue" : 
              latestStatus === "red" ? "bg-red-500 glow-red" : "bg-slate-700"}
          `}>
            <FaTasks size={16} />
          </div>
          <div className="flex flex-col">
            <h3 className="text-[#1e293b] text-[0.85rem] font-black tracking-widest uppercase flex items-center gap-2">
              Recent Tasks
              {loading && <AiOutlineLoading3Quarters className="animate-spin text-blue-500" size={12} />}
            </h3>
            {!isExpanded && data.length > 0 && (
              <div className="flex items-center gap-2 mt-0.5">
                <span className={`w-2 h-2 rounded-full animate-pulse ${
                  latestStatus === "green" ? "bg-green-500" : 
                  latestStatus === "blue" ? "bg-blue-500" : "bg-red-500"
                }`}></span>
                <span className="text-[0.68rem] text-gray-500 font-bold uppercase tracking-tighter">
                  Last task: <span className="text-[#334155]">{data[0].taskName}</span>
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-6">
          <div className="flex items-center -space-x-2 overflow-hidden">
            {/* Miniature status circles for last 5 tasks */}
            {data.slice(0, 5).map((t, i) => (
              <div key={i} className={`w-3 h-3 rounded-full border-2 border-white ring-1 ring-gray-200 ${
                getStatusColor(t.status) === "green" ? "bg-green-400" : 
                getStatusColor(t.status) === "blue" ? "bg-blue-400" : "bg-red-400"
              }`} />
            ))}
          </div>

          <button 
            onClick={(e) => { e.stopPropagation(); loadRecentTasks(); }}
            className={`
              p-2.5 rounded-xl bg-white/50 hover:bg-white/80 hover:scale-110
              transition-all duration-300 shadow-sm
              ${isRefreshing ? "animate-spin text-blue-600" : "text-slate-600"}
            `}
          >
            <FaRedo size={14} />
          </button>
          
          <div className="h-6 w-[1px] bg-slate-300/50"></div>

          <button className="text-slate-600 hover:text-black transition-all duration-300 transform group">
            {isExpanded ? (
              <FaMinus size={16} className="group-hover:scale-125" />
            ) : (
              <FaExpand size={16} className="group-hover:scale-125" />
            )}
          </button>
        </div>
      </div>

      {/* Modern List Content */}
      <div 
        className={`
          transition-all duration-700 ease-[cubic-bezier(0.175, 0.885, 0.32, 1.275)]
          ${isExpanded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none"}
        `}
      >
        <div className="p-6 bg-gradient-to-b from-white/20 to-transparent">
          <div className="max-h-[350px] overflow-y-auto custom-scrollbar rounded-2xl border border-white/50 bg-white/60 shadow-2xl backdrop-blur-md">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="sticky top-0 bg-slate-50/90 backdrop-blur-xl text-slate-500 text-[0.7rem] font-black uppercase tracking-[0.2em] border-b border-slate-200/50">
                  <th className="py-5 px-6">S.No</th>
                  <th className="py-5 px-6">Task Name</th>
                  <th className="py-5 px-6">Action</th>
                  <th className="py-5 px-6 text-center">Status</th>
                  <th className="py-5 px-6 text-center">Duration</th>
                  <th className="py-5 px-6 text-center">Start Time</th>
                  <th className="py-5 px-6 text-center">End Time</th>
                </tr>
              </thead>
              <tbody className="text-[0.75rem]">
                {loading && data.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-20 text-center">
                      <div className="flex flex-col items-center justify-center space-y-4">
                        <div className="relative">
                          <AiOutlineLoading3Quarters className="animate-spin text-blue-600" size={40} />
                          <div className="absolute inset-0 blur-lg bg-blue-400/30 animate-pulse"></div>
                        </div>
                        <span className="font-black text-slate-400 tracking-widest uppercase text-[0.6rem]">Loading tasks...</span>
                      </div>
                    </td>
                  </tr>
                ) : data.length > 0 ? (
                  data.map((task, index) => (
                    <tr
                      key={index}
                      className="group hover:bg-white/80 transition-all duration-300 border-b border-slate-100/50"
                    >
                      <td className="py-4 px-6 text-slate-400 font-mono text-[0.65rem]">{String(index + 1).padStart(2, '0')}</td>
                      <td className="py-4 px-6 font-bold text-slate-800 tracking-tight">{task.taskName}</td>
                      <td className="py-4 px-6">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-bold text-[0.6rem] uppercase">{task.action}</span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-center">
                          {task.status === "Completed" && (
                            <div className="px-4 py-1.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center gap-2 font-black shadow-sm group-hover:glow-green transition-all">
                              <FaCheckCircle size={12} />
                              <span className="text-[0.65rem] uppercase tracking-wider">{task.status}</span>
                            </div>
                          )}
                          {task.status === "Running" && (
                            <div className="px-4 py-1.5 rounded-xl bg-sky-50 text-sky-600 border border-sky-100 flex items-center gap-2 font-black shadow-sm group-hover:glow-blue transition-all">
                              <AiOutlineLoading3Quarters size={12} className="animate-spin" />
                              <span className="text-[0.65rem] uppercase tracking-wider">{task.status}</span>
                            </div>
                          )}
                          {task.status === "Failed" && (
                            <div className="px-4 py-1.5 rounded-xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center gap-2 font-black shadow-sm group-hover:glow-red transition-all">
                              <FaExclamationTriangle size={12} />
                              <span className="text-[0.65rem] uppercase tracking-wider">{task.status}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-center font-bold text-slate-500">{task.duration || "--"}</td>
                      <td className="py-4 px-6 text-center text-slate-400 tabular-nums">{task.startTime}</td>
                      <td className="py-4 px-6 text-center text-slate-400 tabular-nums">{task.endTime || "--"}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="py-20 text-center">
                      <div className="flex flex-col items-center justify-center text-slate-300">
                        <FaTasks size={48} className="opacity-20 mb-4" />
                        <span className="font-bold tracking-widest uppercase">No recent tasks available</span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
