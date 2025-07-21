

// import React, { useState, useEffect } from "react";
// import { useParams, Link } from "react-router-dom";
// import Layout from "@/components/Layout";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import { ArrowLeft, Calendar, TrendingUp, TrendingDown, Loader2, AlertCircle } from "lucide-react";

// import { getSimulationResults, SimulationRunResponse, SimulationChange,getSimulationLicenseClassificationPivotTable } from "../api/result_save"; // Assuming result_save.ts contains these
// import { getLicenseClassificationPivotTable, PivotTableResponse } from '../api/simulation_api'; // For fetching actual FUE

// interface TransformedSimulation {
//   id: string;
//   name: string;
//   date: string;
//   time: string;
//   simulationFue: number;
//   actualFue: number | null; // Can be null while loading or if not found
//   savings: number | null; // Can be null initially
//   status: string;
//   changes: RoleGroupedChange[]; // Use the new grouped changes structure
//   summary?: {
//     total_fue: string;
//     gb_fue: string;
//     gc_fue: string;
//   };
//   simulationResults?: any; // Keep this if you need to pass raw simulation results
// }

// // Define an interface for the grouped changes
// interface RoleGroupedChange {
//   roleId: string;
//   roleDescription: string;
//   currentLicense: string;
//   simulatedLicense: string;
//   changes: {
//     id: number;
//     authObject: string;
//     field: string;
//     valueLow: string;
//     valueHigh: string;
//     operation: string;
//   }[];
// }

// const SimulationDetails = () => {
//   const { clientName, systemName, simulationRunId } = useParams<{ clientName: string; systemName: string; simulationRunId: string  }>(); // Get all params
//   const [simulation, setSimulation] = useState<TransformedSimulation | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [actualFue, setActualFue] = useState<number | null>(null);
//   const [actualFueLoading, setActualFueLoading] = useState(false);

//   // Helper to group changes by role, similar to your mock data structure
//   const groupChangesByRole = (changes: SimulationChange[] | undefined): RoleGroupedChange[] => {
//     if (!changes) return [];

//     const grouped: { [key: string]: RoleGroupedChange } = {};

//     changes.forEach((change, index) => {
//       const roleIdentifier = change.role || "Unknown Role"; // Use role as identifier
      
//       if (!grouped[roleIdentifier]) {
//         grouped[roleIdentifier] = {
//           roleId: roleIdentifier,
//           roleDescription: roleIdentifier, // You might want a lookup for actual description if available
//           currentLicense: change.prev_license || "N/A",
//           simulatedLicense: change.current_license || "Removed", // Or some other default for null
//           changes: [],
//         };
//       }

//       grouped[roleIdentifier].changes.push({
//         id:  change.id || index + 1, // Simple unique ID for key
//         authObject: change.object,
//         field: change.field,
//         valueLow: change.value_low,
//         valueHigh: change.value_high || "", // Ensure it's not null/undefined for display
//         operation: change.operation,
//       });
//     });

//     return Object.values(grouped);
//   };

//   // Fetch actual FUE when client/system changes or on initial load
//   useEffect(() => {
//     const fetchActualFue = async () => {
//       if (!clientName || !systemName) return;

//       setActualFueLoading(true);
//       try {
//         const data: PivotTableResponse = await getLicenseClassificationPivotTable(clientName, systemName);
//         const totalFue = data.fue_summary?.["Total FUE Required"];
//         if (totalFue !== undefined) {
//           setActualFue(totalFue);

//           // If simulation data is already loaded, update its actualFue and savings
//           setSimulation(prevSim => {
//             if (prevSim) {
//               const newSavings = totalFue - prevSim.simulationFue;
//               return {
//                 ...prevSim,
//                 actualFue: totalFue,
//                 savings: newSavings
//               };
//             }
//             return prevSim;
//           });
//         }
//       } catch (err) {
//         console.error("Error fetching actual FUE:", err);
//         // Do not set global error for this, as it's a secondary fetch
//       } finally {
//         setActualFueLoading(false);
//       }
//     };

//     fetchActualFue();
//   }, [clientName, systemName]); // Depend on clientName and systemName

