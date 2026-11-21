'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useToast } from '@/context/ToastContext';
import { Mail, Phone, MapPin, Clock, Send, MessageCircle } from 'lucide-react';

const contactInfo = [
  {
    icon: Mail,
    label: 'Email',
    value: 'officialnoorzan@gmail.com',
    href: 'mailto:officialnoorzan@gmail.com',
  },
  {
    icon: Phone,
    label: 'Phone / WhatsApp',
    value: '+92 300 4123432',
    href: 'tel:+923004123432',
  },
  {
    icon: MapPin,
    label: 'Store Location',
    value: '7-A Guldasht Town, Zarar Shaheed Road, Lahore, Pakistan',
    href: null,
  },
  {
    icon: Clock,
    label: 'Support Hours',
    value: 'Mon – Sat, 9:00 AM – 7:00 PM',
    href: null,
  },
];

export default function ContactPage() {
  const { showToast } = useToast();
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.name || !form.email || !form.message) {
      showToast('Please fill in all required fields.', 'error');
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      showToast('Your message has been sent to Noorzan Customer Support!', 'success');
      setForm({ name: '', email: '', phone: '', message: '' });
      setSubmitting(false);
    }, 600);
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <div className="border-b border-gray-200 py-12 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-gray-400">Customer Care</p>
          <h1 className="text-3xl sm:text-4xl font-black text-black tracking-tight mt-1">Get in Touch</h1>
          <p className="text-xs text-gray-500 max-w-md mx-auto mt-2 leading-relaxed">
            Have questions regarding orders, replacements, or sizing? Our support team is ready to assist you.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          
          {/* Contact Form */}
          <div className="lg:col-span-3 border border-gray-200 p-6 sm:p-8 space-y-6">
            <h2 className="text-sm font-black uppercase tracking-widest text-black border-b border-gray-100 pb-3">
              Send Us a Direct Message
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-black block mb-1">
                    Your Name *
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    placeholder="e.g. Fatima Khan"
                    value={form.name}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 border border-gray-300 text-sm focus:outline-none focus:border-black transition-colors"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-black block mb-1">
                    Email Address *
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={form.email}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 border border-gray-300 text-sm focus:outline-none focus:border-black transition-colors"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="phone" className="text-xs font-bold uppercase tracking-wider text-black block mb-1">
                  Phone / WhatsApp (Optional)
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="0300-1234567"
                  value={form.phone}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 border border-gray-300 text-sm focus:outline-none focus:border-black transition-colors"
                />
              </div>

              <div>
                <label htmlFor="message" className="text-xs font-bold uppercase tracking-wider text-black block mb-1">
                  Your Message or Inquiry *
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  required
                  placeholder="How can we help you today? Please mention your order number if applicable."
                  value={form.message}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 border border-gray-300 text-sm focus:outline-none focus:border-black transition-colors resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="px-8 py-3.5 bg-black hover:bg-gray-800 disabled:opacity-50 text-white text-xs font-bold uppercase tracking-widest transition-all inline-flex items-center gap-2"
              >
                {submitting ? 'Sending...' : 'Submit Message'} <Send size={13} />
              </button>
            </form>
          </div>

          {/* Contact Details Cards */}
          <div className="lg:col-span-2 space-y-6">
            <div className="border border-gray-200 p-6 sm:p-8 space-y-6 bg-gray-50/50">
              <h2 className="text-sm font-black uppercase tracking-widest text-black border-b border-gray-200 pb-3">
                Noorzan Headquarters
              </h2>

              <div className="space-y-4">
                {contactInfo.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label} className="flex items-start gap-3">
                      <div className="p-2.5 bg-white border border-gray-200 text-black">
                        <Icon size={16} />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
                          {item.label}
                        </span>
                        {item.href ? (
                          <a href={item.href} className="text-xs font-bold text-black hover:underline mt-0.5 block">
                            {item.value}
                          </a>
                        ) : (
                          <p className="text-xs font-medium text-black mt-0.5 leading-relaxed">{item.value}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-gray-200 pt-4 text-xs text-gray-600 space-y-1">
                <p className="font-bold text-black uppercase tracking-wider">Fast WhatsApp Support</p>
                <p>Need urgent order status? Contact us directly on WhatsApp with your Order ID.</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}