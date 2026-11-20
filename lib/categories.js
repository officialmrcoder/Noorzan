import { supabase } from '@/lib/supabase';
import { isSupabaseConfigured } from '@/lib/mockData';

export const DEFAULT_CATEGORIES = [
  { id: 'cat-1', name: 'Backpack', slug: 'backpack' },
  { id: 'cat-2', name: 'Messenger Bag', slug: 'messenger' },
  { id: 'cat-3', name: 'Laptop Bag', slug: 'laptop_bag' },
  { id: 'cat-4', name: 'Travel Bag', slug: 'travel_bag' },
  { id: 'cat-5', name: 'Women\'s Handbag', slug: 'handbag' },
];

const LOCAL_STORAGE_KEY = 'noorzan_custom_categories';

// Helper to format a slug from category name
export const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '_')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '_');
};

// Get categories from local storage cache
const getLocalCategories = () => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    return [];
  }
};

// Save categories to local storage cache
const saveLocalCategories = (cats) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cats));
  } catch (err) {
    console.error('Failed to save categories to localStorage:', err);
  }
};

/**
 * Fetch all categories:
 * 1. From Supabase `categories` table (if available)
 * 2. Merged with local storage custom categories
 * 3. Fallback to DEFAULT_CATEGORIES and any category found in products
 */
export async function getCategories(existingProducts = []) {
  let categories = [...DEFAULT_CATEGORIES];
  const localCats = getLocalCategories();

  // Merge local categories
  localCats.forEach((lCat) => {
    if (!categories.some((c) => c.slug === lCat.slug)) {
      categories.push(lCat);
    }
  });

  // Try fetching from Supabase categories table
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true });

      if (!error && data && data.length > 0) {
        data.forEach((dbCat) => {
          const idx = categories.findIndex((c) => c.slug === dbCat.slug);
          if (idx >= 0) {
            categories[idx] = { ...categories[idx], ...dbCat };
          } else {
            categories.push(dbCat);
          }
        });
      }
    } catch (err) {
      console.warn('Categories table fetch fallback:', err.message);
    }
  }

  // Also include any categories found in products that aren't yet in list
  if (existingProducts && existingProducts.length > 0) {
    existingProducts.forEach((p) => {
      if (p.category && !categories.some((c) => c.slug === p.category)) {
        const readable = p.category
          .split('_')
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ');
        categories.push({
          id: `prod-cat-${p.category}`,
          name: readable,
          slug: p.category,
        });
      }
    });
  }

  return categories;
}

/**
 * Add a new category
 */
export async function createCategory(name) {
  if (!name || !name.trim()) throw new Error('Category name is required');
  const cleanName = name.trim();
  const slug = slugify(cleanName);

  const newCat = {
    id: `cat-${Date.now()}`,
    name: cleanName,
    slug: slug,
  };

  // Always save in localStorage for instant offline / fallback access
  const currentLocal = getLocalCategories();
  if (!currentLocal.some((c) => c.slug === slug)) {
    saveLocalCategories([...currentLocal, newCat]);
  }

  // If Supabase configured, attempt insert in categories table
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('categories')
        .insert([{ name: cleanName, slug: slug }])
        .select()
        .single();

      if (!error && data) {
        return data;
      }
      if (error && error.code !== '42P01') { // 42P01 = table doesn't exist yet
        console.warn('Could not save to Supabase categories table:', error.message);
      }
    } catch (err) {
      console.warn('Failed to insert category to Supabase:', err);
    }
  }

  return newCat;
}

/**
 * Delete a category
 */
export async function removeCategory(slug) {
  // Update localStorage
  const currentLocal = getLocalCategories();
  saveLocalCategories(currentLocal.filter((c) => c.slug !== slug));

  if (isSupabaseConfigured()) {
    try {
      await supabase.from('categories').delete().eq('slug', slug);
    } catch (err) {
      console.warn('Failed to delete from Supabase categories:', err);
    }
  }
}
