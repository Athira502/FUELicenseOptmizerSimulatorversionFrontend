


import React, { useState, useEffect } from "react"; 
import { Link, useNavigate } from "react-router-dom"; 
import Layout from "@/components/Layout"; 
import FilterRoles from "@/components/FilterRoles"; 
import RoleProfileSummary from "@/components/RoleProfileSummary"; 
import AuthorizationObjects from "../components/AuthorizationObjects"; 
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"; 
import { Button } from "@/components/ui/button"; 
import { ArrowLeft, RefreshCw, Loader2, AlertCircle } from "lucide-react"; 
import { useToast } from "@/components/ui/use-toast"; 
import { Alert, AlertDescription } from "@/components/ui/alert"; 
import { runSimulation } from "@/api/result_save";
import { 

  getRoleDetailsforSim, 

  getSpecificRoleDetailsforSim, 

  getAuthObjFieldLicData, 

  applySimulationChangesToDb, 

  getLicenseClassificationPivotTable, 

  AuthObjectFieldLicenseData, 

  SimulationChangePayload, 

  AddSuggestion, 

  getAddSuggestions, 

  createSimulationTable 

} from "@/api/simulation_api"; 

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import {
  fetchClients, 
  fetchSystemsByClient, 
} from "@/api/data_post"; 

import FilterObjects from "@/components/FilterObjects";

 

interface Role { 

  id: string; 

  description: string; 

  classification: string; 

  gb: number; 

  gc: number; 

  gd: number; 

  assignedUsers: number; 

  objects: any[]; 

} 

 

 

interface ObjectDetail { 

  id: number; 

  object: string; 

  classification: string; 

  fieldName: string; 

  valueLow: string; 

  valueHigh: string; 

  ttext?: string; 

  action: string | null; 

  newValue: string; 

  isNew: boolean; 

  dynamicLicenseOptions?: { value: string; label: string }[]; 

  addSuggestions?: AddSuggestion[]; 

  selectedLicense?: string; 

} 

 

interface AllEditedObjects { 

  [roleId: string]: ObjectDetail[]; 

} 

 

interface PendingChangesSummary { 

  totalChanges: number; 

  changesByAction: Record<string, number>; 

} 

 

