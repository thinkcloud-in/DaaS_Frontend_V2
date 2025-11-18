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
    <div className="p-4 h-screen overflow-y-hidden">
      <div className="max-w-[100%] h-[90vh] mx-auto bg-white rounded-lg p-4 shadow-lg ">
        <div className="flex justify-start ml-16 mt-3 mb-2">
          <div
            onClick={Goback}
            className="ml-4 bg-[#1a365d]/80 text-white px-2 py-2 rounded-md hover:bg-[#1a365d] focus:outline-none focus:ring-2 focus:ring-[#1a365d] focus:ring-opacity-10"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </div>
        </div>

        {loading ? (
          <p className="text-center">Loading...</p>
        ) : Array.isArray(namespaces) && namespaces.length > 0 ? (
          // render details for the first namespace or map as needed
          <div>
            {namespaces.map((ns) => (
              <ShowRetentionDetails key={ns.namespaceName || ns.name} namespaces={ns} />
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500">No namespace data available.</p>
        )}
      </div>
    </div>
  );
};

export default RetentionPeriod;
