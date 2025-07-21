import axios from "axios";

const API_BASE_URL = "http://localhost:8000";

export const fetchUserGroups = async (client_name: string, system_id: string) => {
  try {
    const url = new URL(`${API_BASE_URL}/user_level/user-group`);
    url.searchParams.append('client_name', client_name);
    url.searchParams.append('system_id', system_id);

    const response = await fetch(url.toString()); 

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to fetch user groups");
    }

    const data = await response.json();
    return data.map((item: { user_groups: string }) => item.user_groups);

  } catch (error: any) {
    console.error("Error fetching user groups:", error); 
    throw error;
  }
};



export const fetchLicenseByUserGroups = async (
  client_name: string, 
  system_id: string,
  user_group_name: string 
) => {
  try {
    const url = new URL(`${API_BASE_URL}/user_level/user-group/${encodeURIComponent(user_group_name)}/licenses`);
    url.searchParams.append('client_name', client_name);
    url.searchParams.append('system_id', system_id);

    const response = await fetch(url.toString());

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || `Failed to fetch license types for user group ${user_group_name}`);
    }

    const data = await response.json();
    return data.map((item: { license_types: string }) => item.license_types); 
  } catch (error: any) {
    console.error(`Error fetching license types for user group ${user_group_name}:`, error); 
    throw error;
  }
};


