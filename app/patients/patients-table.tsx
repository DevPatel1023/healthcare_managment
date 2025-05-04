{
  ;("use client")
}

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, MoreHorizontal, Download } from "lucide-react"
import { generateAvatarUrl } from "@/lib/utils"

interface Patient {
  id: string
  full_name: string
  phone: string | null
  avatar_url: string | null
  conditions: string[]
}

interface PatientsTableProps {
  patients: Patient[]
}

export default function PatientsTable({ patients }: PatientsTableProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [exportFormat, setExportFormat] = useState("PDF")

  const filteredPatients = patients.filter((patient) =>
    patient.full_name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleExport = () => {
    // In a real app, this would generate and download a file
    alert(`Exporting patient data as ${exportFormat}`)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search Patient"
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Select defaultValue="PDF" onValueChange={setExportFormat}>
            <SelectTrigger className="w-24">
              <SelectValue placeholder="Format" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PDF">PDF</SelectItem>
              <SelectItem value="CSV">CSV</SelectItem>
              <SelectItem value="Excel">Excel</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Age</TableHead>
              <TableHead>Mobile</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Condition</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPatients.length > 0 ? (
              filteredPatients.map((patient) => (
                <TableRow key={patient.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage
                          src={patient.avatar_url || generateAvatarUrl(patient.full_name)}
                          alt={patient.full_name}
                        />
                        <AvatarFallback>{patient.full_name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{patient.full_name}</span>
                    </div>
                  </TableCell>
                  <TableCell>30</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <span className="text-green-500">✓</span>
                      {patient.phone || "N/A"}
                    </div>
                  </TableCell>
                  <TableCell>{`${patient.full_name.toLowerCase().replace(/\s+/g, ".")}@example.com`}</TableCell>
                  <TableCell>{patient.conditions.length > 0 ? patient.conditions[0] : "N/A"}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        <DropdownMenuItem>Schedule Appointment</DropdownMenuItem>
                        <DropdownMenuItem>View Medical History</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4">
                  No patients found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
