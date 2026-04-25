import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';

const RefundPolicy = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const sections = [
    { id: 'eligibility', title: '1. Eligibility' },
    { id: 'non-returnable', title: '2. Non-Returnable Items' },
    { id: 'inspection', title: '3. Inspection Protocol' },
    { id: 'process', title: '4. Refund Process' },
    { id: 'exchanges', title: '5. Exchanges' },
    { id: 'damaged', title: '6. Damaged Items' },
    { id: 'costs', title: '7. Shipping Costs' },
  ];

  return (
    <div className="bg-white min-h-screen pt-24 lg:pt-40 pb-20">
      <Helmet>
        <title>Refund & Return Policy | Lustrax Jewelries | Luxury Guarantee</title>
        <meta name="description" content="Review our luxury guarantee. We offer returns within 3 days of purchase for eligible Lustrax pieces. See our full refund process here." />
      </Helmet>

      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="max-w-3xl mb-16 lg:mb-24">
          <motion.span 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[10px] uppercase tracking-[0.5em] font-bold text-gold mb-4 block"
          >
            Luxury Guarantee
          </motion.span>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl lg:text-6xl font-serif text-charcoal uppercase tracking-tighter leading-none"
          >
            Refund & Return Policy
          </motion.h1>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-8 p-4 bg-gold/5 border border-gold/10 inline-block rounded-lg"
          >
            <p className="text-gold text-[10px] font-bold uppercase tracking-[0.2em]">
              Important: 3-Day Integrity Window Applied
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">
          {/* Sidebar Navigation */}
          <aside className="lg:col-span-3 hidden lg:block sticky top-40 h-fit">
            <nav className="space-y-4">
              <p className="text-[10px] font-bold text-charcoal/30 uppercase tracking-[0.3em] mb-8">Navigation</p>
              {sections.map((section) => (
                <a 
                  key={section.id}
                  href={`#${section.id}`}
                  className="block text-[11px] font-bold uppercase tracking-widest text-gray-400 hover:text-gold transition-luxury border-l border-gray-100 pl-6 hover:border-gold py-1"
                >
                  {section.title}
                </a>
              ))}
            </nav>
          </aside>

          {/* Main Content */}
          <div className="lg:col-span-9 space-y-20 lg:space-y-32">
            <section id="eligibility" className="scroll-mt-40 space-y-6">
              <h2 className="text-2xl font-serif text-charcoal uppercase tracking-tight">1. Eligibility for Returns</h2>
              <div className="prose prose-luxury">
                <p>
                  At Lustrax Jewelries, we stand behind the exceptional quality of our creations. We accept returns within **3 days** of delivery, provided that:
                </p>
                <ul className="list-luxury">
                  <li>The item is completely unused and in its original pristine condition.</li>
                  <li>All original packaging, security tags, and certificates of authenticity are intact.</li>
                  <li>A valid proof of purchase from Lustrax-Jewelries.com is provided.</li>
                </ul>
              </div>
            </section>

            <section id="non-returnable" className="scroll-mt-40 space-y-6">
              <h2 className="text-2xl font-serif text-charcoal uppercase tracking-tight">2. Non-Returnable Items</h2>
              <div className="prose prose-luxury">
                <p>
                  Due to hygiene standards, customization requirements, and value protection, the following items are strictly non-refundable:
                </p>
                <ul className="list-luxury">
                  <li>Customized or engraved jewelry pieces.</li>
                  <li>Earrings (for hygiene and health reasons).</li>
                  <li>Items marked as "Final Sale" or part of an exclusive vault release.</li>
                  <li>Pieces that have been resized or altered by a third party.</li>
                </ul>
              </div>
            </section>

            <section id="inspection" className="scroll-mt-40 space-y-6">
              <h2 className="text-2xl font-serif text-charcoal uppercase tracking-tight">3. Inspection Protocol</h2>
              <div className="prose prose-luxury">
                <p>
                  All returned items undergo a rigorous inspection process by our atelier experts. Lustrax reserves the right to reject a return if the piece shows any signs of:
                </p>
                <ul className="list-luxury">
                  <li>Wear, micro-scratches, or damage.</li>
                  <li>Alteration of the setting or gemstone.</li>
                  <li>Missing components or tampering with the security seal.</li>
                </ul>
              </div>
            </section>

            <section id="process" className="scroll-mt-40 space-y-6">
              <h2 className="text-2xl font-serif text-charcoal uppercase tracking-tight">4. Refund Process</h2>
              <div className="prose prose-luxury">
                <p>
                  Once your return is inspected and approved, a refund will be issued to your original payment method. 
                </p>
                <p>
                  Please allow **5–10 business days** for the transaction to reflect in your account, depending on your financial institution's processing times.
                </p>
              </div>
            </section>

            <section id="exchanges" className="scroll-mt-40 space-y-6">
              <h2 className="text-2xl font-serif text-charcoal uppercase tracking-tight">5. Exchanges</h2>
              <div className="prose prose-luxury">
                <p>
                  We offer one-time exchanges for eligible items of equal or greater value, subject to current boutique availability.
                </p>
              </div>
            </section>

            <section id="damaged" className="scroll-mt-40 space-y-6">
              <h2 className="text-2xl font-serif text-charcoal uppercase tracking-tight">6. Damaged or Incorrect Items</h2>
              <div className="prose prose-luxury">
                <p>
                  In the rare event that you receive a damaged or incorrect piece:
                </p>
                <ul className="list-luxury">
                  <li>Contact our concierge within **24 hours** of delivery.</li>
                  <li>Provide high-resolution photographic evidence of the defect.</li>
                </ul>
                <p>
                  We will prioritize a complimentary replacement or a full refund, including all logistics costs.
                </p>
              </div>
            </section>

            <section id="costs" className="scroll-mt-40 space-y-6">
              <h2 className="text-2xl font-serif text-charcoal uppercase tracking-tight">7. Shipping Costs</h2>
              <div className="prose prose-luxury">
                <p>
                  Return shipping costs are the responsibility of the customer unless the item was delivered in a defective or incorrect state. Original shipping fees and insurance premiums are non-refundable.
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RefundPolicy;
