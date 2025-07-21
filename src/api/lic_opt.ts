import axios from 'axios';

const API_BASE_URL = "http://localhost:8000";

export interface LicenseType {
  id: string;
  name: string;
}

export interface OptimizationRequest {
  req_id: number;
  CLIENT_NAME: string;
  SYSTEM_NAME: string;
  STATUS: string;
  TIMESTAMP?: string; 
}

export interface BackendRoleOptimizationResult {
  RESULT_ID: number;
  REQ_ID: number;
  ROLE_ID: string;
  ROLE_DESCRIPTION: string;
  AUTHORIZATION_OBJECT: string;
  FIELD: string;
  VALUE: string;
  LICENSE_REDUCIBLE: 'Yes' | 'No' | 'May Be' | string; 
  INSIGHTS: string;
  RECOMMENDATIONS?: string;
  EXPLANATIONS?: string;
}

export interface FrontendRoleOptimizationResult {
  id: number;
  req_id: number; 
  role_id: string; 
  role_description: string; 
  auth_object: string; 
  field: string; 
  value: string; 
  license_can_be_reduced: 'Yes' | 'No' | 'May Be';
  insights: string;
  recommendations?: string; 
  explanations?: string; 
}


export interface CreateOptimizationRequestPayload {
  client_name: string;
  validation_type?: string; 
  target_license?: string;  
  sap_system_info?: string; // Default is 'S4 HANA OnPremise 1909 Initial Support Pack'
  role_names?: string[] | null;
    system_id: string;
  ratio_threshold?: number | null;
 
  
}

export const getLicenseTypesAPI = async (clientName: string, systemId: string): Promise<LicenseType[]> => {
  if (!clientName || !systemId) {
    console.warn('Client name and System ID are required to fetch license types.');
    return [];
  }
  try {
    const response = await axios.get<LicenseType[]>(`${API_BASE_URL}/optimize/license-types`, {
      params: {
        client_name: clientName,
        system_id: systemId,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching license types:', error);
    throw error; 
  }
};



export const createOptimizationRequestAPI = async (
  payload: CreateOptimizationRequestPayload
): Promise<any> => {
  try {
    const response = await axios.get<any>(`${API_BASE_URL}/optimize/license`, {
      params: payload,
      paramsSerializer: (params) => {
        const searchParams = new URLSearchParams();
        
        Object.keys(params).forEach(key => {
          const value = params[key];
          if (Array.isArray(value)) {
            value.forEach(item => {
              if (item !== null && item !== undefined) {
                searchParams.append(key, item.toString());
              }
            });
          } else if (value !== null && value !== undefined) {
            searchParams.append(key, value.toString());
          }
        });
        
        return searchParams.toString();
      }
    });

    if (response.data && 'error' in response.data) {
      throw new Error(response.data.error);
    }

    return response.data;
  } catch (error) {
    console.error('Error creating optimization request:', error);
    throw error;
  }
};

export const getAllOptimizationRequestsAPI = async (): Promise<OptimizationRequest[]> => {
  try {
    const response = await axios.get<OptimizationRequest[]>(`${API_BASE_URL}/optimize/requests`);
  
    return response.data.map(req => ({
        ...req, 
    }));
  } catch (error) {
    console.error('Error fetching all optimization requests:', error);
    throw error;
  }
};


export const getOptimizationResultsByRequestIdAPI = async (
    reqId: string | number
): Promise<FrontendRoleOptimizationResult[]> => { 
  if (!reqId) {
    console.warn('Request ID is required to fetch results.');
    return [];
  }
  try {
    const response = await axios.get<BackendRoleOptimizationResult[]>(`${API_BASE_URL}/optimize/results/${reqId}`);

    return response.data.map(result => ({
      id: result.RESULT_ID, 
      req_id: result.REQ_ID, 
      role_id: result.ROLE_ID,
      role_description: result.ROLE_DESCRIPTION,
      auth_object: result.AUTHORIZATION_OBJECT, 
      field: result.FIELD,
      value: result.VALUE, 
      license_can_be_reduced: result.LICENSE_REDUCIBLE as 'Yes' | 'No' | 'May Be',      insights: result.INSIGHTS,
      recommendations: result.RECOMMENDATIONS, 
      explanations: result.EXPLANATIONS, 
    }));
  } catch (error) {
    console.error(`Error fetching optimization results for request ID ${reqId}:`, error);
    throw error;
  }
};

