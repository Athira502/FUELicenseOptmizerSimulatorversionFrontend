import React, { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Loader, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import { fetchLogs } from "@/api/data_post";

interface UploadRecord {
    timestamp: string;
    client_name: string;
    system_name: string;
    filename: string;
    status: "In Progress" | "Success" | "Failed";
    log_data: string | null;
    id: string;
}

const UploadStatus = () => {
    const [records, setRecords] = useState<UploadRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
      const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
          const data: UploadRecord[] = await fetchLogs(); 
          setRecords(data);
        } catch (err: any) {
          setError(err.message || "An error occurred while fetching data.");
        } finally {
          setLoading(false);
        }
      };
    
      fetchData();
    }, []);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'short',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        }).format(date);
    };

    const getStatusBadgeClass = (status: "In Progress" | "Success" | "Failed") => {
        switch (status) {
            case "In Progress":
                return "bg-yellow-100 text-yellow-800 border-yellow-200";
            case "Success":
                return "bg-green-100 text-green-800 border-green-200";
            case "Failed":
                return "bg-red-100 text-red-800 border-red-200";
            default:
                return "bg-gray-100 text-gray-800 border-gray-200";
        }
    };

    return (
        <Layout title="File Upload Status">
            <div className="space-y-6 bg-white shadow-md rounded-lg p-6">
                <p className="text-gray-600 mb-4">
                    View the status of your recent file uploads. Monitor progress and check for any issues that may have occurred.
                </p>

                <div className="table-container">
                    {loading ? (
                        <div className="flex justify-center items-center p-8">
                            <Loader className="h-6 w-6 animate-spin text-belize-500" />
                            <span className="ml-2 text-belize-500">Loading...</span>
                        </div>
                    ) : error ? (
                        <div className="text-red-500 p-4 border border-red-500/30 rounded-md bg-red-50/50">
                            {error}
                        </div>
                    ) : (
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Timestamp</th>
                                    <th>Client Name</th>
                                    <th>System ID</th>
                                    <th>Filename</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {records.length > 0 ? (
                                    records.map((record) => (
                                        <tr key={record.id}>
                                            <td>{record.timestamp ? formatDate(record.timestamp) : 'N/A'}</td>
                                            <td>{record.client_name}</td>
                                            <td>{record.system_name}</td>
                                            <td className="font-mono text-xs">{record.filename}</td>
                                            <td>
                                                <span
                                                    className={cn(
                                                        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
                                                        getStatusBadgeClass(record.status)
                                                    )}
                                                >
                                                    {record.status === "In Progress" && (
                                                        <Loader className="h-3 w-3 mr-1 animate-spin" />
                                                    )}
                                                    {record.status}
                                                </span>
                                            </td>
                                            <td>
                                                {record.log_data && record.status === "Failed" ? (
                                                    <Dialog>
                                                        <DialogTrigger asChild>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="text-belize-600 hover:text-belize-700 hover:bg-belize-50"
                                                            >
                                                                <Eye className="h-4 w-4 mr-1" /> View Error
                                                            </Button>
                                                        </DialogTrigger>
                                                        <DialogContent className="max-w-2xl">
                                                            <DialogHeader>
                                                                <DialogTitle>Error Details</DialogTitle>
                                                            </DialogHeader>
                                                            <div className="bg-gray-100 p-4 rounded-md overflow-auto max-h-80">
                                                                <pre className="text-sm text-red-600 whitespace-pre-wrap">
                                                                    {record.log_data}
                                                                </pre>
                                                            </div>
                                                        </DialogContent>
                                                    </Dialog>
                                                ) : (
                                                    <span className="text-gray-400 text-sm">No actions</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="text-center py-8 text-gray-500">
                                            No upload records found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default UploadStatus;




