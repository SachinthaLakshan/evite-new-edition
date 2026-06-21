"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { 
  ClipboardList, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Sparkles, 
  TrendingUp, 
  RefreshCw,
  ChevronDown
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import confetti from "canvas-confetti";

interface TaskItem {
  id: string;
  title: string;
  description: string;
}

interface ChecklistSection {
  id: string;
  header: string;
  tasks: TaskItem[];
}

const CHECKLIST_DATA: ChecklistSection[] = [
  {
    id: "6-12-months",
    header: "6 - 12 MONTHS BEFORE: BUDGETING, RESEARCH & PLANNING",
    tasks: [
      {
        id: "overall_budget",
        title: "Overall Budget Allocation",
        description: "Determine the maximum total budget limit."
      },
      {
        id: "itemized_budget",
        title: "Itemized Budget Management",
        description: "Write down separate specific budgets for the Hall, Food, Dress, Photography, Decorations, Music, and Transport. Keep it strictly in writing to prevent costs from doubling by memory."
      },
      {
        id: "guest_list",
        title: "Draft & Categorize Guest List",
        description: "Group guests into Relatives, Friends, Office Friends, and Special Invited Guests. Finalizing this list early provides a clear picture of total food costs and keeps expenses controlled."
      },
      {
        id: "wedding_date",
        title: "Fix the Wedding Date",
        description: "Select and confirm the final wedding date. If it falls on a weekend, prepare to book all primary vendors immediately."
      },
      {
        id: "venue_reception",
        title: "Research & Select Venue / Reception Hall",
        description: "Visit popular halls early, compare package offerings, evaluate seating capacities, and pay the advance deposit to lock down your preferred venue."
      },
      {
        id: "church_officiant",
        title: "Research Church / Civil Ceremony & Officiant",
        description: "Check availability with Church Coordinators, Priests, or Civil Officiants. Learn about specific venue rules and guidelines."
      },
      {
        id: "traditional_rituals",
        title: "Research Traditional & Unity Rituals",
        description: "Identify requirements and items needed for local or religious customs (e.g., Candles, Veil, Cord, Arrhae, etc.)."
      },
      {
        id: "photography_team",
        title: "Research & Choose Photography & Videography Team",
        description: "Select the Main Photographer and Video Team. Review their design portfolio carefully instead of deciding solely on price. Decide if a Pre-shoot/Prenup shoot is required."
      },
      {
        id: "bridal_groom_designers",
        title: "Research & Select Bridal & Groom Designers",
        description: "Explore styles for the Bridal Dress, Groom Suit, Shoes, and essential accessories. Also, research clothing options for bridesmaids and groomsmen."
      },
      {
        id: "salon_makeup",
        title: "Research & Book Salon & Makeup Artists",
        description: "Plan details for both the Bride and Groom. Schedule a professional Makeup Trial and finalize the exact wedding day hairstyles."
      },
      {
        id: "decor_florist",
        title: "Research & Select Decoration & Florist Teams",
        description: "Pick an overall wedding theme and color palette (e.g., Floral Theme, White & Gold, Royal Blue, Lavender, or Natural Green) and share reference photos with the decorators."
      },
      {
        id: "music_entertainment",
        title: "Research & Choose Entertainment / Music Providers",
        description: "Decide on a matching option based on your budget: Wedding Live Band, DJ, Sound System Providers, or acoustic music."
      },
      {
        id: "catering_options",
        title: "Review Catering Menus & Options",
        description: "Plan a Food Tasting Session if possible. Carefully customize items across Rice Items, Curries, Desserts, and Soft Drinks."
      },
      {
        id: "invitation_strategy",
        title: "Formulate Invitation Strategy",
        description: "Plan your distribution split across Printed Cards, Digital E-Invites, and WhatsApp Invites."
      },
      {
        id: "transport_logistics",
        title: "Develop Transport Logistics",
        description: "Arrange vehicles for the Bridal Car, Family Transport, and Guest Transport. Always reserve a designated emergency vehicle."
      }
    ]
  },
  {
    id: "3-6-months",
    header: "3 - 6 MONTHS BEFORE: BOOKINGS & EARLY RESERVATIONS",
    tasks: [
      {
        id: "reserve_ceremony_venue",
        title: "Reserve Ceremony Venue & Reception Hall",
        description: "Confirm official date lock and finalize contract terms with an official deposit."
      },
      {
        id: "book_photography_team",
        title: "Book Photography & Videography Teams",
        description: "Formally book chosen vendors for both the prenup and wedding day."
      },
      {
        id: "book_entertainment",
        title: "Book Entertainment Providers",
        description: "Lock in the stage, audio equipment, and entertainment crew (DJ, Band, or Sound System)."
      },
      {
        id: "book_suppliers",
        title: "Book Creative & Logistics Suppliers",
        description: "Confirm contracts with Florists, Decorators, Caterers, and Cake/Dessert suppliers."
      },
      {
        id: "schedule_prenup_shoot",
        title: "Schedule Prenup Photoshoot",
        description: "Finalize the exact photoshoot locations, themes, and outfits."
      },
      {
        id: "order_wedding_attire",
        title: "Place Orders for Wedding Attire",
        description: "Take initial custom measurements and finalize designs for the Bridal Gown and Groom Suit (or Barong/Tuxedo)."
      },
      {
        id: "book_party_attire",
        title: "Book Wedding Party Attire",
        description: "Acquire physical measurements for bridesmaids and groomsmen and set completion deadlines."
      },
      {
        id: "schedule_dress_fittings",
        title: "Schedule Dress Fitting Dates",
        description: "Plan multi-stage dress and suit fittings well in advance to accommodate alterations."
      }
    ]
  },
  {
    id: "1-week",
    header: "1 WEEK BEFORE: CHECKLIST REVIEW & SUPPLIER AUDITS",
    tasks: [
      {
        id: "final_supplier_calls",
        title: "Conduct Final Supplier Calls",
        description: "Call every single supplier individually to re-verify operational hours and arrival schedules."
      },
      {
        id: "confirm_hall_logistics",
        title: "Confirm Reception Hall Logistics",
        description: "Re-verify layouts, entry times, and final guest count totals with the hall manager."
      },
      {
        id: "confirm_photo_video_crews",
        title: "Confirm Photography & Videography Crews",
        description: "Provide them with the day's timeline and a list of key people to capture."
      },
      {
        id: "confirm_salon_makeup_schedule",
        title: "Confirm Salon & Makeup Artist Schedules",
        description: "Re-verify exact times for morning prep trials and arrivals."
      },
      {
        id: "ensure_attire_readiness",
        title: "Ensure Attire & Accessories Readiness",
        description: "Ensure Wedding Dress, Groom Suit, Shoes, and all matching accessories are fully ready and pressed."
      },
      {
        id: "secure_wedding_rings",
        title: "Secure and Verify Wedding Rings",
        description: "Keep wedding bands clean, safe, and designated to a trusted party."
      },
      {
        id: "reconfirm_transport_fleet",
        title: "Re-confirm Transport Fleet & Drivers",
        description: "Share location coordinates, maps, and precise timings with all designated drivers."
      },
      {
        id: "finalize_guest_headcount",
        title: "Finalize Total Guest Headcount",
        description: "Communicate the absolute final verified guest count directly to the caterer."
      }
    ]
  }
];

