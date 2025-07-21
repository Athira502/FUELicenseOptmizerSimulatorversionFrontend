
import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeft, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { getUserOptimizationResults } from "@/services/optimizationService";
import { UserOptimizationResult } from "@/types/optimization";

const UserOptimizationResults = () => {
  const { requestId } = useParams<{ requestId: string }>();
  const [searchTerm, setSearchTerm] = useState("");
  const [showReducibleOnly, setShowReducibleOnly] = useState(false);
  
  const { data: results = [], isLoading } = useQuery({
    queryKey: ['userOptimizationResults', requestId],
    queryFn: () => getUserOptimizationResults(requestId!),
    enabled: !!requestId,
  });
  
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    return format(new Date(dateString), "yyyy-MM-dd");
  };
  
  const filteredResults = results.filter((result) => {
    const matchesSearch =
      !searchTerm ||
      result.user_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (result.display_name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (result.user_group?.toLowerCase() || "").includes(searchTerm.toLowerCase());
      
    return matchesSearch && (!showReducibleOnly || result.license_can_be_reduced === true);
  });
  
  return (
    <Layout title="User Optimization Results">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Link to="/user-optimization" className="flex items-center text-belize-600">
            <ArrowLeft className="mr-1 h-4 w-4" /> Back to User Optimization
          </Link>
          <div>
            <span className="text-sm font-medium">Request ID: </span>
            <span className="text-sm">{requestId}</span>
          </div>
        </div>
        
        <div className="bg-white rounded-md border p-4 shadow-sm">
          <h3 className="text-lg font-medium mb-4">Filter Results</h3>
          <div className="grid gap-4 md:grid-cols-3 items-end">
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <Input
                id="search"
                placeholder="Search by user ID, name, group..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="reducibleOnly"
                checked={showReducibleOnly}
                onCheckedChange={(checked) => 
                  setShowReducibleOnly(checked === true)}
              />
              <Label htmlFor="reducibleOnly">
                Show only users with reducible licenses
              </Label>
            </div>
          </div>
        </div>
        
        <div className="rounded-md border bg-white">
          {isLoading ? (
            <div className="flex justify-center items-center p-12">
              <Loader2 className="h-8 w-8 animate-spin text-belize-600" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User ID</TableHead>
                    <TableHead>Display Name</TableHead>
                    <TableHead>Valid From</TableHead>
                    <TableHead>Valid To</TableHead>
                    <TableHead>User Group</TableHead>
                    <TableHead>Last Logon</TableHead>
                    <TableHead>License Reducible</TableHead>
                    <TableHead>Insights & Recommendations</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredResults.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-6">
                        No results found. Try adjusting your search criteria.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredResults.map((result) => (
                      <TableRow key={result.id}>
                        <TableCell className="font-medium">{result.user_id}</TableCell>
                        <TableCell>{result.display_name || "-"}</TableCell>
                        <TableCell>{formatDate(result.valid_from)}</TableCell>
                        <TableCell>{formatDate(result.valid_to)}</TableCell>
                        <TableCell>{result.user_group || "-"}</TableCell>
                        <TableCell>{result.last_logon ? formatDate(result.last_logon) : "-"}</TableCell>
                        <TableCell>
                          {result.license_can_be_reduced ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Yes
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              No
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="max-w-xs">
                          {result.insights && (
                            <div className="mb-1">
                              <span className="font-medium">Insights:</span> {result.insights}
                            </div>
                          )}
                          {result.recommendations && (
                            <div>
                              <span className="font-medium">Recommendations:</span>{" "}
                              {result.recommendations}
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default UserOptimizationResults;