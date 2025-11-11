# Migration Guide

This guide will help you extract the landing page package to a separate repository.

## Step 1: Create New Repository

1. Create a new Git repository:
   ```bash
   mkdir mailist-landing-page
   cd mailist-landing-page
   git init
   ```

2. Copy the entire `landing-page-package` folder:
   ```bash
   cp -r /path/to/mailist-frontend/landing-page-package/* .
   ```

## Step 2: Update Import Paths

If you're using the package in the original project, update the import paths:

**Before:**
```typescript
import { LandingPageComponent } from '../../../landing-page-package/landing-page.component';
```

**After (if published to npm):**
```typescript
import { LandingPageComponent } from '@mailist/landing-page';
```

**After (if using as local package):**
```typescript
import { LandingPageComponent } from '@mailist/landing-page';
```

And add to `package.json`:
```json
{
  "dependencies": {
    "@mailist/landing-page": "file:../mailist-landing-page"
  }
}
```

## Step 3: Setup Package for Publishing (Optional)

If you want to publish to npm:

1. Update `package.json` with your details
2. Add build configuration
3. Create `.npmignore`:
   ```
   *.ts
   !*.d.ts
   *.spec.ts
   tsconfig.json
   ```

4. Add build script to `package.json`:
   ```json
   {
     "scripts": {
       "build": "tsc",
       "prepublishOnly": "npm run build"
     }
   }
   ```

## Step 4: Update Documentation

1. Update README.md with your repository URL
2. Add screenshots
3. Add live demo link if available

## Step 5: Testing

Test the package in your main application:

```typescript
// In your main app
import { LandingPageComponent } from '@mailist/landing-page';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [LandingPageComponent],
  template: '<app-landing-page></app-landing-page>'
})
export class Landing {}
```

## Step 6: Version Control

1. Initialize git in the new repository:
   ```bash
   git add .
   git commit -m "Initial commit: Landing page package v1.0.0"
   ```

2. Push to remote:
   ```bash
   git remote add origin https://github.com/yourusername/mailist-landing-page.git
   git push -u origin main
   ```

## Customization After Migration

### Update Branding

1. Replace "Mailist" with your brand name in all components
2. Update colors in CSS variables
3. Customize content (stats, features, testimonials, pricing)

### Add Your Own Features

Each component is standalone and can be modified independently:

```typescript
// Example: Adding a new feature to FeaturesComponent
features: Feature[] = [
  ...defaultFeatures,
  {
    icon: 'lucide:your-icon',
    title: 'Your Feature',
    description: 'Your description'
  }
];
```

### Modify Styles

All styles are scoped to components. Modify the `.css` files in each component folder:

```css
/* Example: Change primary color */
:root {
  --primary-color: #your-color;
  --primary-hover-color: #your-hover-color;
}
```

## Troubleshooting

### Icons Not Showing

Make sure `iconify-icon` is installed:
```bash
npm install iconify-icon
```

### Routing Issues

Ensure `@angular/router` is installed and `RouterLink` directives point to valid routes in your application.

### Styling Conflicts

All classes are prefixed with `landing-` to minimize conflicts. If you still have conflicts, you can wrap the entire landing page in a scoped class:

```css
.my-landing-page {
  /* Your overrides */
}
```

## Publishing to NPM (Optional)

1. Login to npm:
   ```bash
   npm login
   ```

2. Publish:
   ```bash
   npm publish --access public
   ```

3. Install in your projects:
   ```bash
   npm install @mailist/landing-page
   ```

## Maintenance

### Updating the Package

1. Make your changes
2. Update version in `package.json`
3. Commit and tag:
   ```bash
   git add .
   git commit -m "Update: description of changes"
   git tag v1.0.1
   git push origin main --tags
   ```

4. If published to npm:
   ```bash
   npm publish
   ```

## Support

For questions or issues, please refer to the main README.md or open an issue on GitHub.
