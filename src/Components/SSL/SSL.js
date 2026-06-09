import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
// ✅ Toast ko import kiya
import { toast } from "react-toastify"; 
import {
  uploadSSLThunk,
  fetchSSLStatusThunk,
  renewSSLThunk,
} from "../../redux/features/SSL/SSLThunks";
import {
  selectSSLUploadLoading,
  selectSSLRenewLoading,
  selectSSLValidationMessages,
  selectSSLUploadStatus,
  selectSSLError,
  selectSSLStatusDetails,
} from "../../redux/features/SSL/SSLSelectors";
import { setValidationMessages, clearUploadStatus } from "../../redux/features/SSL/SSLSlice";
import { selectAuthToken } from "../../redux/features/Auth/AuthSelectors";

const SSL = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const token = useSelector(selectAuthToken);
  const uploadLoading = useSelector(selectSSLUploadLoading);
  const renewLoading = useSelector(selectSSLRenewLoading);
  const validationMessages = useSelector(selectSSLValidationMessages);
  const uploadStatus = useSelector(selectSSLUploadStatus);
  const error = useSelector(selectSSLError);
  const sslDetails = useSelector(selectSSLStatusDetails);

  const [certificateType, setCertificateType] = useState("selfSigned");
  const [privateKeyFile, setPrivateKeyFile] = useState(null);
  const [certificateFile, setCertificateFile] = useState(null);

  useEffect(() => {
    if (token) {
      dispatch(fetchSSLStatusThunk(token));
    }
  }, [token, dispatch]);

  useEffect(() => {
    if (sslDetails && sslDetails.certificate_type) {
      const type = sslDetails.certificate_type.toLowerCase();
      if (type.includes("self-signed")) {
        setCertificateType("selfSigned");
      } else if (type.includes("custom")) {
        setCertificateType("custom");
      }
    }
  }, [sslDetails]);

  const Goback = () => {
    navigate("/");
  };

  // ⭐ UPDATE: Handle Renewal with Toast Alerts
  const handleRenewal = async () => {
    // Thunk ke result ko save kiya check karne ke liye
    const resultAction = await dispatch(renewSSLThunk(token));
    
    if (renewSSLThunk.fulfilled.match(resultAction) || resultAction.meta?.requestStatus === "fulfilled") {
      toast.success("SSL Certificate successfully renewed!"); // Success Toast
      dispatch(fetchSSLStatusThunk(token)); 
    } else {
      // Agar backend se koi error message aaya ho toh wo dikhao, nahi toh default text
      const errorMsg = resultAction.payload || error || "Failed to renew SSL Certificate.";
      toast.error(errorMsg); // Failed Toast
    }
  };

  const parseCertificate = async (certFile) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const certContent = e.target.result;
        const messages = [];
        
        if (certContent.includes("CN=")) {
          const cnMatch = certContent.match(/CN=([^,\n]+)/);
          const subject = cnMatch ? cnMatch[1] : "";
          
          if (subject.includes("*.")) {
            messages.push({ type: "info", text: "✓ Wildcard Certificate detected" });
          } else {
            messages.push({ type: "info", text: "✓ Standard/Server Certificate detected" });
          }
        }
        
        if (certContent.includes("CERTIFICATE AUTHORITY") || certContent.includes("basicConstraints: CA:TRUE")) {
          messages.push({ type: "info", text: "✓ Root/Intermediate Certificate detected" });
        }
        
        const validityMatch = certContent.match(/Not After\s*:\s*([^\n]+)/);
        if (validityMatch) {
          messages.push({ type: "info", text: `✓ Valid Until: ${validityMatch[1]}` });
        }
        
        const certCount = (certContent.match(/-----BEGIN CERTIFICATE-----/g) || []).length;
        if (certCount > 1) {
          messages.push({ type: "info", text: `✓ Certificate Chain: ${certCount} certificate(s) found` });
        }
        
        resolve(messages);
      };
      reader.readAsText(certFile);
    });
  };

  const validateCertificates = async () => {
    const messages = [];
    
    if (!privateKeyFile) {
      messages.push({ type: "error", text: "✗ Private Key file is required" });
    }
    
    if (!certificateFile) {
      messages.push({ type: "error", text: "✗ Certificate file is required" });
    }
    
    if (privateKeyFile && !privateKeyFile.name.endsWith(".key")) {
      messages.push({ type: "error", text: "✗ Invalid Private Key format (must be .key)" });
    }
    
    if (certificateFile && !certificateFile.name.endsWith(".crt")) {
      messages.push({ type: "error", text: "✗ Invalid Certificate format (must be .crt)" });
    }
    
    if (certificateFile) {
      const certMessages = await parseCertificate(certificateFile);
      messages.push(...certMessages);
    }
    
    if (privateKeyFile) {
      const reader = new FileReader();
      await new Promise((resolve) => {
        reader.onload = (e) => {
          const keyContent = e.target.result;
          if (keyContent.includes("PRIVATE KEY")) {
            messages.push({ type: "info", text: "✓ Valid Private Key format detected" });
          } else {
            messages.push({ type: "error", text: "✗ Invalid Private Key format" });
          }
          resolve();
        };
        reader.readAsText(privateKeyFile);
      });
    }
    
    dispatch(setValidationMessages(messages));
    return messages.every(msg => msg.type !== "error");
  };

  // ⭐ UPDATE: Handle Upload with Toast Alerts
  const handleUpload = async () => {
    dispatch(clearUploadStatus());
    dispatch(setValidationMessages([]));
    
    const isValid = await validateCertificates();
    if (!isValid) {
      toast.warning("Please resolve the validation errors first."); // Warning Toast
      return;
    }
    
    const resultAction = await dispatch(uploadSSLThunk({ token, certFile: certificateFile, keyFile: privateKeyFile }));
    
    if (uploadSSLThunk.fulfilled.match(resultAction) || resultAction.meta?.requestStatus === "fulfilled") {
      toast.success("SSL Certificate uploaded and applied successfully!"); // Success Toast
      dispatch(fetchSSLStatusThunk(token)); 
    } else {
      const errorMsg = resultAction.payload || error || "Failed to upload SSL Certificate.";
      toast.error(errorMsg); // Failed Toast
    }
  };

  useEffect(() => {
    if (uploadStatus === "success") {
      setTimeout(() => {
        setPrivateKeyFile(null);
        setCertificateFile(null);
        const privateKeyInput = document.getElementById("privateKey");
        const publicCertInput = document.getElementById("publicCertificate");
        if (privateKeyInput) privateKeyInput.value = "";
        if (publicCertInput) publicCertInput.value = "";
      }, 2000);
    }
  }, [uploadStatus]);

  const renderExpirationDetails = () => {
    if (!sslDetails) {
      return <span className="font-normal text-gray-500 animate-pulse">Fetching cluster details...</span>;
    }

    const isSelfSignedBackend = sslDetails.certificate_type?.toLowerCase().includes("self-signed");

    if (certificateType === "selfSigned" && !isSelfSignedBackend) {
      return (
        <span className="font-medium text-xs text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-md w-fit mt-1">
          In-Active (Custom Certificate is currently active on cluster)
        </span>
      );
    }

    if (certificateType === "custom" && isSelfSignedBackend) {
      return (
        <span className="font-medium text-xs text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-md w-fit mt-1">
          In-Active (Self-Signed Certificate is currently active on cluster)
        </span>
      );
    }

    return (
      <div className="flex flex-col space-y-1 mt-1">
        <span className="font-semibold text-gray-800 text-sm">{sslDetails.valid_until}</span>
        <span className={`text-xs font-bold px-2 py-0.5 rounded-md w-fit ${
          sslDetails.is_expired 
            ? "bg-red-100 text-red-700" 
            : sslDetails.days_remaining <= 15 
            ? "bg-yellow-100 text-yellow-700" 
            : "bg-green-100 text-green-700"
        }`}>
          {sslDetails.is_expired 
            ? "Expired" 
            : `Active (${sslDetails.days_remaining} days remaining)`}
        </span>
        {sslDetails.common_name && (
          <span className="text-xs text-gray-500 font-normal">Domain: {sslDetails.common_name}</span>
        )}
      </div>
    );
  };

  return (
    <div className="mt-5 flex flex-col space-y-6 w-[98%] h-[90vh] m-auto bg-white">
      <div className="flex justify-start ml-0 mt-5">
        <div
          onClick={Goback}
          className="ml-4 bg-[#1a365d]/80 hover:bg-[#1a365d] text-[#f5f5f5] hover:text-white px-2 py-2 rounded-md cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#1a365d] focus:ring-opacity-10"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg> 
        </div>
      </div>
      <div className="p-8 rounded-lg flex flex-col items-start m-10 bg-white">
        <h1 className="text-xl font-bold mb-4 text-gray-900 border-b-2 border-gray-200">SSL Certificate</h1>
        
        <div className="mb-6 flex flex-col items-start w-full">
          <label className="text-sm font-medium text-gray-900 mb-3">Certificate Type:</label>
          <div className="flex items-center space-x-6">
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="certificateType"
                value="selfSigned"
                checked={certificateType === "selfSigned"}
                onChange={(e) => setCertificateType(e.target.value)}
                className="w-4 h-4 text-[#1a365d] focus:ring-2 focus:ring-[#1a365d]"
              />
              <span className="ml-2 text-sm font-medium text-gray-900">Self Signed Certificate</span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="certificateType"
                value="custom"
                checked={certificateType === "custom"}
                onChange={(e) => setCertificateType(e.target.value)}
                className="w-4 h-4 text-[#1a365d] focus:ring-2 focus:ring-[#1a365d]"
              />
              <span className="ml-2 text-sm font-medium text-gray-900">Custom Certificate</span>
            </label>
          </div>
        </div>

        {certificateType === "selfSigned" && (
          <div className="w-full flex flex-col items-start space-y-4 border-t pt-6">
            <div className="text-sm font-medium text-gray-900 flex flex-col items-start">
              <span>Expiration Date:</span>
              {renderExpirationDetails()}
            </div>
            <button 
              onClick={handleRenewal}
              disabled={renewLoading}
              className={`${
                renewLoading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-[#1a365d]/80 hover:bg-[#1a365d]"
              } text-[#f5f5f5] hover:text-white font-medium px-4 py-2 rounded-md`}
            >
              {renewLoading ? "Renewing..." : "Renew"}
            </button>
          </div>
        )}

        {certificateType === "custom" && (
          <div className="w-full flex flex-col items-start space-y-4 border-t pt-6">
            <div className="text-sm font-medium text-gray-900 flex flex-col items-start">
              <span>Expiration Date:</span>
              {renderExpirationDetails()}
            </div>
            <div className="flex flex-col items-start w-full">
              <label htmlFor="privateKey" className="text-sm font-medium text-gray-900 mb-1 ml-1">Private Key:</label>
              <input
                type="file"
                id="privateKey"
                name="privateKey"
                accept=".key"
                onChange={(e) => setPrivateKeyFile(e.target.files[0])}
                className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:border-[#1a365d]/100 w-80"
              />
            </div>
            <div className="flex flex-col items-start w-full">
              <label htmlFor="publicCertificate" className="text-sm font-medium text-gray-900 mb-1 ml-1">Public Certificate:</label>
              <input
                type="file"
                id="publicCertificate"
                name="publicCertificate"
                accept=".crt"
                onChange={(e) => setCertificateFile(e.target.files[0])}
                className="w-80 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:border-[#1a365d]/100"
              />
            </div>

            {validationMessages.length > 0 && (
              <div className="w-full mt-4 p-4 rounded-md border-2 border-gray-200 bg-gray-50">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Certificate Verification:</h3>
                <div className="space-y-2">
                  {validationMessages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`text-sm flex items-start space-x-2 ${
                        msg.type === "error"
                          ? "text-red-700"
                          : msg.type === "success"
                          ? "text-green-700"
                          : "text-blue-700"
                      }`}
                    >
                      <span className="font-medium">{msg.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button 
              onClick={handleUpload}
              disabled={uploadLoading}
              className={`${
                uploadLoading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-[#1a365d]/80 hover:bg-[#1a365d]"
              } text-[#f5f5f5] hover:text-white font-medium px-4 py-2 rounded-md`}
            >
              {uploadLoading ? "Uploading..." : "Upload"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SSL;