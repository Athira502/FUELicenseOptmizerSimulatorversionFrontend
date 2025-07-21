import React, { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import OptimizationRequestsTable from "@/components/OptimizationRequestsTable";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { OptimizationRequest, LicenseType as FrontendLicenseType } from "@/types/optimization";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchUserGroups, fetchLicenseByUserGroups } from "../api/user_related"; // Adjust path as needed

const DUMMY_OPTIMIZATION_REQUESTS: OptimizationRequest[] = [
    {
        id: "1",
        request_type: "user",
        filters: { test: "filter" },
        status: 'Completed',
        client_name:'ABC',
        system_id:'S4H0',
        datetime: new Date().toISOString()
       
    },
    {
        id: "mock-uuid-2",
        request_type: "user",
        filters: { test: "filter2" },
        status: 'In Progress',
        client_name:'ABC',
        system_id:'S4H0',
        datetime: new Date(Date.now() - 3600000).toISOString(), 
    }
];

interface Option {
    value: string;
    label: string;
}

const UserOptimization = () => {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [isLoading, setIsLoading] = useState(false);
    const [clientId, setClientId] = useState<string>("");
    const [SAPsysteminfo, setSAPsysteminfo] = useState<string>("");
    const [systemId, setSystemId] = useState<string>("");
    const [userId, setUserId] = useState<string>("");
    const [selectedUserGroups, setSelectedUserGroups] = useState<string>("");
    const [selectedLicenses, setSelectedLicenses] = useState<string>("");
    const [isFilterOpen, setIsFilterOpen] = useState(true);

    const canFetchUserGroups = Boolean(clientId.trim() && systemId.trim());

    const {
        data: userGroups = [],
        isLoading: isLoadingUserGroups,
        error: userGroupsError,
    } = useQuery({
        queryKey: ['userGroups', clientId, systemId],
        queryFn: () => fetchUserGroups(clientId.trim(), systemId.trim()),
        enabled: canFetchUserGroups,
        staleTime: 5 * 60 * 1000, 
        gcTime: 10 * 60 * 1000, 
    });

    const canFetchLicenseTypes = Boolean(
        clientId.trim() && 
        systemId.trim() && 
        selectedUserGroups.trim()
    );

    const {
        data: licenseTypes = [],
        isLoading: isLoadingLicenseTypes,
        error: licenseTypesError,
    } = useQuery({
        queryKey: ['licenseTypes', clientId, systemId, selectedUserGroups],
        queryFn: () => fetchLicenseByUserGroups(
            clientId.trim(), 
            systemId.trim(), 
            selectedUserGroups.trim()
        ),
        enabled: canFetchLicenseTypes,
        staleTime: 5 * 60 * 1000, 
        gcTime: 10 * 60 * 1000,
    });

    const {
        data: requests = [],
        refetch: refetchRequests,
    } = useQuery({
        queryKey: ['userOptimizationRequests'],
        queryFn: () => Promise.resolve(DUMMY_OPTIMIZATION_REQUESTS),
        staleTime: Infinity,
        gcTime: Infinity,
    });

    const userGroupOptions: Option[] = userGroups.map((group: string) => ({
        value: group,
        label: group,
    }));

    const licenseOptions: Option[] = licenseTypes.map((license: string) => ({
        value: license,
        label: license,
    }));

    useEffect(() => {
        setSelectedUserGroups("");
        setSelectedLicenses("");
    }, [clientId, systemId]);

    useEffect(() => {
        setSelectedLicenses("");
    }, [selectedUserGroups]);

    useEffect(() => {
        if (userGroupsError) {
            toast({
                title: "Error fetching user groups",
                description: userGroupsError.message || "Failed to load user groups",
                variant: "destructive",
            });
        }
    }, [userGroupsError, toast]);

    useEffect(() => {
        if (licenseTypesError) {
            toast({
                title: "Error fetching license types",
                description: licenseTypesError.message || "Failed to load license types",
                variant: "destructive",
            });
        }
    }, [licenseTypesError, toast]);

    const createRequestMutation = useMutation({
        mutationFn: async (filters: Record<string, any>) => {
            setIsLoading(true);
            await new Promise(resolve => setTimeout(resolve, 1000));
            const newRequestId = `mock-user-req-${Date.now()}`;
            const newRequest: OptimizationRequest = {
                id: newRequestId,
                request_type: 'user',
                filters: filters,
                status: 'In Progress',
                datetime: new Date().toISOString(),
                client_name: clientId,
                system_id: systemId
            };
            DUMMY_OPTIMIZATION_REQUESTS.push(newRequest);
            return newRequestId;
        },
        onSuccess: () => {
            setIsLoading(false);
            toast({
                title: "Analysis Started",
                description: "Your user optimization analysis request has been submitted.",
            });
            queryClient.invalidateQueries({ queryKey: ['userOptimizationRequests'] });
        },
        onError: (error) => {
            setIsLoading(false);
            console.error("Error creating optimization request:", error);
            toast({
                title: "Error",
                description: "Failed to create optimization request. Please try again.",
                variant: "destructive",
            });
        },
    });

    const handleAnalyze = () => {
        if (!clientId.trim() || !systemId.trim()) {
            toast({
                title: "Missing Required Fields",
                description: "Please enter both Client Name and System SID before analyzing.",
                variant: "destructive",
            });
            return;
        }

        const filters = {
            clientId: clientId.trim(),
            systemId: systemId.trim(),
            SAPsysteminfo: SAPsysteminfo.trim() || null,
            userId: userId.trim() || null,
            userGroups: selectedUserGroups ? [selectedUserGroups] : null,
            licenses: selectedLicenses ? [selectedLicenses] : null,
        };
        
        createRequestMutation.mutate(filters);
    };

    const handleClear = () => {
        setClientId("");
        setSAPsysteminfo("");
        setSystemId("");
        setUserId("");
        setSelectedUserGroups("");
        setSelectedLicenses("");
    };

    return (
        <Layout title="User Level License Optimization">
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

                                    <div className="space-y-2">
                                        <label htmlFor="userId" className="text-sm font-medium">
                                            User ID
                                        </label>
                                        <Input
                                            id="userId"
                                            placeholder="Enter user ID"
                                            value={userId}
                                            onChange={(e) => setUserId(e.target.value)}
                                        />
                                        <p className="text-xs text-gray-500">
                                            Leave blank to analyze based on other filters
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium" htmlFor="userGroup">
                                            User Group
                                        </label>
                                        <select
                                            id="userGroup"
                                            value={selectedUserGroups}
                                            onChange={(e) => setSelectedUserGroups(e.target.value)}
                                            disabled={!canFetchUserGroups || isLoadingUserGroups}
                                            className="w-full border border-gray-300 rounded-md p-2 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                                        >
                                            <option value="">
                                                {!canFetchUserGroups 
                                                    ? "Enter Client Name and System SID first"
                                                    : isLoadingUserGroups 
                                                    ? "Loading user groups..."
                                                    : "Select a User Group"
                                                }
                                            </option>
                                            {userGroupOptions.map((group) => (
                                                <option key={group.value} value={group.value}>
                                                    {group.label}
                                                </option>
                                            ))}
                                        </select>
                                        {userGroupsError && (
                                            <p className="text-xs text-red-500">
                                                Failed to load user groups
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium" htmlFor="licenseType">
                                            License Type
                                        </label>
                                        <select
                                            id="licenseType"
                                            value={selectedLicenses}
                                            onChange={(e) => setSelectedLicenses(e.target.value)}
                                            disabled={!canFetchLicenseTypes || isLoadingLicenseTypes}
                                            className="w-full border border-gray-300 rounded-md p-2 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                                        >
                                            <option value="">
                                                {!selectedUserGroups 
                                                    ? "Select a User Group first"
                                                    : isLoadingLicenseTypes 
                                                    ? "Loading license types..."
                                                    : "Select a license type"
                                                }
                                            </option>
                                            {licenseOptions.map((license) => (
                                                <option key={license.value} value={license.value}>
                                                    {license.label}
                                                </option>
                                            ))}
                                        </select>
                                        {licenseTypesError && (
                                            <p className="text-xs text-red-500">
                                                Failed to load license types
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center justify-end space-x-2 pt-4">
                                    <Button variant="outline" onClick={handleClear}>
                                        Clear
                                    </Button>
                                    <Button 
                                        onClick={handleAnalyze} 
                                        disabled={isLoading || !clientId.trim() || !systemId.trim()}
                                    >
                                        {isLoading ? (
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
                    <OptimizationRequestsTable requests={requests} requestType="user" />
                </div>
            </div>
        </Layout>
    );
};

export default UserOptimization;


