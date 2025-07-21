
export type OptimizationRequestType = 'role' | 'user';

export type OptimizationStatus = 'Started' | 'In Progress' | 'Error' | 'Completed';

export interface OptimizationRequest {
  id: string;
  request_type: OptimizationRequestType;
  filters: Record<string, any>;
  status: OptimizationStatus;
  client_name:string;
  system_id:string;
  datetime: string;
}

export interface RoleOptimizationResult {
  id: string;
  request_id: string;
  role_id: string;
  role_description: string | null;
  auth_object: string | null;
  field: string | null;
  value: string | null;
  license_can_be_reduced: 'Yes' | 'No' | 'May Be'| null;
  insights: string | null;
  recommendations: string | null;
  explanations: string | null;
  created_at: string;
}

export interface UserOptimizationResult {
  id: string;
  request_id: string;
  user_id: string;
  display_name: string | null;
  valid_from: string | null;
  valid_to: string | null;
  user_group: string | null;
  last_logon: string | null;
  license_can_be_reduced: boolean | null;
  insights: string | null;
  recommendations: string | null;
  explanations: string | null;
  created_at: string;
}

export interface LicenseType {
  id: string;
  name: string;
  description: string | null;
}

export interface RatioOption {
  id: string;
  value: string;
}