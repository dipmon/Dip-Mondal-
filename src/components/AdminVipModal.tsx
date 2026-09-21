import React, { useState, useEffect } from 'react';
import { 
  X, 
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  FileSpreadsheet, 
  Search, 
  RefreshCw, 
  Download, 
  Phone, 
  MessageSquare, 
  Key, 
  ExternalLink, 
  Copy, 
  CheckCheck,
  Crown
} from 'lucide-react';
import { VipRequest } from '../types';
import { fetchAllVipRequests, updateVipRequestStatus } from '../firebase';
import { User } from 'firebase/auth';

interface AdminVipModalProps {
  isOpen: boolean;
  currentUser: User | null;
  onClose: () => void;
  onVipApprovedLocally?: () => void;
}

export const AdminVipModal: React.FC<AdminVipModalProps> = ({
  isOpen,
  currentUser,
  onClose,
  onVipApprovedLocally,
}) => {
  const ADMIN_EMAIL = 'dip92599@gmail.com';
  const ADMIN_PIN = '99322';

  const [pinInput, setPinInput] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinError, setPinError] = useState(false);

  const [requests, setRequests] = useState<VipRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Google Sheet Webhook URL
  const [webhookUrl, setWebhookUrl] = useState(() => {
    return typeof window !== 'undefined' ? (localStorage.getItem('cyber_gsheet_webhook_url') || '') : '';
  });
  const [webhookSaved, setWebhookSaved] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);

  // Check auth
  useEffect(() => {
    if (currentUser && currentUser.email === ADMIN_EMAIL) {
      setIsAuthenticated(true);
    }
  }, [currentUser]);

  // Load requests when modal opens and authenticated
  useEffect(() => {
    if (isOpen && isAuthenticated) {
      loadRequests();
    }
  }, [isOpen, isAuthenticated]);

  if (!isOpen) return null;

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput.trim() === ADMIN_PIN || pinInput.trim() === '8116263478' || pinInput.trim() === '8116') {
      setIsAuthenticated(true);
      setPinError(false);
    } else {
      setPinError(true);
    }
  };

  const loadRequests = async () => {
    setIsLoading(true);
    try {
      const list = await fetchAllVipRequests();
      
      // Also merge any locally cached requests
      const localReqJson = localStorage.getItem('cyber_vip_pending_request');
      if (localReqJson) {
        try {
          const localReq: VipRequest = JSON.parse(localReqJson);
          if (!list.some(r => r.id === localReq.id || r.utr === localReq.utr)) {
            list.unshift(localReq);
          }
        } catch (e) {}
      }

      setRequests(list);
    } catch (err) {
      console.warn('Failed to load requests from Firestore:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (req: VipRequest) => {
    setActionLoadingId(req.id);
    try {
      await updateVipRequestStatus(req.id, 'approved');
      
      // If matches local client request, mark client local storage as approved
      const localReqJson = localStorage.getItem('cyber_vip_pending_request');
      if (localReqJson) {
        try {
          const localReq: VipRequest = JSON.parse(localReqJson);
          if (localReq.id === req.id || localReq.utr === req.utr) {
            localReq.status = 'approved';
            localStorage.setItem('cyber_vip_pending_request', JSON.stringify(localReq));
            localStorage.setItem('cyber_ad_free_vip', 'true');
            localStorage.setItem('cyber_vip_utr', req.utr);
            if (onVipApprovedLocally) onVipApprovedLocally();
          }
        } catch (e) {}
      }

      setRequests(prev => prev.map(r => r.id === req.id ? { ...r, status: 'approved' } : r));
    } catch (err) {
      alert('Error updating status. Please try again.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReject = async (req: VipRequest) => {
    if (!confirm(`Are you sure you want to reject VIP request from ${req.name} (UTR: ${req.utr})?`)) return;

    setActionLoadingId(req.id);
    try {
      await updateVipRequestStatus(req.id, 'rejected');
      
      // Update local storage if matched
      const localReqJson = localStorage.getItem('cyber_vip_pending_request');
      if (localReqJson) {
        try {
          const localReq: VipRequest = JSON.parse(localReqJson);
          if (localReq.id === req.id || localReq.utr === req.utr) {
            localReq.status = 'rejected';
            localStorage.setItem('cyber_vip_pending_request', JSON.stringify(localReq));
            localStorage.setItem('cyber_ad_free_vip', 'false');
          }
        } catch (e) {}
      }

      setRequests(prev => prev.map(r => r.id === req.id ? { ...r, status: 'rejected' } : r));
    } catch (err) {
      alert('Error rejecting request.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleSaveWebhook = () => {
    localStorage.setItem('cyber_gsheet_webhook_url', webhookUrl.trim());
    setWebhookSaved(true);
    setTimeout(() => setWebhookSaved(false), 2500);
  };

  const handleExportCsv = () => {
    if (requests.length === 0) {
      alert('No payment records to export yet.');
      return;
    }

    const headers = ['Name', 'Number', 'UTR / Transaction ID', 'Plan', 'Amount (INR)', 'Status', 'Date Submitted'];
    const rows = requests.map(r => [
      `"${r.name.replace(/"/g, '""')}"`,
      `"${r.number}"`,
      `"${r.utr}"`,
      `"${r.plan}"`,
      r.amount,
      `"${r.status}"`,
      `"${new Date(r.createdAt).toLocaleString()}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `CyberVIP_Payments_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const googleAppsScriptCode = `function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = JSON.parse(e.postData.contents);
  sheet.appendRow([data.name, data.number, data.utr, data.amount, data.plan, data.status, data.date]);
  return ContentService.createTextOutput(JSON.stringify({result: "success"})).setMimeType(ContentService.MimeType.JSON);
}`;

  const handleCopyScript = () => {
    navigator.clipboard.writeText(googleAppsScriptCode);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  const filteredRequests = requests.filter(r => 
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.number.includes(searchQuery) ||
    r.utr.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fade-in" id="admin-vip-modal">
      <div className="relative w-full max-w-3xl rounded-2xl bg-[#090b1c] border-2 border-cyan-500/60 p-4 sm:p-6 shadow-[0_0_50px_rgba(0,243,255,0.25)] flex flex-col max-h-[92vh] overflow-y-auto custom-scrollbar">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-[#141530] text-slate-400 hover:text-white border border-slate-700/60 hover:border-slate-500 transition-colors cursor-pointer"
          title="Close Admin Panel"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-cyan-500/20 border border-cyan-400/60 text-cyan-300">
            <ShieldAlert className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[10px] font-mono uppercase tracking-widest font-bold">
              OWNER / ADMIN ACCESS
            </div>
            <h2 className="cyber-font text-lg sm:text-2xl font-black text-white tracking-wide">
              VIP PAYMENT APPROVAL PANEL
            </h2>
          </div>
        </div>

        {/* PIN Security Gate if Not Authenticated */}
        {!isAuthenticated ? (
          <div className="p-6 rounded-2xl bg-[#0f112e] border border-cyan-500/40 text-center my-6 max-w-md mx-auto w-full">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/20 border border-cyan-400 text-cyan-300 flex items-center justify-center mx-auto mb-3">
              <Key className="w-6 h-6" />
            </div>
            <h3 className="cyber-font text-lg font-bold text-white mb-1">ENTER ADMIN PIN</h3>
            <p className="text-xs font-mono text-slate-400 mb-4">
              Enter the admin security PIN (PIN: <span className="text-cyan-300 font-bold">99322</span>) or sign in as dip92599@gmail.com
            </p>

            <form onSubmit={handlePinSubmit} className="space-y-3">
              <input
                type="password"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="Enter PIN (e.g. 99322)"
                className="w-full px-4 py-2.5 rounded-xl bg-[#070814] border border-cyan-500/50 text-white font-mono text-center text-lg tracking-widest outline-none focus:border-cyan-400"
                autoFocus
              />
              {pinError && (
                <div className="text-red-400 text-xs font-mono">
                  Incorrect PIN. Please enter PIN 99322.
                </div>
              )}
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-extrabold text-sm font-mono tracking-wider transition-all cursor-pointer"
              >
                UNLOCK ADMIN PANEL
              </button>
            </form>
          </div>
        ) : (
          <>
            {/* Action Bar: Search, Reload, Export to Google Sheets */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 mb-4">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by Name, Number, or UTR..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#0f112e] border border-slate-700/80 text-white font-mono text-xs outline-none focus:border-cyan-400"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={loadRequests}
                  disabled={isLoading}
                  className="p-2 rounded-xl bg-[#0f112e] hover:bg-[#15183d] border border-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer"
                  title="Refresh Payments"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-cyan-400' : ''}`} />
                </button>

                <button
                  onClick={handleExportCsv}
                  className="px-3 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/60 text-emerald-300 text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                  title="Download CSV for Google Sheets"
                >
                  <Download className="w-4 h-4" />
                  <span>EXPORT FOR GOOGLE SHEETS</span>
                </button>

                <a
                  href="https://docs.google.com/spreadsheets/"
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-2 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 border border-blue-400/60 text-blue-300 text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                  title="Open Google Sheets"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>OPEN SHEETS</span>
                </a>
              </div>
            </div>

            {/* Google Sheet Webhook Sync Configuration Accordion */}
            <div className="p-3 rounded-xl bg-[#0f112e] border border-slate-800 mb-4 text-xs font-mono">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-cyan-300 flex items-center gap-1.5 uppercase">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                  Google Sheet Webhook Sync (গুগল শিট লিঙ্ক)
                </span>
                <span className="text-[10px] text-slate-400">Save data automatically</span>
              </div>
              
              <div className="flex gap-2 mb-2">
                <input
                  type="url"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  placeholder="https://script.google.com/macros/s/.../exec (Paste Google Apps Script URL)"
                  className="flex-1 px-3 py-1.5 rounded-lg bg-[#070814] border border-slate-700 text-white font-mono text-xs outline-none focus:border-cyan-400"
                />
                <button
                  onClick={handleSaveWebhook}
                  className="px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400 text-cyan-300 font-bold cursor-pointer"
                >
                  {webhookSaved ? 'SAVED!' : 'SAVE LINK'}
                </button>
              </div>

              <details className="text-[11px] text-slate-400">
                <summary className="cursor-pointer text-cyan-400 hover:underline">
                  View easy 4-line Google Apps Script code for your Google Sheet
                </summary>
                <div className="mt-2 p-2.5 rounded bg-[#060712] border border-slate-800">
                  <div className="flex items-center justify-between mb-1 text-[10px] text-slate-400">
                    <span>Code.gs inside your Google Sheet Extensions ➔ Apps Script:</span>
                    <button
                      onClick={handleCopyScript}
                      className="flex items-center gap-1 text-cyan-300 hover:text-white"
                    >
                      {copiedScript ? <CheckCheck className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedScript ? 'COPIED!' : 'COPY CODE'}</span>
                    </button>
                  </div>
                  <pre className="text-[10px] text-amber-300 font-mono overflow-x-auto whitespace-pre">
                    {googleAppsScriptCode}
                  </pre>
                </div>
              </details>
            </div>

            {/* Requests Table / Cards */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400 px-1">
                <span>TOTAL SUBMISSIONS: {filteredRequests.length}</span>
                <span>PENDING APPROVAL: {filteredRequests.filter(r => r.status === 'pending').length}</span>
              </div>

              {filteredRequests.length === 0 ? (
                <div className="p-8 text-center bg-[#0d0e26] rounded-xl border border-slate-800/80">
                  <Clock className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                  <div className="text-sm font-mono text-slate-300 font-bold">No VIP payment submissions found</div>
                  <p className="text-xs font-mono text-slate-500 mt-1">
                    When players submit their Name, Number, and UTR, they will appear here awaiting your approval.
                  </p>
                </div>
              ) : (
                filteredRequests.map((req) => {
                  const cleanPhone = req.number.replace(/\D/g, '');
                  const waLink = `https://wa.me/91${cleanPhone.length === 10 ? cleanPhone : cleanPhone.slice(-10)}?text=${encodeURIComponent(`Hello ${req.name}, regarding your Cyber VIP request for UTR: ${req.utr}`)}`;

                  return (
                    <div
                      key={req.id}
                      className={`p-3.5 sm:p-4 rounded-xl border transition-all ${
                        req.status === 'pending'
                          ? 'bg-[#151738] border-amber-400/60 shadow-[0_0_15px_rgba(251,191,36,0.15)]'
                          : req.status === 'approved'
                          ? 'bg-[#0f1b26] border-emerald-500/50'
                          : 'bg-[#1c0f16] border-red-500/40'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-800">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm sm:text-base font-bold text-white font-mono">{req.name}</span>
                            <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-extrabold uppercase ${
                              req.status === 'pending'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-400/50 animate-pulse'
                                : req.status === 'approved'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/50'
                                : 'bg-red-500/20 text-red-300 border border-red-400/50'
                            }`}>
                              {req.status}
                            </span>
                          </div>
                          <div className="text-[11px] font-mono text-slate-400">
                            Submitted: {new Date(req.createdAt).toLocaleString()}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-sm font-mono font-extrabold text-amber-300 bg-amber-500/10 px-2 py-1 rounded border border-amber-500/30">
                            ₹{req.amount} ({req.plan})
                          </span>
                        </div>
                      </div>

                      {/* Detail Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono mb-3">
                        <div className="bg-[#0b0c1e] p-2 rounded border border-slate-800 flex items-center justify-between">
                          <div>
                            <span className="text-[10px] text-slate-500 block uppercase">Phone / Mobile</span>
                            <span className="text-white font-bold tracking-wider">{req.number}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <a
                              href={`tel:${req.number}`}
                              className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300"
                              title="Call Customer"
                            >
                              <Phone className="w-3.5 h-3.5" />
                            </a>
                            <a
                              href={waLink}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1 rounded bg-emerald-900/50 hover:bg-emerald-800 text-emerald-300 border border-emerald-500/40"
                              title="WhatsApp Message"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        </div>

                        <div className="bg-[#0b0c1e] p-2 rounded border border-slate-800">
                          <span className="text-[10px] text-slate-500 block uppercase">12-Digit UTR / Transaction ID</span>
                          <span className="text-amber-300 font-bold font-mono tracking-wider">{req.utr}</span>
                        </div>
                      </div>

                      {/* Action Buttons for Admin */}
                      <div className="flex items-center justify-end gap-2 pt-1">
                        {req.status === 'pending' ? (
                          <>
                            <button
                              onClick={() => handleReject(req)}
                              disabled={actionLoadingId === req.id}
                              className="px-3 py-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/50 border border-red-500/50 text-red-300 text-xs font-mono font-bold transition-all cursor-pointer disabled:opacity-50"
                            >
                              REJECT
                            </button>
                            <button
                              onClick={() => handleApprove(req)}
                              disabled={actionLoadingId === req.id}
                              className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-mono font-black transition-all cursor-pointer flex items-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.3)] disabled:opacity-50"
                            >
                              {actionLoadingId === req.id ? (
                                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              )}
                              <span>APPROVE VIP (STOP ADS)</span>
                            </button>
                          </>
                        ) : req.status === 'approved' ? (
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono text-emerald-400 flex items-center gap-1 font-bold">
                              <CheckCircle2 className="w-3.5 h-3.5" /> APPROVED • ADS BLOCKED
                            </span>
                            <button
                              onClick={() => handleReject(req)}
                              className="text-[10px] font-mono text-slate-500 hover:text-red-400 underline cursor-pointer"
                            >
                              Revoke
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono text-red-400 flex items-center gap-1 font-bold">
                              <XCircle className="w-3.5 h-3.5" /> REJECTED
                            </span>
                            <button
                              onClick={() => handleApprove(req)}
                              className="text-[10px] font-mono text-slate-500 hover:text-emerald-400 underline cursor-pointer"
                            >
                              Re-Approve
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </>
        )}

      </div>
    </div>
  );
};
