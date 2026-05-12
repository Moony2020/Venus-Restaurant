import mongoose from 'mongoose';

export const ALLOWED_CATEGORIES = [
  'Populärt',
  'Förrätt',
  'Pizzor Klass 1',
  'Pizzor Klass 2',
  'Pizzor Klass 3',
  'Pizzor Klass 4',
  'Special Pizzor',
  'Oxfilépizzor',
  'Kebabrätter',
  'A la Carte',
  'Övrigt',
  'Sallader',
  'Såser',
  'Drycker'
];

// Mapping helper to catch common variations
const categoryMap = {
  'populart': 'Populärt',
  'förrätt': 'Förrätt',
  'forratt': 'Förrätt',
  'pizzor-klass-1': 'Pizzor Klass 1',
  'pizzor-klass-2': 'Pizzor Klass 2',
  'pizzor-klass-3': 'Pizzor Klass 3',
  'pizzor-klass-4': 'Pizzor Klass 4',
  'special-pizzor': 'Special Pizzor',
  'specialpizzor': 'Special Pizzor',
  'oxfilepizzor': 'Oxfilépizzor',
  'kebabratter': 'Kebabrätter',
  'a-la-carte': 'A la Carte',
  'ovrigt': 'Övrigt',
  'sallader': 'Sallader',
  'saser': 'Såser',
  'drycker': 'Drycker',
  'appetizer': 'Förrätt'
};

const menuItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    category: { 
      type: String, 
      required: true, 
      index: true,
      enum: {
        values: ALLOWED_CATEGORIES,
        message: '{VALUE} is not a valid category'
      }
    },
    description: { type: String, required: true },
    image: { type: String, required: true },
    price: { type: Number, required: true },
    position: { type: Number, default: 0, index: true },
    available: { type: Boolean, default: true },
    tags: { type: [String], default: [] },
    lunchOfDay: { type: Boolean, default: false },
    prepMinutes: { type: Number, default: 15 }
  },
  { timestamps: true }
);

// Normalization helper
export const normalizeCategory = (input) => {
  if (!input) return input;
  const raw = input.trim();
  const normalizedKey = raw.toLowerCase().replace(/\s+/g, '-');
  
  if (ALLOWED_CATEGORIES.includes(raw)) return raw;
  
  const mapped = categoryMap[normalizedKey] || 
                 Object.values(categoryMap).find(v => v.toLowerCase() === raw.toLowerCase());
  
  return mapped || raw; // Return mapped or original if no match
};

// Pre-validate hook to normalize incoming category
menuItemSchema.pre('validate', function(next) {
  if (this.category) {
    this.category = normalizeCategory(this.category);
  }
  next();
});

export default mongoose.model('MenuItem', menuItemSchema);
