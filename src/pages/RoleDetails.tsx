
// import React, { useState } from "react";
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
// import { Badge } from "@/components/ui/badge";
// import { ArrowLeft } from "lucide-react";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// const RoleDetails = () => {
//   const { roleId } = useParams<{ roleId: string }>();
//   const [editedObjects, setEditedObjects] = useState<any[]>([]);

//   // Mock data based on the screenshot
//   const roleData = {
//     id: decodeURIComponent(roleId || ""),
//     description: "SAP Materials Management - Inventory Management Goods Movements",
//     objects: [
//       {
//         id: 1,
//         object: "M_EINF_EKO",
//         classification: "GA Advanced Use",
//         fieldName: "ACTVT",
//         valueLow: "01",
//         valueHigh: "",
//         action: null,
//         newValue: ""
//       },
//       {
//         id: 2,
//         object: "M_EINF_EKO",
//         classification: "GD Self-Service Use",
//         fieldName: "ACTVT", 
//         valueLow: "02",
//         valueHigh: "",
//         action: null,
//         newValue: ""
//       },
//       {
//         id: 3,
//         object: "M_LFMF_EKO",
//         classification: "GC Core Use",
//         fieldName: "ACTVT",
//         valueLow: "01",
//         valueHigh: "",
//         action: null,
//         newValue: ""
//       },
//       {
//         id: 4,
//         object: "M_MSEG_BME",
//         classification: "GD Self-Service Use",
//         fieldName: "ACTVT",
//         valueLow: "02",
//         valueHigh: "",
//         action: null,
//         newValue: ""
//       }
//     ]
//   };

//   const licenseOptions = [
//     "01 (Create)/GC Core Use",
//     "02 (Change)/GC Core Use", 
//     "03 (Display)/GD Self-Service Use",
//     "16 (Execute)/GD Self-Service Use",
//     "F4 (Look Up)/GD Self-Service Use"
//   ];

//   const currentObjects = roleData.objects;

//   return (
//     <Layout title={`Role Details: ${roleData.id}`}>
//       <div className="space-y-6">
//         <div className="flex items-center justify-between">
//           <Link to="/fue-calculation" className="flex items-center text-blue-600">
//             <ArrowLeft className="mr-1 h-4 w-4" /> Back to FUE Calculation
//           </Link>
//         </div>

//         <Card>
//           <CardHeader>
//             <CardTitle>Role: {roleData.id}</CardTitle>
//             <p className="text-sm text-gray-600">Description: {roleData.description}</p>
//           </CardHeader>
//           <CardContent>
//             <div className="overflow-x-auto">
//               <Table>
//                 <TableHeader>
//                   <TableRow>
//                     <TableHead>Object</TableHead>
//                     <TableHead>Classification</TableHead>
//                     <TableHead>Field Name</TableHead>
//                     <TableHead>Value Low</TableHead>
//                     <TableHead>Value High</TableHead>
//                   </TableRow>
//                 </TableHeader>
//                 <TableBody>
//                   {currentObjects.map((obj) => (
//                     <TableRow key={obj.id}>
//                       <TableCell className="font-medium">{obj.object}</TableCell>
//                       <TableCell>
//                         <Badge variant="outline">
//                           {obj.classification}
//                         </Badge>
//                       </TableCell>
//                       <TableCell>{obj.fieldName}</TableCell>
//                       <TableCell>{obj.valueLow}</TableCell>
//                       <TableCell>{obj.valueHigh}</TableCell>
//                     </TableRow>
//                   ))}
//                 </TableBody>
//               </Table>
//             </div>
//           </CardContent>
//         </Card>
//       </div>
//     </Layout>
//   );
// };

// export default RoleDetails;


// frontend/src/pages/RoleDetails.tsx

import React, { useState, useEffect } from "react";
import { useParams, Link, useLocation } from "react-router-dom"; // Import useLocation
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
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Import the API function and types from your dedicated API file
import { getSpecificRoleDetails, SpecificRoleDetailsResponse } from "../api/simulation_api"; // Adjust path if necessary