//   useEffect(() => {
//     const fetchSimulationDetails = async () => {
//       if (!clientName || !systemName || !simulationRunId) {
//         setError("Missing client name, system name, or id in URL.");
//         setLoading(false);
//         return;
//       }

//       setLoading(true);
//       setError(null);

//       try {
//         // Fetch all simulation results for the client and system
//         const apiResponse = await getSimulationResults(clientName, systemName);

//         // Assuming apiResponse.results is an array of SimulationRunResponse
//         const simulationResultsArray = Array.isArray(apiResponse.results) ? apiResponse.results : [];

//         // Find the specific simulation by timestamp
//         // const foundSimulation = simulationResultsArray.find(
//         //   (sim: SimulationRunResponse) => sim.timestamp === timestamp
//         // );
//         const foundSimulation = simulationResultsArray.find(
//   (sim: SimulationRunResponse) => String(sim.simulation_run_id) === decodeURIComponent(simulationRunId)
// );

//         if (foundSimulation) {
//           let date;
//           try {
//             date = new Date(foundSimulation.timestamp.replace(' ', 'T'));
//           } catch (e) {
//             console.warn(`Invalid timestamp format for found simulation: ${foundSimulation.timestamp}`, e);
//             date = new Date(); // Fallback
//           }

//           const simulationFue = typeof foundSimulation.fue_required === 'string'
//             ? parseFloat(foundSimulation.fue_required)
//             : foundSimulation.fue_required || 0;

//           const currentActualFue = actualFue !== null ? actualFue : (foundSimulation.simulation_results?.fue_summary?.["Total FUE Required"]) || 306;
//           const savings = currentActualFue - simulationFue;

//           setSimulation({
//             id: simulationRunId, // Use timestamp as ID for uniqueness in this view
//             name: `Simulation Run ${foundSimulation.simulation_run_id}`, // Better name
//             date: date.toISOString().split('T')[0],
//             time: date.toTimeString().split(' ')[0].substring(0, 5),
//             simulationFue: simulationFue,
//             actualFue: currentActualFue,
//             savings: savings,
//             status: "Completed", // Assuming it's completed if we have results
//             changes: groupChangesByRole(foundSimulation.changes), // Process changes
//           //   summary: foundSimulation.summary,
//           //   simulationResults: foundSimulation.simulation_results,
//           // });
//            summary: {
//                             total_fue: typeof foundSimulation.summary?.total_fue === 'string' ? parseFloat(foundSimulation.summary.total_fue) : (foundSimulation.summary?.total_fue || 0),
//                             gb_fue: typeof foundSimulation.summary?.gb_fue === 'string' ? parseFloat(foundSimulation.summary.gb_fue) : (foundSimulation.summary?.gb_fue || 0),
//                             gc_fue: typeof foundSimulation.summary?.gc_fue === 'string' ? parseFloat(foundSimulation.summary.gc_fue) : (foundSimulation.summary?.gc_fue || 0),
//                         },
//                         simulationResults: foundSimulation.simulation_results, // This seems redundant if 'summary' and 'changes' are already mapped
//                     });
//         } else {
//           setError("Simulation run not found.");
//         }
//       } catch (err: any) {
//         console.error("Error fetching simulation details:", err);
//         setError(`Failed to load simulation details: ${err.message || 'Unknown error'}`);
//       } finally {
//         setLoading(false);
//       }
//     };

//     // Only fetch details if clientName, systemName, and timestamp are available
//     if (clientName && systemName && simulationRunId) {
//       fetchSimulationDetails();
//     }
//   }, [clientName, systemName, simulationRunId, actualFue]); // Re-run if actualFue updates to correctly calculate savings


//   const getOperationBadgeColor = (operation: string) => {
//     switch (operation) {
//       case "Add":
//         return "bg-green-100 text-green-800";
//       case "Remove":
//         return "bg-red-100 text-red-800";
//       case "Change":
//         return "bg-blue-100 text-blue-800";
//       default:
//         return "bg-gray-100 text-gray-800";
//     }
//   };

//   if (loading) {
//     return (
//       <Layout title="Loading Simulation Details...">
//         <div className="flex justify-center items-center h-64">
//           <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
//           <span className="ml-3 text-lg text-gray-700">Loading simulation details...</span>
//         </div>
//       </Layout>
//     );
//   }

