
import React from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { OptimizationRequest } from "@/types/optimization";
import { Eye } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

interface OptimizationRequestsTableProps {
  requests: OptimizationRequest[];
  requestType: 'role' | 'user';
}

const OptimizationRequestsTable: React.FC<OptimizationRequestsTableProps> = ({
  requests,
  requestType,
}) => {
  const navigate = useNavigate();

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case "COMPLETED":
        return "text-green-600";
      case "FAILED":
        return "text-red-600";
      case "IN PROGRESS":
        return "text-blue-600";
      default:
        return "text-yellow-600";
    }
  };

  const handleViewResults = (requestId: string) => {
    navigate(`/${requestType}-optimization-results/${requestId}`);
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Request ID</TableHead>
            <TableHead>Date & Time</TableHead>
            <TableHead>Client Name</TableHead>
            <TableHead>System ID</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-6">
                No optimization requests found. Use the filters above to start a new analysis.
              </TableCell>
            </TableRow>
          ) : (
            requests.map((request) => (
              <TableRow key={request.id}>
                <TableCell className="font-medium">{request.id.slice(0, 8)}</TableCell>
                <TableCell>
                  {format(new Date(request.datetime), "yyyy-MM-dd HH:mm:ss")}
                </TableCell>
                <TableCell>{request.client_name}</TableCell>
                <TableCell>{request.system_id}</TableCell>
                <TableCell>
                  <span className={getStatusColor(request.status)}>
                    {request.status}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  {request.status.toUpperCase() === "COMPLETED" && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleViewResults(request.id)}
                    >
                      <Eye className="h-4 w-4 mr-1" /> View
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default OptimizationRequestsTable;