import { supabase } from '@/lib/supabase';
import { isSupabaseConfigured } from '@/lib/mockData';

export const DEFAULT_HERO_IMAGE =
  'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=1600';

const HERO_BG_STORAGE_KEY = 'mughal_hero_background';

/**
 * Get the current homepage background settings
 */
export async function getHeroBackground() {
  let bg = {
    imageUrl: DEFAULT_HERO_IMAGE,
    productId: null,
    title: 'New Mughal Collections',
    subtitle: 'Exclusive watches, bags, apparel, and lifestyle accessories for all.',
  };

  // 1. Check localStorage first for instant client response
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem(HERO_BG_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.imageUrl) {
          bg = { ...bg, ...parsed };
        }
      }
    } catch (err) {
      console.warn('Failed to parse hero background from localStorage', err);
    }
  }

  // 2. If Supabase configured, check remote settings or product flagged as hero
  if (isSupabaseConfigured()) {
    try {
      // First check products table for is_hero_bg = true
      const { data: heroProducts, error: prodErr } = await supabase
        .from('products')
        .select('*')
        .eq('is_hero_bg', true)
        .order('created_at', { ascending: false })
        .limit(1);

      if (!prodErr && heroProducts && heroProducts.length > 0) {
        const p = heroProducts[0];
        bg = {
          ...bg,
          imageUrl: p.image_url,
          productId: p.id,
          title: p.name,
        };
        // sync to localStorage
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem(HERO_BG_STORAGE_KEY, JSON.stringify(bg));
          } catch (e) {}
        }
        return bg;
      }

      // Check site_settings table if available
      const { data: settingData, error: setErr } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'hero_background')
        .maybeSingle();

      if (!setErr && settingData && settingData.value) {
        const val = typeof settingData.value === 'string' ? JSON.parse(settingData.value) : settingData.value;
        if (val.imageUrl) {
          bg = { ...bg, ...val };
          if (typeof window !== 'undefined') {
            try {
              localStorage.setItem(HERO_BG_STORAGE_KEY, JSON.stringify(bg));
            } catch (e) {}
          }
        }
      }
    } catch (err) {
      console.warn('Supabase hero background fetch fallback:', err.message);
    }
  }

  return bg;
}

/**
 * Update the homepage background image
 */
export async function setHeroBackground({ imageUrl, productId = null, title = '', subtitle = '' }) {
  if (!imageUrl || !imageUrl.trim()) {
    throw new Error('Image URL is required');
  }

  const payload = {
    imageUrl: imageUrl.trim(),
    productId: productId || null,
    title: title || 'New Mughal Collections',
    subtitle: subtitle || 'Exclusive watches, bags, apparel, and lifestyle accessories for all.',
    updated_at: new Date().toISOString(),
  };

  // 1. Save to localStorage
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(HERO_BG_STORAGE_KEY, JSON.stringify(payload));
      window.dispatchEvent(new CustomEvent('mughal_hero_bg_updated', { detail: payload }));
    } catch (err) {
      console.error('Failed to save hero background to localStorage:', err);
    }
  }

  // 2. If Supabase configured, persist to database
  if (isSupabaseConfigured()) {
    try {
      // If productId provided, update products table
      if (productId) {
        // Clear previous hero bg products
        try {
          await supabase.from('products').update({ is_hero_bg: false }).neq('id', productId);
        } catch (e) {
          // ignore if column doesn't exist
        }
        try {
          await supabase.from('products').update({ is_hero_bg: true }).eq('id', productId);
        } catch (e) {
          // ignore if column doesn't exist
        }
      }

      // Upsert into site_settings
      try {
        await supabase
          .from('site_settings')
          .upsert([{ key: 'hero_background', value: payload, updated_at: new Date().toISOString() }], {
            onConflict: 'key',
          });
      } catch (e) {
        // site_settings table may not exist yet, that's fine
      }
    } catch (err) {
      console.warn('Failed to persist hero background to Supabase:', err);
    }
  }

  return payload;
}
