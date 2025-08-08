
const API_BASE_URL = "http://127.0.0.1:8000";

export const getLogFiles = async (filename?: string): Promise<any> => {
  console.log("🌐 getLogFiles called with filename:", filename);
  
  let url = `${API_BASE_URL}/logs/`;
  if (filename && filename.trim() !== '') {
    url += `?filename=${encodeURIComponent(filename.trim())}`;
  }
  
  console.log("📡 Making request to:", url);

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log("📬 Response status:", response.status);
    console.log("📬 Response headers:", response.headers.get('content-type'));

    // Check if response is JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const textResponse = await response.text();
      console.error("🔥 Non-JSON Response:", textResponse);
      throw new Error(`Server returned non-JSON response. Status: ${response.status}`);
    }

    const data = await response.json();
    console.log("📋 Response data:", data);

    if (!response.ok) {
      throw new Error(data.detail || "An unexpected error occurred while fetching log files.");
    }

    return data;
  } catch (error) {
    console.error("🔥 API Error:", error);
    throw error;
  }
};


export const getCurrentLogLevel = async () => {
  console.log("🌐 getCurrentLogLevel called");
  
  const url = `${API_BASE_URL}/logs/level`;
  console.log("📡 Making request to:", url);

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log("📬 Response status:", response.status);
    console.log("📬 Response headers:", response.headers.get('content-type'));

    // Check if response is JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const textResponse = await response.text();
      console.error("🔥 Non-JSON Response:", textResponse.substring(0, 200) + '...');
      throw new Error(`Server returned HTML instead of JSON. Is your FastAPI server running on ${API_BASE_URL}?`);
    }

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      throw new Error(errorData.detail || errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("📋 Log level data:", data);
    return data;
  } catch (error) {
    console.error('🔥 Error fetching current log level:', error);
    throw error;
  }
};

/**
 * Update the logging level
 * @param logLevel - The log level to set
 * @returns Promise with update result
 */
export const updateLogLevel = async (logLevel: string) => {
  console.log("🌐 updateLogLevel called with:", logLevel);
  
  const url = `${API_BASE_URL}/logs/level`;
  console.log("📡 Making request to:", url);

  try {
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ log_level: logLevel }),
    });

    console.log("📬 Response status:", response.status);
    console.log("📬 Response headers:", response.headers.get('content-type'));

    // Check if response is JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const textResponse = await response.text();
      console.error("🔥 Non-JSON Response:", textResponse.substring(0, 200) + '...');
      throw new Error(`Server returned HTML instead of JSON. Is your FastAPI server running on ${API_BASE_URL}?`);
    }

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      throw new Error(errorData.detail || errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("📋 Update result:", data);
    return data;
  } catch (error) {
    console.error('🔥 Error updating log level:', error);
    throw error;
  }
};


export const deleteOldLogFiles = async (days: number): Promise<{
  message: string;
  deleted_files: Array<{
    filename: string;
    size_bytes: number;
    size_human: string;
    date_created: string;
    age_days: number;
  }>;
  deleted_count: number;
  total_size_freed_bytes: number;
  total_size_freed_human: string;
  cutoff_date: string;
  errors?: string[];
}> => {
  console.log("🌐 deleteOldLogFiles called with days:", days);
  
  if (isNaN(days) || days <= 0) {
    throw new Error("Number of days must be a positive integer.");
  }

  const url = `${API_BASE_URL}/logs/delete-old-logs/?days=${days}`;
  console.log("📡 Making request to:", url);

  try {
    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log("📬 Response status:", response.status);
    console.log("📬 Response headers:", response.headers.get('content-type'));

    // Check if response is JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const textResponse = await response.text();
      console.error("🔥 Non-JSON Response:", textResponse.substring(0, 200) + '...');
      throw new Error(`Server returned HTML instead of JSON. Is your FastAPI server running on ${API_BASE_URL}?`);
    }

    const data = await response.json();
    console.log("📋 Response data:", data);

    if (!response.ok) {
      throw new Error(data.detail || "An unexpected error occurred while deleting log files.");
    }

    return data;
  } catch (error) {
    console.error("🔥 API Error:", error);
    throw error;
  }
};

/**
 * Download a specific log file
 * @param filename - Name of the log file to download
 * @returns Promise that resolves when download starts
 */
export const downloadLogFile = async (filename: string): Promise<void> => {
  console.log("🌐 downloadLogFile called with filename:", filename);
  
  if (!filename || filename.trim() === '') {
    throw new Error("Filename is required for download");
  }
  
  const url = `${API_BASE_URL}/logs/download/${encodeURIComponent(filename.trim())}`;
  console.log("📡 Making request to:", url);

  try {
    const response = await fetch(url, {
      method: "GET",
    });

    console.log("📬 Response status:", response.status);

    if (!response.ok) {
      // For download endpoint, error might be JSON
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "An unexpected error occurred while downloading the log file.");
      } else {
        throw new Error(`Download failed with status: ${response.status}`);
      }
    }

    // Create blob and download
    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename.trim();
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(downloadUrl);

    console.log("✅ File download initiated successfully");
  } catch (error) {
    console.error("🔥 Download Error:", error);
    throw error;
  }
};

/**
 * Get log directory statistics
 * @returns Promise with directory statistics
 */
export const getLogDirectoryStats = async (): Promise<{
  directory_exists: boolean;
  directory_path?: string;
  total_files: number;
  total_size_bytes: number;
  total_size_human: string;
  oldest_file?: {
    filename: string;
    date: string;
    age_days: number;
  };
  newest_file?: {
    filename: string;
    date: string;
    age_days: number;
  };
  files_by_age: {
    today: number;
    "1-7_days": number;
    "8-30_days": number;
    "31-90_days": number;
    "over_90_days": number;
  };
  average_age_days: number;
}> => {
  console.log("🌐 getLogDirectoryStats called");
  
  const url = `${API_BASE_URL}/logs/stats/`;
  console.log("📡 Making request to:", url);

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log("📬 Response status:", response.status);
    console.log("📬 Response headers:", response.headers.get('content-type'));

    // Check if response is JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const textResponse = await response.text();
      console.error("🔥 Non-JSON Response:", textResponse.substring(0, 200) + '...');
      throw new Error(`Server returned HTML instead of JSON. Is your FastAPI server running on ${API_BASE_URL}?`);
    }

    const data = await response.json();
    console.log("📋 Response data:", data);

    if (!response.ok) {
      throw new Error(data.detail || "An unexpected error occurred while fetching directory stats.");
    }

    return data;
  } catch (error) {
    console.error("🔥 API Error:", error);
    throw error;
  }
};