


import React, { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Download, Trash, Search } from "lucide-react";
import {
  fetchClients,
  fetchSystemsByClient,
  fetchTablesForClientSystem,
  downloadTableData,
  truncateTableData,
} from "@/api/data_post"; // Import API functions

interface TableInfo {
  tableName: string;
}

const ManageData = () => {
  const { toast } = useToast();
  const [clientsList, setClientsList] = useState<string[]>([]);
  const [systemsList, setSystemsList] = useState<string[]>([]);
  const [selectedClient, setSelectedClient] = useState<string>("");
  const [selectedSystem, setSelectedSystem] = useState<string>("");
  const [availableTables, setAvailableTables] = useState<string[] | null>(null); // Change to null

  useEffect(() => {
    const loadClients = async () => {
      try {
        const clients = await fetchClients();
        setClientsList(clients);
      } catch (error: any) {
        toast({ title: "Error", description: error.message, variant: "destructive",duration: 900, });
      }
    };

    loadClients();
  }, [toast]);

  useEffect(() => {
    const loadSystems = async () => {
      if (selectedClient) {
        try {
          const systems = await fetchSystemsByClient(selectedClient);
          setSystemsList(systems);
          setSelectedSystem(""); // Reset system when client changes
          setAvailableTables(null); // Clear tables when client changes
        } catch (error: any) {
          toast({ title: "Error", description: error.message, variant: "destructive" });
        }
      } else {
        setSystemsList([]);
        setSelectedSystem("");
        setAvailableTables(null);
      }
    };

    loadSystems();
  }, [selectedClient, toast]);

  const handleSearch = async () => {
    if (!selectedClient || !selectedSystem) {
      toast({
        title: "Selection Required",
        description: "Please select both a Client and a System ID",
        variant: "destructive",
        duration: 900,
      });
      return;
    }

    try {
      const tables = await fetchTablesForClientSystem(selectedClient, selectedSystem);
      if(tables && tables.length > 0){
        setAvailableTables(tables);
        toast({
          title: "Search Complete",
          description: `Found ${tables.length} data sources for ${selectedClient} - ${selectedSystem}`,
          duration: 900,
        });
      }
      else{
        setAvailableTables([]);
        toast({
          title: "Search Complete",
          description: `No data sources found for ${selectedClient} - ${selectedSystem}`,
          duration: 900,
        });
      }
      
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" ,duration: 900,});
      setAvailableTables(null);
    }
  };

  const handleDownload = async (tableName: string) => {
    if (!selectedClient || !selectedSystem) {
      toast({
        title: "Selection Required",
        description: "Please select both a Client and a System ID",
        variant: "destructive",
        duration: 900,
      });
      return;
    }

    try {
      toast({
        title: "Download Started",
        description: `Downloading ${tableName} for ${selectedClient} - ${selectedSystem}`,
        duration: 900,
      });
      await downloadTableData(selectedClient, selectedSystem, tableName);
      toast({
        title: "Download Complete",
        description: `Download of ${tableName} for ${selectedClient} - ${selectedSystem} finished.`,
        duration: 900,
      });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive",duration: 900, });
    }
  };

  const handleDelete = async (tableName: string) => {
    if (!selectedClient || !selectedSystem) {
      toast({
        title: "Selection Required",
        description: "Please select both a Client and a System ID",
        variant: "destructive",
        duration: 900,
      });
      return;
    }

    const confirmed = window.confirm(`Are you sure you want to delete all data from ${tableName} for ${selectedClient} - ${selectedSystem}? This action cannot be undone.`);
    if (confirmed) {
      try {
        const response = await truncateTableData(selectedClient, selectedSystem, tableName);
        toast({
          title: "Delete Successful",
          description: response.message || `Data in ${tableName} for ${selectedClient} - ${selectedSystem} has been deleted.`,duration: 900,
        });
        // Optionally, refresh the table list after deletion
        handleSearch();
      } catch (error: any) {
        toast({ title: "Error", description: error.message, variant: "destructive",duration: 900, });
      }
    }
  };

  return (
    <Layout title="Manage Data">
      <div className="space-y-6 bg-white shadow-md rounded-lg p-6">
        <p className="text-gray-600 mb-4">
          Download or delete data based on client and system selection. Select a client and system ID before performing any actions.
        </p>

        <div className="flex flex-col md:flex-row gap-4 mb-6 items-end">
          <div className="w-full md:w-1/3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Client
            </label>
            <Select
              value={selectedClient}
              onValueChange={(value) => {
                setSelectedClient(value);
              }}
            >
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

          <div className="w-full md:w-1/3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select System ID
            </label>
            <Select
              value={selectedSystem}
              onValueChange={(value) => {
                setSelectedSystem(value);
              }}
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

          <div className="w-full md:w-1/3">
            <Button
              onClick={handleSearch}
              className="w-full bg-belize-300 hover:bg-belize-400 text-white"
              disabled={!selectedClient || !selectedSystem}
            >
              <Search className="h-4 w-4 mr-2" /> Search
            </Button>
          </div>
        </div>

        {availableTables !== null && ( //tables loaded
          availableTables && availableTables.length > 0 ? (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Table Name</th>
                    <th>Client Name</th>
                    <th>System ID</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {availableTables.map((tableName) => (
                    <tr key={tableName}>
                      <td className="font-medium">{tableName}</td>
                      <td>{selectedClient}</td>
                      <td>{selectedSystem}</td>
                      <td>
                        <div className="flex justify-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownload(tableName)}
                            className="text-belize-600 hover:text-belize-700 hover:bg-belize-50"
                          >
                            <Download className="h-4 w-4 mr-1" /> Download
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(tableName)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash className="h-4 w-4 mr-1" /> Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No tables found for the selected Client: {selectedClient} and System: {selectedSystem}.
            </div>
          )
        )}

        {availableTables === null && selectedClient && selectedSystem && (
          <div className="text-center py-8 text-gray-500">
            Click Search to view available data
          </div>
        )}

        {!selectedClient || !selectedSystem && (
          <div className="text-center py-8 text-gray-500">
            Please select a Client and System ID to search for data
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ManageData;
