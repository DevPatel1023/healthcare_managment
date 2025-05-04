"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "@/components/ui/use-toast"
import { Plus, Trash2 } from "lucide-react"
import { addPrescription, generateId, getProfiles } from "@/lib/browser-storage"

interface PrescriptionFormProps {
  doctorId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function PrescriptionForm({ doctorId, open, onOpenChange }: PrescriptionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState("")
  const [medications, setMedications] = useState([
    { id: generateId(), name: "", dosage: "", frequency: "", duration: "" },
  ])
  const [instructions, setInstructions] = useState("")

  const patients = getProfiles().filter((profile) => profile.role === "patient")

  const handleAddMedication = () => {
    setMedications([...medications, { id: generateId(), name: "", dosage: "", frequency: "", duration: "" }])
  }

  const handleRemoveMedication = (id: string) => {
    if (medications.length > 1) {
      setMedications(medications.filter((med) => med.id !== id))
    }
  }

  const handleMedicationChange = (id: string, field: string, value: string) => {
    setMedications(medications.map((med) => (med.id === id ? { ...med, [field]: value } : med)))
  }

  const handleSubmit = () => {
    if (!selectedPatient) {
      toast({
        title: "Patient required",
        description: "Please select a patient for this prescription.",
        variant: "destructive",
      })
      return
    }

    if (medications.some((med) => !med.name || !med.dosage || !med.frequency || !med.duration)) {
      toast({
        title: "Incomplete medication information",
        description: "Please fill in all medication details.",
        variant: "destructive",
      })
      return
    }

    if (!instructions) {
      toast({
        title: "Instructions required",
        description: "Please provide instructions for this prescription.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const newPrescription = {
        id: generateId("prescription-"),
        patientId: selectedPatient,
        doctorId,
        date: new Date().toISOString().split("T")[0],
        medications,
        instructions,
        createdAt: new Date().toISOString(),
      }

      addPrescription(newPrescription)

      toast({
        title: "Prescription created",
        description: "The prescription has been created successfully.",
      })

      // Reset form
      setSelectedPatient("")
      setMedications([{ id: generateId(), name: "", dosage: "", frequency: "", duration: "" }])
      setInstructions("")

      // Close dialog
      onOpenChange(false)
    } catch (error) {
      console.error("Error creating prescription:", error)
      toast({
        title: "Error creating prescription",
        description: "There was an error creating the prescription. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Prescription</DialogTitle>
          <DialogDescription>Fill in the details below to create a new prescription for a patient.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="grid gap-2">
            <Label htmlFor="patient">Patient</Label>
            <Select value={selectedPatient} onValueChange={setSelectedPatient}>
              <SelectTrigger>
                <SelectValue placeholder="Select a patient" />
              </SelectTrigger>
              <SelectContent>
                {patients.map((patient) => (
                  <SelectItem key={patient.id} value={patient.id}>
                    {patient.fullName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Medications</Label>
              <Button type="button" variant="outline" size="sm" onClick={handleAddMedication}>
                <Plus className="h-4 w-4 mr-2" />
                Add Medication
              </Button>
            </div>
            <div className="space-y-4">
              {medications.map((medication, index) => (
                <div key={medication.id} className="grid grid-cols-12 gap-2 items-start">
                  <div className="col-span-3">
                    <Label htmlFor={`med-name-${index}`} className="text-xs">
                      Medication Name
                    </Label>
                    <Input
                      id={`med-name-${index}`}
                      value={medication.name}
                      onChange={(e) => handleMedicationChange(medication.id, "name", e.target.value)}
                      placeholder="e.g., Lisinopril"
                    />
                  </div>
                  <div className="col-span-3">
                    <Label htmlFor={`med-dosage-${index}`} className="text-xs">
                      Dosage
                    </Label>
                    <Input
                      id={`med-dosage-${index}`}
                      value={medication.dosage}
                      onChange={(e) => handleMedicationChange(medication.id, "dosage", e.target.value)}
                      placeholder="e.g., 10mg"
                    />
                  </div>
                  <div className="col-span-3">
                    <Label htmlFor={`med-frequency-${index}`} className="text-xs">
                      Frequency
                    </Label>
                    <Input
                      id={`med-frequency-${index}`}
                      value={medication.frequency}
                      onChange={(e) => handleMedicationChange(medication.id, "frequency", e.target.value)}
                      placeholder="e.g., Once daily"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor={`med-duration-${index}`} className="text-xs">
                      Duration
                    </Label>
                    <Input
                      id={`med-duration-${index}`}
                      value={medication.duration}
                      onChange={(e) => handleMedicationChange(medication.id, "duration", e.target.value)}
                      placeholder="e.g., 30 days"
                    />
                  </div>
                  <div className="col-span-1 pt-6">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveMedication(medication.id)}
                      disabled={medications.length === 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="instructions">Instructions</Label>
            <Textarea
              id="instructions"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Enter detailed instructions for the patient..."
              rows={4}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Prescription"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
