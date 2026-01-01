// Scroll Debugging Utility
// Run this in browser console to diagnose scroll issues

export const debugScroll = () => {
  console.log('🔍 SCROLL DEBUG REPORT');
  console.log('====================');
  
  // Check all scrollable containers
  const selectors = [
    '.section', // EnhancedSidebar
    '.chatMessages', // IDE Chat
    '.messagesContainer', // FloatingChatWidget & ResonantChatPage
    '.menuList', // HomePageDropdownMenu
    '.navContainer', // Main Sidebar
    '.content', // IDE Settings
  ];
  
  selectors.forEach(selector => {
    const elements = document.querySelectorAll(selector);
    elements.forEach((el, idx) => {
      const htmlEl = el as HTMLElement;
      const computed = window.getComputedStyle(htmlEl);
      const scrollHeight = htmlEl.scrollHeight;
      const clientHeight = htmlEl.clientHeight;
      const overflowY = computed.overflowY;
      const flex = computed.flex;
      const minHeight = computed.minHeight;
      const height = computed.height;
      
      console.log(`\n📍 ${selector}[${idx}]:`);
      console.log(`  overflow-y: ${overflowY}`);
      console.log(`  flex: ${flex}`);
      console.log(`  min-height: ${minHeight}`);
      console.log(`  height: ${height}`);
      console.log(`  scrollHeight: ${scrollHeight}px`);
      console.log(`  clientHeight: ${clientHeight}px`);
      console.log(`  Can scroll: ${scrollHeight > clientHeight ? '✅ YES' : '❌ NO (content fits)'}`);
      
      if (overflowY !== 'auto' && overflowY !== 'scroll') {
        console.warn(`  ⚠️ overflow-y is "${overflowY}" but should be "auto"`);
      }
      
      if (scrollHeight <= clientHeight) {
        console.warn(`  ⚠️ Content doesn't overflow - no scroll needed`);
      }
    });
  });
  
  console.log('\n✅ Debug complete. Check warnings above.');
};

// Auto-run in development
if (import.meta.env.DEV) {
  // Wait for DOM to be ready
  if (typeof window !== 'undefined') {
    window.addEventListener('load', () => {
      setTimeout(() => {
        console.log('💡 Run debugScroll() in console to check scroll issues');
        (window as any).debugScroll = debugScroll;
      }, 2000);
    });
  }
}

