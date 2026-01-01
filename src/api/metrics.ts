import fastapiClient from './fastapiClient';

export interface PerformanceMetrics {
  request_count: number;
  error_count: number;
  error_rate: number;
  response_time_p50: number;
  response_time_p95: number;
  response_time_p99: number;
  response_time_avg: number;
  endpoints: Record<string, {
    count: number;
    avg: number;
    p95: number;
  }>;
}

export const fetchPerformanceMetrics = async (): Promise<PerformanceMetrics> => {
  const res = await fastapiClient.get('/admin/metrics/performance');
  return res.data;
};

