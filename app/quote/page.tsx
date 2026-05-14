"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Plus, Trash2, Printer, LogOut } from "lucide-react";

interface LineItem {
  id: string;
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
  const [location, setLocation] = useState("");
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [labourFee, setLabourFee] = useState(0);
  const [newService, setNewService] = useState("");
  const [newQuantity, setNewQuantity] = useState(1);
  const [newUnitPrice, setNewUnitPrice] = useState(0);
  const [loading, setLoading] = useState(false);
  const [invoiceNo, setInvoiceNo] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      router.push("/admin/login");
    }
  }, [router]);

  const addLineItem = () => {
    if (!newService.trim() || newQuantity <= 0 || newUnitPrice <= 0) {
      alert("Please fill all fields correctly");
      return;
    }

    const item: LineItem = {
      id: crypto.randomUUID(),
      service: newService,
      quantity: newQuantity,
      unitPrice: newUnitPrice,
    };

    setLineItems([...lineItems, item]);
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

  const total = useMemo(() => subtotal + labourFee, [subtotal, labourFee]);

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

  const printInvoice = () => {
    if (!invoiceRef.current) return;
    const printWindow = window.open("", "_blank", "width=900,height=700");
    if (!printWindow) return;

    const content = invoiceRef.current.innerHTML;
    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice ${invoiceNo || "PREVIEW"}</title>
          <style>
            body { font-family: Inter, sans-serif; margin: 0; padding: 24px; background: #fff; color: #121212; }
            .invoice-wrapper { width: 100%; max-width: 820px; margin: 0 auto; }
            .brand-header { display: flex; justify-content: space-between; align-items: center; gap: 16px; }
            .brand-text { font-weight: 700; font-size: 28px; letter-spacing: -0.02em; }
            .brand-text span { color: #8fc900; }
            .invoice-details, .customer-details, .footer-note { margin-top: 24px; }
            .section-title { font-size: 12px; text-transform: uppercase; letter-spacing: 0.15em; color: #6b7280; margin-bottom: 10px; }
            .row { display: flex; justify-content: space-between; gap: 8px; }
            .text-muted { color: #6b7280; }
            .table { width: 100%; border-collapse: collapse; margin-top: 24px; }
            .table th, .table td { border-bottom: 1px solid #e5e7eb; padding: 12px 8px; text-align: left; }
            .table th { text-transform: uppercase; font-size: 11px; letter-spacing: 0.12em; color: #6b7280; }
            .table td { font-size: 13px; }
            .table .amount { text-align: right; }
            .totals { margin-top: 24px; width: 100%; max-width: 420px; margin-left: auto; }
            .totals .row { justify-content: space-between; padding: 8px 0; }
            .totals .label { color: #6b7280; }
            .totals .total-value { font-size: 18px; font-weight: 700; }
            .signature { margin-top: 48px; display: flex; justify-content: space-between; align-items: center; }
            .signature-line { border-top: 1px solid #d1d5db; width: 260px; }
            .payment-info { margin-top: 40px; display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
          </style>
        </head>
        <body>
          <div class="invoice-wrapper">${content}</div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  const saveQuote = async () => {
    if (!billedTo.trim() || lineItems.length === 0 || labourFee <= 0) {
      alert("Please fill: Billed To, add line items, and set labour fee");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/quotes/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          billedTo,
          phone,
          email,
          location,
          lineItems,
          labourFee,
          token: localStorage.getItem("adminToken"),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Failed to save quote");
        setLoading(false);
        return;
      }

      setInvoiceNo(data.invoiceNo);
      alert(`Quote saved! Invoice #${data.invoiceNo}`);
    } catch (error) {
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
                <input
                  type="text"
                  placeholder="Customer Name / Company"
                  value={billedTo}
                  onChange={(e) => setBilledTo(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-cyan-400"
                />
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
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            <div className="glass p-6 rounded-3xl border border-white/10">
              <h2 className="text-xl font-semibold text-white mb-4">Add Item</h2>
              <div className="grid gap-4">
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
              <h2 className="text-xl font-semibold text-white mb-4">Labour Fee</h2>
              <input
                type="number"
                placeholder="Labour fee amount"
                min={0}
                step="0.01"
                value={labourFee}
                onChange={(e) => setLabourFee(parseFloat(e.target.value) || 0)}
                className="w-full bg-black/50 border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-cyan-400"
              />
              <p className="text-gray-400 text-sm mt-3">
                Required for every quote and included in the final total.
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
                  <p>{location || "Location"}</p>
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
                <p className="text-sm text-slate-600">{location || "Client address"}</p>
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
