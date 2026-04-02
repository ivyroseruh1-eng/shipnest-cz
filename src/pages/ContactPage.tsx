import { Link } from "react-router-dom";
import { ChevronRight, Mail, Phone, MapPin, Clock } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const ContactPage = () => {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Message sent! We'll get back to you within 24 hours.");
    setForm({ name: "", email: "", subject: "", message: "" });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 space-y-8">
      <nav className="flex items-center gap-2 text-[13px] text-muted-foreground">
        <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-foreground font-medium">Contact Us</span>
      </nav>

      <h1 className="text-3xl font-bold text-foreground tracking-tight">Contact Us</h1>

      <div className="grid md:grid-cols-2 gap-10">
        {/* Info */}
        <div className="space-y-6">
          <p className="text-[14px] text-muted-foreground leading-relaxed">
            Have a question about your order, a product, or just want to say hello? We're here to help. Our support team responds within 24 hours on business days.
          </p>

          <div className="space-y-4">
            {[
              { icon: Mail, label: "Email", value: "support@shipnest.cz" },
              { icon: Phone, label: "Phone", value: "+420 123 456 789" },
              { icon: MapPin, label: "Address", value: "Karlova 256/1, 110 00 Prague 1, Czech Republic" },
              { icon: Clock, label: "Hours", value: "Mon–Fri, 9:00–17:00 CET" },
            ].map(c => (
              <div key={c.label} className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-secondary">
                  <c.icon className="w-4 h-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-[12px] text-muted-foreground font-medium">{c.label}</p>
                  <p className="text-[14px] text-foreground font-medium">{c.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[12px] text-muted-foreground font-medium mb-1 block">Name</label>
              <input type="text" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="w-full bg-secondary border border-border rounded-xl px-4 py-2.5 text-[14px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground/20" />
            </div>
            <div>
              <label className="text-[12px] text-muted-foreground font-medium mb-1 block">Email</label>
              <input type="email" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className="w-full bg-secondary border border-border rounded-xl px-4 py-2.5 text-[14px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground/20" />
            </div>
          </div>
          <div>
            <label className="text-[12px] text-muted-foreground font-medium mb-1 block">Subject</label>
            <input type="text" required value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
              placeholder="e.g. Order #SNX4829371 question"
              className="w-full bg-secondary border border-border rounded-xl px-4 py-2.5 text-[14px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground/20" />
          </div>
          <div>
            <label className="text-[12px] text-muted-foreground font-medium mb-1 block">Message</label>
            <textarea required rows={5} value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
              className="w-full bg-secondary border border-border rounded-xl px-4 py-2.5 text-[14px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground/20 resize-none" />
          </div>
          <button type="submit" className="w-full bg-foreground text-background py-3 rounded-full font-semibold text-[14px] hover:bg-foreground/90 transition-colors">
            Send Message
          </button>
        </form>
      </div>
    </div>
  );
};

export default ContactPage;
