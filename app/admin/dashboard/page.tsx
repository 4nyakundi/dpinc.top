"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, 
  Receipt, 
  ClipboardList, 
  CheckCircle, 
  Clock, 
  TrendingUp, 
  Plus, 
  Trash2, 
  Printer, 
  RefreshCw, 
  LogOut, 
  Search, 
  ChevronRight,
  ShieldCheck,
  Calendar,
  DollarSign
} from "lucide-react";
import Logo from "@/components/Logo";

interface CatalogItem {
  id: string;
  name: string;
  price: number;
}

interface Lead {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  status: string;
  notes?: string;
  quotes?: any[];
}

interface Quote {
  id: string;
  invoiceNo: string;
  status: string;
  issueDate: string;
  dueDate?: string;
  total: number;
  subtotal: number;
  tax: number;
  labourFee: number;
  lead?: Lead;
  lineItems: any[];
  invoice?: any;
  notes?: string;
}

interface Invoice {
  id: string;
  invoiceNo: string;
  total: number;
  status: string;
  issuedAt: string;
  dueAt?: string;
  quote?: {
    id: string;
    status: string;
    total: number;
    issueDate: string;
  };
}

export default function AdminDashboard() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [activeTab, setActiveTab] = useState<"quotes" | "proformas" | "invoices" | "subscribers">("quotes");
  
  // Data states
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [subscribers, setSubscribers] = useState<Lead[]>([]);
  
  // Loading & UI states
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [invoiceFilter, setInvoiceFilter] = useState<"all" | "paid" | "unpaid">("all");
  const [showAddSubscriberModal, setShowAddSubscriberModal] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  // New subscriber form state
  const [newSub, setNewSub] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    packageName: "Monthly Internet Package",
    packagePrice: "",
    notes: ""
  });

  useEffect(() => {
    const adminToken = localStorage.getItem("adminToken");
    if (!adminToken) {
      router.push("/admin/login");
      return;
    }
    setToken(adminToken);
    loadAllData(adminToken);
  }, [router]);

  const loadAllData = async (authToken: string) => {
    setLoading(true);
    try {
      await Promise.all([
        fetchQuotes(authToken),
        fetchInvoices(authToken),
        fetchSubscribers(authToken)
      ]);
    } catch (err) {
      console.error("Error loading data", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchQuotes = async (authToken: string) => {
    const res = await fetch("/api/quotes", {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      const data = await res.json();
      setQuotes(data.quotes || []);
    }
  };

  const fetchInvoices = async (authToken: string) => {
    const res = await fetch("/api/invoices", {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      const data = await res.json();
      setInvoices(data.invoices || []);
    }
  };

  const fetchSubscribers = async (authToken: string) => {
    const res = await fetch("/api/subscribers", {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      const data = await res.json();
      setSubscribers(data.subscribers || []);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    router.push("/admin/login");
  };

  // Actions
  const updateQuoteStatus = async (quoteId: string, status: string) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/quotes/${quoteId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        await loadAllData(token);
      } else {
        alert("Failed to update quotation status");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const deleteQuote = async (quoteId: string) => {
    if (!confirm("Are you sure you want to delete this quotation? This will delete all associated invoice records.")) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/quotes/${quoteId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        await loadAllData(token);
      } else {
        alert("Failed to delete quotation");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const updateInvoiceStatus = async (invoiceId: string, status: string) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/invoices/${invoiceId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        await loadAllData(token);
      } else {
        alert("Failed to update invoice status");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const deleteInvoice = async (invoiceId: string) => {
    if (!confirm("Are you sure you want to delete this invoice?")) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/invoices/${invoiceId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        await loadAllData(token);
      } else {
        alert("Failed to delete invoice");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const createInvoiceFromQuote = async (quoteId: string, dueDate?: string) => {
    setActionLoading(true);
    try {
      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ quoteId, dueDate })
      });
      if (res.ok) {
        await loadAllData(token);
        alert("Invoice created successfully!");
      } else {
        const errorData = await res.json();
        alert(errorData.error || "Failed to create invoice");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const generateMonthlyProformas = async () => {
    setActionLoading(true);
    setSyncStatus("Syncing...");
    try {
      const res = await fetch("/api/subscribers/generate-proformas", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSyncStatus(`Successfully generated ${data.generatedCount} monthly billing records!`);
        await loadAllData(token);
      } else {
        setSyncStatus("Failed to run monthly billing generation.");
      }
    } catch (err) {
      console.error(err);
      setSyncStatus("Error during synchronization.");
    } finally {
      setActionLoading(false);
      setTimeout(() => setSyncStatus(null), 5000);
    }
  };

  const addSubscriber = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSub.name || !newSub.packagePrice) {
      alert("Name and package price are required");
      return;
    }
    setActionLoading(true);
    try {
      const res = await fetch("/api/subscribers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(newSub)
      });
      if (res.ok) {
        setShowAddSubscriberModal(false);
        setNewSub({
          name: "",
          email: "",
          phone: "",
          company: "",
          packageName: "Monthly Internet Package",
          packagePrice: "",
          notes: ""
        });
        await loadAllData(token);
        alert("Subscriber added successfully!");
      } else {
        alert("Failed to add subscriber");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  // Metrics calculators
  const metrics = useMemo(() => {
    const totalQuotesCount = quotes.filter(q => ["draft", "sent", "rejected"].includes(q.status)).length;
    const totalProformasCount = quotes.filter(q => ["accepted", "proforma"].includes(q.status)).length;
    
    const unpaidInvoices = invoices.filter(i => i.status === "unpaid");
    const paidInvoices = invoices.filter(i => i.status === "paid");
    
    const totalPaidAmount = paidInvoices.reduce((sum, inv) => sum + inv.total, 0);
    const totalPendingAmount = unpaidInvoices.reduce((sum, inv) => sum + inv.total, 0);
    
    return {
      quotesCount: totalQuotesCount,
      proformasCount: totalProformasCount,
      pendingCount: unpaidInvoices.length,
      paidCount: paidInvoices.length,
      paidAmount: totalPaidAmount,
      pendingAmount: totalPendingAmount,
      subscribersCount: subscribers.length
    };
  }, [quotes, invoices, subscribers]);

  // Filtered lists
  const filteredQuotes = useMemo(() => {
    return quotes.filter(q => ["draft", "sent", "rejected"].includes(q.status) && (
      q.invoiceNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (q.lead?.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (q.lead?.company || "").toLowerCase().includes(searchQuery.toLowerCase())
    ));
  }, [quotes, searchQuery]);

  const filteredProformas = useMemo(() => {
    return quotes.filter(q => ["accepted", "proforma"].includes(q.status) && (
      q.invoiceNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (q.lead?.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (q.lead?.company || "").toLowerCase().includes(searchQuery.toLowerCase())
    ));
  }, [quotes, searchQuery]);

  const filteredInvoices = useMemo(() => {
    return invoices.filter(i => {
      const matchSearch = i.invoiceNo.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (i.quote?.id || "").toLowerCase().includes(searchQuery.toLowerCase());
      
      if (invoiceFilter === "all") return matchSearch;
      return matchSearch && i.status === invoiceFilter;
    });
  }, [invoices, searchQuery, invoiceFilter]);

  const filteredSubscribers = useMemo(() => {
    return subscribers.filter(s => 
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.email || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.phone || "").toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [subscribers, searchQuery]);

  const formatPrice = (value: number) => {
    return `Ksh ${value.toLocaleString("en-KE", { minimumFractionDigits: 2 })}`;
  };

  const handlePrint = (type: "quote" | "invoice", id: string) => {
    // Standard window open or printing utility
    window.open(`/quote?print=true&type=${type}&id=${id}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-cyan-500 selection:text-black">
      {/* Navbar */}
      <header className="sticky top-0 z-40 bg-black/80 backdrop-blur-md border-b border-white/5 py-4 px-8 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Logo />
          <div className="h-6 w-[1px] bg-white/20"></div>
          <div className="flex items-center gap-2 text-cyan-400 text-sm font-semibold tracking-widest uppercase">
            <ShieldCheck className="w-4 h-4" /> Control Panel
          </div>
        </div>
        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 border border-white/10 hover:border-red-500/30 px-4 py-2 rounded-xl transition-all text-sm font-medium"
        >
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        
        {/* Sync / Billing trigger alerts */}
        {syncStatus && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-4 bg-cyan-500/20 border border-cyan-500/40 rounded-2xl text-cyan-300 text-sm flex items-center justify-between"
          >
            <span>{syncStatus}</span>
            <button onClick={() => setSyncStatus(null)} className="text-xs hover:underline">Dismiss</button>
          </motion.div>
        )}

        {/* Dashboard Title & Quick Sync action */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold font-display tracking-tight text-white mb-2">
              Dashboard
            </h1>
            <p className="text-gray-400">Manage client proposals, billing, and subscription network invoices.</p>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={generateMonthlyProformas}
              disabled={actionLoading}
              className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-semibold px-5 py-3 rounded-xl hover:shadow-lg hover:shadow-cyan-500/30 transition-all disabled:opacity-50 text-sm"
            >
              <RefreshCw className={`w-4 h-4 ${actionLoading ? 'animate-spin' : ''}`} /> Run Monthly Billing
            </button>
          </div>
        </div>

        {/* Top metrics summary cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {/* Card 1: Paid Invoices */}
          <div className="glass border border-white/10 rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/10 blur-[40px] rounded-full" />
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Paid Revenue</span>
              <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center text-green-400">
                <CheckCircle className="w-4 h-4" />
              </div>
            </div>
            <h3 className="text-2xl font-bold font-display mb-1">{formatPrice(metrics.paidAmount)}</h3>
            <p className="text-xs text-gray-400">{metrics.paidCount} Fully paid invoices</p>
          </div>

          {/* Card 2: Pending Revenue */}
          <div className="glass border border-white/10 rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-500/10 blur-[40px] rounded-full" />
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Pending Revenue</span>
              <div className="w-8 h-8 rounded-full bg-yellow-500/10 flex items-center justify-center text-yellow-400">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <h3 className="text-2xl font-bold font-display mb-1">{formatPrice(metrics.pendingAmount)}</h3>
            <p className="text-xs text-gray-400">{metrics.pendingCount} Invoices awaiting payment</p>
          </div>

          {/* Card 3: Active Subscribers */}
          <div className="glass border border-white/10 rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 blur-[40px] rounded-full" />
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Subscribers</span>
              <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <h3 className="text-2xl font-bold font-display mb-1">{metrics.subscribersCount} Clients</h3>
            <p className="text-xs text-gray-400">Active monthly subscriptions</p>
          </div>

          {/* Card 4: Proposals Acceptance */}
          <div className="glass border border-white/10 rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 blur-[40px] rounded-full" />
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Quotations</span>
              <div className="w-8 h-8 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-400">
                <ClipboardList className="w-4 h-4" />
              </div>
            </div>
            <h3 className="text-2xl font-bold font-display mb-1">{metrics.quotesCount} Active</h3>
            <p className="text-xs text-gray-400">{metrics.proformasCount} converted to proformas</p>
          </div>
        </div>

        {/* Tab Selection & Search bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/10 pb-6 mb-8">
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 p-1.5 rounded-2xl overflow-x-auto shrink-0">
            <button
              onClick={() => { setActiveTab("quotes"); setSearchQuery(""); }}
              className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === "quotes" 
                  ? "bg-cyan-500 text-black shadow-lg shadow-cyan-500/20 font-bold" 
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Quotations ({metrics.quotesCount})
            </button>
            <button
              onClick={() => { setActiveTab("proformas"); setSearchQuery(""); }}
              className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === "proformas" 
                  ? "bg-cyan-500 text-black shadow-lg shadow-cyan-500/20 font-bold" 
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Proforma Invoices ({metrics.proformasCount})
            </button>
            <button
              onClick={() => { setActiveTab("invoices"); setSearchQuery(""); }}
              className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === "invoices" 
                  ? "bg-cyan-500 text-black shadow-lg shadow-cyan-500/20 font-bold" 
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Final Invoices ({metrics.paidCount + metrics.pendingCount})
            </button>
            <button
              onClick={() => { setActiveTab("subscribers"); setSearchQuery(""); }}
              className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === "subscribers" 
                  ? "bg-cyan-500 text-black shadow-lg shadow-cyan-500/20 font-bold" 
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Subscribers ({metrics.subscribersCount})
            </button>
          </div>

          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search ${activeTab}...`}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-cyan-400 transition-colors"
            />
          </div>
        </div>

        {/* Tab content viewports */}
        {loading ? (
          <div className="py-20 text-center text-gray-400">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-cyan-400" />
            Loading system records...
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="w-full"
            >
              
              {/* QUOTATIONS TAB */}
              {activeTab === "quotes" && (
                <div className="glass border border-white/10 rounded-3xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left">
                      <thead>
                        <tr className="border-b border-white/10 bg-white/5 text-gray-400 text-xs font-bold uppercase tracking-wider">
                          <th className="py-4 px-6">Quote No</th>
                          <th className="py-4 px-6">Billed To</th>
                          <th className="py-4 px-6">Company</th>
                          <th className="py-4 px-6">Date</th>
                          <th className="py-4 px-6">Total Amount</th>
                          <th className="py-4 px-6">Status</th>
                          <th className="py-4 px-6 text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-sm">
                        {filteredQuotes.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="py-10 text-center text-gray-500">No quotations found.</td>
                          </tr>
                        ) : (
                          filteredQuotes.map((q) => (
                            <tr key={q.id} className="hover:bg-white/5 transition-all">
                              <td className="py-4 px-6 font-semibold text-cyan-400">{q.invoiceNo}</td>
                              <td className="py-4 px-6">{q.lead?.name || "Generic Lead"}</td>
                              <td className="py-4 px-6 text-gray-400">{q.lead?.company || "-"}</td>
                              <td className="py-4 px-6 text-gray-400">{new Date(q.issueDate).toLocaleDateString()}</td>
                              <td className="py-4 px-6 font-bold">{formatPrice(q.total)}</td>
                              <td className="py-4 px-6">
                                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
                                  q.status === "rejected" ? "bg-red-500/20 text-red-400 border border-red-500/30" : "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                                }`}>
                                  {q.status}
                                </span>
                              </td>
                              <td className="py-4 px-6 flex items-center justify-center gap-2">
                                <button 
                                  onClick={() => updateQuoteStatus(q.id, "accepted")}
                                  className="px-3 py-1.5 bg-green-500/20 hover:bg-green-500 text-green-400 hover:text-black border border-green-500/30 rounded-lg text-xs font-bold transition-all"
                                >
                                  Accept
                                </button>
                                <button 
                                  onClick={() => updateQuoteStatus(q.id, "rejected")}
                                  className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/30 text-red-400 border border-red-500/20 rounded-lg text-xs transition-all"
                                >
                                  Reject
                                </button>
                                <button 
                                  onClick={() => handlePrint("quote", q.id)}
                                  className="p-1.5 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-lg transition-all"
                                  title="Print Quotation"
                                >
                                  <Printer className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={() => deleteQuote(q.id)}
                                  className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-all"
                                  title="Delete"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* PROFORMA INVOICES TAB */}
              {activeTab === "proformas" && (
                <div className="glass border border-white/10 rounded-3xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left">
                      <thead>
                        <tr className="border-b border-white/10 bg-white/5 text-gray-400 text-xs font-bold uppercase tracking-wider">
                          <th className="py-4 px-6">Proforma No</th>
                          <th className="py-4 px-6">Client</th>
                          <th className="py-4 px-6">Monthly Rate / Total</th>
                          <th className="py-4 px-6">Prepared Date</th>
                          <th className="py-4 px-6">Billing Info</th>
                          <th className="py-4 px-6 text-center">Invoice Creation</th>
                          <th className="py-4 px-6 text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-sm">
                        {filteredProformas.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="py-10 text-center text-gray-500">No proforma invoices found.</td>
                          </tr>
                        ) : (
                          filteredProformas.map((p) => (
                            <tr key={p.id} className="hover:bg-white/5 transition-all">
                              <td className="py-4 px-6 font-semibold text-purple-400">{p.invoiceNo}</td>
                              <td className="py-4 px-6">
                                <div className="font-semibold">{p.lead?.name || "Generic Lead"}</div>
                                <div className="text-xs text-gray-400">{p.lead?.phone || "-"}</div>
                              </td>
                              <td className="py-4 px-6 font-bold">{formatPrice(p.total)}</td>
                              <td className="py-4 px-6 text-gray-400">{new Date(p.issueDate).toLocaleDateString()}</td>
                              <td className="py-4 px-6 text-xs text-gray-400 max-w-xs truncate">{p.notes || "Standard proforma invoice"}</td>
                              <td className="py-4 px-6 text-center">
                                {p.invoice ? (
                                  <span className="text-xs text-green-400 border border-green-500/20 bg-green-500/10 px-2.5 py-1 rounded-full font-semibold">
                                    Invoice Linked
                                  </span>
                                ) : (
                                  <button
                                    onClick={() => createInvoiceFromQuote(p.id)}
                                    className="px-3.5 py-1.5 bg-gradient-to-r from-purple-500 to-indigo-500 hover:shadow-lg hover:shadow-purple-500/20 text-white rounded-lg text-xs font-bold transition-all"
                                  >
                                    Bill Customer
                                  </button>
                                )}
                              </td>
                              <td className="py-4 px-6 flex items-center justify-center gap-2">
                                <button 
                                  onClick={() => handlePrint("quote", p.id)}
                                  className="p-1.5 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-lg transition-all"
                                  title="Print Proforma"
                                >
                                  <Printer className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={() => deleteQuote(p.id)}
                                  className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-all"
                                  title="Delete"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* INVOICES TAB */}
              {activeTab === "invoices" && (
                <div>
                  <div className="flex items-center gap-4 mb-4">
                    <span className="text-xs text-gray-400 uppercase tracking-widest font-bold">Filter Status:</span>
                    <div className="flex items-center bg-white/5 border border-white/10 rounded-lg p-0.5">
                      <button 
                        onClick={() => setInvoiceFilter("all")} 
                        className={`px-3 py-1 rounded-md text-xs transition-all ${invoiceFilter === "all" ? "bg-white/10 text-white font-bold" : "text-gray-400"}`}
                      >
                        All
                      </button>
                      <button 
                        onClick={() => setInvoiceFilter("unpaid")} 
                        className={`px-3 py-1 rounded-md text-xs transition-all ${invoiceFilter === "unpaid" ? "bg-yellow-500/20 text-yellow-400 font-bold" : "text-gray-400"}`}
                      >
                        Pending
                      </button>
                      <button 
                        onClick={() => setInvoiceFilter("paid")} 
                        className={`px-3 py-1 rounded-md text-xs transition-all ${invoiceFilter === "paid" ? "bg-green-500/20 text-green-400 font-bold" : "text-gray-400"}`}
                      >
                        Paid
                      </button>
                    </div>
                  </div>

                  <div className="glass border border-white/10 rounded-3xl overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse text-left">
                        <thead>
                          <tr className="border-b border-white/10 bg-white/5 text-gray-400 text-xs font-bold uppercase tracking-wider">
                            <th className="py-4 px-6">Invoice No</th>
                            <th className="py-4 px-6">Source Proforma</th>
                            <th className="py-4 px-6">Billed Date</th>
                            <th className="py-4 px-6">Total Billed</th>
                            <th className="py-4 px-6">Status</th>
                            <th className="py-4 px-6 text-center">Payment Control</th>
                            <th className="py-4 px-6 text-center">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-sm">
                          {filteredInvoices.length === 0 ? (
                            <tr>
                              <td colSpan={7} className="py-10 text-center text-gray-500">No final invoices found.</td>
                            </tr>
                          ) : (
                            filteredInvoices.map((inv) => (
                              <tr key={inv.id} className="hover:bg-white/5 transition-all">
                                <td className="py-4 px-6 font-semibold text-green-400">{inv.invoiceNo}</td>
                                <td className="py-4 px-6 text-gray-400 font-mono text-xs">{inv.quote?.id ? "PROP-LINKED" : "MANUAL-INV"}</td>
                                <td className="py-4 px-6 text-gray-400">{new Date(inv.issuedAt).toLocaleDateString()}</td>
                                <td className="py-4 px-6 font-bold">{formatPrice(inv.total)}</td>
                                <td className="py-4 px-6">
                                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
                                    inv.status === "paid" 
                                      ? "bg-green-500/20 text-green-400 border border-green-500/30" 
                                      : "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                                  }`}>
                                    {inv.status === "paid" ? "Paid" : "Pending"}
                                  </span>
                                </td>
                                <td className="py-4 px-6 text-center">
                                  {inv.status === "unpaid" ? (
                                    <button
                                      onClick={() => updateInvoiceStatus(inv.id, "paid")}
                                      className="px-3.5 py-1.5 bg-green-500 text-black hover:shadow-lg hover:shadow-green-500/20 rounded-lg text-xs font-bold transition-all"
                                    >
                                      Mark as Paid
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => updateInvoiceStatus(inv.id, "unpaid")}
                                      className="px-3.5 py-1.5 bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 border border-white/10 hover:border-red-500/30 rounded-lg text-xs font-medium transition-all"
                                    >
                                      Revert to Unpaid
                                    </button>
                                  )}
                                </td>
                                <td className="py-4 px-6 flex items-center justify-center gap-2">
                                  <button 
                                    onClick={() => handlePrint("invoice", inv.id)}
                                    className="p-1.5 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-lg transition-all"
                                    title="Print Invoice / Receipt"
                                  >
                                    <Printer className="w-4 h-4" />
                                  </button>
                                  <button 
                                    onClick={() => deleteInvoice(inv.id)}
                                    className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-all"
                                    title="Delete"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* SUBSCRIBERS TAB */}
              {activeTab === "subscribers" && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold">Monthly Network Subscribers</h3>
                    <button
                      onClick={() => setShowAddSubscriberModal(true)}
                      className="flex items-center gap-2 bg-white text-black hover:bg-gray-200 px-4 py-2.5 rounded-xl font-bold text-sm transition-all"
                    >
                      <Plus className="w-4 h-4" /> Add Subscriber
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {filteredSubscribers.length === 0 ? (
                      <div className="col-span-3 py-10 text-center text-gray-500">No monthly subscribers registered.</div>
                    ) : (
                      filteredSubscribers.map((sub) => {
                        const packageQuote = sub.quotes?.[0];
                        return (
                          <div key={sub.id} className="glass border border-white/10 rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between">
                            <div>
                              <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-full bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                                  <Users className="w-5 h-5" />
                                </div>
                                <div>
                                  <h4 className="font-bold text-white leading-tight">{sub.name}</h4>
                                  <p className="text-xs text-gray-400">{sub.company || "Personal Account"}</p>
                                </div>
                              </div>

                              <div className="space-y-2 border-t border-white/5 pt-4 mb-4">
                                <div className="flex justify-between text-xs text-gray-400">
                                  <span>Phone:</span>
                                  <span className="text-white font-medium">{sub.phone || "-"}</span>
                                </div>
                                <div className="flex justify-between text-xs text-gray-400">
                                  <span>Email:</span>
                                  <span className="text-white font-medium truncate max-w-[180px]">{sub.email || "-"}</span>
                                </div>
                                <div className="flex justify-between text-xs text-gray-400">
                                  <span>Internet Package:</span>
                                  <span className="text-cyan-400 font-semibold truncate max-w-[160px]">
                                    {packageQuote?.lineItems?.[0]?.name || "Monthly Rate"}
                                  </span>
                                </div>
                                <div className="flex justify-between text-xs text-gray-400">
                                  <span>Billing Cost:</span>
                                  <span className="text-white font-bold">{packageQuote ? formatPrice(packageQuote.total) : "Not Configured"}</span>
                                </div>
                              </div>
                            </div>

                            {sub.notes && (
                              <p className="text-xs text-gray-500 bg-white/5 border border-white/5 p-2 rounded-lg mb-4 italic">
                                Note: {sub.notes}
                              </p>
                            )}

                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  setActiveTab("invoices");
                                  setSearchQuery(sub.name);
                                }}
                                className="w-full py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-semibold transition-all border border-white/10"
                              >
                                View Payments
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        )}

      </main>

      {/* Add Subscriber Modal */}
      {showAddSubscriberModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg glass border border-white/10 rounded-3xl p-8 overflow-hidden relative"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 blur-[80px] rounded-full pointer-events-none" />
            
            <h3 className="text-2xl font-bold font-display text-white mb-6">Register Network Subscriber</h3>
            
            <form onSubmit={addSubscriber} className="space-y-4 relative z-10">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-400 uppercase">Client Name</label>
                  <input
                    type="text"
                    required
                    value={newSub.name}
                    onChange={(e) => setNewSub({ ...newSub, name: e.target.value })}
                    placeholder="e.g. Emmanuel Nyakundi"
                    className="bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-400 transition-colors"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-400 uppercase">Company (Optional)</label>
                  <input
                    type="text"
                    value={newSub.company}
                    onChange={(e) => setNewSub({ ...newSub, company: e.target.value })}
                    placeholder="e.g. Mombasa Office"
                    className="bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-400 transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-400 uppercase">Phone Number</label>
                  <input
                    type="text"
                    value={newSub.phone}
                    onChange={(e) => setNewSub({ ...newSub, phone: e.target.value })}
                    placeholder="e.g. 0790964002"
                    className="bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-400 transition-colors"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-400 uppercase">Email Address</label>
                  <input
                    type="email"
                    value={newSub.email}
                    onChange={(e) => setNewSub({ ...newSub, email: e.target.value })}
                    placeholder="e.g. client@gmail.com"
                    className="bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-400 transition-colors"
                  />
                </div>
              </div>

              <div className="border-t border-white/5 pt-4 my-2">
                <p className="text-xs font-bold text-cyan-400 uppercase mb-3">Subscription Details</p>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-400 uppercase">Package Name</label>
                    <input
                      type="text"
                      value={newSub.packageName}
                      onChange={(e) => setNewSub({ ...newSub, packageName: e.target.value })}
                      placeholder="e.g. Internet subscription 10Mbps"
                      className="bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-400 transition-colors"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-400 uppercase">Monthly Price (Ksh)</label>
                    <input
                      type="number"
                      required
                      value={newSub.packagePrice}
                      onChange={(e) => setNewSub({ ...newSub, packagePrice: e.target.value })}
                      placeholder="e.g. 3500"
                      className="bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-400 transition-colors"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase">Notes</label>
                <textarea
                  value={newSub.notes}
                  onChange={(e) => setNewSub({ ...newSub, notes: e.target.value })}
                  placeholder="Additional contract or address details..."
                  rows={2}
                  className="bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-400 transition-colors resize-none"
                />
              </div>

              <div className="flex gap-4 pt-4 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setShowAddSubscriberModal(false)}
                  className="w-1/2 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl text-sm font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="w-1/2 py-3 bg-white text-black hover:bg-gray-200 font-bold rounded-xl text-sm transition-all"
                >
                  {actionLoading ? "Registering..." : "Save Subscriber"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}


