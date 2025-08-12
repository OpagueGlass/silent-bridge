// constants/agora.ts
export const AGORA_CONFIG = {
  appId: '307299cfc268406e952da5358c88ea20', // 从 Agora 控制台获取
  token: '007eJxTYDiw+d01rlknlbPr71zJrPwnF2SuqzZT3kHiaeO8G9s/007eJxTYPBPu7dAzujFiXT+h/G3p2b7eGUYi2UfkPujeLo66+gh02YFBmMDcyNLy+S0ZCMzCxMDs1RLU6OURFNjU4tkC4vURCODq/9nZTQEMjKoH+xnZWSAQBCfiaHEkIEBAPXSHoA=+ShZEBAkF8XobgzJzUvBKFpKLMlPRUBgYAjy8iSg==', // 生产环境需要使用 token
};

export const generateChannelName = (appointmentId: number) => {
  return `appointment_${appointmentId}`;
};
