"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { 
  Wallet, 
  PlusCircle, 
  Trash2, 
  ArrowUpRight, 
  ArrowDownLeft, 
  DollarSign, 
  AlertTriangle, 
  Calendar, 
  Edit3, 
  Check, 
  X, 
  Clock,
  CalendarClock,
  Sparkles,
  RefreshCw,
  Info,
  TrendingUp
} from "lucide-react";
import { toast } from "sonner";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

interface LedgerItem {
  id: string;
  user_id: string;
  type: "expense" | "payment";
  for_what: string;
  vendor: string;
  amount: number;
  notes: string | null;
  date: string;
  status: "paid" | "unpaid";
  created_at: string;
}

export default function BudgetCalculator() {
  const router = useRouter();
  const { session, loading } = useAuth();
  const queryClient = useQueryClient();

  // State for modals
  const [isExpenseOpen, setIsExpenseOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isEditingBudget, setIsEditingBudget] = useState(false);

  // Form states for Expense
  const [expenseForWhat, setExpenseForWhat] = useState("");
  const [expenseVendor, setExpenseVendor] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("");
  const [expenseNotes, setExpenseNotes] = useState("");

  // Form states for Payment
  const [paymentForWhat, setPaymentForWhat] = useState("");
  const [paymentVendor, setPaymentVendor] = useState("");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentNotes, setPaymentNotes] = useState("");
  const [paymentDate, setPaymentDate] = useState("");
  const [paymentStatus, setPaymentStatus] = useState<"paid" | "unpaid">("paid");

  // State for overall budget edit
  const [newBudgetLimit, setNewBudgetLimit] = useState("");

  // Tab State
  const [activeTab, setActiveTab] = useState<"all" | "expense" | "payment" | "due_soon">("all");

  // Fetch Budget Settings
  const { data: budgetSettings = { total_budget: 0 }, isLoading: isLoadingSettings } = useQuery({
    queryKey: ["budget-settings", session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return { total_budget: 0 };
      const { data, error } = await supabase
        .from("budget_settings")
        .select("total_budget")
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching budget settings:", error);
        throw error;
      }
      return data || { total_budget: 0 };
    },
    enabled: !!session?.user?.id,
  });

  // Fetch Budget Ledger
  const { data: ledgerItems = [], isLoading: isLoadingLedger } = useQuery<LedgerItem[]>({
    queryKey: ["budget-ledger", session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return [];
      const { data, error } = await supabase
        .from("budget_ledger")
        .select("*")
        .eq("user_id", session.user.id)
        .order("date", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching budget ledger:", error);
        throw error;
      }
      return (data || []) as LedgerItem[];
    },
    enabled: !!session?.user?.id,
  });

  // Mutation: Update Budget Settings
  const updateBudgetLimitMutation = useMutation({
    mutationFn: async (totalBudget: number) => {
      if (!session?.user?.id) throw new Error("Auth required");
      const { error } = await supabase
        .from("budget_settings")
        .upsert(
          {
            user_id: session.user.id,
            total_budget: totalBudget,
            updated_at: new Date().toISOString()
          },
          { onConflict: "user_id" }
        );
      if (error) throw error;
      return totalBudget;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budget-settings", session?.user?.id] });
      toast.success("Total budget limit updated!");
      setIsEditingBudget(false);
    },
    onError: (err) => {
      toast.error("Failed to update budget limit");
      console.error(err);
    }
  });

  // Mutation: Add Ledger Item
  const addLedgerItemMutation = useMutation({
    mutationFn: async (item: {
      type: "expense" | "payment";
      for_what: string;
      vendor: string;
      amount: number;
      notes: string;
      date?: string;
      status?: "paid" | "unpaid";
    }) => {
      if (!session?.user?.id) throw new Error("Authentication required");
      
      const payload = {
        user_id: session.user.id,
        type: item.type,
        for_what: item.for_what,
        vendor: item.vendor,
        amount: item.amount,
        notes: item.notes || null,
        date: item.date || new Date().toISOString().split("T")[0],
        status: item.status || "paid"
      };

      const { error } = await supabase.from("budget_ledger").insert(payload);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budget-ledger", session?.user?.id] });
      toast.success("Transaction added successfully!");
      // Reset forms
      setExpenseForWhat("");
      setExpenseVendor("");
      setExpenseAmount("");
      setExpenseNotes("");
      
      setPaymentForWhat("");
      setPaymentVendor("");
      setPaymentAmount("");
      setPaymentNotes("");
      setPaymentDate("");
      setPaymentStatus("paid");
      
      setIsExpenseOpen(false);
      setIsPaymentOpen(false);
    },
    onError: (err) => {
      toast.error("Failed to add transaction");
      console.error(err);
    }
  });

  // Mutation: Mark Payment as Paid
  const markAsPaidMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("budget_ledger")
        .update({ status: "paid" })
        .eq("id", id);
      if (error) throw error;
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["budget-ledger", session?.user?.id] });
      const previousLedger = queryClient.getQueryData<LedgerItem[]>(["budget-ledger", session?.user?.id]) || [];
      
      // Optimistic update
      queryClient.setQueryData(
        ["budget-ledger", session?.user?.id],
        previousLedger.map((item) => (item.id === id ? { ...item, status: "paid" as const } : item))
      );
      
      return { previousLedger };
    },
    onError: (err, id, context) => {
      if (context?.previousLedger) {
        queryClient.setQueryData(["budget-ledger", session?.user?.id], context.previousLedger);
      }
      toast.error("Failed to mark payment as paid");
      console.error(err);
    },
    onSuccess: () => {
      toast.success("Payment marked as paid!");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["budget-ledger", session?.user?.id] });
    }
  });

  // Mutation: Delete Ledger Item
  const deleteLedgerItemMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("budget_ledger")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budget-ledger", session?.user?.id] });
      toast.success("Transaction deleted successfully");
    },
    onError: (err) => {
      toast.error("Failed to delete transaction");
      console.error(err);
    }
  });

  // Redirect if not logged in
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
          <p className="text-sm font-medium text-gray-500">Loading budget calculator...</p>
        </div>
      </div>
    );
  }

  // calculations
  const totalBudget = budgetSettings?.total_budget || 0;
  
  const totalExpenses = ledgerItems
    .filter(item => item.type === "expense")
    .reduce((sum, item) => sum + Number(item.amount), 0);
    
  const totalPayments = ledgerItems
    .filter(item => item.type === "payment" && item.status === "paid")
    .reduce((sum, item) => sum + Number(item.amount), 0);

  const totalSpent = totalExpenses + totalPayments;

  const remainingBudget = totalBudget - totalSpent;
  
  // Pending payments is the sum of all unpaid payments in the ledger
  const pendingPayments = ledgerItems
    .filter(item => item.type === "payment" && item.status === "unpaid")
    .reduce((sum, item) => sum + Number(item.amount), 0);
    
  const budgetUsedPercentage = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

  // Due soon calculation (unpaid payments whose date is <= fourteenDaysLaterStr)
  const todayStr = new Date().toISOString().split("T")[0];
  const fourteenDaysLater = new Date();
  fourteenDaysLater.setDate(fourteenDaysLater.getDate() + 14);
  const fourteenDaysLaterStr = fourteenDaysLater.toISOString().split("T")[0];

  const dueSoonItems = ledgerItems.filter(item => {
    return item.type === "payment" && item.status === "unpaid" && item.date <= fourteenDaysLaterStr;
  });

  const dueSoonSum = dueSoonItems.reduce((sum, item) => sum + Number(item.amount), 0);

  const handleSaveBudgetLimit = () => {
    const numericBudget = parseFloat(newBudgetLimit);
    if (isNaN(numericBudget) || numericBudget < 0) {
      toast.error("Please enter a valid positive number");
      return;
    }
    updateBudgetLimitMutation.mutate(numericBudget);
  };

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(expenseAmount);
    if (!expenseForWhat.trim()) {
      toast.error("Please fill in what the expense is for");
      return;
    }
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid expense amount");
      return;
    }
    addLedgerItemMutation.mutate({
      type: "expense",
      for_what: expenseForWhat,
      vendor: expenseVendor || "Unknown",
      amount,
      notes: expenseNotes
    });
  };

  const handleAddPayment = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(paymentAmount);
    if (!paymentForWhat.trim()) {
      toast.error("Please fill in what the payment is for");
      return;
    }
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid payment amount");
      return;
    }
    if (!paymentDate) {
      toast.error("Please select a date for the payment");
      return;
    }
    addLedgerItemMutation.mutate({
      type: "payment",
      for_what: paymentForWhat,
      vendor: paymentVendor || "Unknown",
      amount,
      notes: paymentNotes,
      date: paymentDate,
      status: paymentStatus
    });
  };

  const handleDeleteItem = (id: string) => {
    if (confirm("Are you sure you want to delete this transaction record?")) {
      deleteLedgerItemMutation.mutate(id);
    }
  };

  const formatCurrency = (val: number) => {
    const formattedNum = new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(val);
    return `Rs. ${formattedNum}`;
  };

  const getProgressColor = (pct: number) => {
    if (pct <= 75) return "bg-purple-600";
    if (pct <= 100) return "bg-amber-500";
    return "bg-rose-500";
  };

  const filteredLedger = ledgerItems.filter(item => {
    if (activeTab === "all") return true;
    if (activeTab === "expense") return item.type === "expense";
    if (activeTab === "payment") return item.type === "payment";
    if (activeTab === "due_soon") {
      return item.type === "expense" && item.date <= fourteenDaysLaterStr;
    }
    return true;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        
        {/* Header Block */}
        <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-center">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 flex items-center gap-2.5">
              <Wallet className="h-8 w-8 text-purple-600 animate-pulse" />
              Budget Calculator
            </h1>
            <p className="text-gray-500 mt-1 text-sm md:text-base">
              Add and track your wedding expenses, payments, settings, and outstanding balances.
            </p>
          </div>

          {/* Budget limit editor */}
          <div className="bg-white border border-purple-100 rounded-xl p-3 shadow-sm flex items-center gap-4">
            {isEditingBudget ? (
              <div className="flex items-center gap-2">
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 select-none">Rs.</span>
                  <Input
                    type="number"
                    value={newBudgetLimit}
                    onChange={(e) => setNewBudgetLimit(e.target.value)}
                    placeholder="Enter budget..."
                    className="pl-9 w-40 h-9 font-semibold text-sm border-purple-200 focus-visible:ring-purple-500"
                    autoFocus
                  />
                </div>
                <Button size="icon" className="h-9 w-9 bg-emerald-600 hover:bg-emerald-700" onClick={handleSaveBudgetLimit}>
                  <Check className="h-4.5 w-4.5 text-white" />
                </Button>
                <Button size="icon" variant="outline" className="h-9 w-9 border-slate-200" onClick={() => setIsEditingBudget(false)}>
                  <X className="h-4.5 w-4.5 text-slate-500" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="space-y-0.5">
                  <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Total Wedding Budget</p>
                  <p className="font-extrabold text-lg text-slate-800">{formatCurrency(totalBudget)}</p>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 hover:bg-purple-50 hover:text-purple-600 rounded-lg text-slate-400"
                  onClick={() => {
                    setNewBudgetLimit(totalBudget.toString());
                    setIsEditingBudget(true);
                  }}
                >
                  <Edit3 className="h-4.5 w-4.5" />
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Full-width Budget Used Progress Card */}
        <Card className="border-purple-100 shadow-sm relative overflow-hidden bg-gradient-to-r from-purple-50/20 to-indigo-50/10">
          <CardContent className="p-5 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="space-y-0.5">
                <h3 className="font-extrabold text-sm text-slate-800 flex items-center gap-1.5">
                  <TrendingUp className="h-4.5 w-4.5 text-purple-600 animate-bounce" />
                  Budget Used (%)
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Spent {formatCurrency(totalSpent)} of your total {formatCurrency(totalBudget)} budget
                </p>
              </div>
              <div className="flex items-baseline gap-1.5 self-start sm:self-auto">
                <span className="text-2xl font-black text-purple-700">{budgetUsedPercentage}%</span>
                <span className="text-xs text-purple-400 font-bold uppercase tracking-wide">Used</span>
              </div>
            </div>

            {/* Thicker Linear Progress Bar */}
            <div className="relative w-full h-3.5 bg-slate-100/80 rounded-full border border-slate-200/30 overflow-hidden shadow-inner">
              <div 
                className={`h-full transition-all duration-500 ease-out rounded-full ${getProgressColor(budgetUsedPercentage)}`}
                style={{ width: `${Math.min(budgetUsedPercentage, 100)}%` }}
              />
              {budgetUsedPercentage > 0 && budgetUsedPercentage <= 100 && (
                <div 
                  className="absolute top-0 bottom-0 w-2 bg-white/40 blur-xs transition-all duration-500 ease-out"
                  style={{ left: `calc(${Math.min(budgetUsedPercentage, 100)}% - 4px)` }}
                />
              )}
            </div>
            
            <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase tracking-wider px-0.5">
              <span>0% Start</span>
              <span className={budgetUsedPercentage > 75 ? "text-amber-500 font-bold" : ""}>75% Warning</span>
              <span className={budgetUsedPercentage > 100 ? "text-rose-500 font-bold" : ""}>100% Limit</span>
            </div>
          </CardContent>
        </Card>

        {/* Dashboard Overview Metrics Grid (5 items) */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          
          <Card className="border-purple-100 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-purple-500"></div>
            <CardContent className="p-4 pt-5">
              <span className="text-[10px] font-bold text-purple-500 uppercase tracking-wider">Expenses</span>
              <p className="text-xl font-black text-slate-800 mt-1">{formatCurrency(totalExpenses)}</p>
              <div className="flex items-center gap-1 mt-2 text-[10px] text-slate-400 font-medium">
                <ArrowUpRight className="h-3 w-3 text-purple-500" />
                Total committed cost
              </div>
            </CardContent>
          </Card>

          <Card className="border-emerald-100 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500"></div>
            <CardContent className="p-4 pt-5">
              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Payments</span>
              <p className="text-xl font-black text-slate-800 mt-1">{formatCurrency(totalPayments)}</p>
              <div className="flex items-center gap-1 mt-2 text-[10px] text-slate-400 font-medium">
                <ArrowDownLeft className="h-3 w-3 text-emerald-500" />
                Total paid amount
              </div>
            </CardContent>
          </Card>

          <Card className={`shadow-sm relative overflow-hidden border-2 ${remainingBudget >= 0 ? 'border-purple-100/80' : 'border-rose-200 bg-rose-50/10'}`}>
            <div className={`absolute top-0 left-0 right-0 h-1 ${remainingBudget >= 0 ? 'bg-purple-600' : 'bg-rose-500'}`}></div>
            <CardContent className="p-4 pt-5">
              <span className={`text-[10px] font-bold uppercase tracking-wider ${remainingBudget >= 0 ? 'text-purple-600' : 'text-rose-600'}`}>Remaining Budget</span>
              <p className={`text-xl font-black mt-1 ${remainingBudget >= 0 ? 'text-slate-800' : 'text-rose-600'}`}>
                {formatCurrency(remainingBudget)}
              </p>
              <div className="flex items-center gap-1 mt-2 text-[10px] font-medium">
                {remainingBudget >= 0 ? (
                  <span className="text-slate-400">Budget left to allocate</span>
                ) : (
                  <span className="text-rose-600 flex items-center gap-1 font-semibold">
                    <AlertTriangle className="h-3.5 w-3.5" /> Budget Overrun!
                  </span>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-amber-100 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-amber-500"></div>
            <CardContent className="p-4 pt-5">
              <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">Pending Payments</span>
              <p className="text-xl font-black text-slate-800 mt-1">{formatCurrency(pendingPayments)}</p>
              <div className="flex items-center gap-1 mt-2 text-[10px] text-slate-400 font-medium">
                <Info className="h-3.5 w-3.5 text-amber-500" />
                Unpaid committed balance
              </div>
            </CardContent>
          </Card>

          <Card className="border-rose-100 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-rose-500"></div>
            <CardContent className="p-4 pt-5">
              <span className="text-[10px] font-bold text-rose-500 uppercase tracking-wider">Due Soon Payments</span>
              <p className="text-xl font-black text-slate-800 mt-1">{formatCurrency(dueSoonSum)}</p>
              <div className="flex items-center gap-1 mt-2 text-[10px] text-slate-400 font-medium">
                <CalendarClock className="h-3.5 w-3.5 text-rose-500" />
                Due in next 14 days
              </div>
            </CardContent>
          </Card>

        </div>

        {/* CTA buttons row */}
        <div className="flex items-center gap-3">
          <Button 
            onClick={() => setIsExpenseOpen(true)} 
            className="bg-purple-600 hover:bg-purple-700 text-white font-semibold flex items-center gap-2 shadow-sm rounded-xl px-5 py-5"
          >
            <PlusCircle className="h-5 w-5" />
            Add Expense
          </Button>
          <Button 
            onClick={() => setIsPaymentOpen(true)} 
            variant="outline" 
            className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 font-semibold flex items-center gap-2 shadow-sm rounded-xl px-5 py-5"
          >
            <PlusCircle className="h-5 w-5 text-emerald-600" />
            Add Payment
          </Button>
        </div>

        {/* Ledger logs */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 border-b border-slate-100 pb-3">
            <h2 className="font-extrabold text-lg text-slate-800">Transaction Ledger</h2>
            
            {/* Tabs filter */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg self-start sm:self-auto">
              <button
                onClick={() => setActiveTab("all")}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                  activeTab === "all" ? "bg-white text-slate-800 shadow-xs" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setActiveTab("expense")}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                  activeTab === "expense" ? "bg-purple-600 text-white shadow-xs" : "text-slate-500 hover:text-purple-600"
                }`}
              >
                Expenses
              </button>
              <button
                onClick={() => setActiveTab("payment")}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                  activeTab === "payment" ? "bg-emerald-600 text-white shadow-xs" : "text-slate-500 hover:text-emerald-600"
                }`}
              >
                Payments
              </button>
              <button
                onClick={() => setActiveTab("due_soon")}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                  activeTab === "due_soon" ? "bg-rose-500 text-white shadow-xs" : "text-slate-500 hover:text-rose-600"
                }`}
              >
                Due Soon
              </button>
            </div>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 border-b border-slate-200">
                    <TableHead className="font-bold text-slate-700 w-[15%] px-6 py-4.5">Date</TableHead>
                    <TableHead className="font-bold text-slate-700 w-[12%] px-6 py-4.5">Type</TableHead>
                    <TableHead className="font-bold text-slate-700 w-[28%] px-6 py-4.5">For What</TableHead>
                    <TableHead className="font-bold text-slate-700 w-[18%] px-6 py-4.5">Vendor</TableHead>
                    <TableHead className="font-bold text-slate-700 w-[17%] px-6 py-4.5 text-right">Amount</TableHead>
                    <TableHead className="font-bold text-slate-700 w-[10%] px-6 py-4.5 text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLedger.length > 0 ? (
                    filteredLedger.map((item) => {
                      const isExpense = item.type === "expense";
                      return (
                        <TableRow 
                          key={item.id} 
                          className={`transition-colors border-b border-slate-100/70 hover:bg-slate-50/20 ${
                            isExpense ? "bg-purple-50/5 hover:bg-purple-50/15" : "bg-emerald-50/5 hover:bg-emerald-50/15"
                          }`}
                        >
                          <TableCell className="px-6 py-4 font-medium text-slate-600 text-xs">
                            <span className="flex items-center gap-1.5">
                              <Calendar className="h-3.5 w-3.5 text-slate-400" />
                              {new Date(item.date).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                                timeZone: "UTC" // date is stored as YYYY-MM-DD
                              })}
                            </span>
                          </TableCell>
                          <TableCell className="px-6 py-4">
                            {isExpense ? (
                              <Badge className="bg-purple-100 hover:bg-purple-100 text-purple-800 border border-purple-200/50 rounded-full font-bold text-[10px] gap-1 px-2.5">
                                <ArrowUpRight className="h-3 w-3 text-purple-600" />
                                Expense
                              </Badge>
                            ) : (
                              item.status === "unpaid" ? (
                                <Badge className="bg-amber-100 hover:bg-amber-100 text-amber-800 border border-amber-200/50 rounded-full font-bold text-[10px] gap-1 px-2.5">
                                  <Clock className="h-3 w-3 text-amber-600" />
                                  Unpaid
                                </Badge>
                              ) : (
                                <Badge className="bg-emerald-100 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/50 rounded-full font-bold text-[10px] gap-1 px-2.5">
                                  <ArrowDownLeft className="h-3 w-3 text-emerald-600" />
                                  Paid
                                </Badge>
                              )
                            )}
                          </TableCell>
                          <TableCell className="px-6 py-4">
                            <div className="space-y-0.5">
                              <p className="font-semibold text-slate-900 text-sm">{item.for_what}</p>
                              {item.notes && (
                                <p className="text-slate-400 text-[11px] max-w-lg truncate leading-relaxed">
                                  {item.notes}
                                </p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="px-6 py-4 text-slate-700 font-medium text-xs">
                            {item.vendor || "—"}
                          </TableCell>
                          <TableCell className={`px-6 py-4 text-right font-bold text-sm ${isExpense ? 'text-purple-950' : 'text-emerald-700'}`}>
                            {isExpense ? "-" : "+"} {formatCurrency(Number(item.amount))}
                          </TableCell>
                          <TableCell className="px-6 py-4 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              {item.type === "payment" && item.status === "unpaid" && (
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  onClick={() => markAsPaidMutation.mutate(item.id)}
                                  className="h-8 w-8 hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 rounded-lg"
                                  title="Mark as Paid"
                                  disabled={markAsPaidMutation.isPending}
                                >
                                  <Check className="h-4.5 w-4.5" />
                                </Button>
                              )}
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => handleDeleteItem(item.id)}
                                className="h-8 w-8 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg"
                                title="Delete"
                              >
                                <Trash2 className="h-4.5 w-4.5" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="px-6 py-16 text-center">
                        <div className="flex flex-col items-center justify-center gap-2 text-slate-400">
                          <Wallet className="h-10 w-10 text-slate-300" />
                          <p className="font-semibold text-slate-800 text-sm mt-1">No transaction records</p>
                          <p className="text-xs text-slate-400">
                            {activeTab === "all" ? "Add expenses or payments to start tracking." : "No records found matching this filter."}
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>

        {/* MODAL POPUP: ADD EXPENSE */}
        <Dialog open={isExpenseOpen} onOpenChange={setIsExpenseOpen}>
          <DialogContent className="sm:max-w-md bg-white border border-slate-100 rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <ArrowUpRight className="h-6 w-6 text-purple-600 bg-purple-50 p-1 rounded-lg" />
                Add Wedding Expense
              </DialogTitle>
              <DialogDescription className="text-slate-400">
                Log a new budget allocation. The date will be set to today automatically.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleAddExpense} className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label htmlFor="expenseForWhat" className="font-semibold text-xs text-slate-700">For What <span className="text-rose-500">*</span></Label>
                <Input
                  id="expenseForWhat"
                  placeholder="e.g. Reception Hall Advance, Bridal Dress"
                  value={expenseForWhat}
                  onChange={(e) => setExpenseForWhat(e.target.value)}
                  className="border-slate-200 focus-visible:ring-purple-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="expenseVendor" className="font-semibold text-xs text-slate-700">Vendor</Label>
                  <Input
                    id="expenseVendor"
                    placeholder="e.g. Royal Orchid Hall"
                    value={expenseVendor}
                    onChange={(e) => setExpenseVendor(e.target.value)}
                    className="border-slate-200 focus-visible:ring-purple-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="expenseAmount" className="font-semibold text-xs text-slate-700">Total Amount (Rs.) <span className="text-rose-500">*</span></Label>
                  <Input
                    id="expenseAmount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={expenseAmount}
                    onChange={(e) => setExpenseAmount(e.target.value)}
                    className="border-slate-200 focus-visible:ring-purple-500 font-semibold"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="expenseNotes" className="font-semibold text-xs text-slate-700">Notes</Label>
                <Textarea
                  id="expenseNotes"
                  placeholder="Include any agreement terms, contact numbers, or reference IDs..."
                  value={expenseNotes}
                  onChange={(e) => setExpenseNotes(e.target.value)}
                  className="border-slate-200 focus-visible:ring-purple-500 resize-none h-24"
                />
              </div>

              <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex items-center gap-2 text-[11px] text-slate-500">
                <Calendar className="h-4 w-4 text-purple-600 shrink-0" />
                <span>Date will be saved automatically as today: <strong>{new Date().toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' })}</strong></span>
              </div>

              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" className="border-slate-200" onClick={() => setIsExpenseOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white" disabled={addLedgerItemMutation.isPending}>
                  {addLedgerItemMutation.isPending ? "Adding..." : "Add Expense"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* MODAL POPUP: ADD PAYMENT */}
        <Dialog open={isPaymentOpen} onOpenChange={setIsPaymentOpen}>
          <DialogContent className="sm:max-w-md bg-white border border-slate-100 rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <ArrowDownLeft className="h-6 w-6 text-emerald-600 bg-emerald-50 p-1 rounded-lg" />
                Add Wedding Payment
              </DialogTitle>
              <DialogDescription className="text-slate-400">
                Log a payment made to a vendor. Enter a custom date for this transaction.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleAddPayment} className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label htmlFor="paymentForWhat" className="font-semibold text-xs text-slate-700">For What <span className="text-rose-500">*</span></Label>
                <Input
                  id="paymentForWhat"
                  placeholder="e.g. Hall Deposit, DJ booking deposit"
                  value={paymentForWhat}
                  onChange={(e) => setPaymentForWhat(e.target.value)}
                  className="border-slate-200 focus-visible:ring-purple-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="paymentVendor" className="font-semibold text-xs text-slate-700">Vendor</Label>
                  <Input
                    id="paymentVendor"
                    placeholder="e.g. DJ Sparkles Office"
                    value={paymentVendor}
                    onChange={(e) => setPaymentVendor(e.target.value)}
                    className="border-slate-200 focus-visible:ring-purple-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="paymentAmount" className="font-semibold text-xs text-slate-700">Total Amount (Rs.) <span className="text-rose-500">*</span></Label>
                  <Input
                    id="paymentAmount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    className="border-slate-200 focus-visible:ring-purple-500 font-semibold"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="paymentDate" className="font-semibold text-xs text-slate-700">Payment Date <span className="text-rose-500">*</span></Label>
                  <Input
                    id="paymentDate"
                    type="date"
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    className="border-slate-200 focus-visible:ring-purple-500 font-medium"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="paymentStatus" className="font-semibold text-xs text-slate-700">Payment Status <span className="text-rose-500">*</span></Label>
                  <Select
                    value={paymentStatus}
                    onValueChange={(val: "paid" | "unpaid") => setPaymentStatus(val)}
                  >
                    <SelectTrigger className="border-slate-200 focus-visible:ring-purple-500 text-xs font-semibold h-9">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-slate-200">
                      <SelectItem value="paid" className="text-xs font-medium focus:bg-slate-50">Paid</SelectItem>
                      <SelectItem value="unpaid" className="text-xs font-medium focus:bg-slate-50">Unpaid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="paymentNotes" className="font-semibold text-xs text-slate-700">Notes</Label>
                <Textarea
                  id="paymentNotes"
                  placeholder="e.g. Paid via Bank Transfer, Receipt No. 8921..."
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  className="border-slate-200 focus-visible:ring-purple-500 resize-none h-24"
                />
              </div>

              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" className="border-slate-200" onClick={() => setIsPaymentOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white" disabled={addLedgerItemMutation.isPending}>
                  {addLedgerItemMutation.isPending ? "Adding..." : "Add Payment"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

      </div>
    </DashboardLayout>
  );
}
