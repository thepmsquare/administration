# Typography Configuration & Update Guide

This guide explains how to manage and update fonts within the application. The system is designed to be centralized and easily configurable.

## Centralized Configuration

All font families are defined in `src/config/brand.ts`.

```typescript
// src/config/brand.ts
const brandConfig: BrandConfig = {
  // ...
  primaryFont: "Outfit Variable, sans-serif",
  accentFont: "'Fraunces Variable', serif",
};
```

- **`primaryFont`**: Used for the majority of the application UI, including headings, buttons, and general text.
- **`accentFont`**: Used sparingly for accent pieces via the `.accent-font` CSS class.

## How to Change a Font

Follow these steps to replace an existing font or add a new one:

### 1. Install the Font Package
The project uses [Fontsource](https://fontsource.org/) for self-hosting fonts. Install the variable or static version of the font you want.

```bash
npm install @fontsource-variable/new-font-name
```

### 2. Import the Font in `Page.tsx`
Add the import statement at the top of `src/components/Page.tsx` to include the font files in the bundle.

```tsx
// src/components/Page.tsx
import "@fontsource-variable/new-font-name";
```

### 3. Update the Configuration
Modify `src/config/brand.ts` to reference the new font family name.

```typescript
// src/config/brand.ts
primaryFont: "New Font Name Variable, sans-serif",
```

### 4. (Optional) Update Types
If you add any new configuration fields, ensure they are mirrored in `src/types/config/Brand.ts`.

## Usage in Components

### Automatic Theme Application
Most components will automatically use the `primaryFont` defined in the MUI theme.

### Using the Accent Font
To apply the accent font to a specific element, use the `.accent-font` CSS class:

```tsx
<Typography className="accent-font">
  This text will use the accent font.
</Typography>
```

The `.accent-font` class is defined in `src/stylesheets/common.css` and consumes the `accentFont` value from the configuration via a CSS variable injected in `Page.tsx`.
