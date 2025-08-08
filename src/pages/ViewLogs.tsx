


// import React, { useState, useEffect } from "react";
// import Layout from "@/components/Layout"; 
// import { Button } from "@/components/ui/button"; 
// import {
//     Dialog,
//     DialogContent,
//     DialogHeader,
//     DialogTitle,
//     DialogTrigger,
// } from "@/components/ui/dialog";
// import { Loader, Eye, Download } from "lucide-react";
// import { cn } from "@/lib/utils";
// import { fetchLogFilenames, fetchLogContent, downloadLogFile } from "@/api/data_post";

// interface LogRecord {
//     id: string;
//     timestamp_display: string;
//     client_name: string;
//     system_name: string;
// }

// const LogsPage = () => {
//     const [logRecords, setLogRecords] = useState<LogRecord[]>([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState<string | null>(null);

//     const [currentLogContent, setCurrentLogContent] = useState<string | null>(null);
//     const [fetchingContent, setFetchingContent] = useState(false);
//     const [contentError, setContentError] = useState<string | null>(null);
//     const [isDialogOpen, setIsDialogOpen] = useState(false);
//     const [dialogLogFilename, setDialogLogFilename] = useState<string>('');
    
//     const [downloading, setDownloading] = useState(false);

//     const parseLogFilename = (filename: string): LogRecord | null => {
//         const match = filename.match(/^([a-zA-Z0-9_]+)-([a-zA-Z0-9_]+)-(\d{8})-(\d{6})\.log$/);
//         if (match) {
//             const [, clientName, systemId, datePart, timePart] = match;
           
//             const year = datePart.substring(0, 4);
//             const month = datePart.substring(4, 6);
//             const day = datePart.substring(6, 8);
//             const hour = timePart.substring(0, 2);
//             const minute = timePart.substring(2, 4);
//             const second = timePart.substring(4, 6);
//             const isoTimestamp = `${year}-${month}-${day}T${hour}:${minute}:${second}`;

//             const date = new Date(isoTimestamp);

//             const timestamp_display = new Intl.DateTimeFormat('en-US', {
//                 year: 'numeric',
//                 month: 'short',
//                 day: '2-digit',
//                 hour: '2-digit',
//                 minute: '2-digit',
//                 hour12: true
//             }).format(date);

//             return {
//                 id: filename,
//                 client_name: clientName,
//                 system_name: systemId,
//                 timestamp_display: timestamp_display,
//             };
//         }
//         return null;
//     };

//     useEffect(() => {
//         const loadLogs = async () => {
//             setLoading(true);
//             setError(null);
//             try {
//                 const filenames = await fetchLogFilenames();
               
//                 const parsedRecords = filenames
//                     .map(parseLogFilename)
//                     .filter((record): record is LogRecord => record !== null);
               
//                 setLogRecords(parsedRecords);
//             } catch (err: any) {
//                 console.error("Failed to load log list:", err);
//                 setError(err.message || "Failed to load log list. Please check the backend.");
//             } finally {
//                 setLoading(false);
//             }
//         };

//         loadLogs();
//     }, []);

//     const handleViewLog = async (filename: string) => {
//         setFetchingContent(true);
//         setCurrentLogContent(null);
//         setContentError(null);
//         setDialogLogFilename(filename);

//         try {
//             const content = await fetchLogContent(filename);
//             setCurrentLogContent(content);
//         } catch (err: any) {
//             console.error(`Failed to fetch content for ${filename}:`, err);
//             setContentError(err.message || "Failed to fetch log content.");
//         } finally {
//             setFetchingContent(false);
//         }
//     };

//     const handleDownloadLog = async (filename: string) => {
//         setDownloading(true);
        
//         try {
//             // Use the API function instead of direct fetch
//             const result = await downloadLogFile(filename);
            
//             // Optional: Show success message
//             // alert(`Successfully downloaded: ${result.filename}`);
            
//         } catch (err: any) {
//             console.error(`Failed to download ${filename}:`, err);
//             alert(`Failed to download ${filename}: ${err.message}`);
//         } finally {
//             setDownloading(false);
//         }
//     };

//     return (
//         <Layout title="View Logs">
//             <div className="space-y-6 bg-white shadow-md rounded-lg p-6">
//                 <p className="text-gray-600 mb-4">
//                     View logs for specific client and system activities.
//                 </p>

