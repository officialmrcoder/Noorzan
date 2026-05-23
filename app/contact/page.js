'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useToast } from '@/context/ToastContext';
import { Mail, Phone, MapPin, Clock, Send, MessageCircle, AlertCircle } from 'lucide-react';

const contactInfo = [
  {
    icon: Mail,
    label: 'Email',
    value: 'support@baghaven.pk',
    href: 'mailto:support@baghaven.pk',
  },
  {
    icon: Phone,
    label: 'Phone',
    value: '+92 300 1234567',
    href: 'tel:+923001234567',
  },
  {
    icon: MapPin,
    label: 'Location',
    value: 'Lahore, Pakistan',
    href: null,
  },
  {
    icon: Clock,
    label: 'Business Hours',
    value: 'Mon – Sat, 9 AM – 6 PM',
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

    // Simulate a short delay
    setTimeout(() => {
      showToast('Your message has been sent! We\'ll get back to you soon.', 'success');
      setForm({ name: '', email: '', phone: '', message: '' });
      setSubmitting(false);
    }, 600);
  };

  return (
    <div className="flex flex-col gap-16 pb-16">
      {/* Page Header */}
      <section className="relative bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-700 text-white overflow-hidden rounded-b-[2rem] sm:rounded-b-[3rem] shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1),transparent_60%)]"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20 flex flex-col items-center text-center gap-4 z-10">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-[1.1]">
            Get in Touch
          </h1>
          <p className="text-lg text-indigo-100 max-w-xl text-balance">
            Have a question, feedback, or just want to say hello? We'd love to hear from you.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Contact Form */}
          <div className="lg:col-span-3 bg-white border border-gray-100 rounded-2xl p-6 md:p-8 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Send Us a Message</h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label htmlFor="name" className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                    Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Your full name"
                    value={form.name}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-gray-200 rounded-xl py-2.5 px-4 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                    Email <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-gray-200 rounded-xl py-2.5 px-4 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="phone" className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Phone <span className="text-gray-300">(optional)</span>
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="+92 3XX XXXXXXX"
                  value={form.phone}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-gray-200 rounded-xl py-2.5 px-4 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="message" className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Message <span className="text-rose-500">*</span>
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  placeholder="How can we help you?"
                  value={form.message}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-gray-200 rounded-xl py-2.5 px-4 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition-all shadow-lg shadow-indigo-600/25 hover:shadow-indigo-600/35 hover:-translate-y-0.5 disabled:opacity-60 disabled:pointer-events-none"
              >
                <Send className="w-4 h-4" />
                {submitting ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>

          {/* Contact Info */}
          <div className="lg:col-span-2 space-y-4">
            {contactInfo.map((item) => {
              const Icon = item.icon;
              const content = (
                <div
                  key={item.label}
                  className="bg-white border border-gray-100 rounded-2xl p-6 flex items-start gap-4 hover:shadow-lg transition-all duration-300"
                >
                  <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800 text-sm">{item.label}</h3>
                    <p className="text-gray-500 text-sm mt-0.5">{item.value}</p>
                  </div>
                </div>
              );

              if (item.href) {
                return (
                  <a key={item.label} href={item.href} className="block group">
                    {content}
                  </a>
                );
              }

              return <React.Fragment key={item.label}>{content}</React.Fragment>;
            })}

            {/* Map / Extra CTA */}
            <div className="bg-gradient-to-br from-indigo-900 to-indigo-950 text-white rounded-2xl p-6 shadow-xl relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(99,102,241,0.15),transparent_60%)]"></div>
              <div className="relative z-10 flex flex-col gap-3">
                <h3 className="font-semibold text-lg">Visit Our Store</h3>
                <p className="text-indigo-200 text-sm leading-relaxed">
                  Drop by our showroom in Lahore to see and feel the quality of our bags in person. Walk-ins welcome during business hours.
                </p>
                <Link
                  href="/products"
                  className="inline-flex items-center text-sm font-semibold text-indigo-300 hover:text-white transition-colors mt-1"
                >
                  Browse Products →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
