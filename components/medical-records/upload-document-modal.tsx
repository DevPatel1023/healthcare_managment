"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"

interface UploadDocumentModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: any) => void
}

export function UploadDocumentModal({ isOpen, onClose, onSubmit }: UploadDocumentModalProps) {
  const { toast } = useToast()
  const [file, setFile] = useState<File | null>(null)
  const [documentType, setDocumentType] = useState("")
  const [documentName, setDocumentName] = useState("")

  const documentTypes = [
    "Lab Report",
    "X-Ray",
    "MRI Scan",
    "CT Scan",
    "Prescription",
    "Discharge Summary",
    "Medical Certificate",
    "Insurance Document",
  ]

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleSubmit = () => {
    if (!file || !documentType || !documentName) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      })
      return
    }

    const documentData = {
      file,
      documentType,
      documentName,
      uploadDate: new Date().toISOString(),
      fileSize: `${(file.size / 1024).toFixed(2)} KB`,
      fileName: file.name,
    }

    onSubmit(documentData)
    resetForm()
  }

  const resetForm = () => {
    setFile(null)
    setDocumentType("")
    setDocumentName("")
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          onClose()
          resetForm()
        }
      }}
    >
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Upload Medical Document</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="documentName">Document Name</Label>
            <Input
              id="documentName"
              value={documentName}
              onChange={(e) => setDocumentName(e.target.value)}
              placeholder="Enter document name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="documentType">Document Type</Label>
            <Select value={documentType} onValueChange={setDocumentType}>
              <SelectTrigger id="documentType">
                <SelectValue placeholder="Select document type" />
              </SelectTrigger>
              <SelectContent>
                {documentTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="file">Upload File</Label>
            <Input id="file" type="file" onChange={handleFileChange} accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" />
            {file && (
              <p className="text-sm text-muted-foreground mt-1">
                Selected file: {file.name} ({(file.size / 1024).toFixed(2)} KB)
              </p>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Upload Document</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
