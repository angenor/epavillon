// Test script to verify translations are accessible
import frTranslations from '../src/locales/fr/index.js';
import enTranslations from '../src/locales/en/index.js';

console.log('🔍 Testing translation keys...');

// Test French translations
console.log('\n📝 French translations:');
console.log('community.testimonials.empty.title:', frTranslations.community?.testimonials?.empty?.title);
console.log('community.testimonials.empty.description:', frTranslations.community?.testimonials?.empty?.description);

// Test English translations  
console.log('\n📝 English translations:');
console.log('community.testimonials.empty.title:', enTranslations.community?.testimonials?.empty?.title);
console.log('community.testimonials.empty.description:', enTranslations.community?.testimonials?.empty?.description);

// Verify all keys exist
const frKeys = frTranslations.community?.testimonials?.empty;
const enKeys = enTranslations.community?.testimonials?.empty;

if (frKeys?.title && frKeys?.description && enKeys?.title && enKeys?.description) {
  console.log('\n✅ All testimonial translation keys are present and accessible!');
} else {
  console.log('\n❌ Some testimonial translation keys are missing!');
  process.exit(1);
}

console.log('\n🎉 Translation test completed successfully!');