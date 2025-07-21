
// import React from "react";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { Pencil, Save, RotateCcw, Plus, Loader2 } from "lucide-react";

// interface AuthorizationObject {
//   id: number;
//   object: string;
//   classification: string;
//   fieldName: string;
//   valueLow: string;
//   valueHigh: string;
//   action: string | null;
//   newValue: string;
//   isNew: boolean;
//   dynamicLicenseOptions?: { value: string; label: string }[];
// }

// interface Role {
//   id: string;
//   description: string;
//   classification: string;
//   gb: number;
//   gc: number;
//   gd: number;
//   assignedUsers: number;
//   objects: AuthorizationObject[];
// }

// interface AuthorizationObjectsProps {
//   selectedRole: Role;
//   editedObjects: AuthorizationObject[];
//   isEditing: boolean;
//   onEditClick: () => void;
//   onSave: () => void;
//   onReset: () => void;
//   onAddObject: () => void;
//   updateObjectAction: (objectId: number, action: string) => void;
//   updateObjectNewValue: (objectId: number, newValue: string) => void;
//   updateObjectField: (objectId: number, field: string, value: any) => void;
//   isLoadingDynamicOptions: { [key: number]: boolean };
//   fetchDynamicLicenseOptions: (objId: number, authorizationObject: string, fieldName: string) => void;
//   objectSearchTerm?: string;
// }

// const AuthorizationObjects: React.FC<AuthorizationObjectsProps> = ({
//   selectedRole,
//   editedObjects,
//   isEditing,
//   onEditClick,
//   onSave,
//   onReset,
//   onAddObject,
//   updateObjectAction,
//   updateObjectNewValue,
//   updateObjectField,
//   isLoadingDynamicOptions,
//   fetchDynamicLicenseOptions,
//   objectSearchTerm = "",
// }) => {
//   const displayObjects = editedObjects.filter(obj => {
//   if (!objectSearchTerm) return true; // Show all if no search term
  
//   const matchesSearch = obj.object.toLowerCase().includes(objectSearchTerm.toLowerCase()) || 
//     obj.fieldName.toLowerCase().includes(objectSearchTerm.toLowerCase()) ||
//     obj.classification.toLowerCase().includes(objectSearchTerm.toLowerCase());
//   return matchesSearch;
// });

//   if (!selectedRole) return null;

//   return (
//     <Card>
//       <CardHeader>
//         <div className="flex justify-between items-center">
//           <div>
//             <CardTitle>Authorization Objects - {selectedRole.id}</CardTitle>
//             <p className="text-sm text-gray-600 mt-1">Description: {selectedRole.description}</p>
//           </div>
//           <div className="flex gap-2">
//             {!isEditing ? (
//               <Button onClick={onEditClick} variant="outline">
//                 <Pencil className="h-4 w-4 mr-2" />
//                 Edit
//               </Button>
//             ) : (
//               <div className="flex gap-2 items-center">
//                 <Button variant="outline" onClick={onReset}>
//                   <RotateCcw className="h-4 w-4 mr-2" />
//                   Reset
//                 </Button>
//                 <Button onClick={onSave}>
//                   <Save className="h-4 w-4 mr-2" />
//                   Save
//                 </Button>
//                 <Button onClick={onAddObject} variant="outline" size="sm">
//                   <Plus className="h-4 w-4 mr-2" />
//                   Add Object
//                 </Button>
//               </div>
//             )}
//           </div>
//         </div>
//       </CardHeader>
//       <CardContent>
//         <div className="overflow-x-auto">
//           <Table>
//             <TableHeader>
//               <TableRow>
//                 <TableHead>Object</TableHead>
//                 <TableHead>Classification</TableHead>
//                 <TableHead>Field Name</TableHead>
//                 <TableHead>Value Low</TableHead>
//                 <TableHead>Value High</TableHead>
//                 {isEditing && <TableHead>Action</TableHead>}
//                 {isEditing && <TableHead>New Value</TableHead>}
//               </TableRow>
//             </TableHeader>
//             <TableBody>
//               {displayObjects.map((obj) => (
//                 <TableRow key={obj.id}>
//                   <TableCell>
//                     {isEditing && obj.isNew ? (
//                       <Input
//                         value={obj.object}
//                         onChange={(e) => updateObjectField(obj.id, 'object', e.target.value)}
//                         placeholder="Enter object"
//                       />
//                     ) : (
//                       <span className="font-medium">{obj.object}</span>
//                     )}
//                   </TableCell>
//                   <TableCell>
//                     {obj.isNew ? (
//                       <span className="text-gray-400">-</span>
//                     ) : (
//                       obj.classification
//                     )}
//                   </TableCell>
//                   <TableCell>
//                     {isEditing && obj.isNew ? (
//                       <Input
//                         value={obj.fieldName}
//                         onChange={(e) => updateObjectField(obj.id, 'fieldName', e.target.value)}
//                         placeholder="Enter field name"
//                       />
//                     ) : (
//                       obj.fieldName
//                     )}
//                   </TableCell>
//                   <TableCell>
//                     {isEditing && obj.isNew ? (
//                       <Input
//                         value={obj.valueLow}
//                         onChange={(e) => updateObjectField(obj.id, 'valueLow', e.target.value)}
//                         placeholder="Enter value low"
//                       />
//                     ) : (
//                       obj.valueLow
//                     )}
//                   </TableCell>
//                   <TableCell>
//                     {isEditing && obj.isNew ? (
//                       <Input
//                         value={obj.valueHigh}
//                         onChange={(e) => updateObjectField(obj.id, 'valueHigh', e.target.value)}
//                         placeholder="Enter value high"
//                       />
//                     ) : (
//                       obj.valueHigh
//                     )}
//                   </TableCell>
//                   {isEditing && (
//                     <TableCell>
//                       <Select
//                         value={obj.action || ""}
//                         onValueChange={(value) => updateObjectAction(obj.id, value)}
//                         disabled={obj.isNew}
//                       >
//                         <SelectTrigger className="w-full">
//                           <SelectValue placeholder={obj.isNew ? "Add" : "Select action"} />
//                         </SelectTrigger>
//                         <SelectContent>
//                           {obj.isNew ? (
//                             <SelectItem value="Add">Add</SelectItem>
//                           ) : (
//                             <>
//                               <SelectItem value="Change">Change</SelectItem>
//                               <SelectItem value="Remove">Remove</SelectItem>
//                             </>
//                           )}
//                         </SelectContent>
//                       </Select>
//                     </TableCell>
//                   )}
//                   {isEditing && (
//                     <TableCell>
//                       {obj.action === "Change" ? (
//                         <div className="relative">
//                           {isLoadingDynamicOptions[obj.id] && (
//                             <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10 rounded-md">
//                               <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
//                             </div>
//                           )}
//                           {obj.dynamicLicenseOptions && obj.dynamicLicenseOptions.length > 0 ? (
//                             <Select
//                               value={obj.newValue || ""}
//                               onValueChange={(value) => updateObjectNewValue(obj.id, value)}
//                               disabled={isLoadingDynamicOptions[obj.id]}
//                             >
//                               <SelectTrigger className="w-full">
//                                 <SelectValue placeholder="Select new value" />
//                               </SelectTrigger>
//                               <SelectContent>
//                                 {obj.dynamicLicenseOptions.map((option) => (
//                                   <SelectItem key={option.value} value={option.value}>
//                                     {option.label}
//                                   </SelectItem>
//                                 ))}
//                               </SelectContent>
//                             </Select>
//                           ) : (
//                             <div className="flex items-center gap-2">
//                               <Button
//                                 variant="outline"
//                                 size="sm"
//                                 onClick={() => fetchDynamicLicenseOptions(obj.id, obj.object, obj.fieldName)}
//                                 disabled={isLoadingDynamicOptions[obj.id] || false}
//                               >
//                                 {isLoadingDynamicOptions[obj.id] ? (
//                                   <Loader2 className="h-4 w-4 animate-spin" />
//                                 ) : (
//                                   "Load Options"
//                                 )}
//                               </Button>
//                             </div>
//                           )}
//                         </div>
//                       ) : obj.action === "Remove" ? (
//                         <span className="text-gray-400">-</span>
//                       ) : (
//                         <Input
//                           value={obj.newValue}
//                           onChange={(e) => updateObjectNewValue(obj.id, e.target.value)}
//                           placeholder="Enter new value"
//                           className="w-full"
//                         />
//                       )}
//                     </TableCell>
//                   )}
//                 </TableRow>
//               ))}
//             </TableBody>
//           </Table>
//         </div>
//       </CardContent>
//     </Card>
//   );
// };

// export default AuthorizationObjects;


import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pencil, Save, RotateCcw, Plus, Loader2 } from "lucide-react";

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
  objectSearchTerm?: string;
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
  objectSearchTerm = "",
}) => {
  const displayObjects = editedObjects.filter(obj => {
  if (!objectSearchTerm) return true; // Show all if no search term
  
  const matchesSearch = obj.object.toLowerCase().includes(objectSearchTerm.toLowerCase()) || 
    obj.fieldName.toLowerCase().includes(objectSearchTerm.toLowerCase()) ||
    obj.classification.toLowerCase().includes(objectSearchTerm.toLowerCase());
  return matchesSearch;
});

  if (!selectedRole) return null;

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Authorization Objects - {selectedRole.id}</CardTitle>
            <p className="text-sm text-gray-600 mt-1">Description: {selectedRole.description}</p>
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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Object</TableHead>
                  <TableHead>Classification</TableHead>
                  <TableHead>Field Name</TableHead>
                  <TableHead>Value Low</TableHead>
                  <TableHead>Value High</TableHead>
                  {isEditing && <TableHead>Action</TableHead>}
                  {isEditing && <TableHead>New Value</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayObjects.map((obj) => (
                  <TableRow key={obj.id}>
                    <TableCell>
                      {isEditing && obj.isNew ? (
                        <Input
                          value={obj.object}
                          onChange={(e) => updateObjectField(obj.id, 'object', e.target.value)}
                          placeholder="Enter object"
                        />
                      ) : (
                        <span className="font-medium">{obj.object}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {obj.isNew ? (
                        <span className="text-gray-400">-</span>
                      ) : (
                        obj.classification
                      )}
                    </TableCell>
                    <TableCell>
                      {isEditing && obj.isNew ? (
                        <Input
                          value={obj.fieldName}
                          onChange={(e) => updateObjectField(obj.id, 'fieldName', e.target.value)}
                          placeholder="Enter field name"
                        />
                      ) : (
                        obj.fieldName
                      )}
                    </TableCell>
                    <TableCell>
                      {isEditing && obj.isNew ? (
                        <Input
                          value={obj.valueLow}
                          onChange={(e) => updateObjectField(obj.id, 'valueLow', e.target.value)}
                          placeholder="Enter value low"
                        />
                      ) : (
                        obj.valueLow
                      )}
                    </TableCell>
                    <TableCell>
                      {isEditing && obj.isNew ? (
                        <Input
                          value={obj.valueHigh}
                          onChange={(e) => updateObjectField(obj.id, 'valueHigh', e.target.value)}
                          placeholder="Enter value high"
                        />
                      ) : (
                        obj.valueHigh
                      )}
                    </TableCell>
                    {isEditing && (
                      <TableCell>
                        <Select
                          value={obj.action || ""}
                          onValueChange={(value) => updateObjectAction(obj.id, value)}
                          disabled={obj.isNew}
                        >
                          <SelectTrigger className="w-full">
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
                      </TableCell>
                    )}
                    {isEditing && (
                      <TableCell>
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
                                <SelectTrigger className="w-full">
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
                            className="w-full"
                          />
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AuthorizationObjects;