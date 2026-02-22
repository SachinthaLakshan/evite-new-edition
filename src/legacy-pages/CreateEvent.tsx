"use client";

import React from "react";
import { useRouter } from "next/navigation";
import CreateEventForm from "@/components/CreateEventForm";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const CreateEvent = () => {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => router.push("/dashboard")}
          className="mb-6 hover:bg-gray-100"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
        <CreateEventForm />
      </div>
    </div>
  );
};

export default CreateEvent;
