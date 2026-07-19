# Animation System Documentation

This project uses **Framer Motion** for smooth, professional entrance animations throughout the application.

## Installation

Framer Motion is already installed. To add it to an existing project:

```bash
npm install framer-motion
```

## Available Animation Components

### Core Animated Components

Located in `src/components/motion/index.tsx`:

#### 1. **AnimatedContainer** & **AnimatedItem**

Staggered animations for lists/grids. Child items animate in sequence.

```tsx
import { AnimatedContainer, AnimatedItem } from "@/components/motion";

<AnimatedContainer className="grid grid-cols-3 gap-4">
  {items.map((item) => (
    <AnimatedItem key={item.id}>
      <Card>{item.title}</Card>
    </AnimatedItem>
  ))}
</AnimatedContainer>;
```

#### 2. **FadeIn**

Simple fade-in entrance animation.

```tsx
import { FadeIn } from "@/components/motion";

<FadeIn delay={0.2} duration={0.5}>
  <div>Fades in smoothly</div>
</FadeIn>;
```

#### 3. **SlideInLeft / SlideInRight / SlideInTop / SlideInBottom**

Directional slide-in animations with smooth easing.

```tsx
import { SlideInLeft, SlideInRight } from "@/components/motion";

<SlideInLeft delay={0.1}>Left side slide</SlideInLeft>
<SlideInRight delay={0.1}>Right side slide</SlideInRight>
```

#### 4. **ScaleUp**

Scale-up animation with fade effect, useful for cards and buttons.

```tsx
import { ScaleUp } from "@/components/motion";

<ScaleUp delay={0.1}>
  <Button>Click me</Button>
</ScaleUp>;
```

#### 5. **HoverScale**

Interactive hover effect that scales on hover and tap.

```tsx
import { HoverScale } from "@/components/motion";

<HoverScale>
  <div className="cursor-pointer">Hover me</div>
</HoverScale>;
```

## Animation Utilities

Located in `src/lib/animations.ts`:

### Preset Variants

Use these Framer Motion variants directly with `motion.div`:

```tsx
import {
  slideInFromLeft,
  containerVariants,
  itemVariants,
} from "@/lib/animations";
import { motion } from "framer-motion";

<motion.div initial="hidden" whileInView="visible" variants={slideInFromLeft}>
  Content
</motion.div>;
```

Available variants:

- `fadeIn` - Simple fade
- `slideInFromLeft/Right/Top/Bottom` - Directional slides
- `scaleInUp` - Scale with fade
- `bounceIn` - Bounce effect
- `rotateIn` - Rotate entrance
- `containerVariants` - Parent container
- `itemVariants` - Child items in containers
- `pulse` - Continuous pulse effect

### Animation Config

```tsx
import { animationConfig } from "@/lib/animations";

// Available durations
animationConfig.fast; // 0.2s
animationConfig.normal; // 0.3s
animationConfig.slow; // 0.5s
```

## Implementation Examples

### Example 1: Product Card Grid

```tsx
import { AnimatedContainer, AnimatedItem } from "@/components/motion";

export function ProductGrid({ products }) {
  return (
    <AnimatedContainer className="grid grid-cols-3 gap-6">
      {products.map((product) => (
        <AnimatedItem key={product.id}>
          <ProductCard product={product} />
        </AnimatedItem>
      ))}
    </AnimatedContainer>
  );
}
```

### Example 2: Feature Section

```tsx
import { SlideInLeft, SlideInRight, FadeIn } from "@/components/motion";

export function FeatureSection() {
  return (
    <section className="grid grid-cols-2 gap-12">
      <SlideInLeft>
        <img src="feature.jpg" alt="Feature" />
      </SlideInLeft>

      <div>
        <FadeIn delay={0.2}>
          <h2>Amazing Feature</h2>
          <p>Description here</p>
        </FadeIn>
      </div>
    </section>
  );
}
```

### Example 3: Hero Section with Multiple Entrance

```tsx
import { SlideInTop, SlideInBottom, ScaleUp } from "@/components/motion";

export function Hero() {
  return (
    <section>
      <SlideInTop>
        <h1>Welcome</h1>
      </SlideInTop>

      <SlideInBottom delay={0.2}>
        <p>Subheading</p>
      </SlideInBottom>

      <ScaleUp delay={0.4}>
        <Button>Get Started</Button>
      </ScaleUp>
    </section>
  );
}
```

## Key Features

### Viewport-Based Animation

All animation components are set to `whileInView` which means they trigger when the element comes into view (with a -100px margin for early triggering).

```tsx
viewport={{ once: true, margin: "-100px" }}
```

- `once: true` - Animation only plays once
- `margin: "-100px"` - Starts animation 100px before element is visible

### Customization

All components accept standard Framer Motion props:

```tsx
<FadeIn
  delay={0.5}
  duration={1}
  className="custom-class"
  transition={{ ease: "easeOut" }}
  onClick={() => {}}
>
  Content
</FadeIn>
```

### Using with Tailwind CSS

Animation components work seamlessly with Tailwind classes:

```tsx
<SlideInLeft className="p-6 rounded-lg bg-white shadow-lg">
  Animated content with Tailwind styling
</SlideInLeft>
```

## Performance Optimization

1. **Use `once: true`** - Prevents re-animations on scroll
2. **Stagger animations** - Use `AnimatedContainer` + `AnimatedItem` for better performance with large lists
3. **Lazy animation** - Elements only animate when visible
4. **Viewport margin** - Use margin to start animations early, creating a smoother experience

## Browser Support

Framer Motion supports:

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Updated Components

The following components have been updated with entrance animations:

- `src/app/(public)/properties/page.tsx` - Property cards grid
- `src/components/marketing/featured-properties.tsx` - Featured properties section
- `src/components/marketing/explore-by-category.tsx` - Category cards
- `src/components/marketing/featured-listings.tsx` - Featured listings
- `src/components/marketing/popular-cities.tsx` - City cards
- `src/components/marketing/journey-steps.tsx` - Journey steps
- `src/components/marketing/testimonials.tsx` - Testimonial cards

## Custom Animations

To create custom animations, extend `src/lib/animations.ts`:

```tsx
export const customAnimation: Variants = {
  hidden: { opacity: 0, y: 100 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 50,
      damping: 20,
    },
  },
};
```

Then use with Framer Motion components:

```tsx
import { motion } from "framer-motion";
import { customAnimation } from "@/lib/animations";

<motion.div variants={customAnimation}>Content</motion.div>;
```

## Troubleshooting

### Animations not showing

- Ensure `"use client"` is at the top of client components
- Check that elements are actually coming into viewport
- Verify browser DevTools is not throttling animations

### Performance issues

- Use `once: true` to prevent re-animations
- Consider reducing `staggerChildren` delay in `containerVariants`
- Use `GPU` acceleration by animating `transform` and `opacity` only

### Scroll conflicts

- Ensure viewport margins don't conflict with other scroll listeners
- Test with different margin values: `"-50px"` to `"-200px"`

## Resources

- [Framer Motion Documentation](https://www.framer.com/motion/)
- [Framer Motion API Reference](https://www.framer.com/api/motion/)
- [Framer Motion Examples](https://www.framer.com/motion/examples/)