//                 <div className="table-container">
//                     {loading ? (
//                         <div className="flex justify-center items-center p-8">
//                             <Loader className="h-6 w-6 animate-spin text-belize-500" />
//                             <span className="ml-2 text-belize-500">Loading logs...</span>
//                         </div>
//                     ) : error ? (
//                         <div className="text-red-500 p-4 border border-red-500/30 rounded-md bg-red-50/50">
//                             {error}
//                         </div>
//                     ) : (
//                         <table className="data-table">
//                             <thead>
//                                 <tr>
//                                     <th>Timestamp</th>
//                                     <th>Client Name</th>
//                                     <th>System ID</th>
//                                     <th>Actions</th>
//                                 </tr>
//                             </thead>
//                             <tbody>
//                                 {logRecords.length > 0 ? (
//                                     logRecords.map((record) => (
//                                         <tr key={record.id}>
//                                             <td>{record.timestamp_display}</td>
//                                             <td>{record.client_name}</td>
//                                             <td>{record.system_name}</td>
//                                             <td>
//                                                 <Dialog open={isDialogOpen && dialogLogFilename === record.id} onOpenChange={setIsDialogOpen}>
//                                                     <DialogTrigger asChild>
//                                                         <Button
//                                                             variant="outline"
//                                                             size="sm"
//                                                             className="text-belize-600 hover:text-belize-700 hover:bg-belize-50"
//                                                             onClick={() => handleViewLog(record.id)}
//                                                         >
//                                                             <Eye className="h-4 w-4 mr-1" /> View Log
//                                                         </Button>
//                                                     </DialogTrigger>
//                                                     {isDialogOpen && dialogLogFilename === record.id && (
//                                                         <DialogContent className="max-w-2xl">
//                                                             <DialogHeader>
//                                                                 <div className="flex justify-between items-center">
//                                                     <DialogTitle>Log Details: {dialogLogFilename}</DialogTitle>
//                                                             <div className="flex items-center space-x-2 mr-8">
//                                                                 <Button
//                                                                 variant="outline"
//                                                                 size="sm"
//                                                                 onClick={() => handleDownloadLog(dialogLogFilename)}
//                                                                 disabled={downloading}
//                                                                 className="text-belize-600 hover:text-belize-700 hover:bg-white-50"
//                                                                 >
//                                                                 {downloading ? (
//                                                                     <Loader className="h-4 w-4 mr-1 animate-spin" />
//                                                                 ) : (
//                                                                     <Download className="h-4 w-4 mr-1" />
//                                                                 )}
//                                                                 Download
//                                                                 </Button>
                                                                
//                                                             </div>
//                                                             </div>
                                                                
//                                                             </DialogHeader>
//                                                             <div className="bg-gray-100 p-4 rounded-md overflow-auto max-h-80">
//                                                                 {fetchingContent ? (
//                                                                     <div className="flex justify-center items-center p-4">
//                                                                         <Loader className="h-5 w-5 animate-spin text-belize-500" />
//                                                                         <span className="ml-2 text-belize-500">Loading log content...</span>
//                                                                     </div>
//                                                                 ) : contentError ? (
//                                                                     <pre className="text-sm text-red-600 whitespace-pre-wrap">
//                                                                         Error: {contentError}
//                                                                     </pre>
//                                                                 ) : (
//                                                                     <pre className="text-sm text-gray-800 whitespace-pre-wrap">
//                                                                         {currentLogContent || "No content available."}
//                                                                     </pre>
//                                                                 )}
//                                                             </div>
//                                                         </DialogContent>
//                                                     )}
//                                                 </Dialog>
//                                             </td>
//                                         </tr>
//                                     ))
//                                 ) : (
//                                     <tr>
//                                         <td colSpan={4} className="text-center py-8 text-gray-500">
//                                             No client/system logs found matching the expected pattern.
//                                         </td>
//                                     </tr>
//                                 )}
//                             </tbody>
//                         </table>
//                     )}
//                 </div>
//             </div>
//         </Layout>
//     );
// };

