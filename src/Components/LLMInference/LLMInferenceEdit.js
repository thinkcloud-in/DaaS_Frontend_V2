import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectAuthToken } from "../../redux/features/Auth/AuthSelectors";
import { Loader2, ArrowLeft } from "lucide-react";
import { toast } from "react-toastify";

const EditLLMInference = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const token = useSelector(selectAuthToken);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State Setup - Default mock data aligned exactly with creation structure
  const [formData, setFormData] = useState({
    name: "Inference-Pool-Alpha",
    ip_pools: ["10.100.4.0/22", "172.16.20.0/24"],
    clusters: ["K8s-GPU-Cluster-01"],
    nodes: ["gpu-node-01a", "gpu-node-01b"],
    gpus: ["NVIDIA A100 80GB"],
    base_os: "Ubuntu 22.04 LTS",
    cpu: "32 vCPUs",
    ram: "128 GB",
    datastore: "pure-storage-nvme-01",
    os_disk_size: "150 GB",
    data_disk_size: "2 TB",
    // Sirf ye field active aur editable rahega
    model: "Meta-Llama-3-8B-Instruct", 
  });

  // Agar list page se row data state ke throug mil raha hai toh state update karein
  useEffect(() => {
    if (location.state && location.state.poolData) {
      const p = location.state.poolData;
      setFormData({
        name: p.name || "",
        ip_pools: Array.isArray(p.ip_pools) ? p.ip_pools : p.ip_pools ? [p.ip_pools] : [],
        clusters: p.cluster ? [p.cluster] : [],
        nodes: p.machines ? p.machines.map(m => m.name) : [],
        gpus: p.gpus || ["NVIDIA A100 80GB"],
        base_os: p.base_os || "",
        cpu: p.cpu || "32 vCPUs",
        ram: p.ram || "128 GB",
        datastore: p.datastore || "pure-storage-nvme-01",
        os_disk_size: p.os_disk_size || "150 GB",
        data_disk_size: p.data_disk_size || "2 TB",
        model: p.model_name || p.model || "",
      });
    }
  }, [location.state]);

  // Handle Input Change - Only applied to editable "model" field
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      console.log("Updating Model Target Attribute:", formData.model);
      toast.success("Machine Pool updated successfully!");
      navigate("/inference"); // Wapas list page ya dashboard par redirect karein
    } catch (error) {
      console.error(error);
      toast.error("Failed to update machine pool configuration.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 text-left items-start p-6 w-full overflow-y-auto">
      <div className="w-full max-w-3xl mx-auto flex flex-col text-left items-start pb-10">
        
        {/* Header Section */}
        <div className="mb-6 flex items-center justify-start gap-3 text-left w-full flex-shrink-0">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-600"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-2xl font-bold text-[#1a365d] text-left">Edit Machine Configuration</h1>
        </div>

        {/* Main Form Layout - Exactly identical to creation UI block structure */}
        <form
          onSubmit={handleUpdateSubmit}
          className="bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col text-left items-start w-full overflow-hidden"
        >
          
          {/* Main Inputs Form Body */}
          <div className="p-6 flex flex-col gap-6 w-full text-left items-start">
            
            {/* 1. Name (Read-Only) */}
            <div className="flex flex-col gap-1.5 w-full text-left items-start">
              <label className="text-sm font-semibold text-gray-400 text-left w-full uppercase tracking-wider text-[11px]">Name</label>
              <input
                type="text"
                value={formData.name}
                disabled
                className="w-full h-[42px] rounded-md border-2 border-gray-200 bg-gray-100/80 py-2 px-3 text-sm text-gray-500 text-left cursor-not-allowed select-none outline-none"
              />
            </div>

            {/* 2. IP Pools Display (Read-Only Chip Elements) */}
            <div className="flex flex-col gap-1.5 w-full text-left items-start">
              <label className="text-sm font-semibold text-gray-400 text-left w-full uppercase tracking-wider text-[11px]">IP Pools</label>
              <div className="w-full min-h-[42px] rounded-md border-2 border-gray-200 bg-gray-100/80 py-1.5 px-3 flex flex-wrap gap-1 items-center justify-start cursor-not-allowed select-none">
                {formData.ip_pools.length === 0 ? (
                  <span className="text-gray-400 select-none">No IP pools configured</span>
                ) : (
                  formData.ip_pools.map((val) => (
                    <span key={val} className="inline-flex items-center bg-white text-gray-500 text-xs font-semibold px-2 py-0.5 rounded border border-gray-200">
                      {val}
                    </span>
                  ))
                )}
              </div>
            </div>

            {/* 3. BaseOS (Read-Only Display) */}
            <div className="flex flex-col gap-1.5 w-full text-left items-start">
              <label className="text-sm font-semibold text-gray-400 text-left w-full uppercase tracking-wider text-[11px]">BaseOs</label>
              <input
                type="text"
                value={formData.base_os || "N/A"}
                disabled
                className="w-full h-[42px] rounded-md border-2 border-gray-200 bg-gray-100/80 py-2 px-3 text-sm text-gray-500 text-left cursor-not-allowed select-none outline-none"
              />
            </div>

            {/* 4. Cluster Section Containers (Read-Only Layout Sync) */}
            <div className="flex flex-col gap-5 border border-blue-100 bg-blue-50/10 p-5 rounded-lg w-full text-left items-start select-none">
              <h3 className="text-sm font-bold text-[#1a365d] tracking-wide uppercase border-b border-blue-100 pb-1.5 w-full text-left">
                Cluster Properties (Locked)
              </h3>
              <div className="flex flex-col gap-5 w-full text-left items-start">
                
                {/* Cluster Multi-Display */}
                <div className="flex flex-col gap-1.5 w-full text-left items-start">
                  <label className="text-xs font-semibold text-gray-400 uppercase">Cluster Node</label>
                  <div className="w-full min-h-[42px] rounded-md border-2 border-blue-100/60 bg-gray-100/80 py-1.5 px-3 flex flex-wrap gap-1 items-center justify-start cursor-not-allowed">
                    {formData.clusters.map((val) => (
                      <span key={val} className="bg-white text-gray-500 text-xs font-semibold px-2 py-0.5 rounded border border-gray-200">{val}</span>
                    ))}
                  </div>
                </div>

                {/* Nodes Multi-Display */}
                <div className="flex flex-col gap-1.5 w-full text-left items-start">
                  <label className="text-xs font-semibold text-gray-400 uppercase">Node Selection</label>
                  <div className="w-full min-h-[42px] rounded-md border-2 border-blue-100/60 bg-gray-100/80 py-1.5 px-3 flex flex-wrap gap-1 items-center justify-start cursor-not-allowed">
                    {formData.nodes.map((val) => (
                      <span key={val} className="bg-white text-gray-500 text-xs font-semibold px-2 py-0.5 rounded border border-gray-200">{val}</span>
                    ))}
                  </div>
                </div>

                {/* GPUs Multi-Display */}
                <div className="flex flex-col gap-1.5 w-full text-left items-start">
                  <label className="text-xs font-semibold text-gray-400 uppercase">GPU Selection</label>
                  <div className="w-full min-h-[42px] rounded-md border-2 border-blue-100/60 bg-gray-100/80 py-1.5 px-3 flex flex-wrap gap-1 items-center justify-start cursor-not-allowed">
                    {formData.gpus.map((val) => (
                      <span key={val} className="bg-white text-gray-500 text-xs font-semibold px-2 py-0.5 rounded border border-gray-200">{val}</span>
                    ))}
                  </div>
                </div>

              </div>
            </div>

            {/* 5. CPU Resource (Read-Only) */}
            <div className="flex flex-col gap-1.5 w-full text-left items-start">
              <label className="text-sm font-semibold text-gray-400 text-left w-full uppercase tracking-wider text-[11px]">CPU</label>
              <input
                type="text"
                value={formData.cpu}
                disabled
                className="w-full h-[42px] rounded-md border-2 border-gray-200 bg-gray-100/80 py-2 px-3 text-sm text-gray-500 text-left cursor-not-allowed outline-none"
              />
            </div>

            {/* 6. RAM Resource (Read-Only) */}
            <div className="flex flex-col gap-1.5 w-full text-left items-start">
              <label className="text-sm font-semibold text-gray-400 text-left w-full uppercase tracking-wider text-[11px]">RAM</label>
              <input
                type="text"
                value={formData.ram}
                disabled
                className="w-full h-[42px] rounded-md border-2 border-gray-200 bg-gray-100/80 py-2 px-3 text-sm text-gray-500 text-left cursor-not-allowed outline-none"
              />
            </div>

            {/* 7. Hardware Model Name Input -> ACTIVE & EDITABLE FIELD */}
            <div className="flex flex-col gap-1.5 w-full text-left items-start">
              <label className="text-sm font-bold text-gray-800 text-left w-full">
                Model Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="model"
                value={formData.model}
                onChange={handleInputChange} // Only active update binding
                placeholder="Enter targeted machine hardware target version model type"
                required
                className="w-full h-[42px] rounded-md border-2 border-gray-300 py-2 px-3 focus:border-[#1a365d] focus:outline-none text-sm text-gray-900 font-semibold text-left shadow-xs transition-colors"
              />
            </div>

            {/* 8. Storage Block Config (Read-Only) */}
            <div className="flex flex-col gap-5 border border-gray-200 bg-gray-50/40 p-5 rounded-lg w-full text-left items-start select-none">
              <h3 className="text-sm font-bold text-gray-400 tracking-wide uppercase border-b border-gray-200 pb-1.5 w-full text-left">
                Storage Provisioning (Locked)
              </h3>
              <div className="flex flex-col gap-5 w-full text-left items-start">
                
                <div className="flex flex-col gap-1.5 w-full text-left items-start">
                  <label className="text-xs font-semibold text-gray-400 uppercase">Datastores</label>
                  <input
                    type="text"
                    value={formData.datastore}
                    disabled
                    className="w-full h-[42px] rounded-md border-2 border-gray-200 bg-gray-100/80 py-2 px-3 text-sm text-gray-500 text-left cursor-not-allowed outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5 w-full text-left items-start">
                  <label className="text-xs font-semibold text-gray-400 uppercase">OS Disk Size</label>
                  <input
                    type="text"
                    value={formData.os_disk_size}
                    disabled
                    className="w-full h-[42px] rounded-md border-2 border-gray-200 bg-gray-100/80 py-2 px-3 text-sm text-gray-500 text-left cursor-not-allowed outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5 w-full text-left items-start">
                  <label className="text-xs font-semibold text-gray-400 uppercase">Data Disk Size</label>
                  <input
                    type="text"
                    value={formData.data_disk_size}
                    disabled
                    className="w-full h-[42px] rounded-md border-2 border-gray-200 bg-gray-100/80 py-2 px-3 text-sm text-gray-500 text-left cursor-not-allowed outline-none"
                  />
                </div>

              </div>
            </div>

          </div>

          {/* Bottom Control Actions Strip */}
          <div className="w-full bg-gray-50 border-t border-gray-200 p-4 px-6 flex items-center justify-end gap-3 flex-shrink-0 rounded-b-lg">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex justify-center rounded-md bg-white hover:bg-gray-100 px-5 py-2.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`inline-flex items-center gap-2 rounded-md px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all ${
                isSubmitting ? "bg-[#1a365d] cursor-not-allowed opacity-80" : "bg-[#1a365d] hover:bg-[#122744]"
              }`}
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              <span>{isSubmitting ? "Updating..." : "Update Pool"}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

export default EditLLMInference;