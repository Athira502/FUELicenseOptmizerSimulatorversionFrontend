import axios from "axios";


const API_BASE_URL = "http://localhost:8000"; 

export const uploadLicenseData = async (
  clientName: string,
  systemName: string,
  systemReleaseInfo:string,
  file: File
) => {
  const formData = new FormData();
  formData.append("xml_file", file); 

  const response = await fetch(
    `${API_BASE_URL}/data/load-license-data?client_name=${clientName}&system_name=${systemName}&system_release_info=${systemReleaseInfo}`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to upload license data");
  }

  return await response.json();
};


export const uploadAuthData = async (
  clientName: string,
  systemName: string,
  systemReleaseInfo:string,
  file: File
) => {
  const formData = new FormData();
  formData.append("csv_file", file); 

  const response = await fetch(
    `${API_BASE_URL}/data/load-auth-data?client_name=${clientName}&system_name=${systemName}&system_release_info=${systemReleaseInfo}`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to upload auth data");
  }

  return await response.json();
};





export const uploadRoleFioriMapData = async (
  clientName: string,
  systemName: string,
  systemReleaseInfo:string,
  file: File
) => {
  const formData = new FormData();
  formData.append("csv_file", file); 

  const response = await fetch(
    `${API_BASE_URL}/data/load-role-fiori-map-data?client_name=${clientName}&system_name=${systemName}&system_release_info=${systemReleaseInfo}`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to upload fiori role map data");
  }

  return await response.json();
};




export const uploadMasterDerivedData = async (
  clientName: string,
  systemName: string,
  systemReleaseInfo:string,
  file: File
) => {
  const formData = new FormData();
  formData.append("csv_file", file); 

  const response = await fetch(
    `${API_BASE_URL}/data/load-master-derived-role-data?client_name=${clientName}&system_name=${systemName}&system_release_info=${systemReleaseInfo}`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to upload master derived role  data");
  }

  return await response.json();
};


export const uploadUserData = async (
  clientName: string,
  systemName: string,
  systemReleaseInfo:string,
  file: File
) => {
  const formData = new FormData();
  formData.append("csv_file", file); 
  const response = await fetch(
    `${API_BASE_URL}/data/load-user-data?client_name=${clientName}&system_name=${systemName}&system_release_info=${systemReleaseInfo}`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to upload user data");
  }

  return await response.json();
};


export const uploadUserRoleMapData = async (
  clientName: string,
  systemName: string,
  systemReleaseInfo:string,
  file: File
) => {
  const formData = new FormData();
  formData.append("csv_file", file); 

  const response = await fetch(
    `${API_BASE_URL}/data/load-user-role-map-data?client_name=${clientName}&system_name=${systemName}&system_release_info=${systemReleaseInfo}`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to upload user role map data");
  }

  return await response.json();
};


export const uploadUserRoleMappingData = async (
  clientName: string,
  systemName: string,
  systemReleaseInfo:string,
  file: File
) => {
  const formData = new FormData();
  formData.append("csv_file", file); 

  const response = await fetch(
    `${API_BASE_URL}/data/load-user-role-mapping-data?client_name=${clientName}&system_name=${systemName}&system_release_info=${systemReleaseInfo}`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to upload user role map data");
  }

  return await response.json();
};

export const uploadRoleLicenseSummaryData = async (
  clientName: string,
  systemName: string,
  systemReleaseInfo:string,
  file: File
) => {
  const formData = new FormData();
  formData.append("csv_file", file); 

  const response = await fetch(
    `${API_BASE_URL}/data/load-role-lic-summary-data?client_name=${clientName}&system_name=${systemName}&system_release_info=${systemReleaseInfo}`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to upload user role map data");
  }

  return await response.json();
};



export const uploadObjectFieldLicenseData = async (
  clientName: string,
  systemName: string,
  systemReleaseInfo:string,
  file: File
) => {
  const formData = new FormData();
  formData.append("csv_file", file); 

  const response = await fetch(
    `${API_BASE_URL}/data/load-auth-obj-field-lic-data?client_name=${clientName}&system_name=${systemName}&system_release_info=${systemReleaseInfo}`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to upload user role map data");
  }

  return await response.json();
};




