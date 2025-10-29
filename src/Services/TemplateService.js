import axiosInstance from './AxiosInstane';
import { getEnv } from 'utils/getEnv';
const backendUrl = getEnv('BACKEND_URL');

export const fetchReports = async (token, reportType) => {
	const response = await axiosInstance.get(
		`${backendUrl}/v1/guacamole/reports/${reportType}`,
		{
			headers: { Authorization: `Bearer ${token}` },
		}
	);
	return response.data.data;
};

export const updateReport = async (token, formData) => {
	const response = await axiosInstance.post(
		`${backendUrl}/v1/guacamole/update_report`,
		formData,
		{
			headers: {
				'Content-Type': 'multipart/form-data',
				Authorization: `Bearer ${token}`,
			},
		}
	);
	return response;
};
