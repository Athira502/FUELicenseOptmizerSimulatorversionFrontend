
import React, { useState } from "react";
import { toast, useToast } from "@/hooks/use-toast";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload } from "lucide-react";
import { uploadLicenseData, uploadAuthData, uploadRoleFioriMapData, uploadMasterDerivedData, uploadUserData, uploadUserRoleMapData, uploadUserRoleMappingData, uploadRoleLicenseSummaryData, uploadObjectFieldLicenseData } from "../api/data_post"; // Import API functions

interface FileUploadRowProps {
  title: string;
  allowedExtensions: string[];
  onFileUpload: (
    title: string, 
    clientName: string,
    systemId: string,
    systemRelease: string,
    file: File | null
  ) => void;
}

const FileUploadRow: React.FC<FileUploadRowProps> = ({
  title,
  allowedExtensions,
  onFileUpload,
}) => {
  const { toast } = useToast();
  const [clientName, setClientName] = useState<string>("");
  const [systemId, setSystemId] = useState<string>("");
  const [systemRelease, setSystemRelease] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [isUploading, setIsUploading] = useState<boolean>(false); 

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;

    if (!selectedFile) {
      setFile(null);
      setFileName("");
      return;
    }

    const extension = selectedFile.name.split(".").pop()?.toLowerCase() || "";

    if (!allowedExtensions.includes(`.${extension}`)) {
      toast({
        title: "Invalid File",
        description: `Please upload a file with one of these extensions: ${allowedExtensions.join(", ")}`,
        variant: "destructive",
      });
      e.target.value = "";
      setFile(null);
      setFileName("");
      return;
    }

    setFile(selectedFile);
    setFileName(selectedFile.name);
  };

  const handleUpload = async () => {
    if (!clientName.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter a Client Name",
        variant: "destructive",
      });
      return;
    }

    if (!systemId.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter a System SID",
        variant: "destructive",
      });
      return;
    }

    if (!systemRelease.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter System Release Info",
        variant: "destructive",
      });
      return;
    }

    if (!file) {
      toast({
        title: "No File Selected",
        description: "Please select a file to upload",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    toast({
      title: "Upload Started",
      description: `Uploading ${file.name} for ${clientName} - ${systemId}...`,
    });

    try {
      let responseData;
      if (title.includes("FUE License Roles")) {
        responseData = await uploadLicenseData(clientName, systemId,systemRelease, file); 
      } else if (title.includes("Authorization")) {
        responseData = await uploadAuthData(clientName, systemId,systemRelease, file); 
      } else if (title.includes("Role Fiori")) {
        responseData = await uploadRoleFioriMapData(clientName, systemId, systemRelease, file);
      } else if (title === "Master & Derived Role Mapping Data") { 
        responseData = await uploadMasterDerivedData(clientName, systemId, systemRelease, file);
      } else if (title.includes("User Details")) {
          responseData = await uploadUserData(clientName, systemId, systemRelease, file);
      } else if (title.includes("User Role Mapping")) {
    responseData = await uploadUserRoleMappingData(clientName, systemId, systemRelease, file);

  } else if (title.includes("User Role Map")) {
    responseData = await uploadUserRoleMapData(clientName, systemId, systemRelease, file);

  } else if (title.includes("Role License Summary")) {
    responseData = await uploadRoleLicenseSummaryData(clientName, systemId, systemRelease, file);

  } else if (title.includes("RuleSet")) {
    responseData = await uploadObjectFieldLicenseData(clientName, systemId, systemRelease, file);

  }
 else {
        toast({
          title: "Unsupported Upload Type",
          description: `No API endpoint configured for ${title}`,
          variant: "destructive",
        });
        return;
      }
   

      toast({
        title: "Upload Complete",
        description: responseData?.message || "File uploaded successfully!",
      });
      // Optionally reset the form
      setFile(null);
      setFileName("");
      setClientName("");
      setSystemId("");
      setSystemRelease("");
    } catch (error: any) {
      toast({
        title: "Upload Failed",
        description: error?.message || "An error occurred during upload.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-6 gap-4 p-4 border-b border-gray-200 items-center">
      <div className="text-sm font-medium">{title}</div>

      <div>
        <Input
          type="text"
          placeholder="Client Name *"
          value={clientName}
          onChange={(e) => setClientName(e.target.value)}
          required
          className="border-belize-300"
        />
      </div>

      <div>
        <Input
          type="text"
          placeholder="System SID *"
          value={systemId}
          maxLength={10}
          onChange={(e) => setSystemId(e.target.value)}
          required
          className="border-belize-300"
        />
      </div>

      <div>
        <Input
          type="text"
          placeholder="System Release Info *"
          value={systemRelease}
          onChange={(e) => setSystemRelease(e.target.value)}
          required
          className="border-belize-300"
        />
      </div>

      <div className="relative">
        <input
          type="file"
          id={`file-${title.replace(/\s+/g, '-').toLowerCase()}`}
          className="sr-only"
          onChange={handleFileChange}
          accept={allowedExtensions.join(",")}
        />
        <Label
          htmlFor={`file-${title.replace(/\s+/g, '-').toLowerCase()}`}
          className="cursor-pointer flex items-center justify-center w-full px-4 py-2 text-sm bg-belize-100 hover:bg-belize-200 text-belize-800 rounded-md border border-belize-300"
        >
          <Upload className="h-4 w-4 mr-2" />
          {fileName ? fileName : "Choose File"}
        </Label>
      </div>

      <div>
        <Button
          onClick={handleUpload}
          className={`bg-belize-300 hover:bg-belize-400 text-white w-full ${isUploading ? "opacity-50 cursor-not-allowed" : ""}`}
          disabled={isUploading}
        >
          {isUploading ? "Uploading..." : "Upload File"}
        </Button>
      </div>
    </div>
  );
};
const handleFileUpload = async (
  title: string,
  clientName: string,
  systemId: string,
  systemRelease: string, 
  file: File | null
) => {
  if (!file) return;

  try {
    toast({
      title: "Upload Started",
      description: `Uploading ${file.name} for ${clientName} - ${systemId}...`,
    });

    let responseData;
    
    if (title.includes("FUE License Roles")) {
      responseData = await uploadLicenseData(clientName, systemId,systemRelease, file); 
    } else if (title.includes("Authorization")) {
      responseData = await uploadAuthData(clientName, systemId,systemRelease, file); 
    } else if (title.includes("Role Fiori")) {
      responseData = await uploadRoleFioriMapData(clientName, systemId, systemRelease, file);
    } else if (title === "Master & Derived Role Mapping Data") { //changed this line
      responseData = await uploadMasterDerivedData(clientName, systemId, systemRelease, file);
    } else if (title.includes("User Details")) {
        responseData = await uploadUserData(clientName, systemId, systemRelease, file);
    } else if (title.includes("User Role Mapping")) {
    responseData = await uploadUserRoleMappingData(clientName, systemId, systemRelease, file);

  } else if (title.includes("User Role Map")) {
    responseData = await uploadUserRoleMapData(clientName, systemId, systemRelease, file);

  } else if (title.includes("Role License Summary")) {
    responseData = await uploadRoleLicenseSummaryData(clientName, systemId, systemRelease, file);

  } else if (title.includes("RuleSet")) {
    responseData = await uploadObjectFieldLicenseData(clientName, systemId, systemRelease, file);

  } else {
      toast({
        title: "Unsupported Upload Type",
        description: `No API endpoint configured for ${title}`,
        variant: "destructive",
      });
      return;
    }
    

    toast({
      title: "Upload Complete",
      description: responseData?.message || "File uploaded successfully!",
    });
  } catch (error: any) {
    toast({
      title: "Upload Failed",
      description: error?.message || "An error occurred during upload.",
      variant: "destructive",
    });
  }
};

const UploadFile = () => {
  return (
    <Layout title="Upload File">
      <div className="space-y-6 bg-white shadow-md rounded-lg p-6">
        <p className="text-gray-600 mb-4">
          Upload your data files to populate the system. Please ensure that files are in the correct format.
          <span className="text-red-500 ml-1">*</span> indicates required fields.
        </p>

        <div className="table-container">
          <div className="bg-gray-50 p-4 border-b border-gray-200 font-medium">
            <div className="grid grid-cols-1 lg:grid-cols-6 gap-4">
              <div>Data Type</div>
              <div>Client Name <span className="text-red-500">*</span></div>
              <div>System SID <span className="text-red-500">*</span></div>
              <div>System Release Info <span className="text-red-500">*</span></div>
              <div>File</div>
              <div>Action</div>
            </div>
          </div>

          <FileUploadRow
        title="FUE License Roles & Objects Mapping Data"
        allowedExtensions={[".xml"]}
        onFileUpload={handleFileUpload} 
      />

<FileUploadRow
        title="Role Authorization Object Mapping Data"
        allowedExtensions={[".csv"]}
        onFileUpload={handleFileUpload} 
      />

          <FileUploadRow
            title="Role Fiori Apps Mapping data"
            allowedExtensions={[".csv"]}
            onFileUpload={handleFileUpload}
            
          />

          <FileUploadRow
            title="Master & Derived Role Mapping Data"
            allowedExtensions={[".csv"]}
            onFileUpload={handleFileUpload}
          />

          <FileUploadRow
            title="User Details Data"
            allowedExtensions={[".csv"]}
            onFileUpload={handleFileUpload}
          />

          <FileUploadRow
            title="User Role Mapping Data"
            allowedExtensions={[".csv"]}
            onFileUpload={handleFileUpload}
          />

          <FileUploadRow
            title="Role License Summary Data"
            allowedExtensions={[".csv"]}
            onFileUpload={handleFileUpload}
          />

          <FileUploadRow
            title="FUE License RuleSet"
            allowedExtensions={[".csv"]}
            onFileUpload={handleFileUpload}
          />
        </div>
      </div>
    </Layout>
  );

 
};

export default UploadFile;
