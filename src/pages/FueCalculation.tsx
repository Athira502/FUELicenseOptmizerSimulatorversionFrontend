import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

// Import the API functions
import { getLicenseClassificationPivotTable, PivotTableResponse, getRoleDetails, RoleDetailResponse } from "../api/simulation_api";

const FueCalculation = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [licenseFilter, setLicenseFilter] = useState("all");
  const [pivotData, setPivotData] = useState<PivotTableResponse | null>(null);
  const [roleDetails, setRoleDetails] = useState<RoleDetailResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingRoles, setIsLoadingRoles] = useState(false);
  const [clientName, setClientName] = useState("FUJI");
  const [systemName, setSystemName] = useState("S4HANA");
  const [hasNoData, setHasNoData] = useState(false);
  const [hasNoRoleData, setHasNoRoleData] = useState(false);
  const { toast } = useToast();

  // Function to fetch pivot table data
  const fetchPivotData = async () => {
    if (!clientName || !systemName) {
      toast({
        title: "Missing Parameters",
        description: "Please provide both client name and system name.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setHasNoData(false);
    
    try {
      console.log("🚀 Fetching pivot data for:", { clientName, systemName });
      const data = await getLicenseClassificationPivotTable(clientName, systemName);
      setPivotData(data);
      
      // Check if the data indicates no records found
      const totalUsers = data.pivot_table.Users.Total;
      if (totalUsers === 0) {
        setHasNoData(true);
        toast({
          title: "No Data Found",
          description: `No data found for client "${clientName}" and system "${systemName}".`,
          variant: "destructive",
        });
      } else {
        setHasNoData(false);
        toast({
          title: "Success",
          description: "FUE data loaded successfully.",
          variant: "default",
        });
      }
    } catch (error) {
      console.error("❌ Error fetching pivot data:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to load FUE data.";
      
      // Check if it's a "not found" type error
      if (errorMessage.toLowerCase().includes('not found') || 
          errorMessage.toLowerCase().includes('no data') ||
          errorMessage.toLowerCase().includes('does not exist')) {
        setHasNoData(true);
      }
      
      toast({
        title: "Error",
        description: "No Data found",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Function to fetch role details data
  const fetchRoleDetails = async () => {
    if (!clientName || !systemName) {
      return;
    }

    setIsLoadingRoles(true);
    setHasNoRoleData(false);
    
    try {
      console.log("🚀 Fetching role details for:", { clientName, systemName });
      const data = await getRoleDetails(clientName, systemName);
      setRoleDetails(data);
      
      if (data.length === 0) {
        setHasNoRoleData(true);
        toast({
          title: "No Role Data Found",
          description: `No role details found for client "${clientName}" and system "${systemName}".`,
          variant: "destructive",
        });
      } else {
        setHasNoRoleData(false);
        console.log(`✅ Loaded ${data.length} role details`);
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
      });
      setRoleDetails([]);
    } finally {
      setIsLoadingRoles(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchPivotData();
    fetchRoleDetails();
  }, []);

  // Function to reload both pivot and role data
  const reloadAllData = async () => {
    await Promise.all([fetchPivotData(), fetchRoleDetails()]);
  };

  // Transform API data for display
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

  // Filter roles based on search and license filter
  const filteredRoles = roleDetails.filter(role => {
    const matchesSearch = !searchTerm || 
      role.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      role.profile.toLowerCase().includes(searchTerm.toLowerCase()) ||
      role.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesLicense = licenseFilter === "all" || 
      role.classification.toLowerCase().includes(licenseFilter.toLowerCase());
    
    return matchesSearch && matchesLicense;
  });

  const displayedRoles = filteredRoles.slice(0, 10);

  return (
    <Layout title="FUE Calculation">
      <div className="space-y-6">
        {/* Client/System Selection */}
        <Card>
          <CardHeader>
            <CardTitle>System Selection</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div>
                <Label htmlFor="client-name">Client Name</Label>
                <Input
                  id="client-name"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Enter client name"
                />
              </div>
              <div>
                <Label htmlFor="system-name">System Name</Label>
                <Input
                  id="system-name"
                  value={systemName}
                  onChange={(e) => setSystemName(e.target.value)}
                  placeholder="Enter system name"
                />
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
              <strong>No data found</strong> for client "<strong>{clientName}</strong>" and system "<strong>{systemName}</strong>". 
              Please verify the client and system names are correct, or try a different combination.
            </AlertDescription>
          </Alert>
        )}

        {/* FUE Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">
              Full Use Equivalent Summary
              {/* {pivotData && !hasNoData && (
                <span className="text-sm font-normal text-gray-600 ml-2">
                  ({pivotData.client_name} - {pivotData.system_name})
                </span>
              )} */}
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
          <Card>
            <CardHeader>
              <CardTitle>Filter Roles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <Label htmlFor="search">Search by Role ID or Description</Label>
                  <Input
                    id="search"
                    placeholder="Enter role ID or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="license-filter">License Type</Label>
                  <Select value={licenseFilter} onValueChange={setLicenseFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select license type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All License Types</SelectItem>
                      <SelectItem value="gb">GB - Advanced Use</SelectItem>
                      <SelectItem value="gc">GC - Core Use</SelectItem>
                      <SelectItem value="gd">GD - Self-Service Use</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
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
                    <p className="text-lg font-medium">No Role Data Available</p>
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
                      {displayedRoles.map((role) => (
                        <TableRow key={role.id} className="cursor-pointer hover:bg-gray-50">
                          <TableCell>
  <Link
    to={`/role-details/${encodeURIComponent(role.id)}`} 
    state={{ clientName: clientName, systemName: systemName }} // State as a direct prop
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
                      ))}
                    </TableBody>
                  </Table>
                  {roleDetails.length > 10 && (
                    <div className="mt-4 text-sm text-gray-500 text-center">
                      Showing first 10 of {filteredRoles.length} filtered roles
                    </div>
                  )}
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

