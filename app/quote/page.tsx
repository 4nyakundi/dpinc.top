"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Plus, Trash2, Printer, LogOut } from "lucide-react";

interface CatalogItem {
  id: string;
  name: string;
  description?: string;
  price: number;
}

interface Lead {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  source?: string;
  status: string;
}

interface LineItem {
  id: string;
  catalogItemId?: string;
  service: string;
  quantity: number;
  unitPrice: number;
}

export default function QuoteGenerator() {
  const router = useRouter();
  const invoiceRef = useRef<HTMLDivElement | null>(null);
  const [billedTo, setBilledTo] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [customerLocation, setCustomerLocation] = useState("");
  const [company, setCompany] = useState("");
  const [source, setSource] = useState("web");
  const [selectedLeadId, setSelectedLeadId] = useState("");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [catalogItems, setCatalogItems] = useState<CatalogItem[]>([]);
  const [selectedCatalogItemId, setSelectedCatalogItemId] = useState("");
  const [savedQuotes, setSavedQuotes] = useState<any[]>([]);
  const [savedInvoices, setSavedInvoices] = useState<any[]>([]);
  const [token, setToken] = useState("");
  const [recordsLoading, setRecordsLoading] = useState(false);
  const [labourFee, setLabourFee] = useState(0);
  const [tax, setTax] = useState(0);
  const [newService, setNewService] = useState("");
  const [newQuantity, setNewQuantity] = useState(1);
  const [newUnitPrice, setNewUnitPrice] = useState(0);
  const [loading, setLoading] = useState(false);
  const [invoiceNo, setInvoiceNo] = useState("");

  const loadCatalogItems = async () => {
    try {
      const catalogRes = await fetch("/api/catalog");
      if (catalogRes.ok) {
        const catalogData = await catalogRes.json();
        setCatalogItems(catalogData.items || []);
      }
    } catch (error) {
      console.error("Failed to load catalog items", error);
    }
  };

  const loadLeads = async (token: string) => {
    try {
      const leadRes = await fetch("/api/leads", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (leadRes.ok) {
        const leadData = await leadRes.json();
        setLeads(leadData.leads || []);
      }
    } catch (error) {
      console.error("Failed to load leads", error);
    }
  };

  const loadSavedQuotes = async (token: string) => {
    setRecordsLoading(true);
    try {
      const quotesRes = await fetch("/api/quotes", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (quotesRes.ok) {
        const quotesData = await quotesRes.json();
        setSavedQuotes(quotesData.quotes || []);
      }
    } catch (error) {
      console.error("Failed to load saved quotes", error);
    } finally {
      setRecordsLoading(false);
    }
  };

  const loadSavedInvoices = async (token: string) => {
    try {
      const invoiceRes = await fetch("/api/invoices", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (invoiceRes.ok) {
        const invoiceData = await invoiceRes.json();
        setSavedInvoices(invoiceData.invoices || []);
      }
    } catch (error) {
      console.error("Failed to load saved invoices", error);
    }
  };

  const handleLeadSelection = (leadId: string) => {
    setSelectedLeadId(leadId);
    if (!leadId) {
      setBilledTo("");
      setEmail("");
      setPhone("");
      setCompany("");
      setSource("web");
      return;
    }

    const lead = leads.find((item) => item.id === leadId);
    if (lead) {
      setBilledTo(lead.name || "");
      setEmail(lead.email || "");
      setPhone(lead.phone || "");
      setCompany(lead.company || "");
      setSource(lead.source || "web");
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      router.push("/admin/login");
      return;
    }

    setToken(token);
    loadCatalogItems();
    loadLeads(token);
    loadSavedQuotes(token);
    loadSavedInvoices(token);
  }, [router]);

  const handleCatalogSelect = (catalogId: string) => {
    setSelectedCatalogItemId(catalogId);
    const item = catalogItems.find((catalog) => catalog.id === catalogId);
    if (item) {
      setNewService(item.name);
      setNewUnitPrice(item.price);
      setNewQuantity(1);
    }
  };

  const addLineItem = () => {
    if (!newService.trim() || newQuantity <= 0 || newUnitPrice <= 0) {
      alert("Please fill all fields correctly");
      return;
    }

    const item: LineItem = {
      id: crypto.randomUUID(),
      catalogItemId: selectedCatalogItemId || undefined,
      service: newService,
      quantity: newQuantity,
      unitPrice: newUnitPrice,
    };

    setLineItems([...lineItems, item]);
    setSelectedCatalogItemId("");
    setNewService("");
    setNewQuantity(1);
    setNewUnitPrice(0);
  };

  const removeLineItem = (id: string) => {
    setLineItems(lineItems.filter((item) => item.id !== id));
  };

  const subtotal = useMemo(
    () =>
      lineItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0),
    [lineItems]
  );

  const total = useMemo(() => subtotal + labourFee + tax, [subtotal, labourFee, tax]);

  const formatCurrency = (value: number) =>
    `Ksh ${value.toLocaleString("en-KE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const formatDate = (date: Date) =>
    new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(date);

  const buildInvoiceHtml = () => {
    const invoiceId = invoiceNo || "#00000";
    const formattedDate = formatDate(new Date());
    const itemsHtml = lineItems.length
      ? lineItems
          .map(
            (item) =>
              `<tr>
                <td>${item.service}</td>
                <td class="text-right">${item.quantity}</td>
                <td class="text-right">${formatCurrency(item.unitPrice)}</td>
                <td class="text-right">${formatCurrency(item.quantity * item.unitPrice)}</td>
              </tr>`
          )
          .join("")
      : `<tr><td colspan="4" class="empty-row">Add items to see them appear here.</td></tr>`;

    return `
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Invoice ${invoiceId}</title>
          <style>
            body { margin: 32px; font-family: Inter, system-ui, sans-serif; color: #111827; }
            .invoice { max-width: 680px; margin: 0 auto; }
            .logo { display: block; width: 130px; margin-bottom: 16px; }
            .business-name { font-size: 24px; font-weight: 700; margin: 0; }
            .business-subtitle { margin: 4px 0 24px; color: #4b5563; }
            .section { margin-bottom: 24px; }
            .section-title { margin: 0 0 8px; color: #374151; font-size: 12px; letter-spacing: 0.15em; text-transform: uppercase; }
            .text-sm { font-size: 14px; line-height: 1.7; }
            .text-right { text-align: right; }
            .table { width: 100%; border-collapse: collapse; margin-top: 12px; }
            .table th, .table td { padding: 8px 4px; }
            .table th { text-align: left; color: #374151; font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em; }
            .table td { font-size: 14px; border-bottom: 1px solid #e5e7eb; }
            .totals { width: 100%; margin-top: 16px; }
            .totals-row { display: flex; justify-content: space-between; padding: 4px 0; }
            .totals-row.total { font-size: 16px; font-weight: 700; margin-top: 12px; }
            .empty-row { color: #6b7280; padding: 16px 0; text-align: center; }
            .footer-note { margin-top: 32px; font-size: 14px; line-height: 1.8; }
            .prepared-by { margin-top: 20px; text-align: right; font-size: 14px; }
            @media print { body { margin: 16px; } }
          </style>
        </head>
        <body>
          <div class="invoice">
            <img src="/logo.svg" alt="DataPort Logo" class="logo" />
            <p class="business-name">DataPort INC</p>
            <p class="business-subtitle">Excel Enterprise Limited</p>

            <div class="section text-sm">
              <p><strong>Invoice No.</strong> ${invoiceId}</p>
              <p><strong>Date</strong> ${formattedDate}</p>
            </div>

            <div class="section text-sm">
              <p class="section-title">Billed To</p>
              <p>${billedTo || "Client Name"}</p>
              <p>${phone || "Phone number"}</p>
              <p>${email || "Email address"}</p>
              <p>${customerLocation || "Location"}</p>
            </div>

            <div class="section text-sm">
              <p class="section-title">Payment Info</p>
              <p>MPESA (Mobile)</p>
              <p>Account Name: Emmanuel Nyakundi</p>
              <p>Phone No.: 0790 964 002</p>
              <p>Standard Chartered Bank</p>
              <p>Account No.: 0100499055400</p>
            </div>

            <table class="table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th class="text-right">Quantity</th>
                  <th class="text-right">Unit Price</th>
                  <th class="text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>

            <div class="totals">
              <div class="totals-row">
                <span>Subtotal</span>
                <span>${formatCurrency(subtotal)}</span>
              </div>
              <div class="totals-row">
                <span>Labour Fee</span>
                <span>${formatCurrency(labourFee)}</span>
              </div>
              <div class="totals-row">
                <span>Tax</span>
                <span>${formatCurrency(tax)}</span>
              </div>
              <div class="totals-row total">
                <span>Total</span>
                <span>${formatCurrency(total)}</span>
              </div>
            </div>

            <div class="footer-note">
              <p>Thank you!</p>
              <p>We appreciate your business. Please make payment using the details above.</p>
            </div>

            <div class="prepared-by">
              <p>Prepared by</p>
              <p>Nyakundi, E.</p>
              <p>Dev Ops Engineer</p>
            </div>
          </div>
        </body>
      </html>
    `;
  };

  const printInvoice = () => {
    const printWindow = window.open("", "_blank", "width=900,height=700");
    if (!printWindow) return;

    const html = buildInvoiceHtml();
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  const saveQuote = async () => {
    if (!billedTo.trim() || lineItems.length === 0) {
      alert("Please fill the client details and add at least one item before saving the quote.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/quotes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          leadId: selectedLeadId || undefined,
          lead: selectedLeadId
            ? undefined
            : {
                name: billedTo,
                email,
                phone,
                company,
                source,
                location: customerLocation,
              },
          lineItems,
          labourFee,
          tax,
          notes: "Auto-generated quote",
          recurring: false,
          invoiceOnSave: false,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Failed to save quote");
        setLoading(false);
        return;
      }

      setInvoiceNo(data.quote?.invoiceNo || "");
      if (token) {
        await loadSavedQuotes(token);
        await loadSavedInvoices(token);
      }
      alert(`Quote saved! ${data.quote?.invoiceNo || "Quote created"}`);
    } catch (error) {
      console.error("Error saving quote", error);
      alert("Error saving quote");
    }

    setLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    router.push("/admin/login");
  };

  return (
    <div className="min-h-screen bg-black pt-24 pb-12">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between mb-10">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-5xl font-bold font-display text-white">
              Quote Generator
            </h1>
            <p className="text-gray-400 mt-2 max-w-xl">
              Create invoice-style quotes with labour, save them to records, and print in a polished layout.
            </p>
          </motion.div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <button
              onClick={printInvoice}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-cyan-600 hover:bg-cyan-700 text-white font-semibold transition"
            >
              <Printer className="w-4 h-4" />
              Print Quote
            </button>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-red-600 hover:bg-red-700 text-white font-semibold transition"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-2 space-y-8">
            <div className="glass p-6 rounded-3xl border border-white/10">
              <h2 className="text-xl font-semibold text-white mb-4">Client Details</h2>
              <div className="grid gap-4">
                <select
                  value={selectedLeadId}
                  onChange={(e) => handleLeadSelection(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-cyan-400"
                >
                  <option value="">Select existing lead or create new</option>
                  {leads.map((lead) => (
                    <option key={lead.id} value={lead.id}>
                      {lead.name} — {lead.company || "Lead"}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Customer Name"
                  value={billedTo}
                  onChange={(e) => setBilledTo(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-cyan-400"
                />
                <div className="grid sm:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Company"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-cyan-400"
                  />
                  <input
                    type="text"
                    placeholder="Source (web/referral)"
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <input
                    type="tel"
                    placeholder="Phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-cyan-400"
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Location"
                  value={customerLocation}
                  onChange={(e) => setCustomerLocation(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            <div className="glass p-6 rounded-3xl border border-white/10">
              <h2 className="text-xl font-semibold text-white mb-4">Add Item</h2>
              <div className="grid gap-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-2">
                    Fixed price service
                  </label>
                  <select
                    value={selectedCatalogItemId}
                    onChange={(e) => handleCatalogSelect(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value="">Select a catalog item</option>
                    {catalogItems.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name} — {formatCurrency(item.price)}
                      </option>
                    ))}
                  </select>
                </div>
                <input
                  type="text"
                  placeholder="Item / Service"
                  value={newService}
                  onChange={(e) => setNewService(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-cyan-400"
                />
                <div className="grid sm:grid-cols-3 gap-4">
                  <input
                    type="number"
                    placeholder="Quantity"
                    min={1}
                    value={newQuantity}
                    onChange={(e) => setNewQuantity(parseInt(e.target.value) || 1)}
                    className="bg-black/50 border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-cyan-400"
                  />
                  <input
                    type="number"
                    placeholder="Unit Price"
                    min={0}
                    step="0.01"
                    value={newUnitPrice}
                    onChange={(e) => setNewUnitPrice(parseFloat(e.target.value) || 0)}
                    className="bg-black/50 border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-cyan-400"
                  />
                  <button
                    type="button"
                    onClick={addLineItem}
                    className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-cyan-600 hover:bg-cyan-700 text-white font-semibold transition"
                  >
                    <Plus className="w-4 h-4" />
                    Add
                  </button>
                </div>
              </div>

              {lineItems.length > 0 && (
                <div className="mt-6 space-y-3">
                  {lineItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between gap-4 bg-black/40 p-4 rounded-2xl border border-white/10">
                      <div>
                        <p className="text-white font-medium">{item.service}</p>
                        <p className="text-sm text-gray-400">
                          {item.quantity} × {formatCurrency(item.unitPrice)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-semibold">
                          {formatCurrency(item.quantity * item.unitPrice)}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeLineItem(item.id)}
                        className="text-red-400 hover:text-red-500"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="glass p-6 rounded-3xl border border-white/10 bg-slate-950/40">
              <h2 className="text-xl font-semibold text-white mb-4">Pricing</h2>
              <div className="grid gap-4">
                <input
                  type="number"
                  placeholder="Labour fee amount"
                  min={0}
                  step="0.01"
                  value={labourFee}
                  onChange={(e) => setLabourFee(parseFloat(e.target.value) || 0)}
                  className="w-full bg-black/50 border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-cyan-400"
                />
                <input
                  type="number"
                  placeholder="Tax amount"
                  min={0}
                  step="0.01"
                  value={tax}
                  onChange={(e) => setTax(parseFloat(e.target.value) || 0)}
                  className="w-full bg-black/50 border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>
              <p className="text-gray-400 text-sm mt-3">
                Labour and tax are included in the final quote total.
              </p>
            </div>

            <button
              type="button"
              onClick={saveQuote}
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-bold hover:shadow-lg hover:shadow-cyan-500/30 transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Saving..." : "Save Quote"}
            </button>
          </div>

          <div className="space-y-8">
            <div className="glass p-6 rounded-3xl border border-white/10 sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-gray-400">Quote preview</p>
                  <h2 className="text-2xl font-bold text-white">Invoice layout</h2>
                </div>
                <div className="text-right text-xs text-gray-400">
                  <p>{formatDate(new Date())}</p>
                  <p>{invoiceNo ? invoiceNo : "Invoice #TBD"}</p>
                </div>
              </div>

              <div className="space-y-4 text-sm text-gray-300">
                <div>
                  <p className="text-gray-400 uppercase tracking-[0.2em] text-xs">Billed To</p>
                  <p className="text-white font-medium">{billedTo || "Customer name"}</p>
                  <p>{phone || "Phone"}</p>
                  <p>{email || "Email"}</p>
                  <p>{customerLocation || "Location"}</p>
                </div>
                <div className="pt-4 border-t border-white/10">
                  <div className="flex justify-between text-sm text-gray-400">
                    <span>Subtotal</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-400 mt-2">
                    <span>Labour</span>
                    <span>{formatCurrency(labourFee)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-400 mt-2">
                    <span>Tax</span>
                    <span>{formatCurrency(tax)}</span>
                  </div>
                  <div className="flex justify-between text-white text-lg font-bold mt-3">
                    <span>Total</span>
                    <span>{formatCurrency(total)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="glass p-6 rounded-3xl border border-white/10">
              <h2 className="text-xl font-semibold text-white mb-4">How it looks on PDF</h2>
              <p className="text-gray-400 text-sm mb-4">
                Open the printable quote and export to PDF. The printed version includes the company brand and payment details.
              </p>
              <div className="space-y-4 text-sm text-gray-300">
                <div className="flex justify-between">
                  <span className="text-gray-400">Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Labour</span>
                  <span>{formatCurrency(labourFee)}</span>
                </div>
                <div className="flex justify-between text-white font-bold">
                  <span>Total</span>
                  <span>{formatCurrency(total)}</span>
                </div>
              </div>
            </div>

            <div className="glass p-6 rounded-3xl border border-white/10">
              <h2 className="text-xl font-semibold text-white mb-4">Saved Quote Records</h2>
              {recordsLoading ? (
                <p className="text-gray-400">Loading saved quotes...</p>
              ) : savedQuotes.length === 0 ? (
                <p className="text-gray-400">No saved quotes yet. Save a quote to view it here.</p>
              ) : (
                <div className="space-y-3">
                  {savedQuotes.map((quote) => (
                    <div key={quote.id} className="bg-black/30 p-4 rounded-2xl border border-white/10">
                      <div className="flex justify-between gap-4">
                        <div>
                          <p className="text-white font-semibold">{quote.invoiceNo}</p>
                          <p className="text-sm text-gray-400">{new Date(quote.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-white font-semibold">{formatCurrency(quote.total)}</p>
                          <p className="text-sm text-gray-400">{quote.status}</p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-400 mt-2">{quote.billedTo}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-16" ref={invoiceRef}>
          <div className="max-w-4xl mx-auto bg-white text-slate-900 p-8 print:p-0" id="invoice-print">
            <div className="flex flex-col gap-6 print:gap-0 print:flex-row print:justify-between print:items-center">
              <div className="flex items-center gap-4">
                <img src="/logo.svg" alt="DataPort Logo" className="h-16 w-16" />
                <div>
                  <p className="text-2xl font-bold tracking-tight">Data<span className="text-lime-500">Port</span> INC</p>
                  <p className="text-sm text-slate-500">Excel Enterprise Limited</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-500">Invoice No.</p>
                <p className="text-xl font-bold">{invoiceNo || "#00000"}</p>
                <p className="text-sm text-slate-500">{formatDate(new Date())}</p>
              </div>
            </div>

            <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400 mb-2">Billed To</p>
                <p className="font-semibold text-slate-900">{billedTo || "Client Name"}</p>
                <p className="text-sm text-slate-600">{phone || "Phone number"}</p>
                <p className="text-sm text-slate-600">{email || "Email address"}</p>
                <p className="text-sm text-slate-600">{customerLocation || "Client address"}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400 mb-2">Payment Info</p>
                <p className="text-sm text-slate-600">MPESA (Mobile)</p>
                <p className="text-sm text-slate-900 font-semibold">Account Name: Emmanuel Nyakundi</p>
                <p className="text-sm text-slate-600">Phone No.: 0790 964 002</p>
                <div className="mt-4">
                  <p className="text-sm text-slate-600">Standard Chartered Bank</p>
                  <p className="text-sm text-slate-900 font-semibold">Account No.: 0100499055400</p>
                </div>
              </div>
            </div>

            <div className="mt-10 overflow-hidden rounded-3xl border border-slate-200">
              <table className="w-full border-collapse text-sm">
                <thead className="bg-slate-100">
                  <tr>
                    <th className="text-left px-4 py-4 text-slate-500 uppercase tracking-[0.12em]">Item</th>
                    <th className="text-right px-4 py-4 text-slate-500 uppercase tracking-[0.12em]">Quantity</th>
                    <th className="text-right px-4 py-4 text-slate-500 uppercase tracking-[0.12em]">Unit Price</th>
                    <th className="text-right px-4 py-4 text-slate-500 uppercase tracking-[0.12em]">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {lineItems.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                        Add items to see them appear here.
                      </td>
                    </tr>
                  ) : (
                    lineItems.map((item) => (
                      <tr key={item.id} className="border-t border-slate-200">
                        <td className="px-4 py-4 text-slate-900">{item.service}</td>
                        <td className="px-4 py-4 text-right text-slate-700">{item.quantity}</td>
                        <td className="px-4 py-4 text-right text-slate-700">{formatCurrency(item.unitPrice)}</td>
                        <td className="px-4 py-4 text-right text-slate-900">{formatCurrency(item.quantity * item.unitPrice)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-8 max-w-md ml-auto space-y-3">
              <div className="flex justify-between text-sm text-slate-600">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-slate-600">
                <span>Labour Fee</span>
                <span>{formatCurrency(labourFee)}</span>
              </div>
              <div className="flex justify-between pt-4 border-t border-slate-200 text-lg font-semibold text-slate-900">
                <span>Total</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>

            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400 mb-3">Thank you!</p>
                <p className="text-sm text-slate-600">We appreciate your business. Please make payment using the details above.</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-500">Prepared by</p>
                <p className="font-semibold text-slate-900">Nyakundi, E.</p>
                <p className="text-sm text-slate-600">Dev Ops Engineer</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
