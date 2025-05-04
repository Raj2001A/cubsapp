export const initialBackendHealthState = {
  isConnected: false,
  isChecking: false,
  lastChecked: 0
};

export const initialErrorState = {
  hasError: false,
  message: '',
  severity: 'info' as const,
  operation: '' as const
};
