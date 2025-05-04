import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Chip, Button, Select, MenuItem, FormControl, InputLabel, Switch, FormControlLabel, CircularProgress, Alert, Tooltip } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { getCircuitBreakerStatus } from '../utils/backendErrorHandler';
import logger from '../utils/logger';
import backendHealthService from '../services/backendHealthService';

// Backend types and interfaces
interface Backend {
  id: string;
  name: string;
  type: string;
  status: 'online' | 'offline' | 'degraded' | 'unknown';
  priority: number;
  lastChecked?: string;
  lastUsed?: string;
  enabled: boolean;
}

interface BackendStatus {
  currentBackend: string | null;
  strategy: string;
  backends: Backend[];
}

const BackendStatus: React.FC = () => {
  const { user } = useAuth();
  const [status, setStatus] = useState<BackendStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStrategy, setSelectedStrategy] = useState<string>('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [circuitBreaker, setCircuitBreaker] = useState<{
    global: { isOpen: boolean; failures: number };
    endpoints: Record<string, { isOpen: boolean; failures: number }>;
  }>({
    global: { isOpen: false, failures: 0 },
    endpoints: {}
  });

  // Check if user is admin
  const isAdmin = user?.role === 'Administrator';

  // Fetch backend status
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        setLoading(true);
        setError(null);

        // Force a health check using our health service
        await backendHealthService.forceHealthCheck();

        // Get backend status from API
        const response = await api.backend.getStatus();
        setStatus(response as any);
        setSelectedStrategy((response as any).strategy);

        // Get circuit breaker status
        const cbStatus = getCircuitBreakerStatus();
        setCircuitBreaker({
          global: {
            isOpen: cbStatus.global.isOpen,
            failures: cbStatus.global.failures
          },
          endpoints: Object.entries(cbStatus.endpoints).reduce((acc, [key, value]) => {
            acc[key] = {
              isOpen: value.isOpen,
              failures: value.failures
            };
            return acc;
          }, {} as Record<string, { isOpen: boolean; failures: number }>)
        });

        logger.info('Backend status updated', {
          currentBackend: (response as any).currentBackend,
          strategy: (response as any).strategy,
          backendCount: (response as any).backends?.length,
          circuitBreakerOpen: cbStatus.global.isOpen
        });
      } catch (err) {
        logger.error('Error fetching backend status:', { error: err });
        setError('Failed to fetch backend status');
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();

    // Set up polling for status updates
    const interval = setInterval(() => {
      fetchStatus();
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [refreshKey]);

  // Handle strategy change
  const handleStrategyChange = async (event: React.ChangeEvent<{ value: unknown }>) => {
    const newStrategy = event.target.value as string;

    try {
      setLoading(true);
      await api.backend.setStrategy(newStrategy);
      setSelectedStrategy(newStrategy);
      // Refresh status
      setRefreshKey(prev => prev + 1);
    } catch (err) {
      console.error('Error changing strategy:', err);
      setError('Failed to change strategy');
    } finally {
      setLoading(false);
    }
  };

  // Handle backend toggle
  const handleBackendToggle = async (backendId: string, enabled: boolean) => {
    try {
      setLoading(true);
      await api.backend.toggleBackend(backendId, enabled);
      // Refresh status
      setRefreshKey(prev => prev + 1);
    } catch (err) {
      console.error(`Error ${enabled ? 'enabling' : 'disabling'} backend:`, err);
      setError(`Failed to ${enabled ? 'enable' : 'disable'} backend`);
    } finally {
      setLoading(false);
    }
  };

  // Handle manual backend switch
  const handleSwitchBackend = async (backendId: string) => {
    try {
      setLoading(true);
      await api.backend.switchBackend(backendId);
      // Refresh status
      setRefreshKey(prev => prev + 1);
    } catch (err) {
      console.error('Error switching backend:', err);
      setError('Failed to switch backend');
    } finally {
      setLoading(false);
    }
  };

  // Get status chip color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'success';
      case 'degraded':
        return 'warning';
      case 'offline':
        return 'error';
      default:
        return 'default';
    }
  };

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never';

    const date = new Date(dateString);
    return date.toLocaleString();
  };

  if (!isAdmin) {
    return null; // Only show to admins
  }

  if (loading && !status) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Backend Status
        <Button
          size="small"
          sx={{ ml: 2 }}
          onClick={() => setRefreshKey(prev => prev + 1)}
          disabled={loading}
        >
          Refresh
        </Button>
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {status && (
        <>
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1">
              Current Backend: <strong>{status.currentBackend || 'None'}</strong>
            </Typography>

            {isAdmin && (
              <FormControl sx={{ mt: 2, minWidth: 200 }}>
                <InputLabel>Selection Strategy</InputLabel>
                <Select
                  value={selectedStrategy}
                  onChange={handleStrategyChange as any}
                  label="Selection Strategy"
                  disabled={loading}
                >
                  <MenuItem value="priority">Priority</MenuItem>
                  <MenuItem value="round-robin">Round Robin</MenuItem>
                  <MenuItem value="failover">Failover</MenuItem>
                </Select>
              </FormControl>
            )}
          </Box>

          <Typography variant="subtitle1" gutterBottom>
            Available Backends
          </Typography>

          {circuitBreaker.global.isOpen && (
            <Alert severity="error" sx={{ mb: 2 }}>
              Circuit breaker is open due to {circuitBreaker.global.failures} failures. Some API calls may be blocked.
            </Alert>
          )}

          {(status as any).backends.map((backend: any) => (
            <Paper
              key={backend.id}
              elevation={1}
              sx={{
                p: 2,
                mb: 2,
                borderLeft: '4px solid',
                borderColor: backend.id === (status as any).currentBackend ? 'primary.main' : 'grey.300',
                opacity: backend.enabled ? 1 : 0.7
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle1">
                  {backend.name} ({backend.id})
                </Typography>
                <Chip
                  label={backend.status}
                  color={getStatusColor(backend.status) as any}
                  size="small"
                />
              </Box>

              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 1 }}>
                <Typography variant="body2">Type: {backend.type}</Typography>
                <Typography variant="body2">Priority: {backend.priority}</Typography>
                <Typography variant="body2">Last Checked: {formatDate(backend.lastChecked)}</Typography>
                <Typography variant="body2">Last Used: {formatDate(backend.lastUsed)}</Typography>
              </Box>

              {/* Show endpoint circuit breaker status if applicable */}
              {Object.entries(circuitBreaker.endpoints)
                .filter(([endpoint]) => endpoint.includes(backend.id))
                .map(([endpoint, status]) => status.isOpen && (
                  <Alert key={endpoint} severity="warning" sx={{ mt: 1, mb: 1 }}>
                    <Tooltip title={`Endpoint: ${endpoint}`}>
                      <span>Circuit breaker open for this backend ({status.failures} failures)</span>
                    </Tooltip>
                  </Alert>
                ))
              }

              {isAdmin && (
                <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => handleSwitchBackend(backend.id)}
                    disabled={loading || backend.id === (status as any).currentBackend || !backend.enabled || backend.status !== 'online'}
                  >
                    Switch To This Backend
                  </Button>

                  <FormControlLabel
                    control={
                      <Switch
                        checked={backend.enabled}
                        onChange={(e) => handleBackendToggle(backend.id, e.target.checked)}
                        disabled={loading}
                      />
                    }
                    label={backend.enabled ? 'Enabled' : 'Disabled'}
                  />
                </Box>
              )}
            </Paper>
          ))}
        </>
      )}
    </Paper>
  );
};

export default BackendStatus;
