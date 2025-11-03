import React from "react";
import { useNavigate } from "react-router-dom";
import { PlusIcon} from "@heroicons/react/24/outline";
 
const CreateNewIpmi = () => {
  const navigate=useNavigate()
  return (
    <div className="h-[75vh] flex items-center justify-center m-3 p-5 border-dashed border-stone-300 border-2 bg-white">
      <div className="text-center">
        <div className="mb-4">
        <PlusIcon className="w-12 h-12 mx-auto text-gray-400"/>
        </div>
        <p className="mb-2 text-lg text-gray-600">No IPMI Servers Available</p>
        <p className="mb-8 text-gray-500">
          Get started by creating a new IPMI server.
        </p>
        <div className="w-full flex justify-center items-center">
        <button
        className="bg-[#1a365d]/80 hover:bg-[#1a365d] hover:text-white text-[#f5f5f5] rounded-md px-3 py-2 text-sm font-medium flex flex-col gap-2"
        onClick={()=>navigate("/ipmi/ipmi-create-form")}
        >
          + New IPMI
        </button>
        </div>
      </div>
    </div>
  );
};
 
export default CreateNewIpmi;
 
 