export const fetchClients = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/manage-data/clients`);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to fetch clients");
    }
    const data = await response.json();
    return data.map((item: { client_name: string }) => item.client_name);
  } catch (error: any) {
    console.error("Error fetching clients:", error);
    throw error;
  }
};

export const fetchSystemsByClient = async (clientId: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/manage-data/systems/${clientId}`);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || `Failed to fetch systems for client ${clientId}`);
    }
    const data = await response.json();
    return data.map((item: { system_name: string }) => item.system_name);
  } catch (error: any) {
    console.error(`Error fetching systems for client ${clientId}:`, error);
    throw error;
  }
};



export const downloadTableData = async (clientId: string, systemId: string, tableName: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/manage-data/download/${clientId}/${systemId}/${tableName}`);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || `Failed to download ${tableName} for ${clientId} - ${systemId}`);
    }
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${tableName}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  } catch (error: any) {
    console.error(`Error downloading ${tableName} for ${clientId} - ${systemId}:`, error);
    throw error;
  }
};

export const truncateTableData = async (clientId: string, systemId: string, tableName: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/manage-data/delete/${clientId}/${systemId}/${tableName}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || `Failed to delete ${tableName} for ${clientId} - ${systemId}`);
    }
    return await response.json();
  } catch (error: any) {
    console.error(`Error deleting ${tableName} for ${clientId} - ${systemId}:`, error);
    throw error;
  }
};

export const fetchTablesForClientSystem = async (clientId: string, systemId: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/manage-data/tables/${clientId}/${systemId}`);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || `Failed to fetch tables for ${clientId} - ${systemId}`);
    }
    return await response.json();
  } catch (error: any) {
    console.error(`Error fetching tables for ${clientId} - ${systemId}:`, error);
    throw error;
  }
};

export const fetchLogs = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/data/latest-log`);

    if (!response.ok) {
      const errorData = await response.json();
      const errorMessage = errorData?.detail || `Failed to fetch logs: ${response.statusText}`;
      throw new Error(errorMessage);
    }

    const logs = await response.json();
    console.log(logs)
    return logs; 
  } catch (error: any) {
    console.error("Error retrieving logs:", error);
    throw new Error(error.message || "Internal server error");
  }
};


export async function fetchLogFilenames(): Promise<string[]> {
    try {
        const response = await axios.get(`${API_BASE_URL}/logs`);
        if (response.data && Array.isArray(response.data.files)) {
            return response.data.files;
        } else if (response.data && response.data.message) {
            return [];
        }
        throw new Error("Invalid response format: 'files' array not found.");
    } catch (error) {
        console.error("Error fetching log filenames:", error);
        throw error;
    }
}


export async function fetchLogContent(filename: string): Promise<string> {
    try {
        const response = await axios.get(`${API_BASE_URL}/logs`, {
            params: { filename: filename } 
        });
        if (response.data && typeof response.data.content === 'string') {
            return response.data.content;
        }
        throw new Error("Invalid response format: 'content' not found or not a string.");
    } catch (error) {
        console.error(`Error fetching content for ${filename}:`, error);
        throw error;
    }
}



export const downloadLogFile = async (filename) => {
    try {
        const response = await fetch(`${API_BASE_URL}/logs/download/${encodeURIComponent(filename)}`, {
            method: 'GET',
           
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
        }

        // Get the filename from the response headers or use the provided filename
        const contentDisposition = response.headers.get('Content-Disposition');
        let downloadFilename = filename;
                
        if (contentDisposition) {
            const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
            if (filenameMatch && filenameMatch[1]) {
                downloadFilename = filenameMatch[1].replace(/['"]/g, '');
            }
        }

        // Create blob and download
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = downloadFilename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        return { success: true, filename: downloadFilename };
    } catch (error) {
        console.error('Download failed:', error);
        throw new Error(`Failed to download log file: ${error.message}`);
    }
};
