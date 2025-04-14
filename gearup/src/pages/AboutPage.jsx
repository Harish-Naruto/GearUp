import React from 'react';
import { Link } from 'react-router-dom';
 import { PhoneIcon, MailIcon, UserIcon, StarIcon } from '@heroicons/react/outline';
import { WrenchIcon } from 'lucide-react';

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-blue-700 text-white py-16">
        <div className="container mx-auto px-4 md:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">About AutoService Pro</h1>
            <p className="text-xl md:text-2xl mb-8">The smartest way to manage vehicle repairs</p>
            <div className="flex justify-center">
              <Link 
                to="/services" 
                className="bg-white text-blue-700 font-medium rounded-lg px-6 py-3 mr-4 hover:bg-blue-50 transition-colors"
              >
                Our Services
              </Link>
              <Link 
                to="/contact" 
                className="bg-transparent border-2 border-white text-white font-medium rounded-lg px-6 py-3 hover:bg-white hover:text-blue-700 transition-colors"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 md:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Our Mission</h2>
            <div className="bg-white rounded-xl shadow-lg p-8 mb-12">
              <p className="text-lg text-gray-700 mb-6">
                At AutoService Pro, our mission is to revolutionize the vehicle repair industry by creating 
                a seamless, transparent, and efficient ecosystem that connects vehicle owners with the right service 
                providers. We're committed to eliminating the frustration and uncertainty often associated with 
                vehicle repairs by empowering customers with information and choices.
              </p>
              <p className="text-lg text-gray-700">
                We strive to help garage owners optimize their operations, workers manage their schedules 
                effectively, and customers receive timely, quality service. Through innovative technology 
                and a customer-first approach, we're building a platform that benefits all stakeholders in 
                the vehicle repair process.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-gray-100">
        <div className="container mx-auto px-4 md:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="bg-white rounded-xl shadow p-6 text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserIcon className="h-8 w-8 text-blue-700" />
              </div>
              <h3 className="text-xl font-bold mb-3">Customer First</h3>
              <p className="text-gray-600">
                We prioritize customer satisfaction above all else, ensuring every vehicle owner has 
                a positive experience from booking to completion.
              </p>
            </div>
            <div className="bg-white rounded-xl shadow p-6 text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <WrenchIcon className="h-8 w-8 text-blue-700" />
              </div>
              <h3 className="text-xl font-bold mb-3">Quality Service</h3>
              <p className="text-gray-600">
                We connect customers with verified, skilled professionals who deliver excellent 
                workmanship and reliable service on every job.
              </p>
            </div>
            <div className="bg-white rounded-xl shadow p-6 text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <StarIcon className="h-8 w-8 text-blue-700" />
              </div>
              <h3 className="text-xl font-bold mb-3">Transparency</h3>
              <p className="text-gray-600">
                We believe in clear communication, upfront pricing, and honest feedback to build trust 
                between service providers and customers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 md:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Our Leadership Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {[
              {
                name: "Alex Johnson",
                role: "Chief Executive Officer",
                image: "/api/placeholder/100/100",
                bio: "Former automotive industry executive with 15+ years of experience."
              },
              {
                name: "Sarah Chen",
                role: "Chief Technology Officer",
                image: "/api/placeholder/100/100",
                bio: "Tech innovator with expertise in building scalable platforms."
              },
              {
                name: "Miguel Rodriguez",
                role: "Head of Operations",
                image: "/api/placeholder/100/100",
                bio: "Operations specialist focused on service quality and efficiency."
              },
              {
                name: "Priya Patel",
                role: "Customer Success Director",
                image: "/api/placeholder/100/100",
                bio: "Dedicated to creating exceptional customer experiences."
              }
            ].map((member, index) => (
              <div key={index} className="bg-white rounded-xl shadow p-6 text-center">
                <img 
                  src={member.image} 
                  alt={member.name}
                  className="w-24 h-24 rounded-full mx-auto mb-4 object-cover" 
                />
                <h3 className="text-xl font-bold mb-1">{member.name}</h3>
                <p className="text-blue-700 font-medium mb-3">{member.role}</p>
                <p className="text-gray-600">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-700 text-white py-16">
        <div className="container mx-auto px-4 md:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to experience better vehicle repairs?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied customers who have simplified their vehicle maintenance
            with AutoService Pro.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link 
              to="/register" 
              className="bg-white text-blue-700 font-medium rounded-lg px-6 py-3 hover:bg-blue-50 transition-colors"
            >
              Sign Up Now
            </Link>
            <Link 
              to="/garages" 
              className="bg-transparent border-2 border-white text-white font-medium rounded-lg px-6 py-3 hover:bg-white hover:text-blue-700 transition-colors"
            >
              Find Garages
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;