//   if (error) {
//     return (
//       <Layout title="Error">
//         <div className="flex flex-col items-center justify-center h-64 text-red-600">
//           <AlertCircle className="h-12 w-12 mb-4" />
//           <p className="text-xl font-semibold">{error}</p>
//           <Link to="/simulation-run" className="mt-4 text-blue-600 hover:underline">
//             <Button variant="outline">
//               <ArrowLeft className="mr-2 h-4 w-4" /> Back to Simulation Run
//             </Button>
//           </Link>
//         </div>
//       </Layout>
//     );
//   }

//   if (!simulation) {
//     return (
//       <Layout title="Simulation Not Found">
//         <div className="flex flex-col items-center justify-center h-64 text-gray-600">
//           <p className="text-xl font-semibold">No simulation data available.</p>
//           <Link to="/simulation-run" className="mt-4 text-blue-600 hover:underline">
//             <Button variant="outline">
//               <ArrowLeft className="mr-2 h-4 w-4" /> Back to Simulation Run
//             </Button>
//           </Link>
//         </div>
//       </Layout>
//     );
//   }

//   return (
//     <Layout title="Simulation Details">
//       <div className="space-y-6">
//         <div className="flex items-center justify-between">
//           {/* We need to pass clientName and systemName back to the simulation-run route */}
//           <Link to={`/simulation-run?client=${clientName}&system=${systemName}`} className="flex items-center text-blue-600">
//             <ArrowLeft className="mr-1 h-4 w-4" /> Back to Simulation Run
//           </Link>
//         </div>

//         {/* Simulation Summary */}
//         <Card>
//           <CardHeader>
//             <div className="flex items-center justify-between">
//               <CardTitle className="text-xl">{simulation.name}</CardTitle>
//               <div className="flex items-center text-sm text-gray-600">
//                 <Calendar className="h-4 w-4 mr-1" />
//                 {simulation.date} at {simulation.time}
//               </div>
//             </div>
//           </CardHeader>
//           <CardContent>
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//               <div className="text-center">
//                 <div className="text-2xl font-bold text-blue-600">{simulation.simulationFue}</div>
//                 <div className="text-sm text-gray-600">Simulation FUE</div>
//               </div>
//               <div className="text-center">
//                 <div className="text-2xl font-bold text-gray-800">
//                   {actualFueLoading ? <Loader2 className="h-6 w-6 animate-spin mx-auto" /> : simulation.actualFue}
//                 </div>
//                 <div className="text-sm text-gray-600">Actual FUE</div>
//               </div>
//               <div className="text-center">
//                 <div className="flex items-center justify-center gap-2">
//                   {simulation.savings !== null && simulation.savings > 0 ? (
//                     <>
//                       <TrendingDown className="h-5 w-5 text-green-600" />
//                       <span className="text-2xl font-bold text-green-600">
//                         {simulation.savings} FUE
//                       </span>
//                     </>
//                   ) : (
//                     simulation.savings !== null && (
//                       <>
//                         <TrendingUp className="h-5 w-5 text-red-600" />
//                         <span className="text-2xl font-bold text-red-600">
//                           {Math.abs(simulation.savings)} FUE
//                         </span>
//                       </>
//                     )
//                   )}
//                 </div>
//                 <div className="text-sm text-gray-600">Potential Savings</div>
//               </div>
//             </div>
//           </CardContent>
//         </Card>

//         {/* Changes Made - Hierarchical View */}
//         <Card>
//           <CardHeader>
//             <CardTitle>Changes Made</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="space-y-6">
//               {simulation.changes.length === 0 ? (
//                 <p className="text-gray-500 text-center">No changes recorded for this simulation.</p>
//               ) : (
//                 simulation.changes.map((role) => (
//                   <div key={role.roleId} className="border border-gray-200 rounded-lg p-4">
//                     {/* Role Header */}
//                     <div className="mb-4 pb-3 border-b border-gray-100">
//                       <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
//                         <div>
//                           <h3 className="font-semibold text-lg text-gray-900">{role.roleId}</h3>
//                           <p className="text-sm text-gray-600">{role.roleDescription}</p>
//                         </div>
//                         <div className="flex flex-col md:flex-row gap-4 text-sm">
//                           <div>
//                             <span className="font-medium text-gray-700">Current License: </span>
//                             <span className="text-gray-900">{role.currentLicense}</span>
//                           </div>
//                           <div>
//                             <span className="font-medium text-gray-700">Simulated License: </span>
//                             <span className="text-gray-900">{role.simulatedLicense}</span>
//                           </div>
//                         </div>
//                       </div>
//                     </div>

