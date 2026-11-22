'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useToast } from '@/context/ToastContext';
import { Mail, Phone, MapPin, Clock, Send, MessageCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { getContactPageContent, submitContactMessage, DEFAULT_CONTACT_CONTENT } from '@/lib/contact';

export default function ContactPage() {
  const { showToast } = useToast();
  const [content, setContent] = useState(DEFAULT_CONTACT_CONTENT);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Load custom content configured in Admin & listen for live updates
  useEffect(() => {
    setContent(getContactPageContent());

    const handleUpdate = (e) => {
      if (e?.detail) {
        setContent(e.detail);
      }
    };

    window.addEventListener('mughal_contact_content_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('mughal_contact_content_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name || !form.email || !form.message) {
      showToast('Please fill in all required fields.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      await submitContactMessage({
        name: form.name,
        email: form.email,
        phone: form.phone,
        message: form.message,
      });

      showToast('Thank you! Your message has been sent to New Mughal Collections support.', 'success');
      setForm({ name: '', email: '', phone: '', message: '' });
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      showToast(err.message || 'Failed to send message. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const contactCards = [
    {
      icon: Mail,
      label: 'Email Support',
      value: content.email || 'officialmughalcollections@gmail.com',
      href: `mailto:${content.email || 'officialmughalcollections@gmail.com'}`,
    },
    {
      icon: Phone,
      label: 'Phone / WhatsApp',
      value: content.phone || '+92 300 4123432',
      href: `tel:${(content.phone || '+923004123432').replace(/[^0-9+]/g, '')}`,
    },
    {
      icon: MapPin,
      label: 'Store Location',
      value: content.address || '7-A Guldasht Town, Zarar Shaheed Road, Lahore, Pakistan',
      href: null,
    },
    {
      icon: Clock,
      label: 'Support Hours',
      value: content.hours || 'Mon – Sat, 9:00 AM – 7:00 PM',
      href: null,
    },
  ];

  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <div className="border-b border-gray-200 py-12 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-gray-400">
            {content.tagline || 'Customer Care'}
          </p>
          <h1 className="text-3xl sm:text-4xl font-black text-black tracking-tight mt-1">
            {content.heading || 'Get in Touch'}
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 max-w-lg mx-auto mt-2 leading-relaxed">
            {content.subheading || 'Have questions regarding orders, replacements, or styling advice? Our support team is ready to assist you.'}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          
          {/* Contact Form */}
          <div className="lg:col-span-3 border border-gray-200 p-6 sm:p-8 space-y-6">
            <h2 className="text-sm font-black uppercase tracking-widest text-black border-b border-gray-100 pb-3 flex items-center justify-between">
              <span>Send Us a Direct Message</span>
              <span className="text-[10px] text-gray-400 font-normal lowercase tracking-normal">Directly delivered to Admin</span>
            </h2>

            {submitted && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-emerald-800 text-xs">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <p className="font-bold">Message sent successfully!</p>
                  <p className="text-[11px] text-emerald-700 mt-0.5">Our representative will get in touch with you via email or phone shortly.</p>
                </div>
              </div>
            )}

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
                  placeholder="e.g. 0300-1234567"
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
                  placeholder="How can we help you today? Please mention your order number or question here..."
                  value={form.message}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 border border-gray-300 text-sm focus:outline-none focus:border-black transition-colors resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="px-8 py-3.5 bg-black hover:bg-gray-800 disabled:opacity-50 text-white text-xs font-bold uppercase tracking-widest transition-all inline-flex items-center gap-2 shadow"
              >
                {submitting ? (
                  <>
                    <Loader2 size={13} className="animate-spin" /> Sending...
                  </>
                ) : (
                  <>
                    Submit Message <Send size={13} />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Contact Details Cards */}
          <div className="lg:col-span-2 space-y-6">
            <div className="border border-gray-200 p-6 sm:p-8 space-y-6 bg-gray-50/50">
              <h2 className="text-sm font-black uppercase tracking-widest text-black border-b border-gray-200 pb-3">
                {content.headquartersTitle || 'New Mughal Collections Headquarters'}
              </h2>

              <div className="space-y-4">
                {contactCards.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label} className="flex items-start gap-3">
                      <div className="p-2.5 bg-white border border-gray-200 text-black shrink-0">
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
                <p className="leading-relaxed">
                  {content.whatsappNote || 'Need urgent order status? Contact us directly on WhatsApp with your Order ID.'}
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
