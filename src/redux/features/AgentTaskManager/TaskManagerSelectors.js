export const selectVmDetails = (state) => state.agentTaskManager.vmDetails;
export const selectProcessData = (state) => state.agentTaskManager.processData;
export const selectHostStats = (state) => state.agentTaskManager.hostStats;
export const selectAgentTaskManagerLoading = (state) => state.agentTaskManager.loading;
export const selectAgentTaskManagerError = (state) => state.agentTaskManager.error;
export const selectKillLoading = (state) => state.agentTaskManager.killLoading;