export default function WeddingChecklist() {
  const router = useRouter();
  const { session, loading } = useAuth();
  const queryClient = useQueryClient();

  // Track expanded checklist item IDs for accordion view
  const [expandedItems, setExpandedItems] = React.useState<Record<string, boolean>>({});

  const toggleItem = (taskId: string) => {
    setExpandedItems((prev) => ({
      ...prev,
      [taskId]: !prev[taskId],
    }));
  };

  // Fetch checklist task statuses from the 'Budget' table
  const { data: dbStatuses = {}, isLoading: isFetchingStatuses } = useQuery<Record<string, string>>({
    queryKey: ["checklist-statuses", session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return {};
      
      const { data, error } = await supabase
        .from("Budget")
        .select("task_id, status")
        .eq("user_id", session.user.id);
      
      if (error) {
        console.error("Error fetching checklist statuses:", error);
        throw error;
      }
      
      const statusMap: Record<string, string> = {};
      data?.forEach((row) => {
        statusMap[row.task_id] = row.status;
      });
      return statusMap;
    },
    enabled: !!session?.user?.id,
  });

  // Mutation to update/upsert status
  const updateStatusMutation = useMutation({
    mutationFn: async ({ taskId, newStatus }: { taskId: string; newStatus: string }) => {
      if (!session?.user?.id) throw new Error("Authentication required");
      
      const { error } = await supabase
        .from("Budget")
        .upsert(
          {
            user_id: session.user.id,
            task_id: taskId,
            status: newStatus,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id,task_id" }
        );
        
      if (error) throw error;
      return { taskId, newStatus };
    },
    onMutate: async ({ taskId, newStatus }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["checklist-statuses", session?.user?.id] });
      
      // Get previous status map
      const previousStatuses = queryClient.getQueryData<Record<string, string>>(["checklist-statuses", session?.user?.id]) || {};
      
      // Perform optimistic update
      queryClient.setQueryData(["checklist-statuses", session?.user?.id], {
        ...previousStatuses,
        [taskId]: newStatus,
      });
      
      return { previousStatuses };
    },
    onError: (err, variables, context) => {
      // Rollback to previous state on error
      if (context?.previousStatuses) {
        queryClient.setQueryData(["checklist-statuses", session?.user?.id], context.previousStatuses);
      }
      toast.error("Failed to update task status");
      console.error(err);
    },
    onSuccess: (data) => {
      toast.success("Task status updated");
      
      // Check if this triggers complete wedding list celebration
      const currentStatuses = queryClient.getQueryData<Record<string, string>>(["checklist-statuses", session?.user?.id]) || {};
      let totalTasks = 0;
      let completedTasks = 0;
      
      CHECKLIST_DATA.forEach((section) => {
        section.tasks.forEach((t) => {
          totalTasks++;
          if (currentStatuses[t.id] === "completed") {
            completedTasks++;
          }
        });
      });
      
      if (completedTasks === totalTasks && totalTasks > 0) {
        // Trigger confetti!
        confetti({
          particleCount: 200,
          spread: 90,
          origin: { y: 0.6 }
        });
        toast.success("Congratulations! Your entire wedding checklist is 100% completed! 🍾🎉", {
          duration: 6000,
        });
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["checklist-statuses", session?.user?.id] });
    }
  });

  // Redirect to login if user is not authenticated
  React.useEffect(() => {
    if (!loading && !session) {
      router.push("/auth");
    }
  }, [loading, session, router]);

  if (loading || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50/50">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="h-8 w-8 text-purple-600 animate-spin" />
          <p className="text-sm font-medium text-gray-500">Loading your checklist...</p>
        </div>
      </div>
    );
  }

  // Calculate statistics
  let totalTasks = 0;
  let completedTasks = 0;
  let inProgressTasks = 0;
  let pendingTasks = 0;

  CHECKLIST_DATA.forEach((section) => {
    section.tasks.forEach((task) => {
      totalTasks++;
      const status = dbStatuses[task.id] || "pending";
      if (status === "completed") completedTasks++;
      else if (status === "in_progress") inProgressTasks++;
      else pendingTasks++;
    });
  });

  const overallProgressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const handleStatusChange = (taskId: string, newStatus: string) => {
    updateStatusMutation.mutate({ taskId, newStatus });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-500/10";
      case "in_progress":
        return "bg-amber-50 text-amber-700 border-amber-200 ring-amber-500/10";
      default:
        return "bg-slate-100 text-slate-600 border-slate-200 ring-slate-400/10";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge className="bg-emerald-100 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 gap-1 rounded-full font-medium">
            <CheckCircle2 className="h-3 w-3 text-emerald-600" />
            Completed
          </Badge>
        );
      case "in_progress":
        return (
          <Badge className="bg-amber-100 hover:bg-amber-100 text-amber-800 border border-amber-200 gap-1 rounded-full font-medium">
            <Clock className="h-3 w-3 text-amber-600" />
            In Progress
          </Badge>
        );
      default:
        return (
          <Badge className="bg-slate-100 hover:bg-slate-100 text-slate-600 border border-slate-200 gap-1 rounded-full font-medium">
            <AlertCircle className="h-3 w-3 text-slate-400" />
            Pending
          </Badge>
        );
    }
  };

  const getSectionHeaderColor = (sectionId: string) => {
    switch (sectionId) {
      case "6-12-months":
        return "from-purple-100 to-purple-50/20 border-purple-200/60 text-purple-950";
      case "3-6-months":
        return "from-indigo-100 to-indigo-50/20 border-indigo-200/60 text-indigo-950";
      case "1-week":
        return "from-rose-100 to-rose-50/20 border-rose-200/60 text-rose-950";
      default:
        return "from-slate-100 to-slate-50 border-slate-200 text-slate-900";
    }
  };

  const getSectionCardStyles = (sectionId: string, isExpanded: boolean) => {
    switch (sectionId) {
      case "6-12-months":
        return `bg-purple-50/20 hover:bg-purple-50/40 border-purple-100/80 ${
          isExpanded ? "ring-2 ring-purple-500/10 bg-purple-50/40 border-purple-300" : ""
        }`;
      case "3-6-months":
        return `bg-indigo-50/20 hover:bg-indigo-50/40 border-indigo-100/80 ${
          isExpanded ? "ring-2 ring-indigo-500/10 bg-indigo-50/40 border-indigo-300" : ""
        }`;
      case "1-week":
        return `bg-rose-50/20 hover:bg-rose-50/40 border-rose-100/80 ${
          isExpanded ? "ring-2 ring-rose-500/10 bg-rose-50/40 border-rose-300" : ""
        }`;
      default:
        return `bg-slate-50 hover:bg-slate-100/80 border-slate-200 ${
          isExpanded ? "ring-2 ring-slate-500/10 bg-slate-100/30 border-slate-350" : ""
        }`;
    }
  };

  const getSectionBadgeColor = (sectionId: string) => {
    switch (sectionId) {
      case "6-12-months":
        return "bg-purple-600 hover:bg-purple-700";
      case "3-6-months":
        return "bg-indigo-600 hover:bg-indigo-700";
      case "1-week":
        return "bg-rose-600 hover:bg-rose-700";
      default:
        return "bg-slate-600 hover:bg-slate-700";
    }
  };

  const getSectionHeadingHoverText = (sectionId: string) => {
    switch (sectionId) {
      case "6-12-months":
        return "group-hover:text-purple-900";
      case "3-6-months":
        return "group-hover:text-indigo-900";
      case "1-week":
        return "group-hover:text-rose-900";
      default:
        return "group-hover:text-purple-900";
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        
        {/* Header Title Section */}
        <div className="flex flex-col gap-2 md:flex-row md:justify-between md:items-center">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 flex items-center gap-2.5">
              <ClipboardList className="h-8 w-8 text-purple-600" />
              Wedding Checklist
            </h1>
            <p className="text-gray-500 mt-1.5 text-sm md:text-base">
              Plan and track your wedding tasks step-by-step. All changes are saved automatically.
            </p>
          </div>
          <div className="text-xs text-slate-400 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-lg flex items-center gap-1.5 self-start md:self-auto font-mono">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Database Table: Budget
          </div>
        </div>

        {/* Statistics Cards & Progress Bar */}
        <div className="bg-white rounded-2xl border border-purple-100 shadow-sm p-6 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            
            <div className="bg-purple-50/50 rounded-xl p-4 border border-purple-100/50 flex flex-col justify-between">
              <span className="text-xs font-semibold text-purple-500 uppercase tracking-wider">Total Tasks</span>
              <div className="flex items-baseline gap-1.5 mt-2">
                <span className="text-2xl font-bold text-slate-800">{totalTasks}</span>
                <span className="text-xs text-slate-400">items</span>
              </div>
            </div>

            <div className="bg-emerald-50/40 rounded-xl p-4 border border-emerald-100/40 flex flex-col justify-between">
              <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Completed</span>
              <div className="flex items-baseline gap-1.5 mt-2">
                <span className="text-2xl font-bold text-slate-800">{completedTasks}</span>
                <span className="text-xs text-emerald-500">/{totalTasks}</span>
              </div>
            </div>

            <div className="bg-amber-50/40 rounded-xl p-4 border border-amber-100/40 flex flex-col justify-between">
              <span className="text-xs font-semibold text-amber-600 uppercase tracking-wider">In Progress</span>
              <div className="flex items-baseline gap-1.5 mt-2">
                <span className="text-2xl font-bold text-slate-800">{inProgressTasks}</span>
                <span className="text-xs text-amber-500">active</span>
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 flex flex-col justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending</span>
              <div className="flex items-baseline gap-1.5 mt-2">
                <span className="text-2xl font-bold text-slate-800">{pendingTasks}</span>
                <span className="text-xs text-slate-400">remaining</span>
              </div>
            </div>

          </div>

          {/* Progress bar container */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="font-semibold text-gray-700 flex items-center gap-1.5">
                <TrendingUp className="h-4 w-4 text-purple-600" />
                Overall Wedding Readiness
              </span>
              <span className="font-extrabold text-purple-700">{overallProgressPercentage}% Complete</span>
            </div>
            <div className="relative pt-1">
              <Progress value={overallProgressPercentage} className="h-3 bg-slate-100" />
              {overallProgressPercentage === 100 && (
                <div className="absolute right-0 top-0 -mt-5 flex items-center gap-1 text-xs font-semibold text-emerald-600 animate-bounce">
                  <Sparkles className="h-3.5 w-3.5" /> Perfect Score!
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Interactive Wedding Checklist Cards */}
        <div className="space-y-8">
          {CHECKLIST_DATA.map((section) => {
            const sectionTotalTasks = section.tasks.length;
            const sectionCompletedTasks = section.tasks.filter((t) => dbStatuses[t.id] === "completed").length;
            const isSectionFullyCompleted = sectionCompletedTasks === sectionTotalTasks;
            const sectionStatusText = isSectionFullyCompleted ? "Completed" : "In Progress";
            
            return (
              <div key={section.id} className="space-y-4">
                {/* Section Header */}
                <div className={`p-4 rounded-xl bg-gradient-to-r ${getSectionHeaderColor(section.id)} border shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3`}>
                  <div>
                    <span className="font-extrabold text-sm tracking-wide uppercase">
                      {section.header}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    {/* Task count inside the section */}
                    <Badge variant="outline" className="bg-white/85 border-slate-200/60 text-slate-800 text-[11px] font-semibold px-2 py-0.5 rounded-md">
                      {sectionCompletedTasks}/{sectionTotalTasks} Done
                    </Badge>
                    {/* Section overall status */}
                    {isSectionFullyCompleted ? (
                      <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-[11px] px-2 py-0.5 rounded-md flex items-center gap-1 shadow-sm border border-emerald-600">
                        <CheckCircle2 className="h-3 w-3" />
                        {sectionStatusText}
                      </Badge>
                    ) : (
                      <Badge className={`${getSectionBadgeColor(section.id)} text-white font-semibold text-[11px] px-2 py-0.5 rounded-md flex items-center gap-1 shadow-sm`}>
                        <Clock className="h-3 w-3" />
                        {sectionStatusText}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Section Tasks */}
                <div className="space-y-3">
                  {section.tasks.map((task) => {
                    const status = dbStatuses[task.id] || "pending";
                    const isUpdating = updateStatusMutation.isPending && updateStatusMutation.variables?.taskId === task.id;
                    const isExpanded = !!expandedItems[task.id];

                    return (
                      <div
                        key={task.id}
                        className={`p-4 rounded-xl border transition-all duration-200 shadow-sm ${getSectionCardStyles(
                          section.id,
                          isExpanded
                        )}`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                          {/* Toggle expand container */}
                          <button
                            type="button"
                            onClick={() => toggleItem(task.id)}
                            className="flex-1 flex items-start gap-3 text-left focus:outline-none group"
                          >
                            <ChevronDown
                              className={`h-5 w-5 mt-0.5 text-gray-400 transition-transform duration-200 shrink-0 ${
                                isExpanded ? "transform rotate-180 text-purple-600" : "group-hover:text-gray-600"
                              }`}
                            />
                            <div>
                              <h3 className={`font-bold text-gray-900 transition-colors ${getSectionHeadingHoverText(
                                section.id
                              )}`}>
                                {task.title}
                              </h3>
                            </div>
                          </button>

                          {/* Status select dropdown */}
                          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                            <Select
                              value={status}
                              onValueChange={(val) => handleStatusChange(task.id, val)}
                              disabled={isUpdating}
                            >
                              <SelectTrigger
                                className={`w-[140px] h-9 text-xs font-semibold rounded-lg border-2 shadow-sm transition-all focus:ring-purple-500 focus:border-purple-500 ${getStatusColor(
                                  status
                                )}`}
                              >
                                <SelectValue>{getStatusBadge(status)}</SelectValue>
                              </SelectTrigger>
                              <SelectContent className="rounded-lg shadow-lg border-slate-200">
                                <SelectItem value="pending" className="text-xs focus:bg-slate-50 focus:text-slate-800">
                                  <div className="flex items-center gap-2">
                                    <span className="h-2 w-2 rounded-full bg-slate-400"></span>
                                    Pending
                                  </div>
                                </SelectItem>
                                <SelectItem value="in_progress" className="text-xs focus:bg-amber-50 focus:text-amber-800">
                                  <div className="flex items-center gap-2">
                                    <span className="h-2 w-2 rounded-full bg-amber-500"></span>
                                    In Progress
                                  </div>
                                </SelectItem>
                                <SelectItem value="completed" className="text-xs focus:bg-emerald-50 focus:text-emerald-800">
                                  <div className="flex items-center gap-2">
                                    <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                                    Completed
                                  </div>
                                </SelectItem>
                              </SelectContent>
                            </Select>

                            {isUpdating && (
                              <RefreshCw className="h-4 w-4 text-purple-600 animate-spin shrink-0" />
                            )}
                          </div>
                        </div>

                        {/* Accordion description container */}
                        <AnimatePresence initial={false}>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2, ease: "easeInOut" }}
                              className="overflow-hidden"
                            >
                              <div className="pt-3 pl-8 text-gray-600 text-sm leading-relaxed max-w-3xl border-t border-dashed mt-3 border-slate-200">
                                {task.description}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </DashboardLayout>
  );
}
