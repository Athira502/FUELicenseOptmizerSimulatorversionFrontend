
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pencil, Save, RotateCcw, Plus, Loader2, Search, X } from "lucide-react";

interface AuthorizationObject {
  id: number;
  object: string;
  classification: string;
  fieldName: string;
  valueLow: string;
  valueHigh: string;
  action: string | null;
  newValue: string;
  isNew: boolean;
  dynamicLicenseOptions?: { value: string; label: string }[];
}

interface Role {
  id: string;
  description: string;
  classification: string;
  gb: number;
  gc: number;
  gd: number;
  assignedUsers: number;
  objects: AuthorizationObject[];
}

interface AuthorizationObjectsProps {
  selectedRole: Role;
  editedObjects: AuthorizationObject[];
  isEditing: boolean;
  onEditClick: () => void;
  onSave: () => void;
  onReset: () => void;
  onAddObject: () => void;
  updateObjectAction: (objectId: number, action: string) => void;
  updateObjectNewValue: (objectId: number, newValue: string) => void;
  updateObjectField: (objectId: number, field: string, value: any) => void;
  isLoadingDynamicOptions: { [key: number]: boolean };
  fetchDynamicLicenseOptions: (objId: number, authorizationObject: string, fieldName: string) => void;
}

const AuthorizationObjects: React.FC<AuthorizationObjectsProps> = ({
  selectedRole,
  editedObjects,
  isEditing,
  onEditClick,
  onSave,
  onReset,
  onAddObject,
  updateObjectAction,
  updateObjectNewValue,
  updateObjectField,
  isLoadingDynamicOptions,
  fetchDynamicLicenseOptions,
}) => {
  const [objectSearchTerm, setObjectSearchTerm] = useState("");
  const [classificationSearchTerm, setClassificationSearchTerm] = useState("");
  
  const wildcardToRegExp = (pattern: string): RegExp => {
  let regexPattern;
  const hasExplicitWildcard = pattern.includes('*') || pattern.includes('%');

  if (hasExplicitWildcard) {
   
    let escaped = pattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&');
    regexPattern = escaped.replace(/[*%]/g, '.*');
    regexPattern = `^${regexPattern}$`; 
  } else {
   
    let escaped = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); 
    regexPattern = `^${escaped}.*`; 
  }

  return new RegExp(regexPattern, 'i'); 
};