const CreateSimulation = () => { 

  const navigate = useNavigate(); 

  const { toast } = useToast(); 

  const [searchTerm, setSearchTerm] = useState(""); 

  const [licenseFilter, setLicenseFilter] = useState("all"); 

  const [selectedRole, setSelectedRole] = useState<Role | null>(null); 

  const [currentEditedObjects, setCurrentEditedObjects] = useState<ObjectDetail[]>([]); 

  const [hasChanges, setHasChanges] = useState(false); 
  // const [objectSearchTerm, setObjectSearchTerm] = useState("");
  const [objectSearchTerm, setObjectSearchTerm] = useState("");

  const [isEditing, setIsEditing] = useState(false); 

  const [savedChanges, setSavedChanges] = useState(false); 

  const [roles, setRoles] = useState<Role[]>([]); 

  const [loading, setLoading] = useState(false); 

  const [error, setError] = useState<string | null>(null); 

  const [clientsList, setClientsList] = useState<string[]>([]); // New state for clients
    const [systemsList, setSystemsList] = useState<string[]>([]); // New state for systems
    const [selectedClient, setSelectedClient] = useState<string>(""); // Renamed from clientId
    const [selectedSystem, setSelectedSystem] = useState<string>(""); // Renamed from systemId

  const [isLoadingRoles, setIsLoadingRoles] = useState(false); 

  const [dataLoaded, setDataLoaded] = useState(false); 

  const [loadingDynamicOptions, setLoadingDynamicOptions] = useState<{ [key: number]: boolean }>({}); 

  const [allEditedObjects, setAllEditedObjects] = useState<AllEditedObjects>({}); 

  const [simulationRunning, setSimulationRunning] = useState(false); 

  const [isCreatingTable, setIsCreatingTable] = useState(false); 

const [systemReleaseInfo, setSystemReleaseInfo] = useState(""); 
const [classificationSearchTerm, setClassificationSearchTerm] = useState("");

 
useEffect(() => {
    const loadClients = async () => {
      try {
        const clients = await fetchClients();
        setClientsList(clients);
      } catch (error: any) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      }
    };

    loadClients();
  }, [toast]);

  // Effect to load systems when selectedClient changes
  useEffect(() => {
    const loadSystems = async () => {
      if (selectedClient) {
        try {
          const systems = await fetchSystemsByClient(selectedClient);
          setSystemsList(systems);
          setSelectedSystem(""); // Reset system when client changes
        } catch (error: any) {
          toast({ title: "Error", description: error.message, variant: "destructive" });
        }
      } else {
        setSystemsList([]);
        setSelectedSystem("");
      }
    };

    loadSystems();
  }, [selectedClient, toast]);
  const getLocalStorageKey = (roleId: string, client: string, system: string) => 

    `edited_objects_${roleId}_${client}_${system}`; 

 

  const getAllRolesLocalStorageKey = (client: string, system: string) => 

    `all_edited_roles_${client}_${system}`; 

 

  useEffect(() => { 

    if (selectedClient && selectedSystem) { 

      const storedAllEditedObjects = localStorage.getItem(getAllRolesLocalStorageKey(selectedClient, selectedSystem)); 

      if (storedAllEditedObjects) { 

        try { 

          const parsed = JSON.parse(storedAllEditedObjects); 

          setAllEditedObjects(parsed); 

        } catch (e) { 

          console.error("Failed to parse allEditedObjects from localStorage:", e); 

          localStorage.removeItem(getAllRolesLocalStorageKey(selectedClient, selectedSystem)); 

        } 

      } 

    } 

  }, [selectedClient, selectedSystem]); 

 


  useEffect(() => { 

    if (selectedRole && allEditedObjects[selectedRole.id]) { 

      setCurrentEditedObjects(allEditedObjects[selectedRole.id]); 

      setHasChanges(true); 

      setSavedChanges(true); 

    } else if (selectedRole) { 

      setCurrentEditedObjects(selectedRole.objects); 

      setHasChanges(false); 

      setSavedChanges(false); 

    } 

  }, [selectedRole, allEditedObjects]); 

 

  const fetchRoles = async () => { 

    if (!selectedClient.trim() || !selectedSystem.trim()) { 

      toast({ 

        title: "Missing Information", 

        description: "Please enter both client name and system name.", 

        variant: "destructive", 

      }); 

      return; 

    } 

 

    setIsLoadingRoles(true); 

    setError(null); 

    setRoles([]); 

    setSelectedRole(null); 

    setCurrentEditedObjects([]); 

    setAllEditedObjects({}); 

    localStorage.removeItem(getAllRolesLocalStorageKey(selectedClient, selectedSystem)); 

 

    try { 

      const roleData = await getRoleDetailsforSim(selectedClient.trim(), selectedSystem.trim()); 

 

      const transformedRoles: Role[] = roleData.map(role => ({ 

        id: role.id, 

        description: role.description, 

        classification: role.classification, 

        gb: role.gb, 

        gc: role.gc, 

        gd: role.gd, 

        assignedUsers: role.assignedUsers, 

        objects: [] 

      })); 

 

      setRoles(transformedRoles); 

      setDataLoaded(true); 

 

      toast({ 

        title: "Success", 

        description: `Loaded ${transformedRoles.length} roles successfully.`, 

      }); 

    } catch (err) { 

      setError(err instanceof Error ? err.message : 'Failed to fetch roles'); 

      toast({ 

        title: "Error", 

        description: "Failed to fetch roles. Please check your client and system names.", 

        variant: "destructive", 

      }); 

    } finally { 

      setIsLoadingRoles(false); 

    } 

  }; 

 

  const reloadAllData = () => { 

    fetchRoles(); 

  }; 

 const wildcardToRegExp = (pattern: string): RegExp => {
    let regexPattern;
    const hasExplicitWildcard = pattern.includes('*') || pattern.includes('%');

    if (hasExplicitWildcard) {
      let escaped = pattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&');
      regexPattern = escaped.replace(/[*%]/g, '.*');
      regexPattern = `^${regexPattern}$`;
    } else {
     
      let escaped = pattern.replace(/[+?^${}()|[\]\\]/g, '\\$&');
      regexPattern = `^${escaped}.*`; 
    }
    
    return new RegExp(regexPattern, 'i'); 
  };


  const filteredRoles = roles.filter(role => {
    const lowerCaseSearchTerm = searchTerm.toLowerCase().trim();

    const searchRegExp = lowerCaseSearchTerm ? wildcardToRegExp(lowerCaseSearchTerm) : null;

    const matchesSearch = !searchRegExp ||
      searchRegExp.test(role.id.toLowerCase());

    const matchesLicense = licenseFilter === "all" ||
      role.classification.toLowerCase().includes(licenseFilter.toLowerCase());



    return matchesSearch && matchesLicense;
  });

  

 

  const handleRoleSelect = async (role: Role) => { 

    if (!selectedClient.trim() || !selectedSystem.trim()) { 

      toast({ 

        title: "Missing Information", 

        description: "Please enter both client name and system name.", 

        variant: "destructive", 

      }); 

      return; 

    } 

 

    setLoading(true); 

    try { 

      const roleDetails = await getSpecificRoleDetailsforSim(role.id, selectedClient.trim(), selectedSystem.trim()); 

 

      const transformedObjects: ObjectDetail[] = roleDetails.objectDetails.map((obj, index) => ({ 

        id: index + 1, 

        object: obj.object, 

        classification: obj.classification, 

        fieldName: obj.fieldName, 

        valueLow: obj.valueLow, 

        valueHigh: obj.valueHigh, 

        ttext: obj.ttext, 

        action: null, 

        newValue: "", 

        isNew: false, 

        dynamicLicenseOptions: undefined 

      })); 

 

      const updatedRole = { 

        ...role, 

        objects: transformedObjects 

      }; 

 

      setSelectedRole(updatedRole); 

 

      let objectsToDisplay = transformedObjects; 

      if (allEditedObjects[role.id]) { 

        const savedForThisRole = allEditedObjects[role.id]; 

        const mergedObjects = transformedObjects.map(originalObj => { 

          const savedObj = savedForThisRole.find(p => p.id === originalObj.id); 

          return savedObj ? { ...originalObj, ...savedObj } : originalObj; 

        }); 

        const newObjectsFromSaved = savedForThisRole.filter(p => p.isNew && !transformedObjects.some(o => o.id === p.id)); 

        objectsToDisplay = [...mergedObjects, ...newObjectsFromSaved]; 

 

        setHasChanges(true); 

        setSavedChanges(true); 

        toast({ 

            title: "Unsaved Changes Loaded", 

            description: "Previous unsaved changes for this role have been loaded.", 

        }); 

      } else { 

        setHasChanges(false); 

        setSavedChanges(false); 

      } 

 

      setCurrentEditedObjects(objectsToDisplay); 

      setIsEditing(false); 

    } catch (err) { 

      setError(err instanceof Error ? err.message : 'Failed to fetch role details'); 

      toast({ 

        title: "Error", 

        description: "Failed to fetch role details. Please try again.", 

        variant: "destructive", 

      }); 

    } finally { 

      setLoading(false); 

    } 

  }; 

 

  const handleEditClick = () => { 

    setIsEditing(true); 

  }; 

  const fetchAddSuggestions = async (objId: number, authorizationObject: string, fieldName: string) => { 

  if (!selectedClient.trim() || !selectedSystem.trim()) { 

    toast({ 

      title: "Missing Data", 

      description: "Cannot fetch suggestions: Client or System Name is missing.", 

      variant: "destructive", 

    }); 

    return; 

  } 

 

  setLoadingDynamicOptions(prev => ({ ...prev, [objId]: true })); 

  try { 

    const suggestions = await getAddSuggestions(authorizationObject, fieldName, selectedClient, selectedSystem); 

 

    setCurrentEditedObjects(prev => { 

      const updated = prev.map(obj => 

        obj.id === objId ? {  

          ...obj,  

          addSuggestions: suggestions, 

          // Pre-populate first suggestion if available 

          ...(suggestions.length > 0 && !obj.valueLow ? { 

            valueLow: suggestions[0].value, 

            selectedLicense: suggestions[0].license, 

            newValue: suggestions[0].ui_text 

          } : {}) 

        } : obj 

      ); 

      if (selectedRole) { 

        setAllEditedObjects(prevAll => { 

          const newAll = { ...prevAll, [selectedRole.id]: updated }; 

          localStorage.setItem(getAllRolesLocalStorageKey(selectedClient.trim(), selectedSystem.trim()), JSON.stringify(newAll)); 

          return newAll; 

        }); 

      } 

      return updated; 

    }); 

  } catch (err) { 

    toast({ 

      title: "Error", 

      description: `Failed to fetch suggestions for ${authorizationObject}/${fieldName}.`, 

      variant: "destructive", 

    }); 

    console.error(`Error fetching add suggestions for ${authorizationObject}/${fieldName}:`, err); 

  } finally { 

    setLoadingDynamicOptions(prev => ({ ...prev, [objId]: false })); 

  } 

}; 

 

 

