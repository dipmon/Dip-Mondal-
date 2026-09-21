import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import QRCode from 'qrcode';
import { 
  X, 
  Crown, 
  ShieldCheck, 
  Sparkles, 
  Copy, 
  CheckCheck, 
  QrCode, 
  Smartphone, 
  CheckCircle2, 
  RefreshCw, 
  AlertCircle,
  ExternalLink,
  Lock,
  ArrowRight,
  Clock,
  MessageSquare,
  FileSpreadsheet
} from 'lucide-react';
import { VipRequest } from '../types';
import { submitVipRequest, checkVipRequestStatus } from '../firebase';

interface SubscriptionModalProps {
  isOpen: boolean;
  isAdFree: boolean;
  onToggleAdFree: (enable: boolean) => void;
  onClose: () => void;
  onOpenAdminPanel?: () => void;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  isOpen,
  isAdFree,
  onToggleAdFree,
  onClose,
  onOpenAdminPanel,
}) => {
  const [selectedPlan, setSelectedPlan] = useState<'lifetime' | 'monthly'>('lifetime');
  const [paymentMethodTab, setPaymentMethodTab] = useState<'apps' | 'qr' | 'manual'>('apps');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Form Inputs
  const [customerName, setCustomerName] = useState('');
  const [customerNumber, setCustomerNumber] = useState('');
  const [utrNumber, setUtrNumber] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');

  // Pending request from localStorage if any
  const [pendingRequest, setPendingRequest] = useState<VipRequest | null>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('cyber_vip_pending_request');
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch (e) {}
      }
    }
    return null;
  });

  // Payment Recipient Config
  const PAYEE_PHONE = '8116263478';
  const PAYEE_UPI_ID = '8116263478@upi';

  const PLAN_AMOUNTS = {
    lifetime: 99, // INR
    monthly: 49,  // INR
  };

  const currentAmount = PLAN_AMOUNTS[selectedPlan];
  const upiIntentUri = `upi://pay?pa=${PAYEE_UPI_ID}&pn=CYBER%20VIP&am=${currentAmount}&cu=INR&tn=Cyber%20VIP%20Pass`;

  // Generate UPI QR Code whenever plan changes
  useEffect(() => {
    let isMounted = true;
    QRCode.toDataURL(upiIntentUri, {
      width: 280,
      margin: 1.5,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
    })
      .then((url) => {
        if (isMounted) setQrCodeDataUrl(url);
      })
      .catch((err) => {
        console.error('Failed to generate UPI QR Code', err);
      });

    return () => {
      isMounted = false;
    };
  }, [upiIntentUri]);

  // Check pending request status automatically when modal is opened
  useEffect(() => {
    if (isOpen && pendingRequest && pendingRequest.status === 'pending') {
      handleCheckStatus(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopy = (text: string, fieldKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldKey);
    setTimeout(() => {
      setCopiedField(null);
    }, 2500);
  };

  // Submit payment details for Admin Review & Approval
  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setStatusMessage(null);

    const name = customerName.trim();
    const phone = customerNumber.trim();
    const cleanUtr = utrNumber.trim();

    if (!name) {
      setErrorMessage('অনুগ্রহ করে আপনার নাম লিখুন। (Please enter your name)');
      return;
    }

    if (!phone || phone.replace(/\D/g, '').length < 10) {
      setErrorMessage('সঠিক ১০ সংখ্যার মোবাইল নম্বর লিখুন। (Please enter a valid 10-digit mobile number)');
      return;
    }

    if (!cleanUtr || cleanUtr.length < 8) {
      setErrorMessage('অনুগ্রহ করে পেমেন্টের সঠিক ১২ সংখ্যার UTR বা Transaction ID লিখুন। (Please enter valid 12-digit UTR)');
      return;
    }

    setIsSubmitting(true);

    const requestId = `req_${cleanUtr}`;
    const newRequest: VipRequest = {
      id: requestId,
      userId: typeof window !== 'undefined' ? (localStorage.getItem('cyber_user_id') || `anon_${Date.now()}`) : 'anon',
      name,
      number: phone,
      utr: cleanUtr,
      plan: selectedPlan,
      amount: currentAmount,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    try {
      await submitVipRequest(newRequest);

      // Save pending request in local storage
      localStorage.setItem('cyber_vip_pending_request', JSON.stringify(newRequest));
      setPendingRequest(newRequest);
      setStatusMessage('আপনার পেমেন্ট রিকোয়েস্ট সফলভাবে জমা হয়েছে! অ্যাডমিন ভেরিফাই করে Approve করার পর Ads বন্ধ হবে।');
    } catch (err) {
      // Offline fallback: save locally anyway so user can show it or check later
      localStorage.setItem('cyber_vip_pending_request', JSON.stringify(newRequest));
      setPendingRequest(newRequest);
      setStatusMessage('আপনার পেমেন্ট রিকোয়েস্ট লোকালি সেভ হয়েছে এবং অ্যাডমিনের কাছে পাঠানো হয়েছে।');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check if Admin approved the request
  const handleCheckStatus = async (showFeedback = true) => {
    if (!pendingRequest) return;
    setIsCheckingStatus(true);
    setStatusMessage(null);

    try {
      const liveReq = await checkVipRequestStatus(pendingRequest.id);
      
      // Check if approved in Firestore
      if (liveReq && liveReq.status === 'approved') {
        const approvedReq: VipRequest = { ...pendingRequest, status: 'approved', approvedAt: liveReq.approvedAt };
        localStorage.setItem('cyber_vip_pending_request', JSON.stringify(approvedReq));
        localStorage.setItem('cyber_vip_utr', approvedReq.utr);
        localStorage.setItem('cyber_vip_plan', approvedReq.plan);
        localStorage.setItem('cyber_vip_amount', approvedReq.amount.toString());
        setPendingRequest(approvedReq);
        onToggleAdFree(true);

        confetti({
          particleCount: 120,
          spread: 100,
          origin: { y: 0.5 },
          colors: ['#fbbf24', '#00f3ff', '#10b981', '#ffffff'],
        });

        if (showFeedback) {
          setStatusMessage('অভিনন্দন! আপনার পেমেন্ট অ্যাডমিন কর্তৃক Approved হয়েছে। সমস্ত Ads চিরতরে বন্ধ করা হলো!');
        }
      } else if (liveReq && liveReq.status === 'rejected') {
        const rejectedReq: VipRequest = { ...pendingRequest, status: 'rejected' };
        localStorage.setItem('cyber_vip_pending_request', JSON.stringify(rejectedReq));
        setPendingRequest(rejectedReq);
        if (showFeedback) {
          setErrorMessage('অ্যাডমিন আপনার রিকোয়েস্টটি বাতিল করেছেন। অনুগ্রহ করে সঠিক UTR সহ আবার সাবমিট করুন বা অ্যাডমিনের সাথে যোগাযোগ করুন।');
        }
      } else {
        if (showFeedback) {
          setStatusMessage('আপনার রিকোয়েস্ট এখনও অ্যাডমিন পর্যালোচনায় রয়েছে (Pending Approval)। অ্যাডমিন (8116263478) চেক করে অ্যাপ্রুভ করলেই চালু হবে।');
        }
      }
    } catch (e) {
      if (showFeedback) {
        setStatusMessage('স্ট্যাটাস চেক করা যাচ্ছে না। অনুগ্রহ করে কিছুক্ষণ পর আবার চেষ্টা করুন।');
      }
    } finally {
      setIsCheckingStatus(false);
    }
  };

  const handleResetRequest = () => {
    if (confirm('আপনি কি নতুন করে পেমেন্ট ডিটেইলস সাবমিট করতে চান? (Submit new payment details?)')) {
      localStorage.removeItem('cyber_vip_pending_request');
      setPendingRequest(null);
      setErrorMessage(null);
      setStatusMessage(null);
      setUtrNumber('');
    }
  };

  const existingUtr = typeof window !== 'undefined' ? localStorage.getItem('cyber_vip_utr') : null;
  const existingPlan = typeof window !== 'undefined' ? localStorage.getItem('cyber_vip_plan') : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in" id="subscription-modal">
      <div className="relative w-full max-w-lg rounded-2xl bg-[#0b0c20] border-2 border-amber-400/60 p-4 sm:p-6 shadow-[0_0_50px_rgba(251,191,36,0.3)] flex flex-col max-h-[94vh] overflow-y-auto custom-scrollbar">
        
        {/* Glow Flares */}
        <div className="absolute -top-20 -left-20 w-44 h-44 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-44 h-44 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 p-2 rounded-xl bg-[#141530] text-slate-400 hover:text-white border border-slate-700/60 hover:border-slate-500 transition-colors cursor-pointer"
          title="Close Modal"
          id="close-subscription-btn"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Badge */}
        <div className="flex items-center gap-2.5 mb-2">
          <div className="p-2 sm:p-2.5 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/30 border border-amber-400/60 text-amber-300 shrink-0">
            <Crown className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-mono uppercase tracking-widest font-bold">
              <Sparkles className="w-3 h-3" />
              CYBER VIP • REAL MONEY PAYMENT
            </div>
            <h2 className="cyber-font text-lg sm:text-2xl font-black text-white tracking-wide">
              {isAdFree ? 'VIP PROTOCOL ACTIVE' : 'REMOVE ALL ADS (ADMIN APPROVAL)'}
            </h2>
          </div>
        </div>

        {/* Subtitle / Note */}
        <p className="text-xs font-mono text-slate-300 mb-4 leading-relaxed">
          {isAdFree 
            ? 'পেমেন্ট অনুমোদিত হয়েছে! সমস্ত বিজ্ঞাপন বন্ধ রয়েছে। (Payment approved by Admin! Ads disabled).'
            : 'পেমেন্ট করার পর আপনার Name, Mobile Number ও ১২ ডিজিটের UTR কোড পাঠান। অ্যাডমিন (8116263478) চেক করে Approve করার পর Ads চিরতরে বন্ধ হবে।'}
        </p>

        {/* CASE 1: ALREADY APPROVED & ACTIVE */}
        {isAdFree ? (
          <div className="space-y-4 mb-2">
            <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/40 via-[#101c2e] to-emerald-950/40 border-2 border-emerald-500/60 text-center shadow-[0_0_20px_rgba(16,185,129,0.2)]">
              <div className="inline-flex items-center gap-2 text-emerald-400 font-bold font-mono text-sm mb-1.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>CYBER VIP AD-FREE ACTIVE (APPROVED)</span>
              </div>
              <p className="text-xs font-mono text-slate-200">
                All banners, popunders, and social bar ads are 100% permanently blocked.
              </p>

              <div className="mt-3.5 pt-3 border-t border-emerald-500/30 grid grid-cols-2 gap-2 text-left font-mono text-xs">
                <div className="bg-[#0b1424] p-2 rounded border border-emerald-500/30">
                  <span className="text-[10px] text-slate-400 block uppercase">Payee</span>
                  <span className="text-white font-bold">{PAYEE_PHONE}</span>
                </div>
                <div className="bg-[#0b1424] p-2 rounded border border-emerald-500/30">
                  <span className="text-[10px] text-slate-400 block uppercase">Plan Status</span>
                  <span className="text-emerald-300 font-bold uppercase">{existingPlan || 'Lifetime Pass'}</span>
                </div>
                {existingUtr && (
                  <div className="col-span-2 bg-[#0b1424] p-2 rounded border border-emerald-500/30">
                    <span className="text-[10px] text-slate-400 block uppercase">Verified Transaction UTR</span>
                    <span className="text-amber-300 font-bold tracking-wider">{existingUtr}</span>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-sm cyber-font tracking-wider shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>RETURN TO GAME (NO ADS)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : pendingRequest && pendingRequest.status === 'pending' ? (
          /* CASE 2: PAYMENT SUBMITTED, WAITING FOR ADMIN APPROVAL ("Ami aprove na korle vip aprove hobe na") */
          <div className="space-y-4 mb-2 animate-fade-in">
            <div className="p-4 rounded-xl bg-gradient-to-r from-amber-950/40 via-[#191b3b] to-amber-950/40 border-2 border-amber-400/70 shadow-[0_0_25px_rgba(251,191,36,0.2)]">
              <div className="flex items-center justify-between mb-2">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/60 text-xs font-mono font-bold animate-pulse">
                  <Clock className="w-3.5 h-3.5" />
                  STATUS: PENDING ADMIN APPROVAL
                </div>
                <span className="text-xs font-mono font-bold text-amber-300">
                  ₹{pendingRequest.amount}
                </span>
              </div>

              <p className="text-xs font-mono text-slate-300 mb-3 leading-relaxed">
                আপনার পেমেন্ট রিকোয়েস্ট অ্যাডমিনের কাছে জমা রয়েছে। অ্যাডমিন <strong className="text-white">8116263478</strong> চেক করে Approve করলেই আপনার VIP এক্টিভ হবে এবং Ads বন্ধ হবে।
              </p>

              {/* Submitted Details Box */}
              <div className="space-y-2 bg-[#0a0b1c] p-3 rounded-xl border border-slate-800 text-xs font-mono">
                <div className="flex justify-between border-b border-slate-800/80 pb-1.5">
                  <span className="text-slate-400">Name (নাম):</span>
                  <span className="text-white font-bold">{pendingRequest.name}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800/80 pb-1.5">
                  <span className="text-slate-400">Mobile (নম্বর):</span>
                  <span className="text-cyan-300 font-bold">{pendingRequest.number}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800/80 pb-1.5">
                  <span className="text-slate-400">UTR / Txn ID:</span>
                  <span className="text-amber-300 font-bold">{pendingRequest.utr}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Plan:</span>
                  <span className="text-emerald-400 font-bold uppercase">{pendingRequest.plan}</span>
                </div>
              </div>

              {/* Feedback messages */}
              {statusMessage && (
                <div className="mt-3 p-2.5 rounded-lg bg-cyan-950/40 border border-cyan-500/50 text-cyan-300 font-mono text-xs">
                  {statusMessage}
                </div>
              )}

              {errorMessage && (
                <div className="mt-3 p-2.5 rounded-lg bg-red-950/40 border border-red-500/50 text-red-300 font-mono text-xs">
                  {errorMessage}
                </div>
              )}

              {/* Actions: Check Status & WhatsApp */}
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleCheckStatus(true)}
                  disabled={isCheckingStatus}
                  className="py-2.5 px-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs font-mono tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(0,243,255,0.3)] disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isCheckingStatus ? 'animate-spin' : ''}`} />
                  <span>{isCheckingStatus ? 'CHECKING...' : 'CHECK APPROVAL STATUS'}</span>
                </button>

                <a
                  href={`https://wa.me/918116263478?text=${encodeURIComponent(`Hello Admin, I have submitted Cyber VIP payment of ₹${pendingRequest.amount}. Name: ${pendingRequest.name}, Phone: ${pendingRequest.number}, UTR: ${pendingRequest.utr}. Please approve.`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="py-2.5 px-3 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-500/60 text-emerald-300 font-bold text-xs font-mono transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                  <span>WHATSAPP ADMIN</span>
                </a>
              </div>

              <div className="mt-3 text-center">
                <button
                  type="button"
                  onClick={handleResetRequest}
                  className="text-[11px] font-mono text-slate-500 hover:text-slate-300 underline cursor-pointer"
                >
                  Edit details / Submit another UTR
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* CASE 3: NEW PAYMENT FLOW */
          <>
            {/* Plan Selector with Real INR Pricing */}
            <div className="grid grid-cols-2 gap-2.5 mb-4">
              {/* Lifetime Pass */}
              <button
                type="button"
                onClick={() => setSelectedPlan('lifetime')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer relative ${
                  selectedPlan === 'lifetime'
                    ? 'bg-[#181a42] border-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.3)] ring-1 ring-amber-400'
                    : 'bg-[#11122a] border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="absolute -top-2.5 right-2 px-1.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-black font-extrabold text-[9px] uppercase tracking-wider">
                  BEST VALUE
                </div>
                <div className="text-[10px] font-mono text-amber-400 uppercase font-bold tracking-wider mb-0.5">
                  LIFETIME VIP
                </div>
                <div className="text-xl font-black font-mono text-white mb-0.5">
                  ₹99 <span className="text-[10px] text-slate-400 font-normal">one-time</span>
                </div>
                <p className="text-[10px] text-slate-400 font-mono">Permanent ad removal for all 1000 sectors</p>
              </button>

              {/* Monthly Pass */}
              <button
                type="button"
                onClick={() => setSelectedPlan('monthly')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer relative ${
                  selectedPlan === 'monthly'
                    ? 'bg-[#181a42] border-cyan-400 shadow-[0_0_15px_rgba(0,243,255,0.2)] ring-1 ring-cyan-400'
                    : 'bg-[#11122a] border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="text-[10px] font-mono text-cyan-400 uppercase font-bold tracking-wider mb-0.5">
                  MONTHLY PASS
                </div>
                <div className="text-xl font-black font-mono text-white mb-0.5">
                  ₹49 <span className="text-[10px] text-slate-400 font-normal">/ month</span>
                </div>
                <p className="text-[10px] text-slate-400 font-mono">30-day full ad-free gameplay access</p>
              </button>
            </div>

            {/* Recipient Details Card - 8116263478 */}
            <div className="p-3 sm:p-3.5 rounded-xl bg-gradient-to-r from-cyan-950/40 via-[#121330] to-cyan-950/40 border border-cyan-400/50 mb-4 shadow-[0_0_15px_rgba(0,243,255,0.15)]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-mono font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5" />
                  PAYMENT NUMBER / UPI ID
                </span>
                <span className="text-[11px] font-mono font-extrabold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded border border-amber-400/40">
                  AMOUNT: ₹{currentAmount}
                </span>
              </div>

              {/* Number Copy Box */}
              <div className="flex items-center justify-between bg-[#0a0b1c] p-2.5 rounded-lg border border-slate-700/80 mb-2">
                <div>
                  <span className="text-[9px] font-mono text-slate-400 uppercase block">Phone / Payee Number</span>
                  <span className="text-base sm:text-lg font-black font-mono text-white tracking-widest">{PAYEE_PHONE}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(PAYEE_PHONE, 'phone')}
                  className="px-2.5 py-1.5 rounded-md bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/60 text-cyan-300 text-xs font-mono font-bold flex items-center gap-1 transition-all cursor-pointer"
                  title="Copy Phone Number"
                >
                  {copiedField === 'phone' ? <CheckCheck className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedField === 'phone' ? 'COPIED!' : 'COPY'}</span>
                </button>
              </div>

              {/* UPI ID Copy Box */}
              <div className="flex items-center justify-between bg-[#0a0b1c] p-2 rounded-lg border border-slate-700/80">
                <div className="truncate pr-2">
                  <span className="text-[9px] font-mono text-slate-400 uppercase block">UPI ID (PhonePe / GPay / Paytm)</span>
                  <span className="text-xs sm:text-sm font-bold font-mono text-cyan-300 tracking-wider truncate">{PAYEE_UPI_ID}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(PAYEE_UPI_ID, 'upi')}
                  className="px-2.5 py-1 rounded-md bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/60 text-cyan-300 text-xs font-mono font-bold flex items-center gap-1 transition-all cursor-pointer shrink-0"
                  title="Copy UPI ID"
                >
                  {copiedField === 'upi' ? <CheckCheck className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedField === 'upi' ? 'COPIED!' : 'COPY'}</span>
                </button>
              </div>
            </div>

            {/* Payment Mode Selector Tabs */}
            <div className="flex rounded-xl bg-[#0f1026] p-1 border border-slate-800 mb-3">
              <button
                type="button"
                onClick={() => setPaymentMethodTab('apps')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  paymentMethodTab === 'apps'
                    ? 'bg-amber-500/25 border border-amber-400 text-amber-300 shadow-[0_0_10px_rgba(251,191,36,0.2)]'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>UPI APPS</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethodTab('qr')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  paymentMethodTab === 'qr'
                    ? 'bg-amber-500/25 border border-amber-400 text-amber-300 shadow-[0_0_10px_rgba(251,191,36,0.2)]'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>SCAN QR</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethodTab('manual')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  paymentMethodTab === 'manual'
                    ? 'bg-amber-500/25 border border-amber-400 text-amber-300 shadow-[0_0_10px_rgba(251,191,36,0.2)]'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Lock className="w-3.5 h-3.5" />
                <span>SUBMIT DETAILS</span>
              </button>
            </div>

            {/* Tab 1: UPI App Direct Click Buttons */}
            {paymentMethodTab === 'apps' && (
              <div className="space-y-2 mb-4 animate-fade-in">
                <div className="text-[11px] font-mono text-slate-300 mb-1">
                  ফোনের যেকোনো অ্যাপ দিয়ে সরাসরি পেমেন্ট করুন:
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <a
                    href={upiIntentUri}
                    className="p-2.5 rounded-xl bg-[#5f259f]/30 hover:bg-[#5f259f]/50 border border-[#5f259f] text-white font-mono text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-sm hover:scale-[1.02]"
                    title="Pay with PhonePe"
                  >
                    <div className="w-7 h-7 rounded-lg bg-[#5f259f] flex items-center justify-center text-white font-black text-sm shrink-0">
                      पे
                    </div>
                    <div>
                      <div className="leading-tight font-bold">PhonePe</div>
                      <span className="text-[10px] text-purple-300 font-normal">Pay ₹{currentAmount}</span>
                    </div>
                  </a>

                  <a
                    href={upiIntentUri}
                    className="p-2.5 rounded-xl bg-blue-950/40 hover:bg-blue-900/40 border border-blue-500/70 text-white font-mono text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-sm hover:scale-[1.02]"
                    title="Pay with Google Pay"
                  >
                    <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-sm shrink-0">
                      G
                    </div>
                    <div>
                      <div className="leading-tight font-bold">Google Pay</div>
                      <span className="text-[10px] text-blue-300 font-normal">Pay ₹{currentAmount}</span>
                    </div>
                  </a>

                  <a
                    href={upiIntentUri}
                    className="p-2.5 rounded-xl bg-sky-950/40 hover:bg-sky-900/40 border border-sky-400/70 text-white font-mono text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-sm hover:scale-[1.02]"
                    title="Pay with Paytm"
                  >
                    <div className="w-7 h-7 rounded-lg bg-[#002e6e] flex items-center justify-center text-sky-300 font-black text-xs shrink-0">
                      Pay
                    </div>
                    <div>
                      <div className="leading-tight font-bold">Paytm</div>
                      <span className="text-[10px] text-sky-300 font-normal">Pay ₹{currentAmount}</span>
                    </div>
                  </a>

                  <a
                    href={upiIntentUri}
                    className="p-2.5 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/40 border border-emerald-500/70 text-white font-mono text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-sm hover:scale-[1.02]"
                    title="Pay with Any UPI App"
                  >
                    <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-black text-xs shrink-0">
                      UPI
                    </div>
                    <div>
                      <div className="leading-tight font-bold">Any UPI App</div>
                      <span className="text-[10px] text-emerald-300 font-normal">BHIM / Cred</span>
                    </div>
                  </a>
                </div>
              </div>
            )}

            {/* Tab 2: Scan QR Code View */}
            {paymentMethodTab === 'qr' && (
              <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-[#0e1026] border border-slate-800 mb-4 animate-fade-in text-center">
                <div className="text-xs font-mono text-slate-300 mb-2">
                  যেকোনো ফোন বা ক্যামেরা দিয়ে QR কোড স্ক্যান করে পেমেন্ট করুন:
                </div>

                {qrCodeDataUrl ? (
                  <div className="p-3 bg-white rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.2)] border-2 border-cyan-400/80">
                    <img 
                      src={qrCodeDataUrl} 
                      alt="UPI QR Code" 
                      className="w-44 h-44 sm:w-48 sm:h-48 object-contain"
                    />
                  </div>
                ) : (
                  <div className="w-44 h-44 bg-slate-800 rounded-xl flex items-center justify-center text-xs font-mono text-slate-400">
                    Generating QR Code...
                  </div>
                )}

                <div className="mt-2.5 flex items-center gap-2 text-xs font-mono font-bold text-amber-300">
                  <span>AMOUNT: ₹{currentAmount}</span>
                  <span>•</span>
                  <span>TO: {PAYEE_PHONE}</span>
                </div>
              </div>
            )}

            {/* Form: Name, Number, UTR submission */}
            <form onSubmit={handleSubmitPayment} className="space-y-3 pt-2 border-t border-slate-800/80">
              <div className="flex items-center justify-between">
                <label className="text-xs font-mono font-bold text-amber-300 flex items-center gap-1.5 uppercase">
                  <Lock className="w-3.5 h-3.5" />
                  পেমেন্ট ডাটা সাবমিট করুন (Name, Number & UTR)
                </label>
                <span className="text-[10px] font-mono text-slate-400">Admin Verification</span>
              </div>

              {/* Name Input */}
              <div>
                <label className="text-[11px] font-mono text-slate-300 block mb-1">
                  Name (আপনার পুরো নাম) <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="যেমন: Rahul Sen"
                  className="w-full px-3.5 py-2 rounded-xl bg-[#090a18] border border-cyan-500/40 focus:border-cyan-400 text-white font-mono text-xs outline-none focus:shadow-[0_0_15px_rgba(0,243,255,0.2)] transition-all"
                  required
                />
              </div>

              {/* Mobile Number Input */}
              <div>
                <label className="text-[11px] font-mono text-slate-300 block mb-1">
                  Mobile Number (যে নম্বর থেকে পেমেন্ট করেছেন) <span className="text-red-400">*</span>
                </label>
                <input
                  type="tel"
                  value={customerNumber}
                  onChange={(e) => setCustomerNumber(e.target.value)}
                  placeholder="যেমন: 9876543210"
                  className="w-full px-3.5 py-2 rounded-xl bg-[#090a18] border border-cyan-500/40 focus:border-cyan-400 text-white font-mono text-xs outline-none focus:shadow-[0_0_15px_rgba(0,243,255,0.2)] transition-all"
                  required
                />
              </div>

              {/* UTR Number Input */}
              <div>
                <label className="text-[11px] font-mono text-slate-300 block mb-1">
                  12-Digit UTR / Transaction ID (রসিদের ইউটিআর কোড) <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={utrNumber}
                  onChange={(e) => {
                    setUtrNumber(e.target.value);
                    setErrorMessage(null);
                  }}
                  placeholder="যেমন: 426189234812"
                  className="w-full px-3.5 py-2 rounded-xl bg-[#090a18] border border-cyan-500/50 focus:border-cyan-400 text-white font-mono text-xs tracking-wider outline-none placeholder:text-slate-600 focus:shadow-[0_0_15px_rgba(0,243,255,0.25)] transition-all"
                  required
                />
              </div>

              {errorMessage && (
                <div className="p-2.5 rounded-lg bg-red-950/40 border border-red-500/60 text-red-300 font-mono text-xs flex items-start gap-2 animate-shake">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-black font-extrabold text-xs sm:text-sm cyber-font tracking-wider shadow-[0_0_20px_rgba(251,191,36,0.35)] transition-all cursor-pointer flex items-center justify-center gap-2 uppercase disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>SUBMITTING DATA FOR APPROVAL...</span>
                  </>
                ) : (
                  <>
                    <Crown className="w-4 h-4 fill-black" />
                    <span>SUBMIT FOR ADMIN APPROVAL</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-1">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                  অ্যাডমিন অ্যাপ্রুভ করলে সাথে সাথে Ads বন্ধ হবে
                </span>

                {onOpenAdminPanel && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenAdminPanel();
                    }}
                    className="text-cyan-400 hover:text-cyan-300 underline cursor-pointer"
                  >
                    Admin Login
                  </button>
                )}
              </div>
            </form>
          </>
        )}

      </div>
    </div>
  );
};