const RoleDetails = () => {
  const { roleId } = useParams<{ roleId: string }>();
  const location = useLocation(); // Get location object from react-router-dom
  const { clientName, systemName } = (location.state || {}) as { clientName?: string; systemName?: string }; // Access state, provide default empty object

  const { toast } = useToast();

  const [roleDetails, setRoleDetails] = useState<SpecificRoleDetailsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRoleData = async () => {
      // Use the clientName and systemName from location.state,
      // fall back to default if not provided (e.g., direct access)
      const currentClient = clientName || "FUJI"; // Default if state is not available
      const currentSystem = systemName || "S4HANA"; // Default if state is not available

      if (!roleId) {
        setError("Role ID not provided. Please go back to the FUE Calculation page.");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      setRoleDetails(null); // Clear previous details

      try {
        console.log(`🚀 Fetching details for role: ${decodeURIComponent(roleId)} with client: ${currentClient}, system: ${currentSystem}`);
        const data = await getSpecificRoleDetails(
          decodeURIComponent(roleId),
          currentClient,
          currentSystem
        );
        setRoleDetails(data);
        toast({
          title: "Success",
          description: `Details for role '${decodeURIComponent(roleId)}' loaded.`,
          variant: "default",
          duration: 900,
        });
      } catch (err) {
        console.error("❌ Error fetching role details:", err);
        const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
        setError(`Failed to load role details: ${errorMessage}`);
        toast({
          title: "Error",
          description: `Failed to load role details for '${decodeURIComponent(roleId)}'. ${errorMessage}`,
          variant: "destructive",
          duration: 900,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoleData();
  }, [roleId, clientName, systemName, toast]); // Include clientName and systemName in dependencies

  if (!roleId) {
    return (
      <Layout title="Role Details">
        <div className="flex justify-center items-center h-48">
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              Role ID not provided. Please go back to the FUE Calculation page.
            </AlertDescription>
          </Alert>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={`Role Details: ${decodeURIComponent(roleId || "")}`}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Link to="/fue-calculation" className="flex items-center text-blue-600 hover:underline">
            <ArrowLeft className="mr-1 h-4 w-4" /> Back to FUE Calculation
          </Link>
        </div>

        {isLoading && (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading role details...</span>
          </div>
        )}

        {error && !isLoading && (
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <strong>Error:</strong> {error}
            </AlertDescription>
          </Alert>
        )}

        {roleDetails && !isLoading && !error && (
          <Card>
            <CardHeader>
              <CardTitle>Role: {roleDetails.roleName}</CardTitle>
              <p className="text-sm text-gray-600">Description: {roleDetails.roleDescription}</p>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto max-h-96 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Object</TableHead>
                      <TableHead>Classification</TableHead>
                      <TableHead>Field Name</TableHead>
                      <TableHead>Value Low</TableHead>
                      <TableHead>Value High</TableHead>
                      <TableHead>TText</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {roleDetails.objectDetails.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-4 text-gray-500">
                          No object details found for this role.
                        </TableCell>
                      </TableRow>
                    ) : (
                      roleDetails.objectDetails.map((obj, index) => (
                        <TableRow key={obj.object + obj.fieldName + index}> {/* More robust key */}
                          <TableCell className="font-medium">{obj.object}</TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {obj.classification}
                            </Badge>
                          </TableCell>
                          <TableCell>{obj.fieldName}</TableCell>
                          <TableCell>{obj.valueLow}</TableCell>
                          <TableCell>{obj.valueHigh}</TableCell>
                          <TableCell>{obj.ttext}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {!roleDetails && !isLoading && !error && (
            <div className="flex justify-center items-center py-8 text-gray-500">
                <div className="text-center">
                    <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-lg font-medium">No Role Details Available</p>
                    <p className="text-sm">Could not retrieve details for this role. Please try again later or verify the role ID, client, and system.</p>
                </div>
            </div>
        )}
      </div>
    </Layout>
  );
};

export default RoleDetails;