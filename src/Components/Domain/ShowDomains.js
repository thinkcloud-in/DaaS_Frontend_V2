import React, { useContext, useEffect } from "react";
import { PoolContext } from "../../Context/PoolContext";
import DomainCard from "./DomainCard";
import { useNavigate } from "react-router-dom";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import "./ShowDomainsSkeleton.css";
import { useDispatch, useSelector } from 'react-redux';
import { fetchDomains } from '../../redux/features/Domain/DomainThunks';
import { selectAuthToken } from '../../redux/features/Auth/AuthSelectors';
import { selectDomains, selectDomainLoading } from '../../redux/features/Domain/DomainSelectors';
const ShowDomains = (props) => {
  const navigate = useNavigate();
  const token = useSelector(selectAuthToken);
  const dispatch = useDispatch();
  const domains = useSelector(selectDomains);
  const loading = useSelector(selectDomainLoading);

  // fetch domains from Redux when token is available
  useEffect(() => {
    if (token) dispatch(fetchDomains({ token }));
  }, [token, dispatch]);

  const Goback = () => {
    navigate("/");
  };

  return (
    <div className="w-[98%] h-[90vh] m-auto bg-white dark:bg-gray-800 mt-[1.125rem] rounded-lg flex flex-col overflow-hidden">
      <div className="show-pools flex justify-start items-start gap-2 h-4/5 overflow-y-auto m-3">
        <div className="p-3 pb-0 w-full h-full">
          <div className="flex justify-between mb-3 items-center">
            <h2 className="font-bold leading-7 text-[#00000099] dark:text-gray-100 text-lg pl-4">
              Identity Providers
            </h2>
            <button
              onClick={() => navigate("/domain/domain-create-form")}
              className="bg-[#1a365d]/80 hover:bg-[#1a365d] text-[#f5f5f5] hover:text-white rounded-md px-3 py-2 text-sm font-medium flex flex-col gap-2"
            >
              + Add new provider
            </button>
          </div>
          {loading ? (
            <div className="skeleton-domain-list">
              {[1,2,3].map((i) => (
                <div className="skeleton-domain-card" key={i}></div>
              ))}
            </div>
          ) : (
            <div className="m-5 flex gap-10">
              {domains && domains.length > 0 ? (
                domains
                  .slice() // copy before sorting
                  .sort((a, b) => (a.name || '').localeCompare(b.name || ''))
                  .map((item) => (
                    <DomainCard
                      key={item.id}
                      id={item.id}
                      name={item.name}
                      providerId={item.providerId}
                      enabled={
                        item.config && item.config.enabled === "true" ? "Enabled" : "Disabled"
                      }
                    />
                  ))
              ) : (
                <div className="m-5 flex gap-10 w-full justify-center items-center">
                  No domains available
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShowDomains;
