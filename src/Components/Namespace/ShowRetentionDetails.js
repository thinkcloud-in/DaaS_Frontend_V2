import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from 'Services/AxiosInstane';
import { toast } from 'react-toastify';
import { PoolContext } from '../../Context/PoolContext';
import { getEnv } from 'utils/getEnv';

const ShowRetentionDetails = ({ namespaces }) => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [namespace] = useState(namespaces.namespaceName || '');
  const [retentionDays, setRetentionDays] = useState(namespaces.retentionPeriod || '');
  const [statusMessage, setStatusMessage] = useState('');

  const pc = useContext(PoolContext);
  const userEmail = pc?.tokenParsed?.preferred_username || '';

  const handleUpdateRetention = async () => {
    setIsSubmitting(true);

    if (!retentionDays || retentionDays < 1) {
      setStatusMessage('Retention must be at least 1 day.');
      setIsSubmitting(false);
      return;
    }

    const backendUrl = getEnv('BACKEND_URL');

    try {
      const response = await axiosInstance.put(`${backendUrl}/v1/namespace/update-retention`, {
        namespace,
        retention_days: parseInt(retentionDays),
        email: userEmail,
      });

      const { message, newRetentionPeriod } = response.data;

      toast.success(message || 'Retention updated!');
      setRetentionDays(newRetentionPeriod);  
      setStatusMessage('');
    } catch (error) {
      
      toast.error('Failed to update retention.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 h-screen">
      <div className="h-[86vh] flex justify-center">
        <div className="w-[550px] h-[40vh] bg-white rounded-lg shadow-md p-6 flex flex-col justify-between">
          <h2 className="text-lg font-semibold text-[#1a365d] mb-8 pl-2 pt-2">
            Namespace Details
          </h2>

          <div className="flex flex-col gap-10 w-full max-w-md">
            <div className="flex flex-row gap-9">
              <label className="text-[0.9rem] text-gray-700 font-medium">Namespace</label>
              <input
                type="text"
                value={namespace}
                readOnly
                className="w-full px-2 py-[6px] border border-gray-200 border-b-2 border-b-gray-500 shadow-sm bg-gray-100 cursor-not-allowed text-gray-600"
              />
            </div>

            <div className="flex flex-row gap-9">
              <label className="text-[0.9rem] text-gray-700 font-medium">Retention Period</label>
              <input
                type="number"
                value={retentionDays}
                min={1}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '') {
                    setRetentionDays('');
                    return;
                  }
                  const parsed = parseInt(value);
                  if (!isNaN(parsed) && parsed >= 1) {
                    setRetentionDays(parsed);
                  }
                }}
                className="w-full px-2 py-[6px] border border-gray-200 border-b-2 border-b-gray-500 shadow-sm focus:outline-none focus:border-b-[#1a365d]/100 focus:ring-0"
                placeholder="e.g. 7 in days only"
                required
              />
            </div>
          </div>

          <div className="flex justify-end mt-8">
            <button
              onClick={handleUpdateRetention}
              disabled={isSubmitting}
              className={`px-4 py-2 rounded text-white transition ${
                isSubmitting
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-[#1a365d]/80 hover:bg-[#1a365d]'
              }`}
            >
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </button>
          </div>

          {statusMessage && (
            <p className="text-sm text-center text-orange-600 mt-4">{statusMessage}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShowRetentionDetails;
