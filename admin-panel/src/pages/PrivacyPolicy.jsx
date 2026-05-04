import React from 'react';

const PrivacyPolicy = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 text-gray-800">
      <div className="bg-gradient-to-r from-gray-900 to-red-600 rounded-2xl p-12 text-white text-center mb-10 shadow-xl">
        <h1 className="text-4xl font-extrabold mb-2">Privacy Policy</h1>
        <p className="text-gray-200 opacity-90">Your privacy is our priority</p>
      </div>

      <div className="space-y-10">
        <section>
          <h2 className="text-2xl font-bold text-red-600 mb-4 border-b pb-2">1. Information Collection</h2>
          <p className="text-gray-600 leading-relaxed">
            We collect personal information that you provide to us, including your name, phone number, and service address. 
            We also collect precise location data to connect you with the nearest available service professionals.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-red-600 mb-4 border-b pb-2">2. Use of Information</h2>
          <p className="text-gray-600 leading-relaxed">
            Your data is used specifically to:
          </p>
          <ul className="list-disc pl-6 mt-4 space-y-3 text-gray-600">
            <li>Facilitate service bookings and real-time tracking.</li>
            <li>Send push notifications regarding your order status.</li>
            <li>Verify identity and prevent fraudulent activities.</li>
            <li>Improve the quality and efficiency of our local service network.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-red-600 mb-4 border-b pb-2">3. Data Sharing</h2>
          <p className="text-gray-600 leading-relaxed">
            We only share your contact details and location with the assigned service professional after you have confirmed a booking. 
            We do not sell or lease your personal information to third-party marketing companies.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-red-600 mb-4 border-b pb-2">4. Data Security</h2>
          <p className="text-gray-600 leading-relaxed">
            We implement robust security measures including encryption and secure authentication protocols 
            (Firebase Auth & Firestore Security Rules) to protect your data from unauthorized access or disclosure.
          </p>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
