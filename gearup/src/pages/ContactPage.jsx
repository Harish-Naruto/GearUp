import React, { useState } from 'react';
import { MailIcon, PhoneIcon, LocationMarkerIcon, ClockIcon } from '@heroicons/react/outline';


const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  
  const [formStatus, setFormStatus] = useState({
    status: '', // 'success', 'error', or ''
    message: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name || !formData.email || !formData.message) {
      setFormStatus({
        status: 'error',
        message: 'Please fill out all required fields.'
      });
      return;
    }
    
    // This would be replaced with actual API call in production
    // For now, simulate successful submission
    setTimeout(() => {
      setFormStatus({
        status: 'success',
        message: 'Thank you for your message. We will get back to you shortly!'
      });
      
      // Clear form after successful submission
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-blue-700 text-white py-16">
        <div className="container mx-auto px-4 md:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Contact Us</h1>
            <p className="text-xl md:text-2xl">
              We're here to help with all your vehicle repair service needs
            </p>
          </div>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-16">
        <div className="container mx-auto px-4 md:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16">
              {/* Contact Form */}
              <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
                <h2 className="text-2xl font-bold mb-6">Send Us a Message</h2>
                
                {formStatus.status && (
                  <div className={`mb-6 p-4 rounded ${
                    formStatus.status === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {formStatus.message}
                  </div>
                )}
                
                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label htmlFor="name" className="block text-gray-700 font-medium mb-2">
                      Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="phone" className="block text-gray-700 font-medium mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="subject" className="block text-gray-700 font-medium mb-2">
                      Subject
                    </label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div className="mb-6">
                    <label htmlFor="message" className="block text-gray-700 font-medium mb-2">
                      Message <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      rows="5"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    ></textarea>
                  </div>
                  
                  <button
                    type="submit"
                    className="bg-blue-700 text-white font-medium rounded-lg px-6 py-3 hover:bg-blue-800 transition-colors w-full"
                  >
                    Send Message
                  </button>
                </form>
              </div>
              
              {/* Contact Info */}
              <div>
                <h2 className="text-2xl font-bold mb-6">Contact Information</h2>
                
                <div className="space-y-8">
                  <div className="flex items-start">
                    <div className="bg-blue-100 p-3 rounded-full mr-4">
                      <LocationMarkerIcon className="h-6 w-6 text-blue-700" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg mb-1">Our Location</h3>
                      <p className="text-gray-600">
                        123 Repair Street<br />
                        Automotive Plaza<br />
                        Service City, SC 12345
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="bg-blue-100 p-3 rounded-full mr-4">
                      <PhoneIcon className="h-6 w-6 text-blue-700" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg mb-1">Phone Numbers</h3>
                      <p className="text-gray-600 mb-1">Main: (555) 123-4567</p>
                      <p className="text-gray-600 mb-1">Support: (555) 765-4321</p>
                      <p className="text-gray-600">Emergency: (555) 911-0000</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="bg-blue-100 p-3 rounded-full mr-4">
                      <MailIcon className="h-6 w-6 text-blue-700" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg mb-1">Email Addresses</h3>
                      <p className="text-gray-600 mb-1">General: info@autoservicepro.com</p>
                      <p className="text-gray-600 mb-1">Support: support@autoservicepro.com</p>
                      <p className="text-gray-600">Business: partners@autoservicepro.com</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="bg-blue-100 p-3 rounded-full mr-4">
                      <ClockIcon className="h-6 w-6 text-blue-700" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg mb-1">Business Hours</h3>
                      <p className="text-gray-600 mb-1">Monday - Friday: 8:00 AM - 6:00 PM</p>
                      <p className="text-gray-600 mb-1">Saturday: 9:00 AM - 4:00 PM</p>
                      <p className="text-gray-600">Sunday: Closed</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Map Section */}
      <section className="py-16 bg-gray-100">
        <div className="container mx-auto px-4 md:px-8">
          <h2 className="text-2xl font-bold mb-8 text-center">Find Us</h2>
          <div className="max-w-6xl mx-auto bg-white p-4 rounded-xl shadow-lg">
            {/* This would be replaced with an actual Google Maps integration */}
            <div className="bg-gray-200 w-full h-96 rounded-lg flex items-center justify-center">
              <p className="text-gray-600 text-lg">
                Google Maps will be integrated here
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* FAQ Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 md:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
            
            <div className="space-y-6">
              {[
                {
                  question: "How do I book a vehicle repair service?",
                  answer: "You can book a service through our online platform by creating an account, selecting a garage, choosing the required service, and picking an available time slot."
                },
                {
                  question: "Can I track the status of my repair?",
                  answer: "Yes, once your booking is confirmed, you can track the repair status in real-time through your customer dashboard or mobile app."
                },
                {
                  question: "How are the garages vetted?",
                  answer: "All garages on our platform undergo a thorough verification process, including license verification, facility inspection, and customer review analysis."
                },
                {
                  question: "What payment methods do you accept?",
                  answer: "Our platform supports multiple payment options including credit/debit cards, bank transfers, and mobile payment solutions."
                }
              ].map((faq, index) => (
                <div key={index} className="bg-white rounded-xl shadow-md p-6">
                  <h3 className="text-xl font-bold mb-3">{faq.question}</h3>
                  <p className="text-gray-600">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;