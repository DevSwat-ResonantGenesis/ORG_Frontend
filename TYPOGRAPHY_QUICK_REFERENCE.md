# Typography Quick Reference Guide

## 🎯 Quick Lookup

### Component Import
```tsx
import heroTitleStyles from '@/components/ui/HeroTitle.module.css';
import titleStyles from '@/components/ui/Title.module.css';
```

---

## 📏 Size Reference

### Hero Section
```tsx
<h1 className={heroTitleStyles.heroTitle}>Main Title</h1>
// Desktop: 96px | Mobile: 42px | Weight: 800

<p className={heroTitleStyles.heroSubtitle}>Subtitle</p>
// Desktop: 40px | Mobile: 22px | Weight: 600
```

### Section Titles
```tsx
<h2 className={titleStyles.sectionTitle}>Section Heading</h2>
// Desktop: 36px | Mobile: 28px | Weight: 700

<h2 className={titleStyles.ctaTitle}>Call to Action</h2>
// Desktop: 36px | Mobile: 28px | Weight: 700
```

### Card/Feature Titles
```tsx
<h3 className={titleStyles.featureTitle}>Feature Name</h3>
// 24px | Weight: 600

<h3 className={titleStyles.serviceTitle}>Service Name</h3>
// 24px | Weight: 600

<h3 className={titleStyles.differentiatorTitle}>Differentiator</h3>
// 24px | Weight: 700
```

### Special Titles
```tsx
<h2 className={titleStyles.largeTitle}>Large Section</h2>
// 28px | Weight: 600

<h3 className={titleStyles.mediumTitle}>Medium Title</h3>
// 24px | Weight: 600

<h4 className={titleStyles.subsectionTitle}>Subsection</h4>
// 18px | Weight: 600
```

---

## 🎨 Common Patterns

### Hero Section Pattern
```tsx
<section className={styles.hero}>
  <h1 className={heroTitleStyles.heroTitle}>
    AI Governance Platform
  </h1>
  <p className={heroTitleStyles.heroSubtitle}>
    Complete Control for Multi-AI Operations
  </p>
</section>
```

### Section with Cards Pattern
```tsx
<section>
  <h2 className={titleStyles.sectionTitle}>
    Our Services
  </h2>
  <div className={styles.cards}>
    <div className={styles.card}>
      <h3 className={titleStyles.serviceTitle}>
        Service Name
      </h3>
      <p>Description...</p>
    </div>
  </div>
</section>
```

### Pricing Section Pattern
```tsx
<section>
  <h2 className={titleStyles.sectionTitle}>
    Pricing Plans
  </h2>
  <div className={styles.pricingCard}>
    <h3 className={titleStyles.pricingName}>
      Plan Name
    </h3>
    <p>Plan details...</p>
  </div>
</section>
```

---

## 🔍 Troubleshooting

### Typography Not Applying?
1. ✅ Check CSS module import
2. ✅ Verify class name spelling
3. ✅ Check browser DevTools for actual class name
4. ✅ Ensure element has the class applied

### Size Not Responsive?
1. ✅ Hero titles use `clamp()` - should be responsive
2. ✅ Section titles use `clamp()` - should be responsive
3. ✅ Card titles are fixed at 24px (intentional)

### Dark Mode Not Working?
1. ✅ All components support dark mode automatically
2. ✅ Check `[data-theme='dark']` attribute on root element

---

## 📱 Responsive Breakpoints

- **Mobile:** < 640px
- **Tablet:** 640px - 1023px
- **Desktop:** 1024px+

---

## ⚡ Quick Tips

1. **Always use CSS modules** for component-specific typography
2. **Use explicit pixel values** for critical typography (not CSS variables)
3. **Hero titles** should be the largest (96px desktop)
4. **Card titles** should be consistent (24px)
5. **Body text** should be readable (15-18px)

---

## 📚 Full Documentation

For complete documentation, see:
- `TYPOGRAPHY_SYSTEM.md` - Full system guide
- `TYPOGRAPHY_FIX_SUMMARY.md` - Implementation details

---

## 🎯 Hierarchy Reminder

```
Hero Title (96px) 
  ↓
Hero Subtitle (40px)
  ↓
Section Title (36px)
  ↓
Large Title (28px)
  ↓
Card Title (24px)
  ↓
Subsection Title (18px)
  ↓
Body Text (15-18px)
```

