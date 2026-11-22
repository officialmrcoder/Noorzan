import { supabase } from '@/lib/supabase';
import { isSupabaseConfigured } from '@/lib/mockData';

export const DEFAULT_CATEGORIES = [
  { id: 'cat-watches', name: 'Watches', slug: 'watches' },
  { id: 'cat-bags', name: 'Bags & Luggage', slug: 'bags' },
  { id: 'cat-clothing', name: 'Clothing & Apparel', slug: 'clothing' },
  { id: 'cat-footwear', name: 'Footwear', slug: 'footwear' },
  { id: 'cat-accessories', name: 'Accessories', slug: 'accessories' },
  { id: 'cat-1', name: 'Backpack', slug: 'backpack' },
  { id: 'cat-2', name: 'Messenger Bag', slug: 'messenger' },
  { id: 'cat-3', name: 'Laptop Bag', slug: 'laptop_bag' },
  { id: 'cat-4', name: 'Travel Bag', slug: 'travel_bag' },
  { id: 'cat-5', name: 'Women\'s Handbag', slug: 'handbag' },
];

const LOCAL_STORAGE_KEY = 'mughal_custom_categories';
const LEGACY_STORAGE_KEY = 'noorzan_custom_categories';
// Tracks slugs that the admin has explicitly deleted (including built-in defaults)
const DELETED_CATEGORIES_KEY = 'mughal_deleted_categories';

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

// Category display name formatter
export function formatCategoryName(category) {
  if (!category) return 'General Collection';
  const clean = category.toString().trim();
  const lower = clean.toLowerCase();

  const labels = {
    watches: 'Watches',
    watch: 'Watches',
    clothing: 'Clothing & Apparel',
    cloths: 'Clothing',
    clothes: 'Clothing',
    bags: 'Bags & Luggage',
    bag: 'Bags',
    backpack: 'Backpack',
    messenger: 'Messenger Bag',
    laptop_bag: 'Laptop Bag',
    travel_bag: 'Travel Bag',
    handbag: 'Handbag',
    accessories: 'Accessories',
    footwear: 'Footwear',
    shoes: 'Footwear',
    jewelry: 'Jewelry',
  };

  if (labels[lower]) return labels[lower];

  return clean
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

// Get deleted category slugs blacklist from localStorage
const getDeletedSlugs = () => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(DELETED_CATEGORIES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

// Save deleted slugs blacklist
const saveDeletedSlugs = (slugs) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(DELETED_CATEGORIES_KEY, JSON.stringify(slugs));
  } catch (err) {
    console.error('Failed to save deleted categories:', err);
  }
};

// Get categories from local storage cache
const getLocalCategories = () => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY);
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
  const deletedSlugs = getDeletedSlugs();

  // Start with DEFAULT_CATEGORIES, excluding any the admin has deleted
  let categories = DEFAULT_CATEGORIES.filter((c) => !deletedSlugs.includes(c.slug));
  const localCats = getLocalCategories();

  // Merge local categories (skip any deleted ones)
  localCats.forEach((lCat) => {
    if (!deletedSlugs.includes(lCat.slug) && !categories.some((c) => c.slug === lCat.slug)) {
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
          // Skip any categories the admin explicitly deleted
          if (deletedSlugs.includes(dbCat.slug)) return;
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

  // Also include any categories found in products that aren't yet in list (skip deleted ones)
  if (existingProducts && existingProducts.length > 0) {
    existingProducts.forEach((p) => {
      if (p.category && !deletedSlugs.includes(p.category) && !categories.some((c) => c.slug === p.category)) {
        categories.push({
          id: `prod-cat-${p.category}`,
          name: formatCategoryName(p.category),
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

  // Remove from deleted blacklist in case admin is re-creating a previously deleted category
  const deleted = getDeletedSlugs();
  if (deleted.includes(slug)) {
    saveDeletedSlugs(deleted.filter((s) => s !== slug));
  }

  // If Supabase configured, attempt insert in categories table
  if (isSupabaseConfigured()) {
    try {
      // 8 second timeout wrapper
      const insertPromise = supabase
        .from('categories')
        .insert([{ name: cleanName, slug: slug }])
        .select();

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Supabase request timed out')), 8000)
      );

      const { data, error } = await Promise.race([insertPromise, timeoutPromise]);

      if (error) {
        console.error('Supabase categories insert error:', error);
        if (error.code === '42P01') {
          throw new Error('Supabase table "categories" does not exist. Please run migration 008 in Supabase SQL editor.');
        } else if (error.code === '42501') {
          throw new Error('Permission denied on "categories". Please run migration 008 in Supabase SQL editor.');
        } else {
          throw new Error(error.message || 'Failed to save category to Supabase');
        }
      }

      if (data && data.length > 0) {
        return data[0];
      }
    } catch (err) {
      console.error('Failed to insert category to Supabase:', err);
      throw err;
    }
  }

  return newCat;
}

/**
 * Delete a category
 */
export async function removeCategory(slug) {
  // Remove from local custom categories list
  const currentLocal = getLocalCategories();
  saveLocalCategories(currentLocal.filter((c) => c.slug !== slug));

  // Add to deleted blacklist so DEFAULT_CATEGORIES entry is also suppressed
  const deleted = getDeletedSlugs();
  if (!deleted.includes(slug)) {
    saveDeletedSlugs([...deleted, slug]);
  }

  if (isSupabaseConfigured()) {
    try {
      await supabase.from('categories').delete().eq('slug', slug);
    } catch (err) {
      console.warn('Failed to delete from Supabase categories:', err);
    }
  }
}
