
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { DownloadIcon, FileSpreadsheetIcon, UploadIcon } from "lucide-react";

interface CsvUploadFormProps {
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  downloadTemplate: () => void;
}

export const CsvUploadForm: React.FC<CsvUploadFormProps> = ({
  handleFileUpload,
  downloadTemplate,
}) => {
  return (
    <div className="space-y-6">
      <div className="p-8 border-2 border-dashed rounded-xl bg-gray-50/50 flex flex-col items-center justify-center text-center transition-colors hover:border-primary/50 group relative">
        <UploadIcon className="w-10 h-10 text-gray-400 group-hover:text-primary transition-colors mb-4" />
        <div className="space-y-1 mb-6">
          <p className="text-sm font-semibold text-gray-900">Click to upload your guest list</p>
          <p className="text-xs text-gray-500">Only .csv files are supported</p>
        </div>
        
        <Input
          id="csv-upload"
          type="file"
          accept=".csv"
          onChange={handleFileUpload}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Button type="button" variant="outline" className="text-xs h-8">
            Choose File
          </Button>
          <span className="text-xs text-gray-400">or drag and drop</span>
        </div>
      </div>

      <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="mt-1 bg-blue-100 p-1.5 rounded-md">
            <FileSpreadsheetIcon className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <h4 className="text-sm font-medium text-blue-900">CSV Format Instructions</h4>
            <p className="text-xs text-blue-700 mt-0.5">
              Ensure your file has columns for: <span className="font-bold">Name, WhatsApp Number</span>.
            </p>
          </div>
        </div>
        
        <Button 
          type="button" 
          variant="ghost" 
          size="sm" 
          onClick={downloadTemplate}
          className="text-blue-700 hover:text-blue-800 hover:bg-blue-100/50 shrink-0 h-9"
        >
          <DownloadIcon className="w-4 h-4 mr-2" />
          Get Template
        </Button>
      </div>
    </div>
  );
};