//                     {/* Changes Table */}
//                     <div className="overflow-x-auto">
//                       <Table>
//                         <TableHeader>
//                           <TableRow>
//                             <TableHead>Authorization Object</TableHead>
//                             <TableHead>Field</TableHead>
//                             <TableHead>Value Low</TableHead>
//                             <TableHead>Value High</TableHead>
//                             <TableHead>Operation</TableHead>
//                           </TableRow>
//                         </TableHeader>
//                         <TableBody>
//                           {role.changes.map((change) => (
//                             <TableRow key={change.id}>
//                               <TableCell className="font-medium">{change.authObject}</TableCell>
//                               <TableCell>{change.field}</TableCell>
//                               <TableCell>{change.valueLow}</TableCell>
//                               <TableCell>{change.valueHigh || "-"}</TableCell>
//                               <TableCell>
//                                 <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getOperationBadgeColor(change.operation)}`}>
//                                   {change.operation}
//                                 </span>
//                               </TableCell>
//                             </TableRow>
//                           ))}
//                         </TableBody>
//                       </Table>
//                     </div>
//                   </div>
//                 ))
//               )}
//             </div>
//           </CardContent>
//         </Card>
//       </div>
//     </Layout>
//   );
// };

// export default SimulationDetails;



import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeft, Calendar, TrendingUp, TrendingDown, Loader2, AlertCircle } from "lucide-react";

import { getSimulationResults, SimulationChange } from "../api/result_save";
import { getLicenseClassificationPivotTable } from '../api/simulation_api';

interface TransformedSimulation {
  id: string;
  name: string;
  date: string;
  time: string;
  simulationFue: number;
  actualFue: number | null;
  savings: number | null;
  status: string;
  changes: RoleGroupedChange[];
  summary?: {
    total_fue: number;
    gb_fue: number;
    gc_fue: number;
  };
}

interface RoleGroupedChange {
  roleId: string;
  roleDescription: string;
  currentLicense: string;
  simulatedLicense: string;
  changes: {
    id: number;
    authObject: string;
    field: string;
    valueLow: string;
    valueHigh: string;
    operation: string;
  }[];
}