const displayObjects = editedObjects.filter(obj => {
  let matchesObjectSearch = true;
  let matchesClassificationSearch = true;

  if (objectSearchTerm.trim()) {
    const searchRegExp = wildcardToRegExp(objectSearchTerm.trim());
    matchesObjectSearch =
      searchRegExp.test(obj.object.toLowerCase()) ||
      searchRegExp.test(obj.fieldName.toLowerCase());
  }

  if (classificationSearchTerm.trim()) {
    const searchRegExp = wildcardToRegExp(classificationSearchTerm.trim());
    matchesClassificationSearch =
      searchRegExp.test(obj.classification.toLowerCase());
  }

  return matchesObjectSearch && matchesClassificationSearch;
});

 
  const clearObjectSearch = () => setObjectSearchTerm("");
  const clearClassificationSearch = () => setClassificationSearchTerm("");

  if (!selectedRole) return null;

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Authorization Objects - {selectedRole.id}</CardTitle>
            <p className="text-sm text-gray-600 mt-1">Description: {selectedRole.description}</p>
            {(objectSearchTerm || classificationSearchTerm) && (
              <p className="text-xs text-blue-600 mt-1">
                Showing {displayObjects.length} of {editedObjects.length} objects
                {objectSearchTerm && ` (filtered by object: "${objectSearchTerm}")`}
                {classificationSearchTerm && ` (filtered by classification: "${classificationSearchTerm}")`}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            {!isEditing ? (
              <Button onClick={onEditClick} variant="outline">
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </Button>
            ) : (
              <div className="flex gap-2 items-center">
                <Button variant="outline" onClick={onReset}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset
                </Button>
                <Button onClick={onSave}>
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </Button>
                <Button onClick={onAddObject} variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Object
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="max-h-96 overflow-y-auto">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 font-medium">
                    <div className="space-y-2">
                      <span>Object</span>
                      <div className="relative">
                        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-3 w-3" />
                        <Input
                          placeholder="Search objects..."
                          value={objectSearchTerm}
                          onChange={(e) => setObjectSearchTerm(e.target.value)}
                          className="pl-7 pr-7 h-8 text-xs w-48"
                          
                        />
                        {objectSearchTerm && (
                          <button
                            onClick={clearObjectSearch}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  </th>
                  <th className="text-left p-2 font-medium">
                    <div className="space-y-2">
                      <span>Classification</span>
                      <div className="relative">
                        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-3 w-3" />
                        <Input
                          placeholder="Search classification..."
                          value={classificationSearchTerm}
                          onChange={(e) => setClassificationSearchTerm(e.target.value)}
                          className="pl-7 pr-7 h-8 text-xs w-48"
                        />
                        {classificationSearchTerm && (
                          <button
                            onClick={clearClassificationSearch}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  </th>
                  <th className="text-left p-2 font-medium">Field Name</th>
                  <th className="text-left p-2 font-medium">Value Low</th>
                  <th className="text-left p-2 font-medium">Value High</th>
                  {isEditing && <th className="text-left p-2 font-medium">Action</th>}
                  {isEditing && <th className="text-left p-2 font-medium">New Value</th>}
                </tr>
              </thead>
              <tbody>
                {displayObjects.length === 0 ? (
                  <tr>
                    <td colSpan={isEditing ? 7 : 5} className="text-center py-8 text-gray-500">
                      {(objectSearchTerm || classificationSearchTerm) 
                        ? "No objects found matching your search criteria" 
                        : "No authorization objects found"}
                    </td>
                  </tr>
                ) : (
                  displayObjects.map((obj) => (
                    <tr key={obj.id} className="border-b hover:bg-gray-50">
                      <td className="p-2">
                        {isEditing && obj.isNew ? (
                          <Input
                            value={obj.object}
                            onChange={(e) => updateObjectField(obj.id, 'object', e.target.value)}
                            placeholder="Enter object"
                            className="h-8"
                          />
                        ) : (
                          <span className="font-medium">{obj.object}</span>
                        )}
                      </td>
                      <td className="p-2">
                        {obj.isNew ? (
                          <span className="text-gray-400">-</span>
                        ) : (
                          obj.classification
                        )}
                      </td>
                      <td className="p-2">
                        {isEditing && obj.isNew ? (
                          <Input
                            value={obj.fieldName}
                            onChange={(e) => updateObjectField(obj.id, 'fieldName', e.target.value)}
                            placeholder="Enter field name"
                            className="h-8"
                          />
                        ) : (
                          obj.fieldName
                        )}
                      </td>
                      <td className="p-2">
                        {isEditing && obj.isNew ? (
                          <Input
                            value={obj.valueLow}
                            onChange={(e) => updateObjectField(obj.id, 'valueLow', e.target.value)}
                            placeholder="Enter value low"
                            className="h-8"
                          />
                        ) : (
                          obj.valueLow
                        )}
                      </td>
                      <td className="p-2">
                        {isEditing && obj.isNew ? (
                          <Input
                            value={obj.valueHigh}
                            onChange={(e) => updateObjectField(obj.id, 'valueHigh', e.target.value)}
                            placeholder="Enter value high"
                            className="h-8"
                          />
                        ) : (
                          obj.valueHigh
                        )}
                      </td>
                      {isEditing && (
                        <td className="p-2">
                          <Select
                            value={obj.action || ""}
                            onValueChange={(value) => updateObjectAction(obj.id, value)}
                            disabled={obj.isNew}
                          >
                            <SelectTrigger className="w-full h-8">
                              <SelectValue placeholder={obj.isNew ? "Add" : "Select action"} />
                            </SelectTrigger>
                            <SelectContent>
                              {obj.isNew ? (
                                <SelectItem value="Add">Add</SelectItem>
                              ) : (
                                <>
                                  <SelectItem value="Change">Change</SelectItem>
                                  <SelectItem value="Remove">Remove</SelectItem>
                                </>
                              )}
                            </SelectContent>
                          </Select>
                        </td>
                      )}
                      {isEditing && (
                        <td className="p-2">
                          {obj.action === "Change" ? (
                            <div className="relative">
                              {isLoadingDynamicOptions[obj.id] && (
                                <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10 rounded-md">
                                  <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                                </div>
                              )}
                              {obj.dynamicLicenseOptions && obj.dynamicLicenseOptions.length > 0 ? (
                                <Select
                                  value={obj.newValue || ""}
                                  onValueChange={(value) => updateObjectNewValue(obj.id, value)}
                                  disabled={isLoadingDynamicOptions[obj.id]}
                                >
                                  <SelectTrigger className="w-full h-8">
                                    <SelectValue placeholder="Select new value" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {obj.dynamicLicenseOptions.map((option) => (
                                      <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => fetchDynamicLicenseOptions(obj.id, obj.object, obj.fieldName)}
                                    disabled={isLoadingDynamicOptions[obj.id] || false}
                                    className="h-8"
                                  >
                                    {isLoadingDynamicOptions[obj.id] ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      "Load Options"
                                    )}
                                  </Button>
                                </div>
                              )}
                            </div>
                          ) : obj.action === "Remove" ? (
                            <span className="text-gray-400">-</span>
                          ) : (
                            <Input
                              value={obj.newValue}
                              onChange={(e) => updateObjectNewValue(obj.id, e.target.value)}
                              placeholder="Enter new value"
                              className="w-full h-8"
                            />
                          )}
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AuthorizationObjects;