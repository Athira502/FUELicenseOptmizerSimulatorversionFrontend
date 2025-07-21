
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, X } from "lucide-react";

interface FilterRolesProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  licenseFilter: string;
  setLicenseFilter: (filter: string) => void;
  onSearch?: (term: string) => void; // Optional callback for immediate search
  isSearching?: boolean; // Optional loading state
}

const FilterRoles: React.FC<FilterRolesProps> = ({
  searchTerm,
  setSearchTerm,
  licenseFilter,
  setLicenseFilter,
  onSearch,
  isSearching = false,
}) => {
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);

  // Debounce search to avoid excessive API calls
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      setSearchTerm(localSearchTerm);
      if (onSearch) {
        onSearch(localSearchTerm);
      }
    }, 300); // 300ms delay

    return () => clearTimeout(debounceTimer);
  }, [localSearchTerm, setSearchTerm, onSearch]);

  // Sync with parent component's search term
  useEffect(() => {
    setLocalSearchTerm(searchTerm);
  }, [searchTerm]);

  const handleClearSearch = () => {
    setLocalSearchTerm("");
    setSearchTerm("");
    if (onSearch) {
      onSearch("");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Filter Roles</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Search by Role ID or Description
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Enter role ID or description..."
                value={localSearchTerm}
                onChange={(e) => setLocalSearchTerm(e.target.value)}
                className="pl-10 pr-10"
              />
              {localSearchTerm && (
                <button
                  onClick={handleClearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              {isSearching && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                </div>
              )}
            </div>
            {localSearchTerm && (
              <p className="text-xs text-gray-500 mt-1">
                Searching for: "{localSearchTerm}"
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">License Type</label>
            <Select value={licenseFilter} onValueChange={setLicenseFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All License Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All License Types</SelectItem>
                <SelectItem value="GB Advanced Use">GB Advanced Use</SelectItem>
                <SelectItem value="GC Core Use">GC Core Use</SelectItem>
                <SelectItem value="GD Self-Service Use">GD Self-Service Use</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FilterRoles;




// import React from "react";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// interface FilterRolesProps {
//   searchTerm: string;
//   setSearchTerm: (term: string) => void;
//   licenseFilter: string;
//   setLicenseFilter: (filter: string) => void;
// }

// const FilterRoles: React.FC<FilterRolesProps> = ({
//   searchTerm,
//   setSearchTerm,
//   licenseFilter,
//   setLicenseFilter,
// }) => {
//   return (
//     <Card>
//       <CardHeader>
//         <CardTitle>Filter Roles</CardTitle>
//       </CardHeader>
//       <CardContent>
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           <div>
//             <label className="block text-sm font-medium mb-2">Search by Role ID or Description</label>
//             <Input
//               placeholder="Enter role ID or description..."
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium mb-2">License Type</label>
//             <Select value={licenseFilter} onValueChange={setLicenseFilter}>
//               <SelectTrigger>
//                 <SelectValue placeholder="All License Types" />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="all">All License Types</SelectItem>
//                 <SelectItem value="GB Advanced Use">GB Advanced Use</SelectItem>
//                 <SelectItem value="GC Core Use">GC Core Use</SelectItem>
//                 <SelectItem value="GD Self-Service Use">GD Self-Service Use</SelectItem>
//               </SelectContent>
//             </Select>
//           </div>
//         </div>
//       </CardContent>
//     </Card>
//   );
// };

// export default FilterRoles;
