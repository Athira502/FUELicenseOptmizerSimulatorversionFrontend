
const API_BASE_URL = "http://127.0.0.1:8000"; 

export const deleteOldDbLogs = async (days: number): Promise<{ message: string }> => {
  console.log("🌐 deleteOldDbLogs called with days:", days);
  
  if (isNaN(days) || days <= 0) {
    throw new Error("Number of days must be a positive integer.");
  }

  const url = `${API_BASE_URL}/logs/delete-old-db-logs/?days=${days}`;
  console.log("📡 Making request to:", url);

  try {
    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log("📬 Response status:", response.status);

    const data = await response.json();
    console.log("📋 Response data:", data);

    if (!response.ok) {
      throw new Error(data.detail || "An unexpected error occurred while deleting logs.");
    }

    return data;
  } catch (error) {
    console.error("🔥 API Error:", error);
    throw error;
  }
};