# React Native Sonner

An opinionated toast component for React Native inspired by [Sonner](https://sonner.emilkowal.ski/).

## Features

- **Minimalist design** - Clean, modern toast notifications
- **Smooth animations** - Spring and timing animations powered by Reanimated
- **Swipe to dismiss** - Native gesture support with elastic resistance
- **Dark mode** - Automatic theme detection
- **Cross-platform** - iOS, Android, and Expo
- **Simple API** - Just `toast("Hello!")` anywhere
- **Promise toasts** - Loading, success, and error states
- **Rich colors** - Optional vibrant backgrounds
- **Multi-toast support** - Queue management with visible limit
- **Haptic feedback** - Optional haptics for toast events
- **Accessibility** - Screen reader announcements and labels
- **Performant** - 60fps animations with worklet-based gestures
- **Highly customizable** - Styles, icons, and animations

## Installation

```bash
npm install react-native-sonner
```

### Peer Dependencies

```bash
npm install react-native-reanimated react-native-gesture-handler react-native-safe-area-context

# Optional: for SVG icons
npm install react-native-svg

# Optional: for haptic feedback
npm install expo-haptics
```

Make sure to follow the installation instructions for each peer dependency:
- [react-native-reanimated](https://docs.swmansion.com/react-native-reanimated/docs/fundamentals/getting-started/)
- [react-native-gesture-handler](https://docs.swmansion.com/react-native-gesture-handler/docs/fundamentals/installation/)
- [react-native-safe-area-context](https://github.com/th3rdwave/react-native-safe-area-context#installation)

## Quick Start

### 1. Add the Toaster component

```tsx
import { Toaster } from 'react-native-sonner';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <YourApp />
        <Toaster />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
```

### 2. Show toasts anywhere

```tsx
import { toast } from 'react-native-sonner';

function MyComponent() {
  return (
    <Button
      title="Show Toast"
      onPress={() => toast('Hello World!')}
    />
  );
}
```

## API

### Basic Usage

```tsx
// Default toast
toast('Hello World!');

// With description
toast('Event created', {
  description: 'Your event has been scheduled',
});
```

### Toast Variants

```tsx
toast.success('Success!');
toast.error('Something went wrong');
toast.warning('Please check your input');
toast.info('New update available');
toast.loading('Uploading...');
```

### Promise Toast

```tsx
toast.promise(
  fetchData(),
  {
    loading: 'Loading data...',
    success: (data) => `Loaded ${data.count} items`,
    error: (err) => `Error: ${err.message}`,
  }
);
```

### Update Toast

```tsx
const toastId = toast.loading('Uploading...');

// Update the toast later
toast.update(toastId, {
  type: 'success',
  title: 'Upload complete!',
});
```

### With Actions

```tsx
toast('File deleted', {
  action: {
    label: 'Undo',
    onClick: () => restoreFile(),
  },
  cancel: {
    label: 'Dismiss',
    onClick: () => {},
  },
});
```

### Custom Duration

```tsx
// 10 seconds
toast('Long toast', { duration: 10000 });

// Never auto-dismiss
toast('Sticky toast', { duration: Infinity });
```

### Important Toasts

Important toasts won't be hidden when the visible toast limit is reached:

```tsx
toast.error('Critical error!', { important: true });
```

### Dismiss Programmatically

```tsx
const toastId = toast('Loading...');

// Dismiss specific toast
toast.dismiss(toastId);

// Dismiss all toasts
toast.dismiss();
```

### Callbacks

```tsx
toast('Hello', {
  onDismiss: (t) => console.log('Toast dismissed:', t.id),
  onAutoClose: (t) => console.log('Toast auto-closed:', t.id),
});
```

## Toaster Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `position` | `Position` | `"top-center"` | Toast position on screen |
| `theme` | `"light" \| "dark" \| "system"` | `"system"` | Color theme |
| `duration` | `number` | `4000` | Default duration in ms |
| `visibleToasts` | `number` | `3` | Max visible toasts |
| `gap` | `number` | `12` | Gap between toasts |
| `offset` | `object` | `{ top: 52, bottom: 52, left: 16, right: 16 }` | Screen edge offsets |
| `swipeToDismiss` | `boolean` | `true` | Enable swipe gestures |
| `swipeDirection` | `SwipeDirection \| SwipeDirection[]` | `["left", "right"]` | Swipe directions |
| `pauseOnAppBackground` | `boolean` | `true` | Pause timer when app backgrounds |
| `richColors` | `boolean` | `false` | Vibrant backgrounds |
| `closeButton` | `boolean` | `false` | Show close button |
| `hapticFeedback` | `boolean` | `false` | Enable haptic feedback |
| `icons` | `ToastIcons` | - | Custom icons |
| `toastStyles` | `ToastStyles` | - | Default styles for toasts |
| `containerStyle` | `ViewStyle` | - | Container style |
| `animation` | `AnimationConfig` | - | Animation configuration |
| `toasterId` | `string` | - | ID for multiple Toaster instances |

### Position Options

- `"top-left"` / `"top-center"` / `"top-right"`
- `"bottom-left"` / `"bottom-center"` / `"bottom-right"`

### Animation Configuration

```tsx
<Toaster
  animation={{
    duration: 350,      // Entry animation duration (ms)
    exitDuration: 200,  // Exit animation duration (ms)
    useSpring: true,    // Use spring animation for entry
    damping: 18,        // Spring damping
    stiffness: 140,     // Spring stiffness
    mass: 1,            // Spring mass
  }}
/>
```

Per-toast animation:

```tsx
toast('Custom animation', {
  animation: {
    duration: 500,
    useSpring: false,
  },
});
```

## Haptic Feedback

Enable haptic feedback for toast events (requires `expo-haptics`):

```tsx
<Toaster hapticFeedback />
```

Haptics are triggered on:
- Toast appearance (light impact, or notification type for success/warning/error)
- Action button press (medium impact)
- Cancel button press (light impact)

## Accessibility

Toasts automatically announce to screen readers. Customize accessibility:

```tsx
toast('Order placed', {
  accessibility: {
    announceToScreenReader: true,  // default: true
    accessibilityLabel: 'Your order has been successfully placed',
  },
});
```

## Styling

### Custom Toast Styles

```tsx
toast('Styled toast', {
  styles: {
    container: { backgroundColor: '#1a1a1a' },
    title: { color: '#fff', fontWeight: 'bold' },
    description: { color: '#888' },
  },
});
```

### Global Styles via Toaster

```tsx
<Toaster
  toastStyles={{
    container: { borderRadius: 20 },
    title: { fontFamily: 'Inter-Medium' },
  }}
/>
```

### Available Style Keys

- `container` - Toast container
- `content` - Content wrapper
- `title` - Title text
- `description` - Description text
- `actionButton` - Action button
- `actionButtonText` - Action button text
- `cancelButton` - Cancel button
- `cancelButtonText` - Cancel button text
- `closeButton` - Close button

### Custom Icons

```tsx
<Toaster
  icons={{
    success: <MySuccessIcon />,
    error: <MyErrorIcon />,
    warning: <MyWarningIcon />,
    info: <MyInfoIcon />,
    loading: <MySpinner />,
  }}
/>
```

Per-toast icon:

```tsx
toast('Custom icon', {
  icon: <MyIcon />,
});
```

## Multiple Toaster Instances

Use `toasterId` to target specific Toaster instances:

```tsx
// In your layout
<Toaster toasterId="main" position="top-center" />
<Toaster toasterId="bottom" position="bottom-center" />

// Show toast in specific toaster
toast('Top notification', { toasterId: 'main' });
toast('Bottom notification', { toasterId: 'bottom' });
```

## Hooks

### useToastState

Access toast state in components:

```tsx
import { useToastState } from 'react-native-sonner';

function ToastCounter() {
  const { toasts } = useToastState();
  return <Text>Active toasts: {toasts.length}</Text>;
}
```

## Expo Support

React Native Sonner works with Expo out of the box:

```bash
npx expo install react-native-reanimated react-native-gesture-handler react-native-safe-area-context react-native-svg expo-haptics
```

## TypeScript

Full TypeScript support with exported types:

```tsx
import type {
  ToastT,
  ToastType,
  Position,
  ToasterProps,
  AnimationConfig,
  ToastStyles,
  ToastIcons,
} from 'react-native-sonner';
```

## License

MIT
