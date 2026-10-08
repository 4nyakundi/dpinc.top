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
  Plus, 
  Trash2, 
  Printer, 
  RefreshCw, 
  LogOut, 
  Search, 
  ShieldCheck, 
  DollarSign,
  Edit3,
  Layers,
  Database,
  Save,
  X,
  ExternalLink,
  MessageSquare,
  Tag,
  Check,
  AlertCircle
} from "lucide-react";
import Logo from "@/components/Logo";

interface Service {
  id: string;
  code?: string;
  name: string;
  category: string;
  description?: string;
  unit?: string;
  price: number;
  active: boolean;
}

interface InvoiceItem {
  id?: string;
  serviceId?: string;
  title: string;
  qty: string;
  rate: number;
  total: number;
}

interface Lead {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  status: string;
  notes?: string;
  location?: string;
  package?: string;
  speed?: string;
  monthlyRate?: number;
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
  docType?: string;
  clientType?: string;
  clientName: string;
  phone?: string;
  email?: string;
  location?: string;
  subId?: string;
  status: string;
  issueDate?: string;
  dueDate?: string;
  billingPeriod?: string;
  subtotal: number;
  tax?: number;
  labourFee?: number;
  total: number;
  totalPaid?: number;
  balanceDue?: number;
  hasPaymentPlan?: boolean;
  depositAmount?: number;
  depositLabel?: string;
  notes?: string;
  validityNote?: string;
  issuedAt?: string;
  dueAt?: string;
  items?: InvoiceItem[];
  quote?: {
    id: string;
    status: string;
    total: number;
    issueDate: string;
  };
}

interface DatabaseInfo {
  database: string;
  status: string;
  dbFileSize: string;
  counts: {
    services: number;
    invoices: number;
    invoiceItems: number;
    subscribers: number;
    jobCards: number;
    ledgerEntries: number;
  };
}

