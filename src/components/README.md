# Components

This directory contains reusable UI components for the Mahanaim Money application.

## Mobile-Specific Components

### MobileNavigation

A bottom navigation bar component optimized for mobile devices. It provides easy access to the most important sections of the app with large touch targets.

**Features:**
- Role-based navigation links (different for admin and shop users)
- Active state indication
- Fixed positioning at the bottom of the screen
- Safe area inset support for iOS devices with notches

**Usage:**
```tsx
<MobileNavigation onSignOut={handleSignOut} />
```

### PullToRefresh

A component that adds pull-to-refresh functionality to any scrollable content, similar to native mobile apps.

**Features:**
- Visual feedback during pull gesture
- Customizable threshold and animation
- Works with any scrollable content
- Supports both light and dark modes

**Usage:**
```tsx
<PullToRefresh onRefresh={fetchLatestData}>
  <YourContent />
</PullToRefresh>
```

## Utility Hooks for Mobile

### useSwipeGesture

A hook for detecting swipe gestures on mobile devices.

**Features:**
- Detects swipes in all four directions (left, right, up, down)
- Customizable threshold for activation
- Option to prevent default touch behavior

**Usage:**
```tsx
const containerRef = useRef(null);

useSwipeGesture(containerRef, {
  onSwipeLeft: () => handlePreviousItem(),
  onSwipeRight: () => handleNextItem(),
  threshold: 50,
});

return <div ref={containerRef}>{/* Your content */}</div>;
```

## Internationalization

All components support both English and French languages through the i18n system. The default language is French as per project requirements.

## Responsive Design

Components are designed to be responsive across different screen sizes with special attention to mobile devices:

- Touch-friendly UI elements with appropriate sizing
- Bottom navigation for mobile
- Swipe gestures for common actions
- Pull-to-refresh for content updates
- Safe area insets for modern mobile devices 