import React from 'react';

const TermsOfService = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 text-gray-800">
      <div className="bg-gradient-to-r from-gray-900 to-red-600 rounded-2xl p-12 text-white text-center mb-10 shadow-xl">
        <h1 className="text-4xl font-extrabold mb-2">Terms of Service</h1>
        <p className="text-gray-200 opacity-90">Last Updated: May 2026</p>
      </div>

      <div className="space-y-10">
        <section>
          <h2 className="text-2xl font-bold text-red-600 mb-4 border-b pb-2">1. Acceptance of Terms</h2>
          <p className="text-gray-600 leading-relaxed">
            By accessing and using the WorkEase platform, you agree to be bound by these Terms of Service. 
            If you do not agree to these terms, please do not use our services or access the platform.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-red-600 mb-4 border-b pb-2">2. Service Description</h2>
          <p className="text-gray-600 leading-relaxed">
            WorkEase provides a marketplace platform that connects users with independent home service professionals 
            (including electricians, plumbers, and technicians) in Kolhapur, Maharashtra. WorkEase acts as an 
            intermediary platform and is not the direct provider of the technical services.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-red-600 mb-4 border-b pb-2">3. User Responsibilities</h2>
          <ul className="list-disc pl-6 space-y-3 text-gray-600">
            <li>You must provide accurate and complete information when creating an account.</li>
            <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
            <li>You agree to provide a safe environment for professionals during service visits.</li>
            <li>You agree to pay the fees specified for services booked through the platform.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-red-600 mb-4 border-b pb-2">4. Cancellations & Refunds</h2>
          <p className="text-gray-600 leading-relaxed">
            Cancellations made at least 2 hours prior to the scheduled service time are eligible for a full refund. 
            Cancellations made within 2 hours of the scheduled time may be subject to a nominal cancellation fee 
            to compensate the assigned professional.
          </p>
        </section>
      </div>
    </div>
  );
};

export default TermsOfService;
