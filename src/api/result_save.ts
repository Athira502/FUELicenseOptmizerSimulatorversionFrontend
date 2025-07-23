const API_BASE_URL = "http://127.0.0.1:8000"; 

export const runSimulation = async (
  clientName: string,
  systemName: string
): Promise<any> => {
  try {
    const url = new URL(`${API_BASE_URL}/simulation_result/run-simulation/`);
    url.searchParams.append('client_name', clientName);
    url.searchParams.append('system_name', systemName);

    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to run simulation');
    }

    return await response.json();
  } catch (error) {
    console.error('Error running simulation:', error);
    throw error;
  }
};


export const getSimulationResults = async (
  clientName: string,
  systemName: string
): Promise<any> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/simulation_result/simulation-results/?client_name=${encodeURIComponent(clientName)}&system_name=${encodeURIComponent(systemName)}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.log("got the result of recent simulation run");
      throw new Error(errorData.detail || 'Failed to fetch simulation results');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching simulation results:', error);
    throw error;
  }
};


export const getSimulationLicenseClassificationPivotTable = async (
  clientName: string,
  systemName: string
): Promise<any> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/simulation_result/license-classification-pivot-table/?client_name=${encodeURIComponent(clientName)}&system_name=${encodeURIComponent(systemName)}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to fetch license classification pivot table');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching license classification pivot table:', error);
    throw error;
  }
};

// Types for simulation results
export interface SimulationResult {
  simulation_run_id: string;
  timestamp: string;
  fue_required: string;
  changes: SimulationChange[];
  summary?: {
    total_fue: string;
    gb_fue: string;
    gc_fue: string;
  };
}

export interface SimulationChange {
  id:number,
  role: string;
  object: string;
  field: string;
  value_low: string;
  value_high: string;
  operation: string;
  prev_license: string;
  current_license: string;
}

export interface SimulationRunResponse {
  simulation_run_id:string;
  message: string;
  simulation_results: {
    pivot_table: {
      Users: {
        "GB Advanced Use": number;
        "GC Core Use": number;
        "GD Self-Service Use": number;
        "Total": number;
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
  };
  saved_changes: number;
  fue_required: number;
  timestamp: string;
  client_name: string;
  system_name: string;
  cleanup_completed: boolean;
}