const handleCreateSimulationTable = async () => { 

  if (!selectedClient.trim() || !selectedSystem.trim() || !systemReleaseInfo.trim()) { 

    toast({ 

      title: "Missing Information", 

      description: "Please enter client name, system name, and system release info.", 

      variant: "destructive", 

    }); 

    return; 

  } 

 

  setIsCreatingTable(true); 

  try { 

    const result = await createSimulationTable( 

      selectedClient.trim(),  

      selectedSystem.trim(), 

      systemReleaseInfo.trim() 

    ); 

 

    toast({ 

      title: "Simulation Table Created", 

      description: result.message, 

      variant: "default", 

    }); 

 


    await fetchRoles(); 

     

  } catch (err) { 

    setError(err instanceof Error ? err.message : 'Failed to create simulation table'); 

    toast({ 

      title: "Error", 

      description: "Failed to create simulation table. Please try again.", 

      variant: "destructive", 

    }); 

  } finally { 

    setIsCreatingTable(false); 

  } 

}; 

 

 

 const fetchDynamicLicenseOptions = async (objId: number, authorizationObject: string, fieldName: string) => { 

  if (!selectedClient.trim() || !selectedSystem.trim()) { 

    toast({ 

      title: "Missing Data", 

      description: "Cannot fetch new values: Client or System Name is missing.", 

      variant: "destructive", 

    }); 

    return; 

  } 

 

  setLoadingDynamicOptions(prev => ({ ...prev, [objId]: true })); 

  try { 

    const data = await getAuthObjFieldLicData(authorizationObject, fieldName, selectedClient, selectedSystem); 

    const options = data 

      .filter(item => item.UI_TEXT != null && item.UI_TEXT.trim() !== '') 

      .map(item => ({ value: item.UI_TEXT, label: item.UI_TEXT })); 

 

    setCurrentEditedObjects(prev => { 

      const updated = prev.map(obj => 

        obj.id === objId ? { ...obj, dynamicLicenseOptions: options } : obj 

      ); 

      if (selectedRole) { 

        setAllEditedObjects(prevAll => { 

          const newAll = { ...prevAll, [selectedRole.id]: updated }; 

          localStorage.setItem(getAllRolesLocalStorageKey(selectedClient.trim(), selectedSystem.trim()), JSON.stringify(newAll)); 

          return newAll; 

        }); 

      } 

      return updated; 

    }); 

  } catch (err) { 

    toast({ 

      title: "Error", 

      description: `Failed to fetch new values for ${authorizationObject}/${fieldName}.`, 

      variant: "destructive", 

    }); 

    console.error(`Error fetching dynamic options for ${authorizationObject}/${fieldName}:`, err); 

  } finally { 

    setLoadingDynamicOptions(prev => ({ ...prev, [objId]: false })); 

  } 

}; 

 

 

