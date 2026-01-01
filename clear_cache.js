// Quick Cache Clear Script
// Copy and paste this into browser console (F12 → Console tab)

console.log('🧹 Clearing old project cache...');

// Clear all IDE-related localStorage
const keysToRemove = [
  'ide-project-id',
  'ide-chat-messages',
  'ide-chat-history',
  'resonant-chat-messages',
  'resonant-chat-history',
  'resonant-chat-conversations',
];

keysToRemove.forEach(key => {
  localStorage.removeItem(key);
  console.log(`✅ Removed: ${key}`);
});

// Clear all sessionStorage
sessionStorage.clear();
console.log('✅ Cleared sessionStorage');

// Clear all localStorage keys that start with 'ide-' or 'resonant-'
Object.keys(localStorage).forEach(key => {
  if (key.startsWith('ide-') || key.startsWith('resonant-')) {
    localStorage.removeItem(key);
    console.log(`✅ Removed: ${key}`);
  }
});

console.log('✅ Cache cleared! Now refresh the page (Cmd/Ctrl + Shift + R)');

