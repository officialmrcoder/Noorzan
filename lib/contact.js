import { supabase } from '@/lib/supabase';
import { isSupabaseConfigured } from '@/lib/mockData';

export const DEFAULT_CONTACT_CONTENT = {
  tagline: 'Customer Care',
  heading: 'Get in Touch',
  subheading: 'Have questions regarding orders, replacements, or styling advice? Our support team is ready to assist you.',
  headquartersTitle: 'New Mughal Collections Headquarters',
  email: 'officialmughalcollections@gmail.com',
  phone: '+92 300 4123432',
  address: '7-A Guldasht Town, Zarar Shaheed Road, Lahore, Pakistan',
  hours: 'Mon – Sat, 9:00 AM – 7:00 PM',
  whatsappNote: 'Need urgent order status? Contact us directly on WhatsApp with your Order ID.'
};

// Start with empty messages so user has a 100% clean inbox
export const SAMPLE_CONTACT_MESSAGES = [];

const CONTACT_CONTENT_STORAGE_KEY = 'mughal_contact_page_content';
const CONTACT_MESSAGES_STORAGE_KEY = 'mughal_contact_messages';
const DELETED_MESSAGES_STORAGE_KEY = 'mughal_deleted_message_ids';

// -------------------------------------------------------------
// Contact Page Content Functions
// -------------------------------------------------------------

export function getContactPageContent() {
  if (typeof window === 'undefined') return DEFAULT_CONTACT_CONTENT;
  try {
    const saved = localStorage.getItem(CONTACT_CONTENT_STORAGE_KEY);
    if (saved) {
      return { ...DEFAULT_CONTACT_CONTENT, ...JSON.parse(saved) };
    }
  } catch (err) {
    console.warn('Failed to load contact content from localStorage', err);
  }
  return DEFAULT_CONTACT_CONTENT;
}

export async function saveContactPageContent(content) {
  const merged = { ...DEFAULT_CONTACT_CONTENT, ...content };

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(CONTACT_CONTENT_STORAGE_KEY, JSON.stringify(merged));
      window.dispatchEvent(new CustomEvent('mughal_contact_content_updated', { detail: merged }));
    } catch (e) {
      console.error('Failed to save contact content to localStorage', e);
    }
  }

  if (isSupabaseConfigured()) {
    try {
      await supabase
        .from('site_settings')
        .upsert([{ key: 'contact_page_content', value: merged, updated_at: new Date().toISOString() }], {
          onConflict: 'key'
        });
    } catch (err) {
      console.warn('Could not save contact page content to Supabase site_settings:', err.message);
    }
  }

  return merged;
}

// -------------------------------------------------------------
// Contact Messages (Inquiries) Functions with Robust Deletion Persistence
// -------------------------------------------------------------

export function getDeletedMessageIds() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(DELETED_MESSAGES_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function addDeletedMessageId(id) {
  if (typeof window === 'undefined') return;
  try {
    const current = getDeletedMessageIds();
    if (!current.includes(id)) {
      localStorage.setItem(DELETED_MESSAGES_STORAGE_KEY, JSON.stringify([...current, id]));
    }
  } catch (e) {}
}

export function getLocalContactMessages() {
  if (typeof window === 'undefined') return [];
  try {
    const deletedIds = getDeletedMessageIds();
    const raw = localStorage.getItem(CONTACT_MESSAGES_STORAGE_KEY);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.filter((m) => !deletedIds.includes(m.id));
      }
    }
  } catch (err) {
    console.warn('Failed to parse messages from localStorage', err);
  }
  return [];
}

export function saveLocalContactMessages(messages) {
  if (typeof window === 'undefined') return;
  try {
    const deletedIds = getDeletedMessageIds();
    const clean = Array.isArray(messages) ? messages.filter((m) => !deletedIds.includes(m.id)) : [];
    localStorage.setItem(CONTACT_MESSAGES_STORAGE_KEY, JSON.stringify(clean));
    window.dispatchEvent(new CustomEvent('mughal_contact_messages_updated', { detail: clean }));
  } catch (err) {
    console.error('Failed to save messages to localStorage', err);
  }
}

export async function fetchContactMessages() {
  const deletedIds = getDeletedMessageIds();
  let messages = getLocalContactMessages();

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        messages = data.filter((m) => !deletedIds.includes(m.id));
        saveLocalContactMessages(messages);
      }
    } catch (err) {
      console.warn('Failed to fetch contact messages from Supabase, using local fallback:', err.message);
    }
  }

  return messages.filter((m) => !deletedIds.includes(m.id));
}

export async function submitContactMessage({ name, email, phone = '', message }) {
  if (!name || !email || !message) {
    throw new Error('Name, email and message are required.');
  }

  const newMessage = {
    id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    name: name.trim(),
    email: email.trim(),
    phone: phone.trim(),
    message: message.trim(),
    is_read: false,
    created_at: new Date().toISOString()
  };

  // 1. Save to local storage
  const current = getLocalContactMessages();
  const updated = [newMessage, ...current];
  saveLocalContactMessages(updated);

  // 2. Try inserting into Supabase contact_messages table
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('contact_messages')
        .insert([{
          name: newMessage.name,
          email: newMessage.email,
          phone: newMessage.phone,
          message: newMessage.message,
          is_read: false
        }])
        .select()
        .single();

      if (!error && data) {
        return data;
      }
    } catch (err) {
      console.warn('Supabase insert failed, message kept in local storage:', err.message);
    }
  }

  return newMessage;
}

export async function updateMessageReadStatus(id, isRead) {
  const current = getLocalContactMessages();
  const updated = current.map((m) => (m.id === id ? { ...m, is_read: isRead } : m));
  saveLocalContactMessages(updated);

  if (isSupabaseConfigured()) {
    try {
      await supabase.from('contact_messages').update({ is_read: isRead }).eq('id', id);
    } catch (e) {
      console.warn('Supabase update message failed:', e.message);
    }
  }
  return updated;
}

export async function deleteContactMessage(id) {
  // Permanently record ID as deleted so it can NEVER reappear
  addDeletedMessageId(id);

  const current = getLocalContactMessages();
  const updated = current.filter((m) => m.id !== id);
  saveLocalContactMessages(updated);

  if (isSupabaseConfigured()) {
    try {
      await supabase.from('contact_messages').delete().eq('id', id);
    } catch (e) {
      console.warn('Supabase delete message failed:', e.message);
    }
  }
  return updated;
}