const updateObjectAction = (objectId: number, action: string) => { 

  setCurrentEditedObjects(prev => { 

    const updated = prev.map(obj => { 

      if (obj.id === objectId) { 

        if (action === "Change" && !obj.isNew) { 

          if (obj.object && obj.fieldName) { 

            fetchDynamicLicenseOptions(obj.id, obj.object, obj.fieldName); 

          } else { 

            toast({ 

              title: "Missing Object Data", 

              description: "Cannot fetch new values: Authorization Object or Field Name is missing for this row.", 

              variant: "destructive", 

            }); 

          } 

        } else if (action === "Add" && obj.isNew) { 

          // For Add operations on new objects, fetch suggestions 

          if (obj.object && obj.fieldName) { 

            fetchAddSuggestions(obj.id, obj.object, obj.fieldName); 

          } 

        } 

        return {  

          ...obj,  

          action,  

          newValue: action === "Remove" ? "" : obj.newValue, 


          ...(action !== "Add" ? { addSuggestions: undefined, selectedLicense: undefined } : {}), 

          ...(action !== "Change" ? { dynamicLicenseOptions: undefined } : {}) 

        }; 

      } 

      return obj; 

    }); 

 

    if (selectedRole) { 

      setAllEditedObjects(prevAll => { 

        const newAll = { ...prevAll, [selectedRole.id]: updated }; 

        localStorage.setItem(getAllRolesLocalStorageKey(selectedClient.trim(), selectedSystem.trim()), JSON.stringify(newAll)); 

        return newAll; 

      }); 

    } 

    setHasChanges(true); 

    setSavedChanges(false); 

    return updated; 

  }); 

}; 

 

