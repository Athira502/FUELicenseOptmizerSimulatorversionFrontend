

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Calendar, TrendingUp, TrendingDown, Search, Loader2, AlertCircle } from "lucide-react";
import { useNavigate, useLocation, Link } from "react-router-dom"; // Import useNavigate and useLocation
import Layout from "@/components/Layout";

import { getSimulationResults } from "../api/result_save";
import { getLicenseClassificationPivotTable } from '../api/simulation_api'

const SimulationRun = () => {
  const [clientName, setClientName] = useState("");
  const [systemName, setSystemName] = useState("");
  const [simulations, setSimulations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [actualFue, setActualFue] = useState(null);
  const [actualFueLoading, setActualFueLoading] = useState(false);

  const navigate = useNavigate(); // Initialize the navigate hook
  const location = useLocation(); // Initialize useLocation to read query params

  // Effect to read clientName and systemName from URL query parameters on initial load
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const client = params.get('client');
    const system = params.get('system');
    if (client) {
      setClientName(client);
    }
    if (system) {
      setSystemName(system);
    }
  }, [location.search]); // Rerun if the search part of the URL changes


  const fetchSimulationResults = async () => {
    if (!clientName || !systemName) {
      setError("Please enter both client name and system name");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const apiResponse = await getSimulationResults(clientName, systemName); // Get the full API response

      const resultsData = apiResponse.results;

      
      const resultsArray = Array.isArray(resultsData) ? resultsData : (resultsData ? [resultsData] : []); // Handle cases where resultsData might be null/undefined

      const transformedSimulations = resultsArray.map((result) => {
        let date;
        if (result.timestamp && typeof result.timestamp === 'string') {
          try {
            date = new Date(result.timestamp.replace(' ', 'T'));
          } catch (error) {
            console.warn(`Invalid timestamp format simulation run ID ${result.simulation_run_id}: ${result.timestamp}`, error);
            date = new Date(); // Fallback to current date
          }
        } else {
          console.warn(`Missing or invalid timestamp in simulation run ID ${result.simulation_run_id}:`, result.timestamp);
          date = new Date(); // Fallback to current date
        }

        const currentActualFue = actualFue || (result.simulation_results?.fue_summary?.["Total FUE Required"]) || 306;
        const simulationFue = typeof result.fue_required === 'string' ? parseFloat(result.fue_required) : result.fue_required || 0;

        return {
         
          id: `${clientName}-${systemName}-${result.simulation_run_id}`, // This will be used as the React key
          name: `Simulation Run ${result.simulation_run_id}`,
          date: date.toISOString().split('T')[0],
          time: date.toTimeString().split(' ')[0].substring(0, 5),
          simulationFue: simulationFue,
          actualFue: currentActualFue,
          savings: currentActualFue - simulationFue,
          status: "Completed",
          timestamp: result.timestamp, // Keep the original timestamp string for navigation
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

  const fetchActualFue = async () => {
    if (!clientName || !systemName) return;

    setActualFueLoading(true);

    try {
      const data = await getLicenseClassificationPivotTable(clientName, systemName);
      const totalFue = data.fue_summary["Total FUE Required"];
      setActualFue(totalFue);

      // Update existing simulations with actual FUE
      setSimulations(prev => prev.map(sim => ({
        ...sim,
        actualFue: totalFue,
        savings: totalFue - sim.simulationFue
      })));
    } catch (err) {
      console.error("Error fetching actual FUE:", err);
      // Don't set this as a main error since it's not critical for the main functionality
      // You could add a separate state for FUE-specific errors if needed
    } finally {
      setActualFueLoading(false);
    }
  };

  // Fetch actual FUE when client/system changes
  useEffect(() => {
    if (clientName && systemName) {
      fetchActualFue();
    }
  }, [clientName, systemName]);

  const handleSearch = () => {
    fetchSimulationResults();
  };

  const handleViewDetails = (simulation) => {
    
    navigate(`/simulation-details/${encodeURIComponent(clientName)}/${encodeURIComponent(systemName)}/${encodeURIComponent(simulation.simulation_run_id)}`);
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

  return (

    <Layout title="Simulation Run">
       

        <div className="space-y-6">
          <Card>
            {/* <CardHeader>
              <CardTitle>System Configuration</CardTitle>
               <div className="flex justify-between items-center">
            <Button className="flex items-right gap-2">
              <Plus className="h-4 w-4" />
              Create New Simulation
            </Button>
          </div>
            </CardHeader> */}
            <CardHeader>
  <div className="flex justify-between items-center w-full"> {/* Added a wrapper div */}
    <CardTitle>System Configuration</CardTitle>
    <Link to="/create-simulation" className="flex items-center text-blue-600 hover:text-blue-800"> 

    <Button className="flex items-center gap-2" > {/* Removed items-right as justify-between handles alignment */}
      <Plus className="h-4 w-4" />
      Create New Simulation
    </Button>
    </Link> 

  </div>
</CardHeader>

           
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="clientName">Client Name</Label>
                  <Input
                    id="clientName"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="Enter client name"
                  />
                </div>
                <div>
                  <Label htmlFor="systemName">System Name</Label>
                  <Input
                    id="systemName"
                    value={systemName}
                    onChange={(e) => setSystemName(e.target.value)}
                    placeholder="Enter system name"
                  />
                </div>
              </div>
              <div className="mt-4 flex gap-2 items-center">
                <Button onClick={handleSearch} disabled={loading || !clientName || !systemName}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Search className="h-4 w-4 mr-2" />}
                  Load Simulation Results
                </Button>
                {actualFueLoading && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Loading actual FUE...
                  </div>
                )}
                {actualFue && !actualFueLoading && (
                  <div className="flex items-center text-sm text-gray-600">
                    Current FUE: <span className="font-semibold ml-1">{actualFue}</span>
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

          {/* <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium">Simulation Runs</h2>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create New Simulation
            </Button>
          </div> */}

          {simulations.length === 0 && !loading && (
            <div className="text-center py-8 text-gray-500">
              {clientName && systemName ? "No simulation results found" : "Please enter client and system name to load simulation results"}
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