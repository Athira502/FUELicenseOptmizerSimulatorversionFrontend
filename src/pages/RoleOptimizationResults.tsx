
import React, { useState, useRef, useCallback, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Layout from "@/components/Layout";
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
import { useQuery } from "@tanstack/react-query";
import { getRoleOptimizationResults } from "@/services/optimizationService";
import { RoleOptimizationResult } from "@/types/optimization";

interface ColumnWidths {
  roleId: number;
  roleDescription: number;
  authObject: number;
  field: number;
  value: number;
  reducible: number;
  insights: number;
  recommendations: number;
  explanation: number;
}

const RoleOptimizationResults = () => {
  const { requestId } = useParams<{ requestId: string }>();
  const [searchTerm, setSearchTerm] = useState("");
  const [showReducibleOnly, setShowReducibleOnly] = useState(false);

  const [columnWidths, setColumnWidths] = useState<ColumnWidths>({
    roleId: 150,
    roleDescription: 200, 
    authObject: 150, 
    field: 96,
    value: 96,
    reducible: 80,
    insights: 192,
    recommendations: 192,
    explanation: 400,
  });
  const [isResizing, setIsResizing] = useState(false);
  const [resizingColumn, setResizingColumn] = useState<keyof ColumnWidths | null>(null);
  const tableRef = useRef<HTMLTableElement>(null);

  const handleMouseDown = useCallback(
    (columnKey: keyof ColumnWidths, e: React.MouseEvent) => {
      e.preventDefault();
      setIsResizing(true);
      setResizingColumn(columnKey);

      const startX = e.clientX;
      const startWidth = columnWidths[columnKey];

      const minWidths: ColumnWidths = {
        roleId: 70,
        roleDescription: 100,
        authObject: 80,
        field: 50,
        value: 50,
        reducible: 70,
        insights: 100,
        recommendations: 100,
        explanation: 150,
      };

      const handleMouseMove = (e: MouseEvent) => {
        const diff = e.clientX - startX;
        const newWidth = Math.max(minWidths[columnKey], startWidth + diff);

        setColumnWidths((prev) => ({
          ...prev,
          [columnKey]: newWidth,
        }));
      };

      const handleMouseUp = () => {
        setIsResizing(false);
        setResizingColumn(null);
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    },
    [columnWidths]
  );

  useEffect(() => {
    if (isResizing) {
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    } else {
      document.body.style.cursor = "default";
      document.body.style.userSelect = "auto";
    }
    return () => {
      document.body.style.cursor = "default";
      document.body.style.userSelect = "auto";
    };
  }, [isResizing]);

  const {
    data: results = [],
    isLoading,
    error,
  } = useQuery<RoleOptimizationResult[], Error>({
    queryKey: ["roleOptimizationResults", requestId],
    queryFn: () => getRoleOptimizationResults(requestId!),
    enabled: !!requestId,
  });

  const filteredResults = results.filter((result) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      !searchTerm ||
      result.role_id.toLowerCase().includes(searchLower) ||
      (result.role_description?.toLowerCase() || "").includes(searchLower) ||
      (result.auth_object?.toLowerCase() || "").includes(searchLower) ||
      (result.field?.toLowerCase() || "").includes(searchLower) ||
      (result.value?.toLowerCase() || "").includes(searchLower);

    return (
      matchesSearch &&
      (!showReducibleOnly ||
        result.license_can_be_reduced === "Yes" ||
        result.license_can_be_reduced === "May Be")
    );
  });

  
  const ResizeHandle = ({ columnKey }: { columnKey: keyof ColumnWidths }) => (
    <div
      className={`absolute right-0 top-0 bottom-0 w-1 cursor-col-resize transition-colors ${
        resizingColumn === columnKey ? "bg-blue-500" : "bg-transparent hover:bg-gray-300"
      }`}
      onMouseDown={(e) => handleMouseDown(columnKey, e)}
      style={{ zIndex: 10 }}
    />
  );

  if (error) {
    return (
      <Layout title="Role Optimization Results">
        <div className="space-y-6">
          <Link to="/role-optimization" className="flex items-center text-belize-600">
            <ArrowLeft className="mr-1 h-4 w-4" /> Back to Role Optimization
          </Link>
          <div className="text-red-500">Error loading results: {error.message}</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={`Role Optimization Results - Request ${requestId}`}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Link
            to="/role-optimization"
            className="flex items-center text-belize-600 hover:underline"
          >
            <ArrowLeft className="mr-1 h-4 w-4" /> Back to Role Optimization
          </Link>
          <div>
            <span className="text-sm font-medium">Request ID: </span>
            <span className="text-sm font-semibold text-belize-700">{requestId}</span>
          </div>
        </div>

        <div className="bg-white rounded-md border p-4 shadow-sm">
          <h3 className="text-lg font-medium mb-4">Filter Results</h3>
          <div className="grid gap-4 md:grid-cols-3 items-end">
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <Input
                id="search"
                placeholder="Search by role, description, object..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex items-center space-x-2 md:pt-6">
              <Checkbox
                id="reducibleOnly"
                checked={showReducibleOnly}
                onCheckedChange={(checked) => setShowReducibleOnly(checked === true)}
              />
              <Label htmlFor="reducibleOnly" className="cursor-pointer">
                Show only reducible licenses
              </Label>
            </div>
          </div>
        </div>

        <div className="rounded-md border bg-white">
          {isLoading ? (
            <div className="flex justify-center items-center p-12">
              <Loader2 className="h-8 w-8 animate-spin text-belize-600" />
              <span className="ml-2">Loading results...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table ref={tableRef} className="table-fixed">
                <TableHeader>
                  <TableRow>
                    <TableHead
                      className="relative border-r whitespace-pre-wrap break-words"
                      style={{ width: `${columnWidths.roleId}px` }}
                    >
                      Role ID
                      <ResizeHandle columnKey="roleId" />
                    </TableHead>
                    <TableHead
                      className="relative border-r whitespace-pre-wrap break-words"
                      style={{ width: `${columnWidths.roleDescription}px` }}
                    >
                      Role Description
                      <ResizeHandle columnKey="roleDescription" />
                    </TableHead>
                    <TableHead
                      className="relative border-r whitespace-pre-wrap break-words"
                      style={{ width: `${columnWidths.authObject}px` }}
                    >
                      Auth Object
                      <ResizeHandle columnKey="authObject" />
                    </TableHead>
                    <TableHead
                      className="relative border-r whitespace-pre-wrap break-words"
                      style={{ width: `${columnWidths.field}px` }}
                    >
                      Field
                      <ResizeHandle columnKey="field" />
                    </TableHead>
                    <TableHead
                      className="relative border-r whitespace-pre-wrap break-words"
                      style={{ width: `${columnWidths.value}px` }}
                    >
                      Value
                      <ResizeHandle columnKey="value" />
                    </TableHead>
                    <TableHead
                      className="relative border-r text-center whitespace-pre-wrap break-words"
                      style={{ width: `${columnWidths.reducible}px` }}
                    >
                      Reducible
                      <ResizeHandle columnKey="reducible" />
                    </TableHead>
                    <TableHead
                      className="relative border-r whitespace-pre-wrap break-words"
                      style={{ width: `${columnWidths.insights}px` }}
                    >
                      Insights
                      <ResizeHandle columnKey="insights" />
                    </TableHead>
                    <TableHead
                      className="relative border-r whitespace-pre-wrap break-words"
                      style={{ width: `${columnWidths.recommendations}px` }}
                    >
                      Recommendations
                      <ResizeHandle columnKey="recommendations" />
                    </TableHead>
                    <TableHead
                      className="relative whitespace-pre-wrap break-words"
                      style={{ width: `${columnWidths.explanation}px` }}
                    >
                      Explanation
                      <ResizeHandle columnKey="explanation" />
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredResults.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-6 text-gray-500">
                        No results found matching your criteria.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredResults.map((result) => (
                      <TableRow key={result.id}>
                        <TableCell
                          className="font-medium border-r whitespace-pre-wrap break-words" // Ensure cell content wraps too
                          style={{ width: `${columnWidths.roleId}px` }}
                        >
                          {result.role_id}
                        </TableCell>
                        <TableCell
                          className="border-r whitespace-pre-wrap break-words" // Ensure cell content wraps too
                          style={{ width: `${columnWidths.roleDescription}px` }}
                        >
                          {result.role_description || "-"}
                        </TableCell>
                        <TableCell
                          className="border-r whitespace-pre-wrap break-words" // Ensure cell content wraps too
                          style={{ width: `${columnWidths.authObject}px` }}
                        >
                          {result.auth_object || "-"}
                        </TableCell>
                        <TableCell
                          className="border-r whitespace-pre-wrap break-words"
                          style={{ width: `${columnWidths.field}px` }}
                        >
                          {result.field || "-"}
                        </TableCell>
                        <TableCell
                          className="border-r whitespace-pre-wrap break-words"
                          style={{ width: `${columnWidths.value}px` }}
                        >
                          {result.value || "-"}
                        </TableCell>
                        <TableCell
                          className="border-r text-center whitespace-pre-wrap break-words"
                          style={{ width: `${columnWidths.reducible}px` }}
                        >
                          {result.license_can_be_reduced === "Yes" ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Yes
                            </span>
                          ) : result.license_can_be_reduced === "No" ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              No
                            </span>
                          ) : result.license_can_be_reduced === "May Be" ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              May Be
                            </span>
                          ) : (
                            <span>-</span>
                          )}
                        </TableCell>
                        <TableCell
                          className="border-r whitespace-pre-wrap break-words"
                          style={{ width: `${columnWidths.insights}px` }}
                        >
                          <div className="whitespace-pre-wrap break-words">
                            {result.insights || "-"}
                          </div>
                        </TableCell>
                        <TableCell
                          className="border-r whitespace-pre-wrap break-words"
                          style={{ width: `${columnWidths.recommendations}px` }}
                        >
                          <div className="whitespace-pre-wrap break-words">
                            {result.recommendations || "-"}
                          </div>
                        </TableCell>
                        <TableCell
                          className="whitespace-pre-wrap break-words"
                          style={{ width: `${columnWidths.explanation}px` }}
                        >
                          <div className="whitespace-pre-wrap break-words">
                            {result.explanations || "-"}
                          </div>
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

export default RoleOptimizationResults;




