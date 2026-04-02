import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

const TermsPage = () => (
  <div className="max-w-3xl mx-auto px-4 py-12 space-y-8">
    <nav className="flex items-center gap-2 text-[13px] text-muted-foreground">
      <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
      <ChevronRight className="w-3 h-3" />
      <span className="text-foreground font-medium">Terms of Service</span>
    </nav>

    <h1 className="text-3xl font-bold text-foreground tracking-tight">Terms of Service</h1>
    <p className="text-[13px] text-muted-foreground">Last updated: March 15, 2026</p>

    <div className="prose prose-sm max-w-none text-foreground/80 space-y-6">
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">1. General</h2>
        <p>These Terms of Service ("Terms") govern your use of the ShipNest online store operated by ShipNest s.r.o., IČO: 12345678, registered at Karlova 256/1, 110 00 Prague 1, Czech Republic. By placing an order, you agree to these Terms.</p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">2. Orders & Pricing</h2>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>All prices are listed in USD and include applicable VAT for EU customers.</li>
          <li>We reserve the right to correct pricing errors before shipment.</li>
          <li>An order confirmation email serves as acceptance of your offer to purchase.</li>
          <li>We may cancel orders if products are unavailable or if fraud is suspected.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">3. Payment</h2>
        <p>We accept Visa, Mastercard, American Express, and Apple Pay. All payments are processed securely through Stripe. Your payment information is encrypted and never stored on our servers.</p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">4. Shipping & Delivery</h2>
        <p>All orders are dispatched from our warehouse in Prague, Czech Republic. Standard delivery takes 5–10 business days worldwide. Express shipping (2–4 business days) is available for select destinations. Free shipping on all orders.</p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">5. Returns & Refunds</h2>
        <p>Under Czech consumer law and EU Directive 2011/83/EU, you have the right to withdraw from a purchase within 14 days of receiving the goods without giving a reason. We extend this to 30 days for all customers worldwide. See our <Link to="/returns" className="text-foreground underline">Returns & Refunds</Link> page for full details.</p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">6. Warranty</h2>
        <p>All products come with a 2-year manufacturer warranty as required by EU law. Warranty claims can be initiated by contacting support@shipnest.cz with your order number and description of the issue.</p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">7. Intellectual Property</h2>
        <p>All content on this website, including product images, text, logos, and design, is the property of ShipNest s.r.o. or used under license. Unauthorized reproduction is prohibited.</p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">8. Limitation of Liability</h2>
        <p>ShipNest s.r.o. shall not be liable for indirect, incidental, or consequential damages arising from the use of our products or services, to the extent permitted by applicable law.</p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">9. Governing Law</h2>
        <p>These Terms are governed by the laws of the Czech Republic. Any disputes shall be resolved by the competent courts in Prague, Czech Republic, without prejudice to your rights under EU consumer protection regulations.</p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">10. Contact</h2>
        <p>ShipNest s.r.o.<br />Karlova 256/1, 110 00 Prague 1, Czech Republic<br />Email: support@shipnest.cz<br />Phone: +420 123 456 789</p>
      </section>
    </div>
  </div>
);

export default TermsPage;
