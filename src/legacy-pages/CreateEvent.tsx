"use client";

import React from "react";
import CreateEventForm from "@/components/CreateEventForm";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

const CreateEvent = () => {
  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto py-2">
        <CreateEventForm />
      </div>
    </DashboardLayout>
  );
};

export default CreateEvent;