// export default LogsPage;


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
import { Loader, Eye, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { getLogFiles, downloadLogFile } from "@/api/log_api";

interface LogFileDetail {
    filename: string;
    size_bytes: number;
    size_human: string;
    modified_at: string;
    created_at: string;
    age_days: number;
}

const LogsPage = () => {
    const [logFiles, setLogFiles] = useState<LogFileDetail[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [currentLogContent, setCurrentLogContent] = useState<string | null>(null);
    const [fetchingContent, setFetchingContent] = useState(false);
    const [contentError, setContentError] = useState<string | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [dialogLogFilename, setDialogLogFilename] = useState<string>('');

    const [downloading, setDownloading] = useState(false);

    useEffect(() => {
        const loadLogs = async () => {
            setLoading(true);
            setError(null);
            try {
                // Use the refactored getLogFiles function from the API client
                const response = await getLogFiles();
                if (response && response.files) {
                    setLogFiles(response.files);
                } else {
                    setLogFiles([]);
                }
            } catch (err: any) {
                console.error("Failed to load log list:", err);
                setError(err.message || "Failed to load log list. Please check the backend.");
            } finally {
                setLoading(false);
            }
        };

        loadLogs();
    }, []);

    const handleViewLog = async (filename: string) => {
        setFetchingContent(true);
        setCurrentLogContent(null);
        setContentError(null);
        setDialogLogFilename(filename);
        setIsDialogOpen(true); // Open the dialog immediately

        try {
            // Use the getLogFiles function with a filename to fetch specific content
            const response = await getLogFiles(filename);
            if (response && response.content) {
                setCurrentLogContent(response.content);
            } else {
                setCurrentLogContent("No content available for this log file.");
            }
        } catch (err: any) {
            console.error(`Failed to fetch content for ${filename}:`, err);
            setContentError(err.message || "Failed to fetch log content.");
        } finally {
            setFetchingContent(false);
        }
    };

    const handleDownloadLog = async (filename: string) => {
        setDownloading(true);

        try {
            await downloadLogFile(filename);
        } catch (err: any) {
            console.error(`Failed to download ${filename}:`, err);
            alert(`Failed to download ${filename}: ${err.message}`);
        } finally {
            setDownloading(false);
        }
    };


    return (
        <Layout title="View Logs">
            <div className="space-y-6 bg-white shadow-md rounded-lg p-6">
                <p className="text-gray-600 mb-4">
                    View logs for specific client and system activities.
                </p>
                <div className="table-container">
                    {loading ? (
                        <div className="flex justify-center items-center p-8">
                            <Loader className="h-6 w-6 animate-spin text-belize-500" />
                            <span className="ml-2 text-belize-500">Loading logs...</span>
                        </div>
                    ) : error ? (
                        <div className="text-red-500 p-4 border border-red-500/30 rounded-md bg-red-50/50">
                            {error}
                        </div>
                    ) : (
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Filename</th>
                                    <th>Created At</th>
                                    <th>Size</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {logFiles.length > 0 ? (
                                    logFiles.map((file) => {
                                        const formattedDate = new Date(file.created_at).toLocaleString();

                                        return (
                                            <tr key={file.filename}>
                                                <td>{file.filename}</td>
                                                <td>{formattedDate}</td>
                                               
                                                <td>{file.size_human}</td>
                                                <td>
                                                    <div className="flex space-x-2">
                                                        <Dialog open={isDialogOpen && dialogLogFilename === file.filename} onOpenChange={setIsDialogOpen}>
                                                            <DialogTrigger asChild>
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    className="text-belize-600 hover:text-belize-700 hover:bg-belize-50"
                                                                    onClick={() => handleViewLog(file.filename)}
                                                                >
                                                                    <Eye className="h-4 w-4 mr-1" /> View
                                                                </Button>
                                                            </DialogTrigger>
                                                            {isDialogOpen && dialogLogFilename === file.filename && (
                                                                <DialogContent className="max-w-2xl">
                                                                    <DialogHeader>
                                                                        <div className="flex justify-between items-center">
                                                                            <DialogTitle>Log Details: {dialogLogFilename}</DialogTitle>
                                                                            <Button
                                                                                variant="outline"
                                                                                size="sm"
                                                                                onClick={() => handleDownloadLog(dialogLogFilename)}
                                                                                disabled={downloading}
                                                                                className="text-belize-600 hover:text-belize-700 hover:bg-white-50"
                                                                            >
                                                                                {downloading ? (
                                                                                    <Loader className="h-4 w-4 mr-1 animate-spin" />
                                                                                ) : (
                                                                                    <Download className="h-4 w-4 mr-1" />
                                                                                )}
                                                                                Download
                                                                            </Button>
                                                                        </div>
                                                                    </DialogHeader>
                                                                    <div className="bg-gray-100 p-4 rounded-md overflow-auto max-h-80">
                                                                        {fetchingContent ? (
                                                                            <div className="flex justify-center items-center p-4">
                                                                                <Loader className="h-5 w-5 animate-spin text-belize-500" />
                                                                                <span className="ml-2 text-belize-500">Loading log content...</span>
                                                                            </div>
                                                                        ) : contentError ? (
                                                                            <pre className="text-sm text-red-600 whitespace-pre-wrap">
                                                                                Error: {contentError}
                                                                            </pre>
                                                                        ) : (
                                                                            <pre className="text-sm text-gray-800 whitespace-pre-wrap">
                                                                                {currentLogContent || "No content available."}
                                                                            </pre>
                                                                        )}
                                                                    </div>
                                                                </DialogContent>
                                                            )}
                                                        </Dialog>
                                                      
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="text-center py-8 text-gray-500">
                                            No client/system logs found.
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

export default LogsPage;