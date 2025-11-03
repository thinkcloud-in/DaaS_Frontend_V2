import React, { useContext, useState, useEffect } from "react";
import { PoolContext } from "../../Context/PoolContext";
import DomainCard from "./DomainCard";
import { useNavigate } from "react-router-dom";
import "./ShowDomainsSkeleton.css";
const ShowDomains = (props) => {
  const navigate = useNavigate();
  const pc = useContext(PoolContext);
  const [isLoading, setIsLoading] = useState(true); // Initialize loading state

  useEffect(() => {
    setIsLoading(false); 
  }, []);

  const Goback = () => {
    navigate("/");
  };

  return (
    <div className="w-[98%] h-[90vh] m-auto bg-white mt-[1.125rem] rounded-lg flex flex-col overflow-hidden">
      <div className="flex justify-start ml=0">
        <div
          onClick={Goback}
          className="ml-12 bg-[#1a365d]/80 text-white px-2 py-2 rounded-md hover:bg-[#1a365d] focus:outline-none focus:ring-2 focus:ring-[#1a365d] focus:ring-opacity-10"
        >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
        </div>
      </div>
      <div className="show-pools flex justify-start items-start gap-2 h-4/5 overflow-y-auto m-3">
        <div className="p-3 pb-0 w-full h-full">
          <div className="flex justify-between mb-3 items-center">
            <h2 className="font-bold leading-7 text-[#00000099] text-lg pl-4">
              Identity Providers
            </h2>
            <button
              onClick={() => navigate("/domain/domain-create-form")}
              className="bg-[#1a365d]/80 hover:bg-[#1a365d] text-[#f5f5f5] hover:text-white rounded-md px-3 py-2 text-sm font-medium flex flex-col gap-2"
            >
              + Add new provider
            </button>
          </div>
          {isLoading ? (
            <div className="skeleton-domain-list">
              {[1,2,3].map((i) => (
                <div className="skeleton-domain-card" key={i}></div>
              ))}
            </div>
          ) : (
            <div className="m-5 flex gap-10">
              {pc.availableDomains.length > 0 ? (
                pc.availableDomains
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((item) => (
                    <DomainCard
                      key={item.id}
                      id={item.id}
                      name={item.name}
                      providerId={item.providerId}
                      enabled={
                        item.config.enabled === "true" ? "Enabled" : "Disabled"
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
