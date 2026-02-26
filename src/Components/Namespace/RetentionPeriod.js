import React, { useEffect } from "react";
import ShowRetentionDetails from "./ShowRetentionDetails";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { selectAuthToken } from '../../redux/features/Auth/AuthSelectors';
import { fetchNamespaces } from "../../redux/features/Namespace/NamespaceThunks";
import { selectAllNamespaces, selectNamespaceLoading } from "../../redux/features/Namespace/NamespaceSelectors";

const RetentionPeriod = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const token = useSelector(selectAuthToken);
  const namespaces = useSelector(selectAllNamespaces);
  const loading = useSelector(selectNamespaceLoading);

  useEffect(() => {
    if (token) dispatch(fetchNamespaces(token));
  }, [dispatch, token]);

  const Goback = () => {
    navigate("/");
  };

  return (
    <div className="p-2 md:p-4 h-full flex flex-col overflow-hidden">
      <div className="w-full md:w-[98%] h-[85vh] md:h-[90vh] mx-auto bg-white rounded-lg p-2 md:p-4 shadow-lg flex flex-col overflow-hidden">
        <div className="flex justify-start mb-2">
          <div
            onClick={Goback}
            className="bg-[#1a365d]/80 text-white px-2 py-2 rounded-md hover:bg-[#1a365d] focus:outline-none focus:ring-2 focus:ring-[#1a365d] focus:ring-opacity-10 cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-[#1a365d] ml-4">Retention Period</h2>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-center text-gray-500">Loading...</p>
          </div>
        ) : Array.isArray(namespaces) && namespaces.length > 0 ? (
          <div className="flex-1 overflow-auto custom-scrollbar">
            {namespaces.map((ns) => (
              <ShowRetentionDetails key={ns.namespaceName || ns.name} namespaces={ns} />
            ))}
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-center text-gray-500">No namespace data available.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RetentionPeriod;