const handleAddSuggestionSelect = (objectId: number, suggestion: AddSuggestion) => { 

  setCurrentEditedObjects(prev => { 

    const updated = prev.map(obj => 

      obj.id === objectId ? {  

        ...obj,  

        valueLow: suggestion.value, 

        selectedLicense: suggestion.license, 

        newValue: suggestion.ui_text 

      } : obj 

    ); 

 

    if (selectedRole) { 

      setAllEditedObjects(prevAll => { 

        const newAll = { ...prevAll, [selectedRole.id]: updated }; 

        localStorage.setItem(getAllRolesLocalStorageKey(selectedClient.trim(), selectedSystem.trim()), JSON.stringify(newAll)); 

        return newAll; 

      }); 

    } 

    setHasChanges(true); 

    setSavedChanges(false); 

    return updated; 

  }); 

}; 

 

   

 

  const updateObjectNewValue = (objectId: number, newValue: string) => { 

    setCurrentEditedObjects(prev => { 

      const updated = prev.map(obj => 

        obj.id === objectId ? { ...obj, newValue } : obj 

      ); 

      if (selectedRole) { 

        setAllEditedObjects(prevAll => { 

          const newAll = { ...prevAll, [selectedRole.id]: updated }; 

          localStorage.setItem(getAllRolesLocalStorageKey(selectedClient.trim(), selectedSystem.trim()), JSON.stringify(newAll)); 

          return newAll; 

        }); 

      } 

      setHasChanges(true); 

      setSavedChanges(false); 

      return updated; 

    }); 

  }; 

 

  const updateObjectField = (objectId: number, field: string, value: string) => { 

    setCurrentEditedObjects(prev => { 

      const updated = prev.map(obj => 

        obj.id === objectId ? { ...obj, [field]: value } : obj 

      ); 

      if (selectedRole) { 

        setAllEditedObjects(prevAll => { 

          const newAll = { ...prevAll, [selectedRole.id]: updated }; 

          localStorage.setItem(getAllRolesLocalStorageKey(selectedClient.trim(), selectedSystem.trim()), JSON.stringify(newAll)); 

          return newAll; 

        }); 

      } 

      setHasChanges(true); 

      setSavedChanges(false); 

      return updated; 

    }); 

  }; 

 

 

