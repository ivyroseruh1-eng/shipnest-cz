import React, { useState, useMemo } from "react";
import { Order } from "@/types";
import {
  generateOrderEmail,
  ALL_TRACKING_STEPS,
  TrackingStepName,
  GeneratedEmail,
} from "@/lib/orderEmailGenerator";
import {
  Mail,
  Send,
  Copy,
  Check,
  Download,
  ExternalLink,
  Code,
  Eye,
  Smartphone,
  Monitor,
  X,
  FileText,
  User,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";

interface OrderEmailModalProps {
  order: Order;
  initialStep?: string;
  onClose?: () => void;
  isInlineTab?: boolean;
}

export const OrderEmailModal: React.FC<OrderEmailModalProps> = ({
  order,
  initialStep,
  onClose,
  isInlineTab = false,
}) => {
  const [selectedStep, setSelectedStep] = useState<string>(
    initialStep || order.status || "Order Received"
  );
  const [viewMode, setViewMode] = useState<"preview" | "code" | "text">("preview");
  const [viewport, setViewport] = useState<"desktop" | "mobile">("desktop");
  const [copied, setCopied] = useState<"html" | "text" | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [sentSteps, setSentSteps] = useState<Set<string>>(new Set());

  // Generate dynamic email whenever order or step changes
  const generated: GeneratedEmail = useMemo(() => {
    return generateOrderEmail(order, selectedStep);
  }, [order, selectedStep]);

  const handleCopyHtml = () => {
    navigator.clipboard.writeText(generated.html);
    setCopied("html");
    toast.success("HTML Email code copied to clipboard!");
    setTimeout(() => setCopied(null), 2500);
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(generated.plainText);
    setCopied("text");
    toast.success("Plain text email copied to clipboard!");
    setTimeout(() => setCopied(null), 2500);
  };

  const handleDownloadHtml = () => {
    const blob = new Blob([generated.html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `shipnest-email-${order.orderId}-${selectedStep.toLowerCase().replace(/\s+/g, "-")}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("HTML email template downloaded!");
  };

  const handleOpenInNewWindow = () => {
    const win = window.open("", "_blank");
    if (win) {
      win.document.write(generated.html);
      win.document.close();
    }
  };

  const handleSendEmail = () => {
    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      setSentSteps((prev) => new Set(prev).add(selectedStep));
      toast.success(
        `Dispatched "${selectedStep}" notification to ${order.customer.email}`,
        {
          description: `Order #${order.orderId} · Tracking PIN: ${order.deliveryPin || "••••"}`,
        }
      );
    }, 900);
  };

  const containerContent = (
    <div className="space-y-5">
      {/* Step Selector Pills Bar */}
      <div>
        <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-2">
          Select Logistics Step to Notify Customer
        </label>
        <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-none">
          {ALL_TRACKING_STEPS.map((step) => {
            const isCurrent = selectedStep === step;
            const wasSent = sentSteps.has(step);
            return (
              <button
                key={step}
                type="button"
                onClick={() => setSelectedStep(step)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                  isCurrent
                    ? "bg-foreground text-background shadow-xs ring-1 ring-foreground"
                    : "bg-secondary/70 hover:bg-secondary text-muted-foreground hover:text-foreground border border-border/70"
                }`}
              >
                <span>{step}</span>
                {wasSent && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Email dispatched" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Recipient & Metadata Card */}
      <div className="bg-secondary/40 border border-border rounded-xl p-3.5 sm:p-4 text-xs space-y-2.5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-primary shrink-0" />
            <div>
              <span className="text-[10px] text-muted-foreground font-semibold uppercase block">Customer Recipient</span>
              <span className="font-bold text-foreground">{order.customer.name}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-primary shrink-0" />
            <div>
              <span className="text-[10px] text-muted-foreground font-semibold uppercase block">Email Address</span>
              <span className="font-mono text-foreground truncate block max-w-[200px]">{order.customer.email}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <div>
              <span className="text-[10px] text-muted-foreground font-semibold uppercase block">Doorstep Verification PIN</span>
              <span className="font-mono font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">{order.deliveryPin || "4829"}</span>
            </div>
          </div>
        </div>

        {/* Email Subject preview line */}
        <div className="pt-2 border-t border-border/60 flex items-center gap-2 text-xs">
          <span className="text-muted-foreground font-semibold text-[11px] shrink-0">Subject:</span>
          <span className="font-medium text-foreground truncate">{generated.subject}</span>
        </div>
      </div>

      {/* View Switcher & Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        {/* View Mode Switcher */}
        <div className="flex items-center bg-secondary/80 border border-border rounded-xl p-1 gap-1">
          <button
            type="button"
            onClick={() => setViewMode("preview")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              viewMode === "preview"
                ? "bg-foreground text-background shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Visual Preview</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode("code")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              viewMode === "code"
                ? "bg-foreground text-background shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>HTML Source</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode("text")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              viewMode === "text"
                ? "bg-foreground text-background shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Plain Text</span>
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center flex-wrap gap-2">
          {viewMode === "preview" && (
            <div className="flex items-center bg-secondary/60 border border-border rounded-xl p-0.5">
              <button
                type="button"
                onClick={() => setViewport("desktop")}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewport === "desktop" ? "bg-card text-foreground shadow-2xs" : "text-muted-foreground"
                }`}
                title="Apple Style View (560px)"
              >
                <Monitor className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewport("mobile")}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewport === "mobile" ? "bg-card text-foreground shadow-2xs" : "text-muted-foreground"
                }`}
                title="Gmail App Mobile View (375px)"
              >
                <Smartphone className="w-4 h-4" />
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={handleCopyHtml}
            className="px-3 py-1.5 bg-secondary hover:bg-secondary/80 border border-border rounded-xl text-xs font-semibold text-foreground flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            {copied === "html" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>Copy HTML</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadHtml}
            className="p-2 bg-secondary hover:bg-secondary/80 border border-border rounded-xl text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            title="Download .html file"
          >
            <Download className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={handleOpenInNewWindow}
            className="p-2 bg-secondary hover:bg-secondary/80 border border-border rounded-xl text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            title="Open in new window"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            disabled={isSending}
            onClick={handleSendEmail}
            className="px-3.5 py-1.5 bg-foreground text-background hover:bg-foreground/90 disabled:opacity-50 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isSending ? "Dispatching..." : "Send to Customer"}</span>
          </button>
        </div>
      </div>

      {/* Main View Display Area */}
      <div className="border border-border rounded-2xl overflow-hidden bg-slate-900/5 dark:bg-black/30">
        {viewMode === "preview" && (
          <div className="p-4 sm:p-6 flex justify-center overflow-x-auto min-h-[500px] max-h-[70vh]">
            <div
              className="transition-all duration-300 w-full shadow-2xl rounded-2xl overflow-hidden border border-border bg-white"
              style={{
                maxWidth: viewport === "desktop" ? "560px" : "375px",
              }}
            >
              <iframe
                title="ShipNest HTML Email Preview"
                srcDoc={generated.html}
                className="w-full h-[620px] border-none bg-white"
              />
            </div>
          </div>
        )}

        {viewMode === "code" && (
          <div className="relative">
            <pre className="p-4 sm:p-5 text-xs font-mono text-slate-800 dark:text-slate-200 overflow-x-auto max-h-[550px] leading-relaxed select-all">
              {generated.html}
            </pre>
          </div>
        )}

        {viewMode === "text" && (
          <div className="p-4 sm:p-5">
            <div className="flex justify-between items-center pb-2 mb-2 border-b border-border">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase">Plain Text Counterpart</span>
              <button
                onClick={handleCopyText}
                className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
              >
                {copied === "text" ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                <span>Copy Plain Text</span>
              </button>
            </div>
            <pre className="text-xs font-mono text-foreground whitespace-pre-wrap max-h-[500px] overflow-y-auto leading-relaxed">
              {generated.plainText}
            </pre>
          </div>
        )}
      </div>
    </div>
  );

  if (isInlineTab) {
    return containerContent;
  }

  // Modal / Dialog presentation
  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-card border border-border rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-y-auto p-5 sm:p-7 space-y-5 shadow-2xl">
        {/* Modal Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">
                Customer Email Dispatcher · Order #{order.orderId}
              </h2>
              <p className="text-xs text-muted-foreground">
                Official HTML Email with live tracking, website assets, and PIN authentication
              </p>
            </div>
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {containerContent}
      </div>
    </div>
  );
};