export default function AdminDashboard() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [activeTab, setActiveTab] = useState<"invoices" | "services" | "quotes" | "proformas" | "subscribers">("invoices");
  
  // Data states
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [subscribers, setSubscribers] = useState<Lead[]>([]);
  const [dbInfo, setDbInfo] = useState<DatabaseInfo | null>(null);
  
  // Loading & UI states
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [invoiceFilter, setInvoiceFilter] = useState<"all" | "paid" | "unpaid" | "partial">("all");
  const [serviceCategoryFilter, setServiceCategoryFilter] = useState<string>("all");
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  // Modals state
  const [showAddSubscriberModal, setShowAddSubscriberModal] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [serviceFormData, setServiceFormData] = useState({
    code: "",
    name: "",
    category: "Essentials Packages",
    description: "",
    unit: "One-Off Investment",
    price: "",
    active: true,
  });

  // Invoice Edit & Items Modal state
  const [showEditInvoiceModal, setShowEditInvoiceModal] = useState(false);
  const [showCreateInvoiceModal, setShowCreateInvoiceModal] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [invoiceFormData, setInvoiceFormData] = useState({
    id: "",
    invoiceNo: "",
    docType: "Invoice",
    clientName: "",
    phone: "",
    email: "",
    location: "Mombasa",
    status: "unpaid",
    issueDate: "",
    dueDate: "",
    billingPeriod: "",
    notes: "",
    validityNote: "Please Note: Valid for 14 days from date.",
    hasPaymentPlan: false,
    depositAmount: 0,
    depositLabel: "1 ST Installment",
    tax: 0,
    labourFee: 0,
  });
  const [invoiceItemsList, setInvoiceItemsList] = useState<InvoiceItem[]>([]);

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
    const adminToken = localStorage.getItem("adminToken") || "master-admin-session";
    setToken(adminToken);
    loadAllData(adminToken);
  }, []);

  const loadAllData = async (authToken: string) => {
    setLoading(true);
    try {
      await Promise.all([
        fetchInvoices(authToken),
        fetchServices(),
        fetchQuotes(authToken),
        fetchSubscribers(authToken),
        fetchDatabaseInfo()
      ]);
    } catch (err) {
      console.error("Error loading data", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDatabaseInfo = async () => {
    try {
      const res = await fetch("/api/database");
      if (res.ok) {
        const data = await res.json();
        setDbInfo(data);
      }
    } catch (err) {
      console.warn("DB Info fetch err:", err);
    }
  };

  const fetchServices = async () => {
    try {
      const res = await fetch("/api/services");
      if (res.ok) {
        const data = await res.json();
        setServices(data.services || []);
      }
    } catch (err) {
      console.error("Failed to fetch services:", err);
    }
  };

  const fetchInvoices = async (authToken: string) => {
    try {
      const res = await fetch("/api/invoices", {
        headers: { 
          Authorization: `Bearer ${authToken}`,
          "x-admin-key": "dpinc-staff-master"
        }
      });
      if (res.ok) {
        const data = await res.json();
        setInvoices(data.invoices || []);
      }
    } catch (err) {
      console.error("Failed to fetch invoices:", err);
    }
  };

  const fetchQuotes = async (authToken: string) => {
    try {
      const res = await fetch("/api/quotes", {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setQuotes(data.quotes || []);
      }
    } catch (err) {
      console.error("Failed to fetch quotes:", err);
    }
  };

  const fetchSubscribers = async (authToken: string) => {
    try {
      const res = await fetch("/api/subscribers", {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSubscribers(data.subscribers || []);
      }
    } catch (err) {
      console.error("Failed to fetch subscribers:", err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    router.push("/admin/login");
  };

  // ---------------------------------------------------------------------------
  // SERVICES CRUD
  // ---------------------------------------------------------------------------
  const handleOpenAddService = () => {
    setEditingService(null);
    setServiceFormData({
      code: `SRV-${Date.now().toString().slice(-4)}`,
      name: "",
      category: "Essentials Packages",
      description: "",
      unit: "One-Off Investment",
      price: "",
      active: true,
    });
    setShowServiceModal(true);
  };

  const handleOpenEditService = (service: Service) => {
    setEditingService(service);
    setServiceFormData({
      code: service.code || "",
      name: service.name,
      category: service.category || "General",
      description: service.description || "",
      unit: service.unit || "Per Project",
      price: String(service.price),
      active: service.active,
    });
    setShowServiceModal(true);
  };

  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceFormData.name || !serviceFormData.price) {
      alert("Please provide service name and price.");
      return;
    }

    setActionLoading(true);
    try {
      const payload = {
        code: serviceFormData.code,
        name: serviceFormData.name,
        category: serviceFormData.category,
        description: serviceFormData.description,
        unit: serviceFormData.unit,
        price: parseFloat(serviceFormData.price) || 0,
        active: serviceFormData.active,
      };

      let res;
      if (editingService) {
        // Update existing service
        res = await fetch(`/api/services/${editingService.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        // Create new service
        res = await fetch("/api/services", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      if (res.ok) {
        setShowServiceModal(false);
        await Promise.all([fetchServices(), fetchDatabaseInfo()]);
        setSyncStatus(`Service "${serviceFormData.name}" saved to SQL database successfully!`);
      } else {
        const err = await res.json();
        alert(err.error || "Failed to save service");
      }
    } catch (err) {
      console.error(err);
      alert("Error saving service");
    } finally {
      setActionLoading(false);
      setTimeout(() => setSyncStatus(null), 4000);
    }
  };

  const handleDeleteService = async (service: Service) => {
    if (!confirm(`Are you sure you want to permanently delete service "${service.name}" from the database?`)) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/services/${service.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        await Promise.all([fetchServices(), fetchDatabaseInfo()]);
        setSyncStatus(`Service "${service.name}" deleted from database.`);
      } else {
        alert("Failed to delete service.");
      }
    } catch (err) {
      console.error(err);
      alert("Error deleting service");
    } finally {
      setActionLoading(false);
      setTimeout(() => setSyncStatus(null), 4000);
    }
  };

  // ---------------------------------------------------------------------------
  // INVOICE & ITEM CRUD
  // ---------------------------------------------------------------------------
  const handleOpenEditInvoice = (inv: Invoice) => {
    setEditingInvoice(inv);
    setInvoiceFormData({
      id: inv.id,
      invoiceNo: inv.invoiceNo,
      docType: inv.docType || "Invoice",
      clientName: inv.clientName || "",
      phone: inv.phone || "",
      email: inv.email || "",
      location: inv.location || "Mombasa",
      status: inv.status || "unpaid",
      issueDate: inv.issueDate ? new Date(inv.issueDate).toISOString().split("T")[0] : (inv.issuedAt ? new Date(inv.issuedAt).toISOString().split("T")[0] : ""),
      dueDate: inv.dueDate ? new Date(inv.dueDate).toISOString().split("T")[0] : (inv.dueAt ? new Date(inv.dueAt).toISOString().split("T")[0] : ""),
      billingPeriod: inv.billingPeriod || "",
      notes: inv.notes || "",
      validityNote: inv.validityNote || "Please Note: Valid for 14 days from date.",
      hasPaymentPlan: Boolean(inv.hasPaymentPlan),
      depositAmount: inv.depositAmount || 0,
      depositLabel: inv.depositLabel || "1 ST Installment",
      tax: inv.tax || 0,
      labourFee: inv.labourFee || 0,
    });

    // Populate line items
    if (inv.items && inv.items.length > 0) {
      setInvoiceItemsList(JSON.parse(JSON.stringify(inv.items)));
    } else {
      setInvoiceItemsList([
        {
          title: "Technical Deliverable / ICT Service",
          qty: "1",
          rate: inv.total || 0,
          total: inv.total || 0,
        }
      ]);
    }
    setShowEditInvoiceModal(true);
  };

  const handleOpenCreateInvoice = () => {
    const year = new Date().getFullYear().toString().slice(-2);
    const rand = Math.floor(Math.random() * 899 + 100);
    const today = new Date().toISOString().split("T")[0];
    const due = new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0];

    setEditingInvoice(null);
    setInvoiceFormData({
      id: "",
      invoiceNo: `#${rand}/${year}`,
      docType: "Invoice",
      clientName: "",
      phone: "",
      email: "",
      location: "Mombasa",
      status: "unpaid",
      issueDate: today,
      dueDate: due,
      billingPeriod: `${new Date().toLocaleString('default', { month: 'long' })} 2026`,
      notes: "Thank you for partnering with Data Port Limited.",
      validityNote: "Please Note: Valid for 14 days from date.",
      hasPaymentPlan: false,
      depositAmount: 0,
      depositLabel: "1 ST Installment",
      tax: 0,
      labourFee: 0,
    });
    setInvoiceItemsList([
      {
        title: "Optical Fiber Drop Cable Splicing & NOC Installation",
        qty: "1 Setup",
        rate: 3500,
        total: 3500,
      }
    ]);
    setShowEditInvoiceModal(true);
  };

  const handleAddLineItemRow = () => {
    setInvoiceItemsList(prev => [
      ...prev,
      {
        title: "New Custom Service Item",
        qty: "1",
        rate: 2500,
        total: 2500,
      }
    ]);
  };

  const handleAddFromCatalog = (serviceId: string) => {
    const s = services.find(item => item.id === serviceId);
    if (!s) return;
    setInvoiceItemsList(prev => [
      ...prev,
      {
        serviceId: s.id,
        title: s.name,
        qty: s.unit || "1",
        rate: s.price,
        total: s.price,
      }
    ]);
  };

  const handleUpdateItemField = (index: number, field: keyof InvoiceItem, value: any) => {
    setInvoiceItemsList(prev => {
      const copy = [...prev];
      const item = { ...copy[index] };
      (item as any)[field] = value;

      if (field === "rate" || field === "qty") {
        const rate = field === "rate" ? (parseFloat(value) || 0) : item.rate;
        const numQty = parseFloat(item.qty) || 1;
        item.total = rate * numQty;
      }
      copy[index] = item;
      return copy;
    });
  };

  const handleDeleteItemRow = (index: number) => {
    setInvoiceItemsList(prev => prev.filter((_, i) => i !== index));
  };

  const calculateModalTotals = () => {
    const subtotal = invoiceItemsList.reduce((acc, it) => acc + (Number(it.total) || 0), 0);
    const tax = Number(invoiceFormData.tax) || 0;
    const labour = Number(invoiceFormData.labourFee) || 0;
    const grandTotal = subtotal + tax + labour;
    const deposit = invoiceFormData.hasPaymentPlan ? (Number(invoiceFormData.depositAmount) || 0) : 0;
    const paid = invoiceFormData.status === "paid" ? grandTotal : deposit;
    const balanceDue = Math.max(0, grandTotal - paid);

    return { subtotal, grandTotal, paid, balanceDue };
  };

  const handleSaveInvoiceWithItems = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoiceFormData.clientName.trim()) {
      alert("Client name is required.");
      return;
    }
    if (invoiceItemsList.length === 0) {
      alert("At least one line item is required.");
      return;
    }

    setActionLoading(true);
    try {
      const { subtotal, grandTotal } = calculateModalTotals();
      const payload = {
        ...invoiceFormData,
        subtotal,
        total: grandTotal,
        items: invoiceItemsList,
      };

      let res;
      if (invoiceFormData.id) {
        // PATCH existing invoice and line items
        res = await fetch(`/api/invoices/${invoiceFormData.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            "x-admin-key": "dpinc-staff-master"
          },
          body: JSON.stringify(payload),
        });
      } else {
        // POST new invoice and line items
        res = await fetch(`/api/invoices`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            "x-admin-key": "dpinc-staff-master"
          },
          body: JSON.stringify(payload),
        });
      }

      if (res.ok) {
        setShowEditInvoiceModal(false);
        await Promise.all([fetchInvoices(token), fetchDatabaseInfo()]);
        setSyncStatus(`Invoice ${invoiceFormData.invoiceNo} saved with ${invoiceItemsList.length} line items!`);
      } else {
        const err = await res.json();
        alert(err.error || "Failed to save invoice");
      }
    } catch (err) {
      console.error(err);
      alert("Error saving invoice");
    } finally {
      setActionLoading(false);
      setTimeout(() => setSyncStatus(null), 4000);
    }
  };

  const updateInvoiceStatus = async (invoiceId: string, status: string) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/invoices/${invoiceId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "x-admin-key": "dpinc-staff-master"
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        await Promise.all([fetchInvoices(token), fetchDatabaseInfo()]);
      } else {
        alert("Failed to update invoice status");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const deleteInvoice = async (invoiceId: string, invoiceNo: string) => {
    if (!confirm(`Are you sure you want to permanently delete invoice ${invoiceNo} and all its itemized records?`)) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/invoices/${invoiceId}`, {
        method: "DELETE",
        headers: { 
          Authorization: `Bearer ${token}`,
          "x-admin-key": "dpinc-staff-master"
        }
      });
      if (res.ok) {
        await Promise.all([fetchInvoices(token), fetchDatabaseInfo()]);
        setSyncStatus(`Invoice ${invoiceNo} deleted from SQL database.`);
      } else {
        alert("Failed to delete invoice");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
      setTimeout(() => setSyncStatus(null), 4000);
    }
  };

  // Metrics calculators
  const metrics = useMemo(() => {
    const totalQuotesCount = quotes.filter(q => ["draft", "sent", "rejected"].includes(q.status)).length;
    const totalProformasCount = quotes.filter(q => ["accepted", "proforma"].includes(q.status)).length;
    
    const unpaidInvoices = invoices.filter(i => i.status === "unpaid");
    const paidInvoices = invoices.filter(i => i.status === "paid");
    const partialInvoices = invoices.filter(i => i.status === "partial");
    
    const totalPaidAmount = paidInvoices.reduce((sum, inv) => sum + (inv.total || 0), 0) + 
      partialInvoices.reduce((sum, inv) => sum + (inv.totalPaid || 0), 0);
    const totalPendingAmount = unpaidInvoices.reduce((sum, inv) => sum + (inv.total || 0), 0) +
      partialInvoices.reduce((sum, inv) => sum + (inv.balanceDue || 0), 0);
    
    return {
      quotesCount: totalQuotesCount,
      proformasCount: totalProformasCount,
      pendingCount: unpaidInvoices.length + partialInvoices.length,
      paidCount: paidInvoices.length,
      paidAmount: totalPaidAmount,
      pendingAmount: totalPendingAmount,
      servicesCount: services.length,
      subscribersCount: subscribers.length
    };
  }, [quotes, invoices, services, subscribers]);

  // Filtered lists
  const filteredInvoices = useMemo(() => {
    return invoices.filter(i => {
      const matchSearch = 
        (i.invoiceNo || "").toLowerCase().includes(searchQuery.toLowerCase()) || 
        (i.clientName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (i.phone || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (i.email || "").toLowerCase().includes(searchQuery.toLowerCase());
      
      if (invoiceFilter === "all") return matchSearch;
      return matchSearch && i.status === invoiceFilter;
    });
  }, [invoices, searchQuery, invoiceFilter]);

  const filteredServices = useMemo(() => {
    return services.filter(s => {
      const matchCat = serviceCategoryFilter === "all" || s.category === serviceCategoryFilter;
      const matchSearch = 
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.code || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.description || "").toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [services, searchQuery, serviceCategoryFilter]);

  const serviceCategories = useMemo(() => {
    const set = new Set<string>();
    services.forEach(s => { if (s.category) set.add(s.category); });
    return Array.from(set);
  }, [services]);

  const formatPrice = (value: number) => {
    return `KSh ${Number(value || 0).toLocaleString("en-KE", { minimumFractionDigits: 2 })}`;
  };

  const printInvoiceDocument = (inv: Partial<Invoice> & { items?: any[] }) => {
    const isProforma = (inv.docType || "").toLowerCase().includes("proforma");
    const title = inv.docType || (isProforma ? "Proforma Invoice" : "Invoice");
    const issueDateStr = inv.issueDate ? new Date(inv.issueDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : (inv.issuedAt ? new Date(inv.issuedAt).toLocaleDateString("en-GB") : new Date().toLocaleDateString("en-GB"));
    const dueDateStr = inv.dueDate ? new Date(inv.dueDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : (inv.dueAt ? new Date(inv.dueAt).toLocaleDateString("en-GB") : "On Receipt");

    const items = inv.items && inv.items.length > 0 ? inv.items : [
      { title: "Technical Deliverable / ICT Infrastructure", qty: "1", rate: inv.total || 0, total: inv.total || 0 }
    ];

    const itemsHtml = items.map((item, idx) => `
      <tr style="border-bottom: 1px solid #E2E8F0;">
        <td style="padding: 10px 8px; text-align: left; font-size: 0.925rem; color: #0F172A; vertical-align: middle;">
          <strong>${idx + 1}.</strong> ${item.title}
        </td>
        <td style="padding: 10px 8px; text-align: center; font-size: 0.9rem; color: #334155; vertical-align: middle;">
          ${item.qty || "1"}
        </td>
        <td style="padding: 10px 8px; text-align: right; font-size: 0.925rem; font-family: monospace; color: #0F172A; vertical-align: middle;">
          KSh ${Number(item.rate || 0).toLocaleString("en-KE", { minimumFractionDigits: 2 })}
        </td>
        <td style="padding: 10px 8px; text-align: right; font-size: 0.925rem; font-family: monospace; font-weight: 700; color: #0F172A; vertical-align: middle;">
          KSh ${Number(item.total || 0).toLocaleString("en-KE", { minimumFractionDigits: 2 })}
        </td>
      </tr>
    `).join("");

    const grandTotal = Number(inv.total) || 0;
    const totalPaid = Number(inv.totalPaid) || 0;
    const balanceDue = Number(inv.balanceDue !== undefined ? inv.balanceDue : (grandTotal - totalPaid)) || 0;

    let paymentPlanHtml = "";
    if (inv.hasPaymentPlan || totalPaid > 0) {
      paymentPlanHtml = `
        <div style="margin: 20px 0; border: 1px solid #CBD5E1; border-radius: 8px; padding: 12px; background: #F8FAFC;">
          <div style="font-weight: 800; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.05em; color: #0F172A; margin-bottom: 8px; border-bottom: 1px solid #CBD5E1; padding-bottom: 4px;">
            Payment Schedule / Installment Breakdown
          </div>
          <table style="width: 100%; border-collapse: collapse; font-size: 0.875rem;">
            <tr>
              <td style="padding: 4px 0; color: #334155; font-weight: 600;">${inv.depositLabel || "Deposit / Installment Paid"}:</td>
              <td style="padding: 4px 0; text-align: right; font-weight: 700; font-family: monospace; color: #16A34A;">KSh ${totalPaid.toLocaleString("en-KE", { minimumFractionDigits: 2 })}</td>
            </tr>
            <tr style="border-top: 1px solid #E2E8F0;">
              <td style="padding: 6px 0 0 0; color: #0F172A; font-weight: 800; text-transform: uppercase;">Outstanding Balance Due:</td>
              <td style="padding: 6px 0 0 0; text-align: right; font-weight: 900; font-family: monospace; color: ${balanceDue > 0 ? '#DC2626' : '#16A34A'};">KSh ${balanceDue.toLocaleString("en-KE", { minimumFractionDigits: 2 })}</td>
            </tr>
          </table>
        </div>
      `;
    }

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${title} - ${inv.invoiceNo}</title>
        <style>
          @page { size: A4; margin: 15mm 15mm 15mm 15mm; }
          * { box-sizing: border-box; }
          body {
            font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif;
            margin: 0;
            padding: 24px;
            color: #0F172A;
            background: #FFFFFF;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .invoice-sheet {
            max-width: 800px;
            margin: 0 auto;
            border: 1px solid #E2E8F0;
            padding: 36px 40px;
            background: #FFFFFF;
          }
          @media print {
            body { padding: 0; background: #FFF; }
            .invoice-sheet { border: none; padding: 0; max-width: 100%; }
            .no-print { display: none !important; }
          }
          .header-row { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; border-bottom: 2px solid #0F172A; padding-bottom: 16px; }
          .brand-col h1 { margin: 0; font-size: 24px; font-weight: 900; letter-spacing: -0.5px; color: #0F172A; }
          .brand-col h1 span { color: #5C9400; }
          .brand-sub { font-size: 11px; color: #475569; margin-top: 4px; line-height: 1.4; }
          .meta-col { text-align: right; }
          .meta-col .doc-title { font-size: 22px; font-weight: 900; text-transform: uppercase; color: #0F172A; letter-spacing: 0.5px; margin: 0 0 4px 0; }
          .meta-col .inv-no { font-size: 15px; font-weight: 800; font-family: monospace; color: #5C9400; }
          .meta-col .inv-date { font-size: 12px; color: #475569; margin-top: 2px; }
          .billed-row { display: flex; justify-content: space-between; margin-bottom: 24px; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 16px 20px; }
          .client-col h3 { font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; color: #64748B; margin: 0 0 6px 0; }
          .client-name { font-size: 16px; font-weight: 800; color: #0F172A; }
          .client-detail { font-size: 12px; color: #334155; margin-top: 2px; }
          .dates-col { text-align: right; font-size: 12px; color: #334155; }
          .dates-col div { margin-bottom: 3px; }
          .items-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          .items-table th { background: #0F172A; color: #FFFFFF; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; padding: 10px 8px; }
          .totals-wrap { display: flex; justify-content: flex-end; margin-bottom: 24px; }
          .totals-table { width: 320px; border-collapse: collapse; font-size: 13px; }
          .totals-table td { padding: 6px 8px; }
          .grand-total-row { border-top: 2px solid #0F172A; border-bottom: 2px solid #0F172A; font-weight: 900; font-size: 15px; }
          .footer-section { display: flex; justify-content: space-between; align-items: flex-end; border-top: 1px solid #CBD5E1; padding-top: 20px; margin-top: 20px; }
          .payment-info { flex: 1; max-width: 55%; font-size: 12px; }
          .payment-title { font-size: 11px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.06em; color: #0F172A; margin-bottom: 8px; }
          .channel-box { margin-bottom: 8px; line-height: 1.4; color: #1E293B; }
          .channel-box strong { color: #0F172A; }
          .sign-box { text-align: right; min-width: 200px; }
          .sign-line { border-top: 1px solid #0F172A; width: 160px; margin: 4px auto 3px auto; }
          .validity-note { font-size: 11px; color: #64748B; font-style: italic; margin-top: 16px; text-align: center; }
          .print-btn-bar { text-align: center; margin-bottom: 20px; }
          .print-btn { background: #5C9400; color: #FFF; border: none; padding: 10px 24px; border-radius: 8px; font-size: 14px; font-weight: 700; cursor: pointer; box-shadow: 0 4px 12px rgba(92,148,0,0.3); }
        </style>
      </head>
      <body>
        <div class="print-btn-bar no-print">
          <button class="print-btn" onclick="window.print()">🖨️ Print / Save as PDF</button>
        </div>

        <div class="invoice-sheet">
          <div class="header-row">
            <div class="brand-col">
              <h1>DATA PORT<span>.</span>INC</h1>
              <div class="brand-sub">
                DATA PORT LIMITED • ICT Infrastructure & Digital Media<br>
                Along Jomo Kenyatta Avenue, Mombasa, Kenya<br>
                Tel: +254 790 964 002 / 0795 917 066 • Email: tech@dpinc.co.ke
              </div>
            </div>
            <div class="meta-col">
              <div class="doc-title">${title}</div>
              <div class="inv-no">${inv.invoiceNo || "N/A"}</div>
              <div class="inv-date">Issued: ${issueDateStr}</div>
              <div class="inv-date" style="color: #DC2626; font-weight: 600;">Due: ${dueDateStr}</div>
            </div>
          </div>

          <div class="billed-row">
            <div class="client-col">
              <h3>BILLED TO</h3>
              <div class="client-name">${inv.clientName || "Valued Client"}</div>
              ${inv.phone ? `<div class="client-detail">Phone / M-Pesa: <strong>${inv.phone}</strong></div>` : ''}
              ${inv.email ? `<div class="client-detail">Email: <strong>${inv.email}</strong></div>` : ''}
              ${inv.location ? `<div class="client-detail">Location: <strong>${inv.location}</strong></div>` : ''}
            </div>
            <div class="dates-col">
              <div><strong>Billing Cycle:</strong> ${inv.billingPeriod || "Standard"}</div>
              <div><strong>Payment Status:</strong> <span style="text-transform: uppercase; font-weight: 800; color: ${inv.status === 'paid' ? '#16A34A' : (inv.status === 'partial' ? '#2563EB' : '#DC2626')};">${inv.status || "unpaid"}</span></div>
              <div><strong>Document Ref:</strong> #${(inv.id || "GEN").slice(-6).toUpperCase()}</div>
            </div>
          </div>

          <table class="items-table">
            <thead>
              <tr>
                <th style="text-align: left;">Scope / Service Deliverable</th>
                <th style="text-align: center; width: 90px;">Qty / Term</th>
                <th style="text-align: right; width: 140px;">Rate (KSh)</th>
                <th style="text-align: right; width: 140px;">Amount (KSh)</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <div class="totals-wrap">
            <table class="totals-table">
              <tr>
                <td style="color: #64748B;">Subtotal:</td>
                <td style="text-align: right; font-family: monospace; font-weight: 600;">KSh ${Number(inv.subtotal || grandTotal).toLocaleString("en-KE", { minimumFractionDigits: 2 })}</td>
              </tr>
              ${inv.tax && inv.tax > 0 ? `
              <tr>
                <td style="color: #64748B;">VAT (16%):</td>
                <td style="text-align: right; font-family: monospace; font-weight: 600;">KSh ${Number(inv.tax).toLocaleString("en-KE", { minimumFractionDigits: 2 })}</td>
              </tr>` : ''}
              ${inv.labourFee && inv.labourFee > 0 ? `
              <tr>
                <td style="color: #64748B;">Installation / Labour:</td>
                <td style="text-align: right; font-family: monospace; font-weight: 600;">KSh ${Number(inv.labourFee).toLocaleString("en-KE", { minimumFractionDigits: 2 })}</td>
              </tr>` : ''}
              <tr class="grand-total-row">
                <td style="color: #0F172A;">GRAND TOTAL:</td>
                <td style="text-align: right; font-family: monospace; color: #5C9400;">KSh ${grandTotal.toLocaleString("en-KE", { minimumFractionDigits: 2 })}</td>
              </tr>
              ${totalPaid > 0 ? `
              <tr>
                <td style="color: #16A34A; font-weight: 700;">Total Paid:</td>
                <td style="text-align: right; font-family: monospace; font-weight: 700; color: #16A34A;">KSh ${totalPaid.toLocaleString("en-KE", { minimumFractionDigits: 2 })}</td>
              </tr>
              <tr style="border-top: 1px solid #E2E8F0; font-weight: 800;">
                <td style="color: ${balanceDue > 0 ? '#DC2626' : '#16A34A'};">BALANCE DUE:</td>
                <td style="text-align: right; font-family: monospace; color: ${balanceDue > 0 ? '#DC2626' : '#16A34A'};">KSh ${balanceDue.toLocaleString("en-KE", { minimumFractionDigits: 2 })}</td>
              </tr>` : ''}
            </table>
          </div>

          ${paymentPlanHtml}

          <div class="footer-section">
            <div class="payment-info">
              <div class="payment-title">OFFICIAL PAYMENT CHANNELS</div>
              <div class="channel-box">
                <strong>MPESA (Mobile Pay):</strong><br>
                Account Name: <strong>Emmanuel Nyakundi</strong><br>
                Phone / Paybill: <strong>0790 964 002</strong>
              </div>
              <div class="channel-box">
                <strong>Standard Chartered Bank Kenya:</strong><br>
                Account Name: <strong>Emmanuel Nyakundi</strong><br>
                Account Number: <strong>0100499055400</strong>
              </div>
            </div>

            <div class="sign-box">
              <div style="font-size: 11px; color: #64748B; margin-bottom: 8px;">Authorized Representative:</div>
              <svg width="120" height="38" viewBox="0 0 120 38" fill="none" style="display:block; margin:0 auto -4px auto;">
                <path d="M12 26 C24 8, 30 5, 38 18 C45 30, 48 10, 56 22 C62 31, 75 14, 88 24 C95 28, 105 18, 112 20" stroke="#1d4ed8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M22 14 C35 30, 50 33, 78 26" stroke="#1d4ed8" stroke-width="1.6" stroke-linecap="round"/>
              </svg>
              <div class="sign-line"></div>
              <div style="font-size: 13px; font-weight: 800; color: #0F172A;">Nyakundi, E.</div>
              <div style="font-size: 11px; color: #475569; font-weight: 600;">Dev Op's Engineer & Lead Tech</div>
            </div>
          </div>

          <div class="validity-note">
            ${inv.validityNote || "Please Note: Valid for 14 days from date. Thank you for choosing Data Port Limited."}
          </div>
        </div>
      </body>
      </html>
    `;

    const printWin = window.open("", "_blank", "width=850,height=950");
    if (printWin) {
      printWin.document.open();
      printWin.document.write(html);
      printWin.document.close();
      printWin.focus();
      setTimeout(() => {
        printWin.print();
      }, 350);
    }
  };

  const handlePrint = (type: "quote" | "invoice", id: string) => {
    if (type === "invoice") {
      const inv = invoices.find(i => i.id === id);
      if (inv) {
        printInvoiceDocument(inv);
        return;
      }
    } else {
      const q = quotes.find(item => item.id === id);
      if (q) {
        printInvoiceDocument({
          id: q.id,
          invoiceNo: q.invoiceNo,
          docType: q.status === "proforma" || q.status === "accepted" ? "Proforma Invoice" : "Commercial Proposal",
          clientName: q.lead?.name || "Client",
          phone: q.lead?.phone,
          email: q.lead?.email,
          location: q.lead?.location || "Mombasa",
          status: q.status,
          issueDate: q.issueDate,
          dueDate: q.dueDate,
          subtotal: q.subtotal,
          tax: q.tax,
          labourFee: q.labourFee,
          total: q.total,
          notes: q.notes,
          items: (q.lineItems || []).map((li: any) => ({
            title: li.name,
            qty: String(li.quantity || 1),
            rate: li.unitPrice,
            total: li.total
          }))
        });
        return;
      }
    }
    window.open(`/quote?print=true&type=${type}&id=${id}`, "_blank");
  };

  const handleWhatsAppInvoice = (inv: Invoice) => {
    const cleanPhone = (inv.phone || "").replace(/[^0-9]/g, "");
    const formattedPhone = cleanPhone.startsWith("0") ? "254" + cleanPhone.substring(1) : cleanPhone;
    
    let itemsText = "";
    if (inv.items && inv.items.length > 0) {
      inv.items.forEach(i => {
        itemsText += `  • ${i.title} (${i.qty}): KSh ${Number(i.rate).toLocaleString()}\n`;
      });
    }

    const grandTotal = Number(inv.total) || 0;
    const totalPaid = Number(inv.totalPaid) || 0;
    const balanceDue = Number(inv.balanceDue !== undefined ? inv.balanceDue : (grandTotal - totalPaid)) || 0;

    let balanceText = "";
    if (totalPaid > 0) {
      balanceText = `*DEPOSIT PAID:* KSh ${totalPaid.toLocaleString()}\n*BALANCE DUE:* *KSh ${balanceDue.toLocaleString()}*\n\n`;
    }

    const msg = `*DATA PORT LIMITED — OFFICIAL INVOICE NOTICE*\n\n` +
      `Dear *${inv.clientName}*,\n\n` +
      `Your *${inv.docType || 'Invoice'}* is ready.\n\n` +
      `*Invoice Ref:* ${inv.invoiceNo}\n` +
      `*Due Date:* ${inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : 'Immediate'}\n\n` +
      `*Service Breakdown:*\n${itemsText}\n` +
      `*TOTAL AMOUNT:* *KSh ${grandTotal.toLocaleString()}*\n` +
      balanceText +
      `*Direct Payment Channels:*\n` +
      `👉 *MPESA (Mobile):* 0790 964 002 (Emmanuel Nyakundi)\n` +
      `👉 *Standard Chartered Bank:* Acc No: 0100499055400\n\n` +
      `Thank you for choosing Data Port Limited!`;

    window.open(`https://wa.me/${formattedPhone}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  const modalTotals = calculateModalTotals();

  return (
    <div className="min-h-screen bg-black text-white selection:bg-cyan-500 selection:text-black font-sans">
      {/* Navbar */}
      <header className="sticky top-0 z-40 bg-black/85 backdrop-blur-md border-b border-white/10 py-4 px-6 md:px-8 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Logo />
          <div className="h-6 w-[1px] bg-white/20"></div>
          <div className="flex items-center gap-2 text-cyan-400 text-sm font-semibold tracking-widest uppercase">
            <ShieldCheck className="w-4 h-4" /> SQL Operations & Financial ERP
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <a 
            href="/dpinc_database.sql" 
            download="dpinc_database.sql"
            className="hidden sm:flex items-center gap-2 bg-white/5 hover:bg-white/10 text-cyan-300 border border-cyan-500/30 px-3.5 py-1.5 rounded-xl transition-all text-xs font-semibold"
            title="Download SQL Database Script"
          >
            <Database className="w-3.5 h-3.5" /> Export .SQL
          </a>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 border border-white/10 hover:border-red-500/30 px-3.5 py-1.5 rounded-xl transition-all text-xs font-medium"
          >
            <LogOut className="w-3.5 h-3.5" /> Logout
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        
        {/* Sync / Billing trigger alerts */}
        {syncStatus && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-cyan-500/15 border border-cyan-500/40 rounded-2xl text-cyan-300 text-sm flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-cyan-400" />
              <span>{syncStatus}</span>
            </div>
            <button onClick={() => setSyncStatus(null)} className="text-xs hover:underline text-cyan-400">Dismiss</button>
          </motion.div>
        )}

        {/* SQL Database Health Status Badge Bar */}
        {dbInfo && (
          <div className="mb-8 p-3.5 bg-gradient-to-r from-emerald-500/10 via-cyan-500/10 to-purple-500/10 border border-cyan-500/20 rounded-2xl flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></div>
              <span className="font-mono text-emerald-400 font-bold uppercase tracking-wider">SQL Database Engine: Connected</span>
              <span className="text-gray-400">|</span>
              <span className="text-gray-300">Provider: <strong className="text-white">{dbInfo.database}</strong></span>
              <span className="text-gray-400">|</span>
              <span className="text-gray-300">File Size: <strong className="text-white">{dbInfo.dbFileSize}</strong></span>
            </div>
            <div className="flex items-center gap-4 text-gray-300">
              <span>Services: <strong className="text-cyan-400">{dbInfo.counts.services}</strong></span>
              <span>Invoices: <strong className="text-green-400">{dbInfo.counts.invoices}</strong></span>
              <span>Line Items: <strong className="text-purple-400">{dbInfo.counts.invoiceItems}</strong></span>
              <span>Subscribers: <strong className="text-yellow-400">{dbInfo.counts.subscribers}</strong></span>
            </div>
          </div>
        )}

        {/* Dashboard Title & Quick Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-2">
              Master Operations & Billing Hub
            </h1>
            <p className="text-gray-400 text-sm">
              Live SQL Database management for all commercial services, invoices, itemized proposals, and clients.
            </p>
          </div>
          
          <div className="flex items-center flex-wrap gap-3">
            <button 
              onClick={handleOpenCreateInvoice}
              className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-black font-bold px-4 py-2.5 rounded-xl hover:shadow-lg hover:shadow-green-500/20 transition-all text-xs"
            >
              <Plus className="w-4 h-4" /> Create New Invoice
            </button>
            <button 
              onClick={handleOpenAddService}
              className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-bold px-4 py-2.5 rounded-xl hover:shadow-lg hover:shadow-cyan-500/20 transition-all text-xs"
            >
              <Plus className="w-4 h-4" /> Add New Service
            </button>
            <button 
              onClick={() => loadAllData(token)}
              disabled={actionLoading}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/15 text-white font-semibold px-3 py-2.5 rounded-xl border border-white/10 transition-all text-xs disabled:opacity-50"
              title="Refresh Data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${actionLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Top metrics summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Card 1: Paid Invoices */}
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Paid Revenue</span>
              <div className="w-7 h-7 rounded-full bg-green-500/10 flex items-center justify-center text-green-400">
                <CheckCircle className="w-4 h-4" />
              </div>
            </div>
            <h3 className="text-2xl font-bold font-mono text-white mb-1">{formatPrice(metrics.paidAmount)}</h3>
            <p className="text-xs text-gray-400">{metrics.paidCount} Fully settled invoices</p>
          </div>

          {/* Card 2: Pending Revenue */}
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Pending Revenue</span>
              <div className="w-7 h-7 rounded-full bg-yellow-500/10 flex items-center justify-center text-yellow-400">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <h3 className="text-2xl font-bold font-mono text-yellow-400 mb-1">{formatPrice(metrics.pendingAmount)}</h3>
            <p className="text-xs text-gray-400">{metrics.pendingCount} Invoices awaiting settlement</p>
          </div>

          {/* Card 3: Commercial Services Offered */}
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Services Catalog</span>
              <div className="w-7 h-7 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-400">
                <Layers className="w-4 h-4" />
              </div>
            </div>
            <h3 className="text-2xl font-bold font-mono text-cyan-400 mb-1">{metrics.servicesCount} Active</h3>
            <p className="text-xs text-gray-400">Packages, Networks, CCTV, Web</p>
          </div>

          {/* Card 4: Subscribers */}
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Subscribers</span>
              <div className="w-7 h-7 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <h3 className="text-2xl font-bold font-mono text-purple-400 mb-1">{metrics.subscribersCount} Clients</h3>
            <p className="text-xs text-gray-400">Monthly recurring network clients</p>
          </div>
        </div>

        {/* Tab Selection & Search bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5 mb-8">
          <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 p-1 rounded-2xl overflow-x-auto shrink-0">
            <button
              onClick={() => { setActiveTab("invoices"); setSearchQuery(""); }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === "invoices" 
                  ? "bg-green-500 text-black shadow-lg shadow-green-500/20" 
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <Receipt className="w-3.5 h-3.5" />
              Invoices Hub ({invoices.length})
            </button>
            <button
              onClick={() => { setActiveTab("services"); setSearchQuery(""); }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === "services" 
                  ? "bg-cyan-500 text-black shadow-lg shadow-cyan-500/20" 
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <Tag className="w-3.5 h-3.5" />
              Services Offered ({services.length})
            </button>
            <button
              onClick={() => { setActiveTab("subscribers"); setSearchQuery(""); }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === "subscribers" 
                  ? "bg-purple-500 text-black shadow-lg shadow-purple-500/20" 
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              Subscribers ({metrics.subscribersCount})
            </button>
            <button
              onClick={() => { setActiveTab("proformas"); setSearchQuery(""); }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === "proformas" 
                  ? "bg-yellow-500 text-black shadow-lg shadow-yellow-500/20" 
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <ClipboardList className="w-3.5 h-3.5" />
              Proformas ({metrics.proformasCount})
            </button>
          </div>

          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search ${activeTab}...`}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-cyan-400 transition-colors"
            />
          </div>
        </div>

        {/* Tab content viewports */}
        {loading ? (
          <div className="py-20 text-center text-gray-400">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-cyan-400" />
            Loading SQL database records...
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
            >
              {/* =============================================================
                  TAB 1: INVOICES HUB (EDITABLE ITEMS & BILLING)
                  ============================================================= */}
              {activeTab === "invoices" && (
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400 uppercase tracking-widest font-bold">Filter Status:</span>
                      <div className="flex items-center bg-white/5 border border-white/10 rounded-lg p-0.5">
                        <button 
                          onClick={() => setInvoiceFilter("all")} 
                          className={`px-3 py-1 rounded-md text-xs transition-all ${invoiceFilter === "all" ? "bg-white/15 text-white font-bold" : "text-gray-400"}`}
                        >
                          All ({invoices.length})
                        </button>
                        <button 
                          onClick={() => setInvoiceFilter("unpaid")} 
                          className={`px-3 py-1 rounded-md text-xs transition-all ${invoiceFilter === "unpaid" ? "bg-yellow-500/20 text-yellow-400 font-bold" : "text-gray-400"}`}
                        >
                          Unpaid
                        </button>
                        <button 
                          onClick={() => setInvoiceFilter("paid")} 
                          className={`px-3 py-1 rounded-md text-xs transition-all ${invoiceFilter === "paid" ? "bg-green-500/20 text-green-400 font-bold" : "text-gray-400"}`}
                        >
                          Paid
                        </button>
                        <button 
                          onClick={() => setInvoiceFilter("partial")} 
                          className={`px-3 py-1 rounded-md text-xs transition-all ${invoiceFilter === "partial" ? "bg-blue-500/20 text-blue-400 font-bold" : "text-gray-400"}`}
                        >
                          Partial
                        </button>
                      </div>
                    </div>

                    <button
                      onClick={handleOpenCreateInvoice}
                      className="flex items-center gap-1.5 bg-white/10 hover:bg-white/15 text-white text-xs px-3 py-1.5 rounded-lg border border-white/15 transition-all font-semibold"
                    >
                      <Plus className="w-3.5 h-3.5 text-green-400" /> New Itemized Invoice
                    </button>
                  </div>

                  <div className="bg-white/[0.02] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse text-left">
                        <thead>
                          <tr className="border-b border-white/10 bg-white/5 text-gray-400 text-xs font-bold uppercase tracking-wider">
                            <th className="py-3.5 px-5">Invoice No</th>
                            <th className="py-3.5 px-5">Client / Organization</th>
                            <th className="py-3.5 px-5">Issue Date</th>
                            <th className="py-3.5 px-5">Itemized Items</th>
                            <th className="py-3.5 px-5">Total Billed</th>
                            <th className="py-3.5 px-5">Status</th>
                            <th className="py-3.5 px-5 text-center">Edit / Modify Items</th>
                            <th className="py-3.5 px-5 text-center">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-sm">
                          {filteredInvoices.length === 0 ? (
                            <tr>
                              <td colSpan={8} className="py-12 text-center text-gray-500">
                                No invoices matching current criteria.
                              </td>
                            </tr>
                          ) : (
                            filteredInvoices.map((inv) => {
                              const itemsCount = inv.items?.length || 1;
                              const displayDate = inv.issueDate 
                                ? new Date(inv.issueDate).toLocaleDateString() 
                                : (inv.issuedAt ? new Date(inv.issuedAt).toLocaleDateString() : "-");

                              return (
                                <tr key={inv.id} className="hover:bg-white/[0.04] transition-all">
                                  <td className="py-3.5 px-5 font-bold font-mono text-green-400">{inv.invoiceNo}</td>
                                  <td className="py-3.5 px-5">
                                    <div className="font-bold text-white">{inv.clientName}</div>
                                    <div className="text-xs text-gray-400">{inv.phone || inv.email || inv.location || "Mombasa"}</div>
                                  </td>
                                  <td className="py-3.5 px-5 text-gray-400 text-xs">{displayDate}</td>
                                  <td className="py-3.5 px-5">
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/5 border border-white/10 text-cyan-300">
                                      {itemsCount} {itemsCount === 1 ? "Line Item" : "Line Items"}
                                    </span>
                                  </td>
                                  <td className="py-3.5 px-5 font-bold font-mono text-white">
                                    {formatPrice(inv.total)}
                                    {inv.balanceDue && inv.balanceDue > 0 ? (
                                      <div className="text-[11px] font-normal text-yellow-400">Bal: {formatPrice(inv.balanceDue)}</div>
                                    ) : null}
                                  </td>
                                  <td className="py-3.5 px-5">
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
                                      inv.status === "paid" 
                                        ? "bg-green-500/20 text-green-400 border border-green-500/30" 
                                        : inv.status === "partial"
                                        ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                                        : "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                                    }`}>
                                      {inv.status}
                                    </span>
                                  </td>
                                  <td className="py-3.5 px-5 text-center">
                                    <button
                                      onClick={() => handleOpenEditInvoice(inv)}
                                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 rounded-lg text-xs font-bold transition-all shadow-sm"
                                      title="Edit Invoice & Modify Line Items"
                                    >
                                      <Edit3 className="w-3.5 h-3.5" /> Edit Items
                                    </button>
                                  </td>
                                  <td className="py-3.5 px-5">
                                    <div className="flex items-center justify-center gap-1.5">
                                      {inv.status === "unpaid" ? (
                                        <button
                                          onClick={() => updateInvoiceStatus(inv.id, "paid")}
                                          className="p-1.5 bg-green-500/15 hover:bg-green-500/30 text-green-400 rounded-lg transition-all"
                                          title="Mark as Paid"
                                        >
                                          <CheckCircle className="w-4 h-4" />
                                        </button>
                                      ) : (
                                        <button
                                          onClick={() => updateInvoiceStatus(inv.id, "unpaid")}
                                          className="p-1.5 bg-yellow-500/15 hover:bg-yellow-500/30 text-yellow-400 rounded-lg transition-all"
                                          title="Revert to Unpaid"
                                        >
                                          <Clock className="w-4 h-4" />
                                        </button>
                                      )}
                                      <button
                                        onClick={() => handleWhatsAppInvoice(inv)}
                                        className="p-1.5 bg-emerald-500/15 hover:bg-emerald-500/30 text-emerald-400 rounded-lg transition-all"
                                        title="Send WhatsApp Bill"
                                      >
                                        <MessageSquare className="w-4 h-4" />
                                      </button>
                                      <button 
                                        onClick={() => handlePrint("invoice", inv.id)}
                                        className="p-1.5 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-lg transition-all"
                                        title="Print Invoice"
                                      >
                                        <Printer className="w-4 h-4" />
                                      </button>
                                      <button 
                                        onClick={() => deleteInvoice(inv.id, inv.invoiceNo)}
                                        className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-all"
                                        title="Delete Invoice"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* =============================================================
                  TAB 2: SERVICES OFFERED (FULL CRUD & TARIFFS)
                  ============================================================= */}
              {activeTab === "services" && (
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
                    <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
                      <span className="text-xs text-gray-400 uppercase tracking-widest font-bold">Category:</span>
                      <button
                        onClick={() => setServiceCategoryFilter("all")}
                        className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                          serviceCategoryFilter === "all" ? "bg-cyan-500 text-black font-bold" : "bg-white/5 text-gray-400 hover:text-white"
                        }`}
                      >
                        All ({services.length})
                      </button>
                      {serviceCategories.map(cat => (
                        <button
                          key={cat}
                          onClick={() => setServiceCategoryFilter(cat)}
                          className={`px-3 py-1 rounded-md text-xs font-semibold whitespace-nowrap transition-all ${
                            serviceCategoryFilter === cat ? "bg-cyan-500 text-black font-bold" : "bg-white/5 text-gray-400 hover:text-white"
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={handleOpenAddService}
                      className="flex items-center gap-1.5 bg-cyan-500 hover:bg-cyan-400 text-black font-bold px-3.5 py-1.5 rounded-lg text-xs transition-all shadow-md shadow-cyan-500/20"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add New Service
                    </button>
                  </div>

                  <div className="bg-white/[0.02] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse text-left">
                        <thead>
                          <tr className="border-b border-white/10 bg-white/5 text-gray-400 text-xs font-bold uppercase tracking-wider">
                            <th className="py-3.5 px-5">Code</th>
                            <th className="py-3.5 px-5">Service Name & Scope</th>
                            <th className="py-3.5 px-5">Category</th>
                            <th className="py-3.5 px-5">Unit / Term</th>
                            <th className="py-3.5 px-5 text-right">Standard Rate (KSh)</th>
                            <th className="py-3.5 px-5 text-center">Status</th>
                            <th className="py-3.5 px-5 text-center">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-sm">
                          {filteredServices.length === 0 ? (
                            <tr>
                              <td colSpan={7} className="py-12 text-center text-gray-500">
                                No services found in this category.
                              </td>
                            </tr>
                          ) : (
                            filteredServices.map((srv) => (
                              <tr key={srv.id} className="hover:bg-white/[0.04] transition-all">
                                <td className="py-3.5 px-5 font-mono text-xs text-cyan-400 font-semibold">
                                  {srv.code || "SRV-AUTO"}
                                </td>
                                <td className="py-3.5 px-5 max-w-sm">
                                  <div className="font-bold text-white">{srv.name}</div>
                                  {srv.description && (
                                    <div className="text-xs text-gray-400 line-clamp-1">{srv.description}</div>
                                  )}
                                </td>
                                <td className="py-3.5 px-5">
                                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/5 border border-white/10 text-gray-300">
                                    {srv.category}
                                  </span>
                                </td>
                                <td className="py-3.5 px-5 text-gray-400 text-xs">{srv.unit || "Per Project"}</td>
                                <td className="py-3.5 px-5 text-right font-bold font-mono text-emerald-400">
                                  {formatPrice(srv.price)}
                                </td>
                                <td className="py-3.5 px-5 text-center">
                                  <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold uppercase ${
                                    srv.active 
                                      ? "bg-green-500/20 text-green-400 border border-green-500/30" 
                                      : "bg-red-500/20 text-red-400 border border-red-500/30"
                                  }`}>
                                    {srv.active ? "Active" : "Inactive"}
                                  </span>
                                </td>
                                <td className="py-3.5 px-5">
                                  <div className="flex items-center justify-center gap-2">
                                    <button
                                      onClick={() => handleOpenEditService(srv)}
                                      className="p-1.5 bg-cyan-500/10 hover:bg-cyan-500/25 text-cyan-400 rounded-lg transition-all"
                                      title="Edit Service"
                                    >
                                      <Edit3 className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteService(srv)}
                                      className="p-1.5 bg-red-500/10 hover:bg-red-500/25 text-red-400 rounded-lg transition-all"
                                      title="Delete Service"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
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

              {/* =============================================================
                  TAB 3: SUBSCRIBERS
                  ============================================================= */}
              {activeTab === "subscribers" && (
                <div>
                  <div className="bg-white/[0.02] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse text-left">
                        <thead>
                          <tr className="border-b border-white/10 bg-white/5 text-gray-400 text-xs font-bold uppercase tracking-wider">
                            <th className="py-3.5 px-5">Subscriber / Company</th>
                            <th className="py-3.5 px-5">Contact Info</th>
                            <th className="py-3.5 px-5">Location</th>
                            <th className="py-3.5 px-5">Subscription Package</th>
                            <th className="py-3.5 px-5">Monthly Tariff</th>
                            <th className="py-3.5 px-5 text-center">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-sm">
                          {subscribers.length === 0 ? (
                            <tr>
                              <td colSpan={6} className="py-12 text-center text-gray-500">No active subscribers found.</td>
                            </tr>
                          ) : (
                            subscribers.map((sub) => (
                              <tr key={sub.id} className="hover:bg-white/[0.04] transition-all">
                                <td className="py-3.5 px-5 font-bold text-white">
                                  {sub.name}
                                  {sub.company && <div className="text-xs text-gray-400 font-normal">{sub.company}</div>}
                                </td>
                                <td className="py-3.5 px-5 text-xs text-gray-300">
                                  <div>{sub.phone || "-"}</div>
                                  <div className="text-gray-500">{sub.email || "-"}</div>
                                </td>
                                <td className="py-3.5 px-5 text-xs text-gray-400">{sub.location || "Mombasa"}</td>
                                <td className="py-3.5 px-5 text-xs font-semibold text-cyan-300">
                                  {sub.package || "Custom Bandwidth"}
                                </td>
                                <td className="py-3.5 px-5 font-bold font-mono text-emerald-400">
                                  {formatPrice(sub.monthlyRate || 0)}
                                </td>
                                <td className="py-3.5 px-5 text-center">
                                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-500/20 text-green-400 border border-green-500/30 uppercase">
                                    {sub.status}
                                  </span>
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

              {/* =============================================================
                  TAB 4: PROFORMAS
                  ============================================================= */}
              {activeTab === "proformas" && (
                <div>
                  <div className="bg-white/[0.02] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse text-left">
                        <thead>
                          <tr className="border-b border-white/10 bg-white/5 text-gray-400 text-xs font-bold uppercase tracking-wider">
                            <th className="py-3.5 px-5">Ref Number</th>
                            <th className="py-3.5 px-5">Client Name</th>
                            <th className="py-3.5 px-5">Issue Date</th>
                            <th className="py-3.5 px-5">Total Valuation</th>
                            <th className="py-3.5 px-5">Status</th>
                            <th className="py-3.5 px-5 text-center">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-sm">
                          {quotes.filter(q => ["accepted", "proforma"].includes(q.status)).length === 0 ? (
                            <tr>
                              <td colSpan={6} className="py-12 text-center text-gray-500">No proforma quotes available.</td>
                            </tr>
                          ) : (
                            quotes.filter(q => ["accepted", "proforma"].includes(q.status)).map((q) => (
                              <tr key={q.id} className="hover:bg-white/[0.04] transition-all">
                                <td className="py-3.5 px-5 font-mono text-purple-400 font-bold">{q.invoiceNo}</td>
                                <td className="py-3.5 px-5 font-semibold text-white">{q.lead?.name || "Client"}</td>
                                <td className="py-3.5 px-5 text-xs text-gray-400">{new Date(q.issueDate).toLocaleDateString()}</td>
                                <td className="py-3.5 px-5 font-bold font-mono text-white">{formatPrice(q.total)}</td>
                                <td className="py-3.5 px-5">
                                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30 uppercase">
                                    {q.status}
                                  </span>
                                </td>
                                <td className="py-3.5 px-5 text-center">
                                  <button
                                    onClick={() => handlePrint("quote", q.id)}
                                    className="p-1.5 bg-white/5 hover:bg-white/15 text-gray-300 rounded-lg transition-all"
                                  >
                                    <Printer className="w-4 h-4" />
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
            </motion.div>
          </AnimatePresence>
        )}
      </main>

      {/* =======================================================================
          MODAL: EDIT INVOICE & MODIFY LINE ITEMS
          ======================================================================= */}
      {showEditInvoiceModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#12141a] border border-white/15 rounded-3xl w-full max-w-4xl p-6 md:p-8 max-h-[90vh] overflow-y-auto shadow-2xl my-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Edit3 className="w-5 h-5 text-cyan-400" />
                  {invoiceFormData.id ? `Edit Invoice ${invoiceFormData.invoiceNo}` : "Create New Itemized Invoice"}
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Modify client details, document properties, and add, edit, or delete individual item rows.
                </p>
              </div>
              <button 
                onClick={() => setShowEditInvoiceModal(false)}
                className="p-2 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-xl transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveInvoiceWithItems} className="space-y-6">
              {/* Row 1: Document Details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Invoice Number</label>
                  <input
                    type="text"
                    value={invoiceFormData.invoiceNo}
                    onChange={(e) => setInvoiceFormData({ ...invoiceFormData, invoiceNo: e.target.value })}
                    className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-400 font-mono font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Document Type</label>
                  <select
                    value={invoiceFormData.docType}
                    onChange={(e) => setInvoiceFormData({ ...invoiceFormData, docType: e.target.value })}
                    className="w-full bg-[#1c1f26] border border-white/15 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value="Invoice">Official Invoice</option>
                    <option value="Proforma Invoice">Proforma Invoice</option>
                    <option value="Receipt">Payment Receipt</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Status</label>
                  <select
                    value={invoiceFormData.status}
                    onChange={(e) => setInvoiceFormData({ ...invoiceFormData, status: e.target.value })}
                    className="w-full bg-[#1c1f26] border border-white/15 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value="unpaid">Unpaid / Pending</option>
                    <option value="paid">Paid & Settled</option>
                    <option value="partial">Partial Deposit</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              {/* Row 2: Client Info */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 bg-white/[0.02] p-4 rounded-2xl border border-white/5">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Client / Org Name *</label>
                  <input
                    type="text"
                    value={invoiceFormData.clientName}
                    onChange={(e) => setInvoiceFormData({ ...invoiceFormData, clientName: e.target.value })}
                    className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-400 font-semibold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={invoiceFormData.phone}
                    onChange={(e) => setInvoiceFormData({ ...invoiceFormData, phone: e.target.value })}
                    className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={invoiceFormData.email}
                    onChange={(e) => setInvoiceFormData({ ...invoiceFormData, email: e.target.value })}
                    className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Location</label>
                  <input
                    type="text"
                    value={invoiceFormData.location}
                    onChange={(e) => setInvoiceFormData({ ...invoiceFormData, location: e.target.value })}
                    className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              {/* Row 3: Dates & Period */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Issue Date</label>
                  <input
                    type="date"
                    value={invoiceFormData.issueDate}
                    onChange={(e) => setInvoiceFormData({ ...invoiceFormData, issueDate: e.target.value })}
                    className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={invoiceFormData.dueDate}
                    onChange={(e) => setInvoiceFormData({ ...invoiceFormData, dueDate: e.target.value })}
                    className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Billing Period</label>
                  <input
                    type="text"
                    value={invoiceFormData.billingPeriod}
                    onChange={(e) => setInvoiceFormData({ ...invoiceFormData, billingPeriod: e.target.value })}
                    placeholder="e.g. October 2026"
                    className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              {/* SECTION: ITEM-LEVEL EDITING & MODIFICATION TABLE */}
              <div className="border border-white/10 rounded-2xl p-4 bg-white/[0.02]">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-cyan-400 uppercase tracking-wider">Itemized Line Items</span>
                    <span className="text-xs text-gray-400">({invoiceItemsList.length} items)</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Add from Catalog dropdown */}
                    <select
                      onChange={(e) => {
                        if (e.target.value) {
                          handleAddFromCatalog(e.target.value);
                          e.target.value = "";
                        }
                      }}
                      className="bg-[#1c1f26] border border-cyan-500/30 text-cyan-300 rounded-xl px-3 py-1.5 text-xs font-medium focus:outline-none"
                      defaultValue=""
                    >
                      <option value="" disabled>+ Add from Services Catalog...</option>
                      {services.map(s => (
                        <option key={s.id} value={s.id}>
                          {s.name} (KSh {s.price.toLocaleString()})
                        </option>
                      ))}
                    </select>

                    <button
                      type="button"
                      onClick={handleAddLineItemRow}
                      className="flex items-center gap-1 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Blank Row
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left text-xs">
                    <thead>
                      <tr className="border-b border-white/10 bg-white/5 text-gray-400 font-bold uppercase">
                        <th className="py-2.5 px-3">Service / Item Description</th>
                        <th className="py-2.5 px-3 w-28 text-center">Qty / Term</th>
                        <th className="py-2.5 px-3 w-36 text-right">Unit Rate (KSh)</th>
                        <th className="py-2.5 px-3 w-36 text-right">Total (KSh)</th>
                        <th className="py-2.5 px-3 w-16 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {invoiceItemsList.map((item, idx) => (
                        <tr key={idx} className="hover:bg-white/[0.02]">
                          <td className="py-2 px-3">
                            <input
                              type="text"
                              value={item.title}
                              onChange={(e) => handleUpdateItemField(idx, "title", e.target.value)}
                              placeholder="Service name / scope..."
                              className="w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-white font-medium focus:outline-none focus:border-cyan-400"
                              required
                            />
                          </td>
                          <td className="py-2 px-3">
                            <input
                              type="text"
                              value={item.qty}
                              onChange={(e) => handleUpdateItemField(idx, "qty", e.target.value)}
                              placeholder="e.g. 1"
                              className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-white text-center focus:outline-none focus:border-cyan-400"
                            />
                          </td>
                          <td className="py-2 px-3">
                            <input
                              type="number"
                              min="0"
                              step="100"
                              value={item.rate}
                              onChange={(e) => handleUpdateItemField(idx, "rate", e.target.value)}
                              className="w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-right font-mono font-bold text-emerald-400 focus:outline-none focus:border-cyan-400"
                              required
                            />
                          </td>
                          <td className="py-2 px-3 text-right font-mono font-bold text-white text-sm">
                            {formatPrice(item.total)}
                          </td>
                          <td className="py-2 px-3 text-center">
                            <button
                              type="button"
                              onClick={() => handleDeleteItemRow(idx)}
                              className="p-1.5 bg-red-500/10 hover:bg-red-500/25 text-red-400 rounded-lg transition-all"
                              title="Delete Item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Calculation Summary Footer */}
                <div className="mt-4 pt-4 border-t border-white/10 flex flex-col sm:flex-row items-end justify-between gap-4">
                  <div className="w-full sm:w-1/2 space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="planToggle"
                        checked={invoiceFormData.hasPaymentPlan}
                        onChange={(e) => setInvoiceFormData({ ...invoiceFormData, hasPaymentPlan: e.target.checked })}
                        className="rounded"
                      />
                      <label htmlFor="planToggle" className="text-xs text-gray-300">Enable Deposit / Partial Payment Plan</label>
                    </div>

                    {invoiceFormData.hasPaymentPlan && (
                      <div className="flex items-center gap-3">
                        <input
                          type="text"
                          value={invoiceFormData.depositLabel}
                          onChange={(e) => setInvoiceFormData({ ...invoiceFormData, depositLabel: e.target.value })}
                          placeholder="e.g. 1 ST Installment"
                          className="bg-white/5 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white"
                        />
                        <input
                          type="number"
                          value={invoiceFormData.depositAmount}
                          onChange={(e) => setInvoiceFormData({ ...invoiceFormData, depositAmount: parseFloat(e.target.value) || 0 })}
                          placeholder="Deposit Amount"
                          className="bg-white/5 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white font-mono"
                        />
                      </div>
                    )}
                  </div>

                  <div className="w-full sm:w-72 bg-white/5 p-3 rounded-xl border border-white/10 space-y-1.5 text-xs">
                    <div className="flex justify-between text-gray-400">
                      <span>Subtotal:</span>
                      <span className="font-mono text-white font-semibold">{formatPrice(modalTotals.subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-gray-400">
                      <span>VAT / Taxes:</span>
                      <span className="font-mono text-white font-semibold">{formatPrice(invoiceFormData.tax)}</span>
                    </div>
                    <div className="flex justify-between text-white font-bold text-sm pt-1 border-t border-white/10">
                      <span>Grand Total:</span>
                      <span className="font-mono text-emerald-400">{formatPrice(modalTotals.grandTotal)}</span>
                    </div>
                    {invoiceFormData.hasPaymentPlan && (
                      <div className="flex justify-between text-yellow-400 font-bold pt-1">
                        <span>Balance Due:</span>
                        <span className="font-mono">{formatPrice(modalTotals.balanceDue)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Invoice Notes / Terms</label>
                <textarea
                  rows={2}
                  value={invoiceFormData.notes}
                  onChange={(e) => setInvoiceFormData({ ...invoiceFormData, notes: e.target.value })}
                  className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowEditInvoiceModal(false)}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl text-xs font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const { subtotal, grandTotal } = calculateModalTotals();
                    printInvoiceDocument({
                      ...invoiceFormData,
                      subtotal,
                      total: grandTotal,
                      items: invoiceItemsList,
                    });
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 bg-white/10 hover:bg-white/15 text-white rounded-xl text-xs font-bold transition-all border border-white/15 shadow-sm"
                >
                  <Printer className="w-4 h-4 text-cyan-400" /> Print Invoice
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex items-center gap-1.5 px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-black rounded-xl text-xs font-bold transition-all disabled:opacity-50 shadow-lg shadow-green-500/20"
                >
                  <Save className="w-4 h-4" /> Save Invoice & Items to SQL
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =======================================================================
          MODAL: ADD / EDIT SERVICE IN CATALOG
          ======================================================================= */}
      {showServiceModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#12141a] border border-white/15 rounded-3xl w-full max-w-lg p-6 md:p-8 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Tag className="w-5 h-5 text-cyan-400" />
                {editingService ? "Edit Service Rate" : "Add New Commercial Service"}
              </h3>
              <button 
                onClick={() => setShowServiceModal(false)}
                className="p-2 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-xl transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveService} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Service Code</label>
                <input
                  type="text"
                  value={serviceFormData.code}
                  onChange={(e) => setServiceFormData({ ...serviceFormData, code: e.target.value })}
                  placeholder="e.g. NET-FIBER-01"
                  className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-400 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Service Name *</label>
                <input
                  type="text"
                  value={serviceFormData.name}
                  onChange={(e) => setServiceFormData({ ...serviceFormData, name: e.target.value })}
                  placeholder="e.g. 18-Camera IP CCTV & NVR Setup"
                  className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-400 font-semibold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Category</label>
                  <select
                    value={serviceFormData.category}
                    onChange={(e) => setServiceFormData({ ...serviceFormData, category: e.target.value })}
                    className="w-full bg-[#1c1f26] border border-white/15 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value="Essentials Packages">Essentials Packages</option>
                    <option value="Network & Infrastructure">Network & Infrastructure</option>
                    <option value="Security & Surveillance">Security & Surveillance</option>
                    <option value="Development & Creative">Development & Creative</option>
                    <option value="Systems & Servers">Systems & Servers</option>
                    <option value="Maintenance & AMC Retainers">Maintenance & AMC Retainers</option>
                    <option value="Internet Bandwidth">Internet Bandwidth</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Unit / Billing Term</label>
                  <input
                    type="text"
                    value={serviceFormData.unit}
                    onChange={(e) => setServiceFormData({ ...serviceFormData, unit: e.target.value })}
                    placeholder="e.g. Per Unit / One-Off"
                    className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Commercial Price (KSh) *</label>
                <input
                  type="number"
                  min="0"
                  step="100"
                  value={serviceFormData.price}
                  onChange={(e) => setServiceFormData({ ...serviceFormData, price: e.target.value })}
                  placeholder="e.g. 35000"
                  className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-sm text-white font-mono font-bold text-emerald-400 focus:outline-none focus:border-cyan-400"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Technical Description</label>
                <textarea
                  rows={2}
                  value={serviceFormData.description}
                  onChange={(e) => setServiceFormData({ ...serviceFormData, description: e.target.value })}
                  placeholder="Details of hardware, labor or specifications included..."
                  className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="srvActive"
                  checked={serviceFormData.active}
                  onChange={(e) => setServiceFormData({ ...serviceFormData, active: e.target.checked })}
                  className="rounded"
                />
                <label htmlFor="srvActive" className="text-xs text-gray-300">Active Service in Commercial Proposal</label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowServiceModal(false)}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl text-xs font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex items-center gap-1.5 px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black rounded-xl text-xs font-bold transition-all disabled:opacity-50 shadow-lg shadow-cyan-500/20"
                >
                  <Save className="w-4 h-4" /> Save Service
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
