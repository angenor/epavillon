// Test script to verify createPost translations are accessible
import frTranslations from '../src/locales/fr/index.js';
import enTranslations from '../src/locales/en/index.js';

console.log('🔍 Testing createPost translation keys...');

// Test French translations
console.log('\n📝 French createPost translations:');
console.log('community.createPost.testimonialTitle:', frTranslations.community?.createPost?.testimonialTitle);
console.log('community.createPost.testimonialTitlePlaceholder:', frTranslations.community?.createPost?.testimonialTitlePlaceholder);
console.log('community.createPost.willBeUsedAsThumbnail:', frTranslations.community?.createPost?.willBeUsedAsThumbnail);

// Test English translations  
console.log('\n📝 English createPost translations:');
console.log('community.createPost.testimonialTitle:', enTranslations.community?.createPost?.testimonialTitle);
console.log('community.createPost.testimonialTitlePlaceholder:', enTranslations.community?.createPost?.testimonialTitlePlaceholder);
console.log('community.createPost.willBeUsedAsThumbnail:', enTranslations.community?.createPost?.willBeUsedAsThumbnail);

// Verify all keys exist
const frKeys = frTranslations.community?.createPost;
const enKeys = enTranslations.community?.createPost;

const requiredKeys = ['testimonialTitle', 'testimonialTitlePlaceholder', 'willBeUsedAsThumbnail'];
let allKeysPresent = true;

requiredKeys.forEach(key => {
  if (!frKeys?.[key] || !enKeys?.[key]) {
    console.log(`❌ Missing key: ${key}`);
    allKeysPresent = false;
  }
});

if (allKeysPresent) {
  console.log('\n✅ All createPost translation keys are present and accessible!');
} else {
  console.log('\n❌ Some createPost translation keys are missing!');
  process.exit(1);
}

console.log('\n🎉 CreatePost translation test completed successfully!');