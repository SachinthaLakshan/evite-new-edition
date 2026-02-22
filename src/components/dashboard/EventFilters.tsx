import React from "react";
import { EventStatus } from "@/types/event";

interface EventFiltersProps {
  selectedFilter: EventStatus | "all";
  onFilterChange: (filter: EventStatus | "all") => void;
  filters: { label: string; value: EventStatus | "all" }[];
}

const EventFilters: React.FC<EventFiltersProps> = ({ selectedFilter, onFilterChange, filters }) => {
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {filters.map((filter) => (
        <button
          key={filter.value}
          onClick={() => onFilterChange(filter.value)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            selectedFilter === filter.value
              ? "bg-primary text-primary-foreground"
              : "bg-secondary hover:bg-secondary/80"
          }`}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
};

export default EventFilters;
