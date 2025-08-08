import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, RefreshCw, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getLicenseClassificationPivotTable, PivotTableResponse, getRoleDetails, RoleDetailResponse } from "../api/simulation_api";
import FilterRoles from '../components/FilterRoles';
import {
  fetchClients, 
  fetchSystemsByClient, 
} from "@/api/data_post";


const FueCalculation = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [licenseFilter, setLicenseFilter] = useState("all");
  const [pivotData, setPivotData] = useState<PivotTableResponse | null>(null);
  const [roleDetails, setRoleDetails] = useState<RoleDetailResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingRoles, setIsLoadingRoles] = useState(false);
  const [clientsList, setClientsList] = useState<string[]>([]); 
   const [systemsList, setSystemsList] = useState<string[]>([]); 
   const [selectedClient, setSelectedClient] = useState<string>(""); 
   const [selectedSystem, setSelectedSystem] = useState<string>(""); 
  const [hasNoData, setHasNoData] = useState(false);
  const [hasNoRoleData, setHasNoRoleData] = useState(false);
  const { toast } = useToast();
 useEffect(() => {
    const loadClients = async () => {
      try {
        const clients = await fetchClients();
        setClientsList(clients);
      } catch (error: any) {
        toast({ title: "Error", description: error.message, variant: "destructive",duration: 900, });
      }
    };

    loadClients();
  }, [toast]);

  useEffect(() => {
    const loadSystems = async () => {
      if (selectedClient) {
        try {
          const systems = await fetchSystemsByClient(selectedClient);
          setSystemsList(systems);
          setSelectedSystem(""); 
        } catch (error: any) {
          toast({ title: "Error", description: error.message, variant: "destructive",duration: 900, });
        }
      } else {
        setSystemsList([]);
        setSelectedSystem("");
      }
    };

    loadSystems();
  }, [selectedClient, toast]);

  const fetchPivotData = async () => {
    if (!selectedClient || !selectedSystem) {
      toast({
        title: "Missing Parameters",
        description: "Please provide both client name and system name.",
        variant: "destructive",
        duration: 900,
      });
      return;
    }

    setIsLoading(true);
    setHasNoData(false);

    try {
      console.log("🚀 Fetching pivot data for:", { selectedClient, selectedSystem });
      const data = await getLicenseClassificationPivotTable(selectedClient, selectedSystem);
      setPivotData(data);

      const totalUsers = data.pivot_table.Users.Total;
      if (totalUsers === 0) {
        setHasNoData(true);
        toast({
          title: "No Data Found",
          description: `No data found for client "${selectedClient}" and system "${selectedSystem}".`,
          variant: "destructive",
          duration: 900,
        });
      } else {
        setHasNoData(false);
        toast({
          title: "Success",
          description: "FUE data loaded successfully.",
          variant: "default",
          duration: 900,
        });
      }
    } catch (error) {
      console.error("❌ Error fetching pivot data:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to load FUE data.";

      if (errorMessage.toLowerCase().includes('not found') ||
          errorMessage.toLowerCase().includes('no data') ||
          errorMessage.toLowerCase().includes('does not exist')) {
        setHasNoData(true);
      }

      toast({
        title: "Error",
        description: "No Data found",
        variant: "destructive",
        duration: 900,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRoleDetails = async () => {
    if (!selectedClient || !selectedSystem) {
      return;
    }

    setIsLoadingRoles(true);
    setHasNoRoleData(false);

    try {
      console.log("🚀 Fetching role details for:", { selectedClient, selectedSystem });
      const data = await getRoleDetails(selectedClient, selectedSystem);
      setRoleDetails(data);

      if (data.length === 0) {
        setHasNoRoleData(true);
        toast({
          title: "No Role Data Found",
          description: `No role details found for client "${selectedClient}" and system "${selectedSystem}".`,
          variant: "destructive",
          duration: 900,
        });
      } else {
        setHasNoRoleData(false);
       
      }
    } catch (error) {
      console.error("❌ Error fetching role details:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to load role details.";

      if (errorMessage.toLowerCase().includes('not found') ||
          errorMessage.toLowerCase().includes('no data') ||
          errorMessage.toLowerCase().includes('does not exist')) {
        setHasNoRoleData(true);
      }

      toast({
        title: "Error",
        description: "Failed to load role details",
        variant: "destructive",
        duration: 900,
      });
      setRoleDetails([]);
    } finally {
      setIsLoadingRoles(false);
    }
  };

  useEffect(() => {
    fetchPivotData();
    fetchRoleDetails();
  }, []);

  const reloadAllData = async () => {
    await Promise.all([fetchPivotData(), fetchRoleDetails()]);
  };

  const getFueCalculation = () => {
    if (!pivotData || hasNoData) {
      return {
        totalFue: 0,
        breakdown: [
          { classification: "GB - Advanced Use", users: 0, fue: 0 },
          { classification: "GC - Core Use", users: 0, fue: 0 },
          { classification: "GD - Self-Service Use", users: 0, fue: 0 }
        ]
      };
    }

    return {
      totalFue: pivotData.fue_summary["Total FUE Required"],
      breakdown: [
        {
          classification: "GB - Advanced Use",
          users: pivotData.pivot_table.Users["GB Advanced Use"],
          fue: pivotData.fue_summary["GB Advanced Use FUE"]
        },
        {
          classification: "GC - Core Use",
          users: pivotData.pivot_table.Users["GC Core Use"],
          fue: pivotData.fue_summary["GC Core Use FUE"]
        },
        {
          classification: "GD - Self-Service Use",
          users: pivotData.pivot_table.Users["GD Self-Service Use"],
          fue: pivotData.fue_summary["GD Self-Service Use FUE"]
        }
      ]
    };
  };

  const fueCalculation = getFueCalculation();

  const wildcardToRegExp = (pattern: string): RegExp => {
    let regexPattern;
    const hasExplicitWildcard = pattern.includes('*') || pattern.includes('%');

    if (hasExplicitWildcard) {
      let escaped = pattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&');
      regexPattern = escaped.replace(/[*%]/g, '.*');
      regexPattern = `^${regexPattern}$`;
    } else {
     
      let escaped = pattern.replace(/[+?^${}()|[\]\\]/g, '\\$&');
      regexPattern = `^${escaped}.*`; 
    }
    
    return new RegExp(regexPattern, 'i'); 
  };


  const filteredRoles = roleDetails.filter(role => {
    const lowerCaseSearchTerm = searchTerm.toLowerCase().trim();

    const searchRegExp = lowerCaseSearchTerm ? wildcardToRegExp(lowerCaseSearchTerm) : null;

    const matchesSearch = !searchRegExp ||
      searchRegExp.test(role.id.toLowerCase());

    const matchesLicense = licenseFilter === "all" ||
      role.classification.toLowerCase().includes(licenseFilter.toLowerCase());



    return matchesSearch && matchesLicense;
  });

  useEffect(() => {
    console.log(`Number of filtered roles: ${filteredRoles.length}`);
    if (filteredRoles.length > 0) {
        console.log("First filtered role ID:", filteredRoles[0].id);
    }
  }, [filteredRoles]);

  const displayedRoles = filteredRoles;

  return (
    <Layout title="FUE Calculation">
      <div className="space-y-6">
        
        <Card>
          <CardHeader>
            <CardTitle>System Selection</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
             {/* Client Name Select */}
                               <div className="space-y-2">
                                 <label htmlFor="clientSelect" className="text-sm font-medium">
                                   Select Client *
                                 </label>
                                 <Select
                                   value={selectedClient}
                                   onValueChange={setSelectedClient}
                                 >
                                   <SelectTrigger className="w-full">
                                     <SelectValue placeholder="Select Client" />
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
             
                               {/* System SID Select */}
                               <div className="space-y-2">
                                 <label htmlFor="systemSelect" className="text-sm font-medium">
                                   Select System SID *
                                 </label>
                                 <Select
                                   value={selectedSystem}
                                   onValueChange={setSelectedSystem}
                                   disabled={!selectedClient} // Disable until a client is selected
                                 >
                                   <SelectTrigger className="w-full">
                                     <SelectValue placeholder={selectedClient ? "Select System ID" : "Select Client first"} />
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
              <div className="flex items-end">
                <Button
                  onClick={reloadAllData}
                  disabled={isLoading || isLoadingRoles}
                  className="flex items-center gap-2"
                >
                  {(isLoading || isLoadingRoles) ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                  {(isLoading || isLoadingRoles) ? "Loading..." : "Load Data"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {hasNoData && !isLoading && (
          <Alert className="border-amber-200 bg-amber-50">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              <strong>No data found</strong> for client "<strong>{selectedClient}</strong>" and system "<strong>{selectedSystem}</strong>".
              Please verify the client and system names are correct, or try a different combination.
            </AlertDescription>
          </Alert>
        )}

        {/* FUE Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">
              Full Use Equivalent Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="ml-2">Loading FUE data...</span>
              </div>
            ) : hasNoData ? (
              <div className="flex justify-center items-center py-8 text-gray-500">
                <div className="text-center">
                  <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-lg font-medium">No Data Available</p>
                  <p className="text-sm">No FUE data found for the selected client and system.</p>
                </div>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-3">
                <div className="md:col-span-2">
                  <div className="space-y-2">
                    <div className="grid grid-cols-3 gap-4 text-sm font-medium">
                      <div>Authorization Classification</div>
                      <div>Users</div>
                      <div>FUEs</div>
                    </div>
                    {fueCalculation.breakdown.map((item, index) => (
                      <div key={index} className="grid grid-cols-3 gap-4 text-sm">
                        <div>{item.classification}</div>
                        <div>{item.users.toLocaleString()}</div>
                        <div>{item.fue.toLocaleString()}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex justify-center items-center">
                  <div className="border-2 border-blue-600 bg-blue-50 p-6 rounded-lg text-center">
                    <div className="text-4xl font-bold text-blue-800">
                      {fueCalculation.totalFue.toLocaleString()}
                    </div>
                    <div className="text-sm text-blue-600 font-medium mt-2">Full Use Equivalent</div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Filters - Only show if we have data */}
        {!hasNoData && (
          <FilterRoles
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            licenseFilter={licenseFilter}
            setLicenseFilter={setLicenseFilter}
            isSearching={isLoadingRoles}
          />
        )}

        {/* Roles Table - Only show if we have data */}
        {!hasNoData && (
          <Card>
            <CardHeader>
              <CardTitle>
                Role/Profile License Summary
                {isLoadingRoles && (
                  <span className="text-sm font-normal text-gray-600 ml-2">
                    <Loader2 className="h-4 w-4 animate-spin inline mr-1" />
                    Loading roles...
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingRoles ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <span className="ml-2">Loading role details...</span>
                </div>
              ) : hasNoRoleData ? (
                <div className="flex justify-center items-center py-8 text-gray-500">
                  <div className="text-center">
                    <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p className="lg:text-lg font-medium">No Role Data Available</p>
                    <p className="text-sm">No role details found for the selected client and system.</p>
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto max-h-96 overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Role/Profile</TableHead>
                        <TableHead>Authorization Classification</TableHead>
                        <TableHead>GB Advance Use</TableHead>
                        <TableHead>GC Core Use</TableHead>
                        <TableHead>GD Self-Service Use</TableHead>
                        <TableHead>Assigned to Users</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRoles.length > 0 ? (
                        filteredRoles.map((role) => (
                          <TableRow key={role.id} className="cursor-pointer hover:bg-gray-50">
                            <TableCell>
                              <Link
                                to={`/role-details/${encodeURIComponent(role.id)}`}
                                state={{ clientName: selectedClient, systemName: selectedSystem }}
                                className="text-blue-600 hover:text-blue-800 font-medium"
                              >
                                {role.id}
                              </Link>
                            </TableCell>
                            <TableCell>{role.classification}</TableCell>
                            <TableCell>{role.gb}</TableCell>
                            <TableCell>{role.gc}</TableCell>
                            <TableCell>{role.gd}</TableCell>
                            <TableCell className="font-medium">{role.assignedUsers.toLocaleString()}</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center text-gray-500 py-4">
                            No roles match your current filters.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default FueCalculation;