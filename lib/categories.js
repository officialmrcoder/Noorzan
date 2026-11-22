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
      if (error && error.code !== '42P01') {
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