const handleAddObject = () => { 

  const newObject: ObjectDetail = { 

    id: Date.now(), 

    object: "", 

    classification: "", 

    fieldName: "", 

    valueLow: "", 

    valueHigh: "", 

    ttext: "", 

    action: "Add", 

    newValue: "", 

    isNew: true, 

    dynamicLicenseOptions: undefined, 

    addSuggestions: undefined, 

    selectedLicense: undefined 

  }; 

  setCurrentEditedObjects(prev => { 

    const updated = [...prev, newObject]; 

    if (selectedRole) { 

      setAllEditedObjects(prevAll => { 

        const newAll = { ...prevAll, [selectedRole.id]: updated }; 

        localStorage.setItem(getAllRolesLocalStorageKey(selectedClient.trim(), selectedSystem.trim()), JSON.stringify(newAll)); 

        return newAll; 

      }); 

    } 

    setHasChanges(true); 

    setSavedChanges(false); 

    return updated; 

  }); 

}; 

  const handleSave = () => { 

    if (selectedRole) { 

        setSavedChanges(true); 

        toast({ 

            title: "Changes Saved Locally", 

            description: `Changes for role '${selectedRole.id}' have been saved to your browser. Click "Run Simulation" to apply to database.`, 

            variant: "default", 

        }); 

    } 

    setIsEditing(false); 

  }; 

   

 

  const handleReset = () => { 

    if (selectedRole) { 

      setCurrentEditedObjects([...selectedRole.objects]); 

      setHasChanges(false); 

      setIsEditing(false); 

      setSavedChanges(false); 

      setAllEditedObjects(prevAll => { 

        const newAll = { ...prevAll }; 

        delete newAll[selectedRole.id]; 

        localStorage.setItem(getAllRolesLocalStorageKey(selectedClient.trim(), selectedSystem.trim()), JSON.stringify(newAll)); 

        return newAll; 

      }); 

      toast({ 

        title: "Changes Reset", 

        description: "All unsaved changes for this role have been discarded.", 

        variant: "default", 

      }); 

    } 

  }; 

 

  const generateRequestNumber = () => { 

    return `SIM${String(Date.now()).slice(-6)}`; 

  }; 

 


  const validateSimulationChanges = (changes: SimulationChangePayload[]) => { 

    const errors = []; 

 

    for (const change of changes) { 

      if (!change.role_id || !change.object || !change.field_name) { 

        errors.push(`Missing required fields for change: ${JSON.stringify(change)}`); 

      } 

 
      if (!["Add", "Change", "Remove"].includes(change.action)) { 

        errors.push(`Invalid action '${change.action}' for role ${change.role_id}`); 

      } 

 
      if (change.action === "Add" && !change.value_low) { 

        errors.push(`Add operation requires value_low for role ${change.role_id}`); 

      } 

 
      if (change.action === "Change" && !change.new_value_ui_text) { 

        errors.push(`Change operation requires new_value_ui_text for role ${change.role_id}`); 

      } 

    } 

 

    return errors; 

  }; 

 const handleRunSimulation = async () => {
  if (!selectedClient.trim() || !selectedSystem.trim()) {
    toast({
      title: "Missing Information",
      description: "Please enter both client name and system name.",
      variant: "destructive",
    });
    return;
  }

  setSimulationRunning(true);
  setError(null);

  try {
    const allChangesToSend: SimulationChangePayload[] = [];
    const rolesWithChanges = Object.keys(allEditedObjects);

    if (rolesWithChanges.length === 0) {
      toast({
        title: "No Changes to Simulate",
        description: "No pending changes found to apply to the database.",
        variant: "default",
      });
      return;
    }

    for (const roleId of rolesWithChanges) {
      const roleChanges = allEditedObjects[roleId];

      const changesForThisRole = roleChanges
        .filter(obj => obj.action !== null && obj.action !== "")
        .map(obj => ({
          role_id: roleId,
          object: obj.object,
          field_name: obj.fieldName,
          value_low: obj.valueLow,
          value_high: obj.valueHigh,
          ttext: obj.ttext || "",
          classification: obj.classification,
          action: obj.action as "Add" | "Change" | "Remove",
          new_value_ui_text: obj.newValue || "",
          is_new_object: obj.isNew,
          frontend_id: obj.id,
          selected_license: obj.action === "Add" ? obj.selectedLicense : undefined
        }));

      allChangesToSend.push(...changesForThisRole);
    }

    if (allChangesToSend.length === 0) {
      toast({
        title: "No Valid Changes",
        description: "No valid changes found to apply to the database. Please ensure you have selected actions for your changes.",
        variant: "default",
      });
      return;
    }

    const validationErrors = validateSimulationChanges(allChangesToSend);
    if (validationErrors.length > 0) {
      setError(`Validation errors: ${validationErrors.join('; ')}`);
      toast({
        title: "Validation Error",
        description: "Please fix the validation errors before running the simulation.",
        variant: "destructive",
      });
      return;
    }

    const changesSummary = allChangesToSend.reduce((acc, change) => {
      acc[change.action] = (acc[change.action] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const summaryText = Object.entries(changesSummary)
      .map(([action, count]) => `${count} ${action}${count > 1 ? 's' : ''}`)
      .join(', ');

    console.log(`About to send ${allChangesToSend.length} changes: ${summaryText}`);

    // Step 1: Send changes to backend
    const response = await applySimulationChangesToDb(selectedClient.trim(), selectedSystem.trim(), allChangesToSend);
    console.log("Backend response:", response);

    // Step 2: Run the simulation after changes are applied
    toast({
      title: "Changes Applied",
      description: "Changes applied successfully. Running simulation...",
      variant: "default",
    });

    const simulationResult = await runSimulation(selectedClient.trim(), selectedSystem.trim());
    console.log("Simulation result:", simulationResult);

    // Generate request number for tracking
    const requestNumber = generateRequestNumber();

    // Clear all localStorage after successful completion
    localStorage.removeItem(getAllRolesLocalStorageKey(selectedClient.trim(), selectedSystem.trim()));
    setAllEditedObjects({});

    // Clear current view
    if (selectedRole) {
      setCurrentEditedObjects([...selectedRole.objects]);
      setHasChanges(false);
      setSavedChanges(false);
    }

    toast({
      title: "Simulation Completed Successfully",
      description: `Changes applied and simulation completed. ${summaryText}. Request: ${requestNumber}`,
      variant: "default",
    });

    // Navigate after a short delay
    setTimeout(() => {
      navigate("/simulation-run");
    }, 2000);

  } catch (err) {
    console.error("Error running simulation:", err);
    const errorMessage = err instanceof Error ? err.message : 'Failed to run simulation';
    setError(errorMessage);
    toast({
      title: "Error Running Simulation",
      description: `Failed to apply changes or run simulation: ${errorMessage}`,
      variant: "destructive",
    });
  } finally {
    setSimulationRunning(false);
  }
};

  const handleKeyPress = (e: React.KeyboardEvent) => { 

    if (e.key === 'Enter') { 

      reloadAllData(); 

    } 

  }; 

 


  const getPendingChangesSummary = (): PendingChangesSummary | null => { 

    const totalChanges = Object.values(allEditedObjects).reduce((total, roleChanges) => { 

      return total + roleChanges.filter(obj => obj.action !== null && obj.action !== "").length; 

    }, 0); 

 

    if (totalChanges === 0) return null; 

 

    const changesByAction: Record<string, number> = {}; 

    Object.values(allEditedObjects).forEach(roleChanges => { 

      roleChanges.filter(obj => obj.action !== null && obj.action !== "").forEach(obj => { 

        changesByAction[obj.action!] = (changesByAction[obj.action!] || 0) + 1; 

      }); 

    }); 

 

    return { totalChanges, changesByAction }; 

  }; 

 


  const getRoleChangesSummary = (roleId: string): { changesCount: number; hasChanges: boolean } => { 

    const roleChanges = allEditedObjects[roleId]; 

    if (!roleChanges) return { changesCount: 0, hasChanges: false }; 

 

    const changesCount = roleChanges.filter(obj => obj.action !== null && obj.action !== "").length; 

    return { changesCount, hasChanges: changesCount > 0 }; 

  }; 

 

  const pendingChangesSummary = getPendingChangesSummary(); 

 

  return ( 

    <Layout title="Create New Simulation"> 

      <div className="space-y-6"> 

        <div className="flex items-center justify-between"> 

          <Link to="/simulation-run" className="flex items-center text-blue-600 hover:text-blue-800"> 

            <ArrowLeft className="mr-1 h-4 w-4" /> Back to Simulation Run 

          </Link> 

 

          {pendingChangesSummary && ( 

            <div className="flex items-center gap-2"> 

              <AlertCircle className="h-4 w-4 text-amber-500" /> 

              <span className="text-sm text-amber-700"> 

                {pendingChangesSummary.totalChanges} pending changes across {Object.keys(allEditedObjects).length} roles 

              </span> 

            </div> 

          )} 

        </div> 

 

        {error && ( 

          <Alert variant="destructive"> 

            <AlertCircle className="h-4 w-4" /> 

            <AlertDescription>{error}</AlertDescription> 

          </Alert> 

        )} 

 

        <Card> 

          <CardHeader> 

            <CardTitle>System Selection</CardTitle> 

          </CardHeader> 

          <CardContent> 

            <div className="grid gap-4 md:grid-cols-3"> {/* Changed to 3 columns */} 

              <div className="space-y-2">
                                               <label htmlFor="clientSelect" className="text-sm font-medium">
                                                 Select Client *
                                               </label>
                                               <Select
                                                 value={selectedClient}
                                                 onValueChange={setSelectedClient}
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
                           
                                             {/* System SID Select */}
                                             <div className="space-y-2">
                                               <label htmlFor="systemSelect" className="text-sm font-medium">
                                                 Select System SID *
                                               </label>
                                               <Select
                                                 value={selectedSystem}
                                                 onValueChange={setSelectedSystem}
                                                 disabled={!selectedClient} // Disable until a client is selected
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

              <div className="flex items-end"> 

        <Button 

          onClick={reloadAllData} 

          disabled={loading || isLoadingRoles || simulationRunning} 

          className="flex items-center gap-2 ml-auto" 

        > 

          {(loading || isLoadingRoles) ? ( 

            <Loader2 className="h-4 w-4 animate-spin" /> 

          ) : ( 

            <RefreshCw className="h-4 w-4" /> 

          )} 

          {(loading || isLoadingRoles) ? "Loading..." : "Load Data"} 

        </Button> 

       

      </div> 
            </div> 

          </CardContent> 

        </Card> 

 

        {!dataLoaded && !isLoadingRoles && ( 

          <Card> 

            <CardContent className="text-center py-8"> 

              <p className="text-gray-600">Please enter client name and system name, then click "Load Data" to fetch roles.</p> 

            </CardContent> 

          </Card> 

        )} 

 

        {dataLoaded && ( 

          <> 

            <FilterRoles 

              searchTerm={searchTerm} 

              setSearchTerm={setSearchTerm} 

              licenseFilter={licenseFilter} 

              setLicenseFilter={setLicenseFilter} 

            /> 

 

            <RoleProfileSummary 
            simulationRunning={simulationRunning}

              filteredRoles={filteredRoles} 

              selectedRole={selectedRole} 

              onRoleSelect={handleRoleSelect} 

              onRunSimulation={handleRunSimulation} 

              savedChanges={savedChanges} 

              pendingChangesSummary={pendingChangesSummary} 

              getRoleChangesSummary={getRoleChangesSummary} 

            /> 

          </> 

        )} 

 

       
{selectedRole && (
  <>
 
    {/* <FilterObjects
      searchTerm={objectSearchTerm}
      setSearchTerm={setObjectSearchTerm}
    /> */}
    
    {/* <AuthorizationObjects 
      selectedRole={selectedRole} 
      editedObjects={currentEditedObjects} 
      objectSearchTerm={objectSearchTerm} 
      isEditing={isEditing} 
      onEditClick={handleEditClick} 
      onSave={handleSave} 
      onReset={handleReset} 
      onAddObject={handleAddObject} 
      updateObjectAction={updateObjectAction} 
      updateObjectNewValue={updateObjectNewValue} 
      updateObjectField={updateObjectField} 
      isLoadingDynamicOptions={loadingDynamicOptions}
      
      fetchDynamicLicenseOptions={function (objId: number, authorizationObject: string, fieldName: string): void { 
        throw new Error("Function not implemented."); 
      }} 
    /> */}
     <AuthorizationObjects
    selectedRole={selectedRole}
    editedObjects={currentEditedObjects}
    isEditing={isEditing}
    onEditClick={handleEditClick}
    onSave={handleSave}
    onReset={handleReset}
    onAddObject={handleAddObject}
    updateObjectAction={updateObjectAction}
    updateObjectNewValue={updateObjectNewValue}
    updateObjectField={updateObjectField}
    isLoadingDynamicOptions={loadingDynamicOptions}
    fetchDynamicLicenseOptions={fetchDynamicLicenseOptions}
  />
  </>
)}

      </div> 

    </Layout> 

  ); 

}; 

 

export default CreateSimulation; 
