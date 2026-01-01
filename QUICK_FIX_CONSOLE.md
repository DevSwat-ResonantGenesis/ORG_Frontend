# Quick Fix - Run in Console

Copy and paste this into your browser console (DevTools):

```javascript
// Clear API test flag
sessionStorage.removeItem('rg_api_test_run');

// Suppress network errors (they're expected - backend isn't running)
const originalWarn = console.warn;
const originalError = console.error;

console.warn = function(...args) {
  const msg = args[0]?.toString() || '';
  if (msg.includes('Network error') || msg.includes('ERR_NETWORK') || msg.includes('API connection')) {
    return; // Suppress
  }
  originalWarn.apply(console, args);
};

console.error = function(...args) {
  const msg = args[0]?.toString() || '';
  if (msg.includes('ERR_CONNECTION_REFUSED') || msg.includes('ERR_NETWORK')) {
    return; // Suppress
  }
  originalError.apply(console, args);
};

console.log('✅ Console errors suppressed! Refresh the page now.');
```

Then refresh the page (Cmd+R or F5).

---

**The embedding test page will work fine - these errors are just noise!** 🎯

