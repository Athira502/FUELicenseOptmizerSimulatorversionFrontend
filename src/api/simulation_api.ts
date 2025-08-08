import axios from "axios";

const API_BASE_URL = "http://127.0.0.1:8000"; 

export interface PivotTableResponse {
  pivot_table: {
    Users: {
      "GB Advanced Use": number;
      "GC Core Use": number;
      "GD Self-Service Use": number;
      Other: number;
      Total: number;
    };
  };
  fue_summary: {
    "GB Advanced Use FUE": number;
    "GC Core Use FUE": number;
    "GD Self-Service Use FUE": number;
    "Total FUE Required": number;
  };
  client_name: string;
  system_name: string;
}

export const getLicenseClassificationPivotTable = async (
  clientName: string,
  systemName: string
): Promise<PivotTableResponse> => {
  console.log("🌐 getLicenseClassificationPivotTable called with:", { clientName, systemName });
  
  if (!clientName || !systemName) {
    throw new Error("Client name and system name are required.");
  }

  const url = `${API_BASE_URL}/data/pivot-table/license-classification/?client_name=${encodeURIComponent(clientName)}&system_name=${encodeURIComponent(systemName)}`;
  console.log("📡 Making request to:", url);

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log("📬 Response status:", response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
    }

    const data: PivotTableResponse = await response.json();
    console.log("📋 Response data:", data);

    return data;
  } catch (error) {
    console.error("🔥 API Error:", error);
    throw error;
  }
};



// Add these interfaces to your existing simulation_api.ts file

export interface RoleDetailResponse {
  id: string;
  profile: string;
  description: string;
  classification: string;
  assignedUsers: number;
  gb: number;
  gc: number;
  gd: number;
  not_classified: number;
}

// Add this function to your existing simulation_api.ts file

export const getRoleDetails = async (
  clientName: string,
  systemName: string
): Promise<RoleDetailResponse[]> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/fue/roles/details/?client_name=${encodeURIComponent(clientName)}&system_name=${encodeURIComponent(systemName)}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
    }

    const data: RoleDetailResponse[] = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching role details:', error);
    throw error;
  }
};



export const getRoleDetailsforSim = async (
  clientName: string,
  systemName: string
): Promise<RoleDetailResponse[]> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/simulator/roles_for_sim/details/?client_name=${encodeURIComponent(clientName)}&system_name=${encodeURIComponent(systemName)}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
    }

    const data: RoleDetailResponse[] = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching role details:', error);
    throw error;
  }
};


export interface RoleObjectDetail {
  object: string;
  classification: string;
  fieldName: string;
  valueLow: string;
  valueHigh: string;
  ttext: string;
}

export interface SpecificRoleDetailsResponse {
  roleName: string;
  roleDescription: string;
  objectDetails: RoleObjectDetail[];
}

export async function getSpecificRoleDetails(
  roleName: string, 
  clientName: string,
  systemName: string
): Promise<SpecificRoleDetailsResponse> {
  const response = await fetch(
   
    `${API_BASE_URL}/fue/role-details/${encodeURIComponent(roleName)}?client_name=${encodeURIComponent(clientName)}&system_name=${encodeURIComponent(systemName)}`
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || `Failed to fetch role details: HTTP status ${response.status}`);
  }
  return response.json();
}


export interface SpecificRoleDetailsResponseforSim {
  roleName: string;
  objectDetails: RoleObjectDetail[];
}


export const getSpecificRoleDetailsforSim = async (
  roleName: string,
  clientName: string,
  systemName: string
): Promise<SpecificRoleDetailsResponseforSim> => {
  try {
  
    const encodedRoleName = encodeURIComponent(roleName);
    
    const response = await fetch(
      `${API_BASE_URL.replace(/\/$/, '')}/simulator/role-details-for-simulation/${encodedRoleName}?client_name=${encodeURIComponent(clientName)}&system_name=${encodeURIComponent(systemName)}`
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching specific role details:', error);
    throw error;
  }
};

export interface AuthObjectFieldLicenseData {
  AUTHORIZATION_OBJECT: string;
  FIELD: string;
  ACTIVITIY: string;
  TEXT: string;
  LICENSE: string;
  UI_TEXT: string; 
}

export const getAuthObjFieldLicData = async (
  authorizationObject: string,
  field: string,
  clientName: string,
  systemName: string
): Promise<AuthObjectFieldLicenseData[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/simulator/auth_object_field_license_data/`, {
      params: {
        authorization_object: authorizationObject,
        field: field,
        client_name: clientName,
        system_name: systemName
      }
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching auth object field license data for ${authorizationObject}, ${field}:`, error);
    throw error;
  }
};

export interface SimulationChangePayload {
  role_id: string;
  object: string;
  field_name: string;
  value_low: string;
  value_high: string;
  ttext?: string;
  classification?: string; // Original CLASSIF_S4
  action: "Add" | "Change" | "Remove"; // Literal types for strictness
  new_value_ui_text?: string; // The UI_TEXT chosen by the user
  is_new_object: boolean;
  frontend_id: number; // Frontend's temporary ID for tracking
}


export interface ApplySimulationResponse {
  simulation_run_id: string;
  status: "In Progress" | "Processing Changes" | "Completed" | "Failed";
  timestamp: string;
  client_name: string;
  system_name: string;
}

// Update the existing interface to match your backend response
export const applySimulationChangesToDb = async (
  clientName: string,
  systemName: string,
  changes: SimulationChangePayload[]
): Promise<ApplySimulationResponse> => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/simulator/apply-simulation-changes/`,
      changes,
      {
        params: { 
          client_name: clientName, 
          system_name: systemName 
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error applying simulation changes to DB:", error);
    if (axios.isAxiosError(error) && error.response?.status === 500) {
      throw new Error("Simulation initialization failed. Please try again.");
    }
    throw error;
  }
};



export const getLicenseClassificationPivotTableforSim = async (
  clientName: string,
  systemName: string
): Promise<PivotTableResponse> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/simulator/license-classification-simulation/`, {
      params: { client_name: clientName, system_name: systemName }
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching license classification pivot table:", error);
    throw error;
  }
};

export interface AddSuggestion {
  value: string;
  license: string;
  ui_text: string;
  text: string;
}

export const getAddSuggestions = async (
  authorizationObject: string,
  field: string,
  clientName: string,
  systemName: string
): Promise<AddSuggestion[]> => {
  const response = await fetch(
    `${API_BASE_URL}/simulator/get-add-suggestions/?authorization_object=${encodeURIComponent(authorizationObject)}&field=${encodeURIComponent(field)}&client_name=${encodeURIComponent(clientName)}&system_name=${encodeURIComponent(systemName)}`
  );

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};

// Add this to your simulation_api.ts file
export interface CreateSimulationTableResponse {
  status: string;
  message: string;
  table_name: string;
  records_copied?: number;
}
export async function createSimulationTable(
  clientName: string,
  systemName: string,
  systemReleaseInfo: string
): Promise<CreateSimulationTableResponse> {
  // Create URL with query parameters
  const url = new URL(`${API_BASE_URL}/data/create-role-obj-lic-simulation-table`);
  url.searchParams.append('client_name', clientName);
  url.searchParams.append('system_name', systemName);
  url.searchParams.append('system_release_info', systemReleaseInfo);

  const response = await fetch(url.toString(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    // Remove the body since we're using query parameters
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Failed to create simulation table: HTTP status ${response.status}`);
  }

  return response.json();
}