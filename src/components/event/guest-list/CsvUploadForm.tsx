
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { DownloadIcon } from "lucide-react";
import { Guest } from "@/types/event-form";

interface CsvUploadFormProps {
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  downloadTemplate: () => void;
}

export const CsvUploadForm: React.FC<CsvUploadFormProps> = ({
  handleFileUpload,
  downloadTemplate,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Label htmlFor="csv-upload">Upload Guest List</Label>
          <Input
            id="csv-upload"
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
          />
        </div>
        <Button type="button" variant="outline" onClick={downloadTemplate}>
          <DownloadIcon className="w-4 h-4 mr-2" />
          Download Template
        </Button>
      </div>
      <p className="text-sm text-gray-500">
        CSV should have columns: Name, Email, WhatsApp Number
      </p>
    </div>
  );
};
