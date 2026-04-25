import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';

const TermsAndConditions = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const sections = [
    { id: 'introduction', title: '1. Introduction' },
    { id: 'products', title: '2. Products & Pricing' },
    { id: 'orders', title: '3. Orders & Cancellations' },
    { id: 'payments', title: '4. Secure Payments' },
    { id: 'shipping', title: '5. Shipping & Delivery' },
    { id: 'ip', title: '6. Intellectual Property' },
    { id: 'liability', title: '7. Limitation of Liability' },
    { id: 'law', title: '8. Governing Law' },
  ];

  return (
    <div className="bg-white min-h-screen pt-24 lg:pt-40 pb-20">
      <Helmet>
        <title>Terms & Conditions | Lustrax Jewelries | Fine Luxury Jewelry Nigeria</title>
        <meta name="description" content="Read the official Terms and Conditions for Lustrax Jewelries. Understand our policies on orders, payments, shipping, and more." />
      </Helmet>

      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="max-w-3xl mb-16 lg:mb-24">
          <motion.span 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[10px] uppercase tracking-[0.5em] font-bold text-gold mb-4 block"
          >
            Legal Protocol
          </motion.span>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl lg:text-6xl font-serif text-charcoal uppercase tracking-tighter leading-none"
          >
            Terms & Conditions
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-6 text-gray-400 text-sm font-medium uppercase tracking-widest"
          >
            Effective Date: April 25, 2026
          </motion.p>
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
            <section id="introduction" className="scroll-mt-40 space-y-6">
              <h2 className="text-2xl font-serif text-charcoal uppercase tracking-tight">1. Introduction & Acceptance</h2>
              <div className="prose prose-luxury">
                <p>
                  Welcome to Lustrax Jewelries. By accessing our platform, purchasing our creations, or utilizing our bespoke services, you acknowledge that you have read, understood, and agreed to be bound by these Terms & Conditions.
                </p>
                <p>
                  Lustrax provides a curated selection of fine luxury jewelry. Our services are reserved for individuals who appreciate the craftsmanship, heritage, and integrity behind every piece in our collection.
                </p>
              </div>
            </section>

            <section id="products" className="scroll-mt-40 space-y-6 text-justify">
              <h2 className="text-2xl font-serif text-charcoal uppercase tracking-tight">2. Products & Pricing</h2>
              <div className="prose prose-luxury">
                <p>
                  Every Lustrax piece is subject to availability. Given the exclusive nature of our materials, we reserve the right to modify specifications, prices, or discontinue items without prior notice.
                </p>
                <ul className="list-luxury">
                  <li>Natural variations in gemstones and precious metals are a testament to authenticity and are not considered defects.</li>
                  <li>Weights and dimensions provided are estimates based on standard atelier measurements.</li>
                  <li>Prices listed are inclusive of VAT where applicable but exclude insurance and specialized logistics unless stated otherwise.</li>
                </ul>
              </div>
            </section>

            <section id="orders" className="scroll-mt-40 space-y-6">
              <h2 className="text-2xl font-serif text-charcoal uppercase tracking-tight">3. Orders & Cancellations</h2>
              <div className="prose prose-luxury">
                <p>
                  We reserve the absolute right to refuse or cancel any order for reasons including but not limited to stock limitations, inaccuracies in pricing, or suspicion of fraudulent activity.
                </p>
                <p>
                  For high-value acquisitions, our protocol may require additional identity verification or bank-verified payment confirmation before the order is released for shipment.
                </p>
              </div>
            </section>

            <section id="payments" className="scroll-mt-40 space-y-6">
              <h2 className="text-2xl font-serif text-charcoal uppercase tracking-tight">4. Secure Payment Processing</h2>
              <div className="prose prose-luxury">
                <p>
                  All transactions are processed through encrypted, military-grade payment gateways. Lustrax does not store full credit card details. You are responsible for ensuring that all billing information provided is accurate and that you are the authorized holder of the payment method used.
                </p>
              </div>
            </section>

            <section id="shipping" className="scroll-mt-40 space-y-6">
              <h2 className="text-2xl font-serif text-charcoal uppercase tracking-tight">5. Shipping & Risk of Loss</h2>
              <div className="prose prose-luxury">
                <p>
                  Delivery timelines provided at checkout are estimates. While we strive for absolute punctuality, Lustrax is not liable for delays caused by third-party logistics providers, customs procedures, or external environmental factors.
                </p>
                <p>
                  The risk of loss and title for all pieces pass to you upon delivery to the carrier. We recommend selecting insured shipping for all high-value acquisitions.
                </p>
              </div>
            </section>

            <section id="ip" className="scroll-mt-40 space-y-6">
              <h2 className="text-2xl font-serif text-charcoal uppercase tracking-tight">6. Intellectual Property</h2>
              <div className="prose prose-luxury">
                <p>
                  All designs, photography, branding, and text appearing on this platform are the exclusive intellectual property of Lustrax Jewelries. Unauthorized reproduction, modification, or distribution of our proprietary assets is strictly prohibited and protected by international copyright laws.
                </p>
              </div>
            </section>

            <section id="liability" className="scroll-mt-40 space-y-6">
              <h2 className="text-2xl font-serif text-charcoal uppercase tracking-tight">7. Limitation of Liability</h2>
              <div className="prose prose-luxury">
                <p>
                  To the maximum extent permitted by law, Lustrax Jewelries shall not be liable for any indirect, incidental, or consequential damages resulting from the use of our products or the inability to access our platform. Our total liability for any claim shall not exceed the amount paid for the specific item purchased.
                </p>
              </div>
            </section>

            <section id="law" className="scroll-mt-40 space-y-6">
              <h2 className="text-2xl font-serif text-charcoal uppercase tracking-tight">8. Governing Law</h2>
              <div className="prose prose-luxury">
                <p>
                  These Terms & Conditions are governed by and construed in accordance with the laws of the Federal Republic of Nigeria. Any disputes arising shall be subject to the exclusive jurisdiction of the courts located in Lagos, Nigeria.
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditions;
