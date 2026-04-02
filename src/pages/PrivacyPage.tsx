import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

const PrivacyPage = () => (
  <div className="max-w-3xl mx-auto px-4 py-12 space-y-8">
    <nav className="flex items-center gap-2 text-[13px] text-muted-foreground">
      <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
      <ChevronRight className="w-3 h-3" />
      <span className="text-foreground font-medium">Privacy Policy</span>
    </nav>

    <h1 className="text-3xl font-bold text-foreground tracking-tight">Privacy Policy</h1>
    <p className="text-[13px] text-muted-foreground">Last updated: March 15, 2026</p>

    <div className="prose prose-sm max-w-none text-foreground/80 space-y-6">
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">1. Who We Are</h2>
        <p>ShipNest s.r.o., IČO: 12345678, with its registered office at Karlova 256/1, 110 00 Prague 1, Czech Republic, is the data controller responsible for your personal data. You can contact us at privacy@shipnest.cz.</p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">2. Data We Collect</h2>
        <p>We collect the following categories of personal data when you use our services:</p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li><strong>Identity data:</strong> Full name, billing and shipping address.</li>
          <li><strong>Contact data:</strong> Email address and phone number.</li>
          <li><strong>Transaction data:</strong> Order history, payment details (we do not store full card numbers — payments are processed via Stripe).</li>
          <li><strong>Technical data:</strong> IP address, browser type, device information, cookies and usage data collected via analytics tools.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">3. How We Use Your Data</h2>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>To process and fulfil your orders.</li>
          <li>To communicate order updates, shipping notifications, and delivery confirmations.</li>
          <li>To comply with legal obligations under Czech and EU law.</li>
          <li>To improve our website, products, and customer experience.</li>
          <li>To send marketing communications (only with your explicit consent).</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">4. Legal Basis (GDPR Art. 6)</h2>
        <p>We process personal data based on: (a) performance of a contract, (b) legitimate interest, (c) compliance with legal obligations, and (d) consent for marketing communications.</p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">5. Data Sharing</h2>
        <p>We share data with: logistics partners (DHL, FedEx, Czech Post) for delivery, payment processors (Stripe), and analytics providers. We do not sell your personal data to third parties.</p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">6. Data Retention</h2>
        <p>Order data is retained for 5 years to comply with Czech tax law (zákon č. 563/1991 Sb.). Marketing consent data is kept until you withdraw consent. Technical logs are deleted after 90 days.</p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">7. Your Rights</h2>
        <p>Under GDPR, you have the right to: access, rectify, erase, restrict processing, data portability, and object to processing. To exercise these rights, contact privacy@shipnest.cz. You also have the right to lodge a complaint with the Czech Data Protection Office (ÚOOÚ).</p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">8. Cookies</h2>
        <p>We use essential cookies for site functionality and analytics cookies (with your consent) to understand usage patterns. You can manage cookie preferences at any time via the cookie banner or your browser settings.</p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">9. Contact</h2>
        <p>For any privacy-related questions, contact our Data Protection Officer at:</p>
        <p>ShipNest s.r.o.<br />Karlova 256/1<br />110 00 Prague 1, Czech Republic<br />Email: privacy@shipnest.cz<br />Phone: +420 123 456 789</p>
      </section>
    </div>
  </div>
);

export default PrivacyPage;
