
import {
    getLicenseTypesAPI,
    createOptimizationRequestAPI,
    getAllOptimizationRequestsAPI,
    getOptimizationResultsByRequestIdAPI,
    LicenseType as BackendLicenseType, 
    OptimizationRequest as BackendOptimizationRequest, 
    CreateOptimizationRequestPayload
} from '../api/lic_opt'; 

import {
    OptimizationRequest, 
    OptimizationRequestType, 
    RoleOptimizationResult, 
    LicenseType, 
    RatioOption, 
    UserOptimizationResult
} from "../types/optimization"; 


export const getLicenseTypes = async (clientId: string, systemId: string): Promise<LicenseType[]> => {
    if (!clientId || !systemId) {
        return [];
    }
   
    const apiLicenseTypes = await getLicenseTypesAPI(clientId, systemId);

    
    return apiLicenseTypes.map(lt => ({
        id: lt.id,
        name: lt.name,
        description: null, 
    }));
};


export const getRatioOptions = async (): Promise<RatioOption[]> => {
    
    const mockRatioOptions: RatioOption[] = [
        { id: "10", value: "10" },
        { id: "20", value: "20" },
        { id: "30", value: "30" },
    ];
    return Promise.resolve(mockRatioOptions);
};


export const createOptimizationRequest = async (
    
    payload: CreateOptimizationRequestPayload
  ): Promise<any> => {
    if (!payload.client_name || !payload.system_id) {
      throw new Error("Client Name and System SID are required.");
    }

    const finalPayload: CreateOptimizationRequestPayload = {
        ...payload
        // ,
        // validation_type: payload.validation_type || "role",
       
    };

    if (finalPayload.ratio_threshold !== undefined && finalPayload.ratio_threshold !== null && isNaN(finalPayload.ratio_threshold)) {
        throw new Error("Ratio threshold must be a valid number.");
      }
    
      return createOptimizationRequestAPI(finalPayload);
    };


export const getOptimizationRequests = async (
): Promise<OptimizationRequest[]> => {
    
    const backendRequests = await getAllOptimizationRequestsAPI(); 

    
    return backendRequests.map(req => ({
        id: String(req.req_id), 
        client_name: req.CLIENT_NAME, 
        system_id: req.SYSTEM_NAME, 
        status: req.STATUS as OptimizationRequest['status'], 
        datetime: req.TIMESTAMP ? new Date(req.TIMESTAMP).toISOString() : new Date().toISOString(),
        request_type: 'role', 
        filters: {}, 
    }));
};

export const getRoleOptimizationResults = async (
    requestId: string 
): Promise<RoleOptimizationResult[]> => { 
   
    
    const results = await getOptimizationResultsByRequestIdAPI(requestId); 

    
    return results.map(res => ({
        id: String(res.id), 
        request_id: String(res.req_id), 
        role_id: res.role_id || null,
        role_description: res.role_description || null, 
        auth_object: res.auth_object || null, 
        field: res.field || null,
        value: res.value || null, 
        license_can_be_reduced: res.license_can_be_reduced !== undefined ? res.license_can_be_reduced : null,
        insights: res.insights || null,
        recommendations: res.recommendations || null, 
        explanations: res.explanations || null,
        created_at: new Date().toISOString(), 
    }));
};

export const getUserOptimizationResults = async (
  requestId: string
): Promise<UserOptimizationResult[]> => {
  console.log(`Fetching user optimization results for request ID: ${requestId}`);

  return [
    {
      id: crypto.randomUUID(),
      request_id: requestId,
      user_id: 'USER001',
      display_name: 'John Doe',
      valid_from: new Date('2023-01-01').toISOString(),
      valid_to: new Date('2024-12-31').toISOString(),
      user_group: 'FINANCE',
      last_logon: new Date('2023-06-15').toISOString(),
      license_can_be_reduced: true,
      insights: 'User has not logged in for over 3 months',
      recommendations: 'Consider downgrading to Self-Service license',
      explanations: 'Infrequent usage does not justify Professional license cost',
      created_at: new Date().toISOString()
    },
    {
      id: crypto.randomUUID(),
      request_id: requestId,
      user_id: 'USER002',
      display_name: 'Jane Smith',
      valid_from: new Date('2023-01-01').toISOString(),
      valid_to: null,
      user_group: 'IT',
      last_logon: new Date('2023-10-01').toISOString(),
      license_can_be_reduced: false,
      insights: 'User actively uses advanced features',
      recommendations: 'Maintain current Professional license',
      explanations: 'Usage patterns justify the current license type',
      created_at: new Date().toISOString()
    }
  ];
};



