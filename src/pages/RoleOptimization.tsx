import React, { useState, useEffect } from "react"; // Import useEffect
import Layout from "@/components/Layout";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select, 
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import OptimizationRequestsTable from "@/components/OptimizationRequestsTable";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

import {
  OptimizationRequest,
  LicenseType as FrontendLicenseType,
} from "@/types/optimization";

import {
  getLicenseTypes,
  getOptimizationRequests,
  createOptimizationRequest,
} from "@/services/optimizationService";

import {
  fetchClients, // Import fetchClients
  fetchSystemsByClient, // Import fetchSystemsByClient
} from "@/api/data_post"; // Import API functions

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CreateOptimizationRequestPayload } from "@/api/lic_opt";


interface Option {
  value: string;
  label: string;
}

const RoleOptimization = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [roleIds, setRoleIds] = useState<string>("");
  const [clientsList, setClientsList] = useState<string[]>([]); // New state for clients
  const [systemsList, setSystemsList] = useState<string[]>([]); // New state for systems
  const [selectedClient, setSelectedClient] = useState<string>(""); // Renamed from clientId
  const [selectedSystem, setSelectedSystem] = useState<string>(""); // Renamed from systemId
  const [SAPsysteminfo, setSAPsysteminfo] = useState<string>("");
  const [selectedLicense, setSelectedLicense] = useState<string>("");
  const [ratioInput, setRatioInput] = useState<string>("");

  const [isFilterOpen, setIsFilterOpen] = useState(true);

  // Effect to load clients on component mount
  useEffect(() => {
    const loadClients = async () => {
      try {
        const clients = await fetchClients();
        setClientsList(clients);
      } catch (error: any) {
        toast({ title: "Error", description: error.message, variant: "destructive",duration: 900,});
      }
    };

    loadClients();
  }, [toast]);

  // Effect to load systems when selectedClient changes
  useEffect(() => {
    const loadSystems = async () => {
      if (selectedClient) {
        try {
          const systems = await fetchSystemsByClient(selectedClient);
          setSystemsList(systems);
          setSelectedSystem(""); // Reset system when client changes
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


  const { data: licenseTypes = [], isLoading: isLoadingLicenseTypes } = useQuery({
    queryKey: ['licenseTypes', selectedClient, selectedSystem], // Use selectedClient and selectedSystem
    queryFn: () => getLicenseTypes(selectedClient, selectedSystem), // Pass selectedClient and selectedSystem
    enabled: !!selectedClient && !!selectedSystem, // Enable only when both are selected
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const {
    data: requests = [],
    refetch: refetchRequests,
    isLoading: isLoadingRequests,
  } = useQuery({
    queryKey: ['roleOptimizationRequests'],
    queryFn: () => getOptimizationRequests(),
  });

  const licenseOptions: Option[] = licenseTypes.map((license: FrontendLicenseType) => ({
    value: license.id,
    label: license.name,
  }));
  

  // const createRequestMutation = useMutation({
  //   mutationFn: createOptimizationRequest,
  //   onMutate: () => {
  //     toast({
  //       title: "Request Initiated",
  //       description: "Your role optimization analysis request is being submitted.",
  //     });
  //   },
  //   onSuccess: (data) => {
  //     toast({
  //       title: "Analysis Completed",
  //       description: "Your role optimization analysis request has been succesfully completed.",
  //     });
  //     queryClient.invalidateQueries({ queryKey: ['roleOptimizationRequests'] });
  //     console.log("Optimization Analysis response data:", data);
  //   },
  //   onError: (error: Error) => {
  //     console.error("Error creating optimization request:", error);
  //     toast({
  //       title: "Error",
  //       description: error.message || "Failed to create optimization request. Please try again.",
  //       variant: "destructive",
  //     });
  //   }
  // });

const createRequestMutation = useMutation({
  mutationFn: createOptimizationRequest,
  onSuccess: (data) => {
    toast({
      title: "Request Initiated",
      description: `Optimization request ${data.request_id} has been started and is processing in the background.`,duration: 1000,
    });
    // Immediately refresh to show the new IN_PROGRESS request
    queryClient.invalidateQueries({ queryKey: ['roleOptimizationRequests'] });
    console.log("Optimization request initiated:", data);
  },
  onError: (error: Error) => {
    console.error("Error creating optimization request:", error);
    toast({
      title: "Error",
      description: error.message || "Failed to create optimization request. Please try again.",
      variant: "destructive",
      duration: 900,
    });
  }
});


  const handleAnalyze = () => {
    if (!selectedClient || !selectedSystem) {
      toast({
        title: "Missing Information",
        description: "Client Name and System SID are required.",
        variant: "destructive",
        duration: 900,
      });
      return;
    }

    const roleIdArray = roleIds.split(',').map(id => id.trim()).filter(id => id);

    let roleNamesParam: string[];
    if (roleIdArray.length === 0) {
      roleNamesParam = [];
    } else {
      roleNamesParam = roleIdArray;
    }

    const payload: CreateOptimizationRequestPayload = {
      client_name: selectedClient, 
      system_id: selectedSystem, 
      role_names: roleNamesParam,
      target_license: selectedLicense || undefined,
      ratio_threshold: ratioInput ? parseFloat(ratioInput) : undefined,
      sap_system_info: SAPsysteminfo || 'S4 HANA OnPremise 1909 Initial Support Pack',
    };
    const API_BASE_URL = "http://localhost:8000";
    const url = `${API_BASE_URL}/optimize/license?client_name=${payload.client_name}&system_id=${payload.system_id}${
      payload.role_names.length > 0
        ? payload.role_names.map(rn => `&role_names=${encodeURIComponent(rn)}`).join('')
        : ''
    }&target_license=${payload.target_license || ''}&sap_system_info=${payload.sap_system_info || ''}`;
    console.log("Generated URL:", url);

    if (payload.ratio_threshold !== undefined && isNaN(payload.ratio_threshold)) {
      toast({
        title: "Invalid Input",
        description: "Ratio Threshold must be a valid number.",
        variant: "destructive",
        duration: 900,
      });
      return;
    }

    createRequestMutation.mutate(payload);

     setTimeout(() => {
    queryClient.invalidateQueries({ queryKey: ['roleOptimizationRequests'] });
  }, 1000);
  };

  const handleClear = () => {
    setRoleIds("");
    setSelectedClient(""); // Clear selected client
    setSelectedSystem(""); // Clear selected system
    setSelectedLicense("");
    setRatioInput("");
    setSAPsysteminfo("");
  };

  const isAnalyzing = createRequestMutation.status === 'pending';

  return (
    <Layout title="Role Level License Optimization">
      <div className="space-y-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xl flex justify-between items-center">
              <span>Optimization Filters</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsFilterOpen(!isFilterOpen)}
              >
                {isFilterOpen ? 'Hide' : 'Show'}
              </Button>
            </CardTitle>
          </CardHeader>
          <Collapsible open={isFilterOpen} onOpenChange={setIsFilterOpen}>
  <CollapsibleContent>
    <CardContent className="space-y-4">
      
      {/* Row 1: Client Name and System SID */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Client Name Select */}
        <div className="space-y-2">
          <label htmlFor="clientSelect" className="text-sm font-medium">
            Select Client *
          </label>
          <Select value={selectedClient} onValueChange={setSelectedClient}>
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
            disabled={!selectedClient}
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
      </div>

      {/* Row 2: Role ID, License Type, Ratio Input */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Role IDs */}
        <div className="space-y-2">
          <label htmlFor="roleIds" className="text-sm font-medium">
            Role ID(s)
          </label>
          <Input
            id="roleIds"
            placeholder="Enter one or more role IDs, comma separated"
            value={roleIds}
            onChange={(e) => setRoleIds(e.target.value)}
          />
          <p className="text-xs text-gray-500">
            Leave blank to analyze all roles
          </p>
        </div>

        {/* License Type */}
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="licenseType">
            Current Role License Type
          </label>
          <select
            id="licenseType"
            value={selectedLicense}
            onChange={(e) => setSelectedLicense(e.target.value)}
            className="w-full border border-gray-300 rounded-md p-2 text-sm"
            disabled={isLoadingLicenseTypes || (!selectedClient || !selectedSystem)}
          >
            <option value="">Default (GB Advanced Use) or Select</option>
            {!isLoadingLicenseTypes && licenseOptions.map((license) => (
              <option key={license.value} value={license.value}>
                {license.label}
              </option>
            ))}
          </select>
          {isLoadingLicenseTypes && <p className="text-xs text-gray-500">Loading license types...</p>}
        </div>

        {/* Ratio Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="ratioInput">
            Ratio Threshold (e.g., 20)
          </label>
          <Input
            id="ratioInput"
            type="number"
            placeholder="Enter max AGR_RATIO (optional)"
            value={ratioInput}
            onChange={(e) => setRatioInput(e.target.value)}
            min="1"
          />
        </div>
      </div>

      <div className="flex items-center justify-end space-x-2 pt-4">
        <Button variant="outline" onClick={handleClear}>
          Clear
        </Button>
        <Button
          onClick={handleAnalyze}
          disabled={isAnalyzing || !selectedClient || !selectedSystem}
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            "Analyze"
          )}
        </Button>
      </div>
    </CardContent>
  </CollapsibleContent>
</Collapsible>

        </Card>
        <div>
      {/* This new container uses flexbox to align the heading and button */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">Optimization Requests</h3>
        <Button variant="outline" onClick={() => refetchRequests()}>
          Refresh
        </Button>
      </div>
      
      {isLoadingRequests ? (
        <div className="flex justify-center items-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-belize-600" />
        </div>
      ) : (
        <OptimizationRequestsTable requests={requests} requestType="role" />
      )}
    </div>
 
      
      </div>
    </Layout>
  );
};

export default RoleOptimization;