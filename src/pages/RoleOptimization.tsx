

import React, { useState } from "react";
import Layout from "@/components/Layout";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
  const [clientId, setClientId] = useState<string>("");
  const [SAPsysteminfo, setSAPsysteminfo] = useState<string>("");
  const [systemId, setSystemId] = useState<string>("");
  const [selectedLicense, setSelectedLicense] = useState<string>("");
  const [ratioInput, setRatioInput] = useState<string>("");

  const [isFilterOpen, setIsFilterOpen] = useState(true);

  const { data: licenseTypes = [], isLoading: isLoadingLicenseTypes } = useQuery({
    queryKey: ['licenseTypes', clientId, systemId],
    queryFn: () => getLicenseTypes(clientId, systemId),
    enabled: !!clientId && !!systemId,
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

  const createRequestMutation = useMutation({
    mutationFn: createOptimizationRequest,
    onSuccess: (data) => {
      toast({
        title: "Analysis Submitted",
        description: "Your role optimization analysis request has been submitted and processing started.",
      });
      queryClient.invalidateQueries({ queryKey: ['roleOptimizationRequests'] });
      console.log("Optimization Analysis response data:", data);
    },
    onError: (error: Error) => {
      console.error("Error creating optimization request:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create optimization request. Please try again.",
        variant: "destructive",
      });
    }
  });

const handleAnalyze = () => {
    if (!clientId || !systemId) {
        toast({
            title: "Missing Information",
            description: "Client Name and System SID are required.",
            variant: "destructive",
        });
        return;
    }

    const roleIdArray = roleIds.split(',').map(id => id.trim()).filter(id => id);

    let roleNamesParam: string[] ;
    if (roleIdArray.length === 0) {
        roleNamesParam = []; 
    } else {
        roleNamesParam = roleIdArray;
    }

    const payload: CreateOptimizationRequestPayload = {
        client_name: clientId,
        system_id: systemId,
        role_names: roleNamesParam, // Use the correctly formatted parameter
        target_license: selectedLicense || undefined,
        ratio_threshold: ratioInput ? parseFloat(ratioInput) : undefined,
        validation_type: "role",
        sap_system_info: SAPsysteminfo || 'S4 HANA OnPremise 1909 Initial Support Pack',
    };
const API_BASE_URL = "http://localhost:8000";
      const url = `${API_BASE_URL}/optimize/license?client_name=${payload.client_name}&system_id=${payload.system_id}${
        payload.role_names.length > 0 
            ? payload.role_names.map(rn => `&role_names=${encodeURIComponent(rn)}`).join('')
            : ''
    }&target_license=${payload.target_license || ''}&validation_type=${payload.validation_type || ''}&sap_system_info=${payload.sap_system_info || ''}`;
    console.log("Generated URL:", url);

    if (payload.ratio_threshold !== undefined && isNaN(payload.ratio_threshold)) {
        toast({
            title: "Invalid Input",
            description: "Ratio Threshold must be a valid number.",
            variant: "destructive",
        });
        return;
    }

    createRequestMutation.mutate(payload);
};

  const handleClear = () => {
    setRoleIds("");
    setClientId("");
    setSystemId("");
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

                  {/* Client Name */}
                  <div className="space-y-2">
                    <label htmlFor="clientId" className="text-sm font-medium">
                      Client Name *
                    </label>
                    <Input
                      id="clientId"
                      placeholder="Enter the client name"
                      value={clientId}
                      onChange={(e) => setClientId(e.target.value)}
                    />
                  </div>

                 

                  {/* System SID */}
                  <div className="space-y-2">
                    <label htmlFor="systemId" className="text-sm font-medium">
                      System SID *
                    </label>
                    <Input
                      id="systemId"
                      placeholder="Enter System SID"
                      value={systemId}
                      onChange={(e) => setSystemId(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="SAPsysteminfo" className="text-sm font-medium">
                      SAP System Info
                    </label>
                    <Input
                      id="SAPsysteminfo"
                      placeholder="Enter the system info"
                      value={SAPsysteminfo}
                      onChange={(e) => setSAPsysteminfo(e.target.value)}
                    />
                  </div>

                  {/* License Type */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="licenseType">
                      Target License Type
                    </label>
                    <select
                      id="licenseType"
                      value={selectedLicense}
                      onChange={(e) => setSelectedLicense(e.target.value)}
                      className="w-full border border-gray-300 rounded-md p-2 text-sm"
                      disabled={isLoadingLicenseTypes || (!clientId || !systemId)}
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
                    disabled={isAnalyzing || !clientId || !systemId}
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
          <h3 className="text-lg font-medium mb-4">Optimization Requests</h3>
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