const SimulationDetails = () => {
  const { clientName, systemName, simulationRunId } = useParams<{ 
    clientName: string; 
    systemName: string; 
    simulationRunId: string;
  }>();
  
  const [simulation, setSimulation] = useState<TransformedSimulation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actualFue, setActualFue] = useState<number | null>(null);
  const [actualFueLoading, setActualFueLoading] = useState(false);

  // Helper to group changes by role
  const groupChangesByRole = (changes: SimulationChange[] | undefined): RoleGroupedChange[] => {
    if (!changes || changes.length === 0) return [];

    const grouped: { [key: string]: RoleGroupedChange } = {};

    changes.forEach((change, index) => {
      const roleIdentifier = change.role || "Unknown Role";
      
      if (!grouped[roleIdentifier]) {
        grouped[roleIdentifier] = {
          roleId: roleIdentifier,
          roleDescription: roleIdentifier,
          currentLicense: change.prev_license || "N/A",
          simulatedLicense: change.current_license || "Removed",
          changes: [],
        };
      }

      grouped[roleIdentifier].changes.push({
        id: change.id || index + 1,
        authObject: change.object || "N/A",
        field: change.field || "N/A",
        valueLow: change.value_low || "",
        valueHigh: change.value_high || "",
        operation: change.operation || "Unknown",
      });
    });

    return Object.values(grouped);
  };

  // Fetch actual FUE
  useEffect(() => {
    const fetchActualFue = async () => {
      if (!clientName || !systemName) return;

      setActualFueLoading(true);
      try {
        const data = await getLicenseClassificationPivotTable(clientName, systemName);
        const totalFue = data.fue_summary?.["Total FUE Required"];
        if (totalFue !== undefined) {
          setActualFue(totalFue);
        }
      } catch (err) {
        console.error("Error fetching actual FUE:", err);
      } finally {
        setActualFueLoading(false);
      }
    };

    fetchActualFue();
  }, [clientName, systemName]);

  // Fetch simulation details
  useEffect(() => {
    const fetchSimulationDetails = async () => {
      if (!clientName || !systemName || !simulationRunId) {
        setError("Missing client name, system name, or simulation run ID in URL.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        console.log("Fetching simulation details for:", {
          clientName,
          systemName,
          simulationRunId
        });

        const apiResponse = await getSimulationResults(clientName, systemName);
        console.log("API Response:", apiResponse);

        if (!apiResponse.results || apiResponse.results.length === 0) {
          setError("No simulation results found.");
          setLoading(false);
          return;
        }

        // Convert simulationRunId to number for comparison
        const targetRunId = parseInt(simulationRunId);
        console.log("Looking for simulation run ID:", targetRunId);

        const foundSimulation = apiResponse.results.find(
          (sim: any) => {
            console.log("Comparing:", sim.simulation_run_id, "with", targetRunId);
            return sim.simulation_run_id === targetRunId;
          }
        );

        console.log("Found simulation:", foundSimulation);

        if (!foundSimulation) {
          setError(`Simulation run with ID ${simulationRunId} not found.`);
          setLoading(false);
          return;
        }

        // Parse the timestamp
        let date;
        try {
          if (foundSimulation.timestamp) {
            // Handle timestamp format like "2025-07-17 12:45:40"
            date = new Date(foundSimulation.timestamp.replace(' ', 'T'));
          } else {
            date = new Date();
          }
        } catch (e) {
          console.warn(`Invalid timestamp format: ${foundSimulation.timestamp}`, e);
          date = new Date();
        }

        // Parse FUE values
        const simulationFue = typeof foundSimulation.fue_required === 'string'
          ? parseFloat(foundSimulation.fue_required)
          : foundSimulation.fue_required || 0;

        const currentActualFue = actualFue || 306; // Default fallback
        const savings = currentActualFue - simulationFue;

        // Parse summary if available
        let summary = undefined;
        if (foundSimulation.summary) {
          summary = {
            total_fue: typeof foundSimulation.summary.total_fue === 'string' 
              ? parseFloat(foundSimulation.summary.total_fue) 
              : foundSimulation.summary.total_fue || 0,
            gb_fue: typeof foundSimulation.summary.gb_fue === 'string' 
              ? parseFloat(foundSimulation.summary.gb_fue) 
              : foundSimulation.summary.gb_fue || 0,
            gc_fue: typeof foundSimulation.summary.gc_fue === 'string' 
              ? parseFloat(foundSimulation.summary.gc_fue) 
              : foundSimulation.summary.gc_fue || 0,
          };
        }

        const transformedSimulation: TransformedSimulation = {
          id: simulationRunId,
          name: `Simulation Run ${foundSimulation.simulation_run_id}`,
          date: date.toISOString().split('T')[0],
          time: date.toTimeString().split(' ')[0].substring(0, 5),
          simulationFue: simulationFue,
          actualFue: currentActualFue,
          savings: savings,
          status: "Completed",
          changes: groupChangesByRole(foundSimulation.changes),
          summary: summary,
        };

        console.log("Transformed simulation:", transformedSimulation);
        setSimulation(transformedSimulation);

      } catch (err: any) {
        console.error("Error fetching simulation details:", err);
        setError(`Failed to load simulation details: ${err.message || 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    };

    fetchSimulationDetails();
  }, [clientName, systemName, simulationRunId]);

  // Update savings when actualFue changes
  useEffect(() => {
    if (simulation && actualFue !== null) {
      const newSavings = actualFue - simulation.simulationFue;
      setSimulation(prev => prev ? {
        ...prev,
        actualFue: actualFue,
        savings: newSavings
      } : null);
    }
  }, [actualFue]);

  const getOperationBadgeColor = (operation: string) => {
    switch (operation) {
      case "Add":
        return "bg-green-100 text-green-800";
      case "Remove":
        return "bg-red-100 text-red-800";
      case "Change":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <Layout title="Loading Simulation Details...">
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <span className="ml-3 text-lg text-gray-700">Loading simulation details...</span>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="Error">
        <div className="flex flex-col items-center justify-center h-64 text-red-600">
          <AlertCircle className="h-12 w-12 mb-4" />
          <p className="text-xl font-semibold">{error}</p>
          <Link to={`/simulation-run?client=${clientName}&system=${systemName}`} className="mt-4">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Simulation Run
            </Button>
          </Link>
        </div>
      </Layout>
    );
  }

  if (!simulation) {
    return (
      <Layout title="Simulation Not Found">
        <div className="flex flex-col items-center justify-center h-64 text-gray-600">
          <p className="text-xl font-semibold">No simulation data available.</p>
          <Link to={`/simulation-run?client=${clientName}&system=${systemName}`} className="mt-4">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Simulation Run
            </Button>
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Simulation Details">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Link to={`/simulation-run?client=${clientName}&system=${systemName}`} className="flex items-center text-blue-600">
            <ArrowLeft className="mr-1 h-4 w-4" /> Back to Simulation Run
          </Link>
        </div>

        {/* Simulation Summary */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">{simulation.name}</CardTitle>
              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="h-4 w-4 mr-1" />
                {simulation.date} at {simulation.time}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{simulation.simulationFue}</div>
                <div className="text-sm text-gray-600">Simulation FUE</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-800">
                  {actualFueLoading ? <Loader2 className="h-6 w-6 animate-spin mx-auto" /> : simulation.actualFue}
                </div>
                <div className="text-sm text-gray-600">Actual FUE</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2">
                  {simulation.savings !== null && simulation.savings > 0 ? (
                    <>
                      <TrendingDown className="h-5 w-5 text-green-600" />
                      <span className="text-2xl font-bold text-green-600">
                        {simulation.savings} FUE
                      </span>
                    </>
                  ) : (
                    simulation.savings !== null && (
                      <>
                        <TrendingUp className="h-5 w-5 text-red-600" />
                        <span className="text-2xl font-bold text-red-600">
                          {Math.abs(simulation.savings)} FUE
                        </span>
                      </>
                    )
                  )}
                </div>
                <div className="text-sm text-gray-600">Potential Savings</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Changes Made */}
        <Card>
          <CardHeader>
            <CardTitle>Changes Made</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {simulation.changes.length === 0 ? (
                <p className="text-gray-500 text-center">No changes recorded for this simulation.</p>
              ) : (
                simulation.changes.map((role, index) => (
                  <div key={`${role.roleId}-${index}`} className="border border-gray-200 rounded-lg p-4">
                    {/* Role Header */}
                    <div className="mb-4 pb-3 border-b border-gray-100">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                        <div>
                          <h3 className="font-semibold text-lg text-gray-900">{role.roleId}</h3>
                          <p className="text-sm text-gray-600">{role.roleDescription}</p>
                        </div>
                        <div className="flex flex-col md:flex-row gap-4 text-sm">
                          <div>
                            <span className="font-medium text-gray-700">Current License: </span>
                            <span className="text-gray-900">{role.currentLicense}</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Simulated License: </span>
                            <span className="text-gray-900">{role.simulatedLicense}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Changes Table */}
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Authorization Object</TableHead>
                            <TableHead>Field</TableHead>
                            <TableHead>Value Low</TableHead>
                            <TableHead>Value High</TableHead>
                            <TableHead>Operation</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {role.changes.map((change) => (
                            <TableRow key={change.id}>
                              <TableCell className="font-medium">{change.authObject}</TableCell>
                              <TableCell>{change.field}</TableCell>
                              <TableCell>{change.valueLow}</TableCell>
                              <TableCell>{change.valueHigh || "-"}</TableCell>
                              <TableCell>
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getOperationBadgeColor(change.operation)}`}>
                                  {change.operation}
                                </span>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default SimulationDetails;