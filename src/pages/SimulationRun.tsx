
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Plus, Calendar, TrendingUp, TrendingDown, Search, Loader2, AlertCircle } from "lucide-react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import Layout from "@/components/Layout";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  fetchClients,
  fetchSystemsByClient,
} from "@/api/data_post";

import { getSimulationResults } from "../api/result_save";
import { getLicenseClassificationPivotTable } from '../api/simulation_api'

const SimulationRun = () => {
  const [clientsList, setClientsList] = useState<string[]>([]);
  const [systemsList, setSystemsList] = useState<string[]>([]);
  const [selectedClient, setSelectedClient] = useState<string>("");
  const [selectedSystem, setSelectedSystem] = useState<string>("");
  const [simulations, setSimulations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [actualFue, setActualFue] = useState(null);
  const [actualFueLoading, setActualFueLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const loadClients = async () => {
      try {
        const clients = await fetchClients();
        setClientsList(clients);
        if (clients.length > 0) {
          const params = new URLSearchParams(location.search);
          const clientFromUrl = params.get('client');
          if (clientFromUrl && clients.includes(clientFromUrl)) {
            setSelectedClient(clientFromUrl);
          } else {
            setSelectedClient(clients[0]);
          }
        }
      } catch (error: any) {
        console.error("Error fetching clients:", error);
        setError(`Failed to load clients: ${error.message}`);
      }
    };

    loadClients();
  }, [location.search]); 

  useEffect(() => {
    const loadSystems = async () => {
      if (selectedClient) {
        setSystemsList([]);
        setSelectedSystem("");
        try {
          const systems = await fetchSystemsByClient(selectedClient);
          setSystemsList(systems);
          if (systems.length > 0) {
            const params = new URLSearchParams(location.search);
            const systemFromUrl = params.get('system');
            if (systemFromUrl && systems.includes(systemFromUrl)) {
              setSelectedSystem(systemFromUrl);
            } else {
              setSelectedSystem(systems[0]);
            }
          }
        } catch (error: any) {
          console.error("Error fetching systems:", error);
          setError(`Failed to load systems for ${selectedClient}: ${error.message}`);
        }
      } else {
        setSystemsList([]);
        setSelectedSystem("");
      }
    };

    loadSystems();
  }, [selectedClient, location.search]);

  const fetchActualFue = async () => {
    if (!selectedClient || !selectedSystem) return null;

    setActualFueLoading(true);

    try {
      const data = await getLicenseClassificationPivotTable(selectedClient, selectedSystem);
      const totalFue = data.fue_summary["Total FUE Required"];
      setActualFue(totalFue);
      return totalFue; // Return the fetched value
    } catch (err) {
      console.error("Error fetching actual FUE:", err);
      return null;
    } finally {
      setActualFueLoading(false);
    }
  };

  const fetchSimulationResults = async (currentActualFue = null) => {
    if (!selectedClient || !selectedSystem) {
      setError("Please enter both client name and system name");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const apiResponse = await getSimulationResults(selectedClient, selectedSystem);
      const resultsData = apiResponse.results;
      const resultsArray = Array.isArray(resultsData) ? resultsData : (resultsData ? [resultsData] : []);

      const transformedSimulations = resultsArray.map((result) => {
        let date;
        if (result.timestamp && typeof result.timestamp === 'string') {
          try {
            date = new Date(result.timestamp.replace(' ', 'T'));
          } catch (error) {
            console.warn(`Invalid timestamp format simulation run ID ${result.simulation_run_id}: ${result.timestamp}`, error);
            date = new Date();
          }
        } else {
          console.warn(`Missing or invalid timestamp in simulation run ID ${result.simulation_run_id}:`, result.timestamp);
          date = new Date();
        }

        // Use the passed actualFue value, or fall back to the state value, or default
        const actualFueValue = currentActualFue || actualFue || (result.simulation_results?.fue_summary?.["Total FUE Required"]) || 306;
        const simulationFue = typeof result.fue_required === 'string' ? parseFloat(result.fue_required) : result.fue_required || 0;

        return {
          id: `${selectedClient}-${selectedSystem}-${result.simulation_run_id}`,
                    name: result.simulation_run_id,

          date: date.toISOString().split('T')[0],
          time: date.toTimeString().split(' ')[0].substring(0, 5),
          simulationFue: simulationFue,
          actualFue: actualFueValue,
          savings: actualFueValue - simulationFue,
          status: "Completed",
          timestamp: result.timestamp,
          changes: result.changes,
          summary: result.summary,
          simulationResults: result.simulation_results,
          simulation_run_id: result.simulation_run_id 
        };
      });

      setSimulations(transformedSimulations);
    } catch (err) {
      console.error("Error fetching simulation results:", err);
      setError(`Error fetching simulation results: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Modified useEffect to ensure proper sequencing
  useEffect(() => {
    const loadData = async () => {
      if (selectedClient && selectedSystem) {
        // First fetch actual FUE and wait for it
        const fetchedActualFue = await fetchActualFue();
        // Then fetch simulation results with the correct actualFue value
        await fetchSimulationResults(fetchedActualFue);
      } else {
        setSimulations([]);
        setActualFue(null);
        setError("");
      }
    };

    loadData();
  }, [selectedClient, selectedSystem]);

  const handleSearch = async () => {
    // For manual search, also ensure proper sequencing
    const fetchedActualFue = await fetchActualFue();
    await fetchSimulationResults(fetchedActualFue);
  };
  const handleViewDetails = (simulation) => {
  navigate(
    `/simulation-details/${encodeURIComponent(selectedClient)}/${encodeURIComponent(selectedSystem)}/${encodeURIComponent(simulation.simulation_run_id)}`,
    { 
      state: { 
        actualFue: actualFue,
        simulationData: simulation 
      } 
    }
  );
};
  
  const getStatusColor = (status) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-800";
      case "Running":
        return "bg-yellow-100 text-yellow-800";
      case "Failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

useEffect(() => {
  if (error) {
    const timer = setTimeout(() => {
      setError("");
    }, 10); // ⏱️ Auto-clear after 4 seconds

    return () => clearTimeout(timer); // 🧹 Cleanup on re-render
  }
}, [error]);

useEffect(() => {
  setError(""); // Clear error when navigating away or returning
}, [location.pathname]);

  return (
    <Layout title="Simulation Run">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center w-full">
              <CardTitle>System Configuration</CardTitle>
              <Link to="/create-simulation" className="flex items-center text-blue-600 hover:text-blue-800">
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Create New Simulation
                </Button>
              </Link>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="client-select">Client Name</Label>
                <Select
                  value={selectedClient}
                  onValueChange={setSelectedClient}
                  disabled={clientsList.length === 0}
                >
                  <SelectTrigger id="client-select">
                    <SelectValue placeholder="Select a Client" />
                  </SelectTrigger>
                  <SelectContent>
                    {clientsList.map((client) => (
                      <SelectItem key={client} value={client}>
                        {client}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="system-select">System Name</Label>
                <Select
                  value={selectedSystem}
                  onValueChange={setSelectedSystem}
                  disabled={!selectedClient || systemsList.length === 0}
                >
                  <SelectTrigger id="system-select">
                    <SelectValue placeholder={selectedClient ? "Select a System" : "Select Client first"} />
                  </SelectTrigger>
                  <SelectContent>
                    {systemsList.map((system) => (
                      <SelectItem key={system} value={system}>
                        {system}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="mt-4 flex gap-2 items-center">
              <Button onClick={handleSearch} disabled={loading || !selectedClient || !selectedSystem}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Search className="h-4 w-4 mr-2" />}
                Load Simulation Results
              </Button>
              {actualFueLoading && (
                <div className="flex items-center text-sm text-gray-600">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Loading actual FUE...
                </div>
              )}
            </div>
            {error && (
              <div className="mt-2 flex items-center text-sm text-red-600">
                <AlertCircle className="h-4 w-4 mr-2" />
                {error}
              </div>
            )}
          </CardContent>
        </Card>

        {simulations.length === 0 && !loading && (
          <div className="text-center py-8 text-gray-500">
            {selectedClient && selectedSystem ? "No simulation results found" : "Please enter client and system name to load simulation results"}
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {simulations.map((simulation) => (
            <Card key={simulation.id} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{simulation.name}</CardTitle>
                  <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(simulation.status)}`}>
                    {simulation.status}
                  </span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="h-4 w-4 mr-1" />
                  {simulation.date} at {simulation.time}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Simulation FUE:</span>
                    <span className="font-medium">{simulation.simulationFue}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Actual FUE:</span>
                    <span className="font-medium">
                      {actualFueLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        simulation.actualFue
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Potential Savings:</span>
                    <div className="flex items-center gap-1">
                      {simulation.savings > 0 ? (
                        <>
                          <TrendingDown className="h-4 w-4 text-green-600" />
                          <span className="font-medium text-green-600">
                            {simulation.savings} FUE
                          </span>
                        </>
                      ) : (
                        <>
                          <TrendingUp className="h-4 w-4 text-red-600" />
                          <span className="font-medium text-red-600">
                            {Math.abs(simulation.savings)} FUE
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => handleViewDetails(simulation)}
                  >
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default SimulationRun;