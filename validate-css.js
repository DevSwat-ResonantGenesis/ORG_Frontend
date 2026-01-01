#!/usr/bin/env node
/**
 * Quick CSS Validation Script
 * Checks if global.css has valid syntax
 */

const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, 'src/theme/global.css');

try {
  const css = fs.readFileSync(cssPath, 'utf8');
  
  // Basic validation checks
  const issues = [];
  
  // Check for unmatched braces
  const openBraces = (css.match(/{/g) || []).length;
  const closeBraces = (css.match(/}/g) || []).length;
  if (openBraces !== closeBraces) {
    issues.push(`Unmatched braces: ${openBraces} open, ${closeBraces} close`);
  }
  
  // Check for invalid :not() syntax (chained :not() can be problematic)
  const invalidNotPattern = /:not\([^)]+\):not\([^)]+\)/g;
  if (invalidNotPattern.test(css)) {
    issues.push('Found potentially invalid chained :not() selectors');
  }
  
  // Check file size (too large might cause issues)
  if (css.length > 100000) {
    issues.push(`CSS file is very large: ${css.length} characters`);
  }
  
  if (issues.length === 0) {
    console.log('✅ CSS file appears valid!');
    console.log(`   File size: ${css.length} characters`);
    console.log(`   Braces: ${openBraces} open, ${closeBraces} close (balanced)`);
    process.exit(0);
  } else {
    console.log('⚠️  CSS file has potential issues:');
    issues.forEach(issue => console.log(`   - ${issue}`));
    process.exit(1);
  }
} catch (error) {
  console.error('❌ Error reading CSS file:', error.message);
  process.exit(1);
}

