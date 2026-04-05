# Christian De Goma Portfolio

A modern, interactive portfolio website featuring a custom "Portfolio OS" boot animation and glass-morphism design elements. Showcasing projects, education, and professional experience with a sleek, tech-forward aesthetic.

## ✨ Features

- **Custom Boot Loader** - Matrix-style loading animation with system-inspired UI
- **Glass-Morphism Navigation** - Modern frosted-glass effect navigation component
- **Responsive Design** - Mobile-friendly layout using Tailwind CSS
- **Smooth Animations** - Interactive dot-grid effects and fluid hover states
- **Project Showcase** - Dedicated section for highlighting your best work
- **Contact Integration** - Email-based contact form system
- **Dark Theme** - Contemporary dark mode design with custom color palette

## 🛠️ Tech Stack

- **HTML5** - Semantic markup
- **CSS3** - Custom styling with glass-morphism effects
- **JavaScript (Vanilla)** - Interactive components and animations
- **Tailwind CSS** - Utility-first CSS framework
- **Font Awesome** - Icon library
- **Google Fonts** - Space Grotesk & Inter typefaces

## 📁 Project Structure

```
.
├── index.html                    # Main portfolio homepage
├── blog-post.html               # Blog post template
├── contact-letter-email.js       # Contact form handler
├── glass-nav.js                 # Navigation component logic
├── glass-nav.css                # Navigation styling
├── dot-grid.js                  # Animated dot grid effect
├── fluid-glass-hover.html       # Glass hover effect demo
├── playground.js                # Development/testing file
├── script.js                    # Main application logic
├── script_append.js             # Additional scripts
├── style.css                    # Global styles
├── tailwind.config.js           # Tailwind configuration
├── asset/                       # Media and content assets
│   ├── about/                   # About section content
│   ├── education/               # Education history
│   └── projects/                # Project showcase files
└── readme.md                    # This file
```

## 🚀 Getting Started

### Prerequisites
- A modern web browser (Chrome, Firefox, Safari, Edge)
- No build tools or dependencies required (vanilla HTML/CSS/JS)

### Installation

1. **Clone or download** the repository to your local machine
2. **Open `index.html`** in your web browser
   - Directly: Double-click `index.html`
   - Or use a local server (recommended for best functionality):
     ```powershell
     # Using Python
     python -m http.server 8000
     
     # Using Node.js (http-server)
     npx http-server
     ```
3. Visit `http://localhost:8000` (or appropriate port) in your browser

## 📝 Customization

### Update Portfolio Content
- Edit asset folders (`about/`, `education/`, `projects/`) with your own content
- Modify `index.html` to update the main structure and sections

### Customize Colors
- Edit the color scheme in `tailwind.config.js`:
  ```javascript
  colors: {
    'brand-blue': '#0066cc',
    'brand-dark': '#050A18',
    // ... modify hex values as needed
  }
  ```

### Modify Boot Loader
- Edit the boot animation in `index.html` (boot-loader section)
- Adjust timing and messaging in `script.js`

### Update Contact Form
- Configure email settings in `contact-letter-email.js`
- Update form recipient and message templates

## 📧 Contact Integration

The contact form uses `contact-letter-email.js` to handle form submissions. Ensure it's properly configured with your email service before deployment.

## 🎨 Design Elements

- **Glass-Morphism**: Frosted glass effect backgrounds and overlays
- **Dot Grid**: Background pattern used in various sections
- **Fluid Hover**: Smooth animation effects on interactive elements
- **Boot Theme**: Retro terminal/OS inspired loading experience

## 📱 Responsive Design

The portfolio is fully responsive and optimized for:
- Desktop (1920px and above)
- Laptop (1280px - 1919px)
- Tablet (768px - 1279px)
- Mobile (below 768px)

## 🔗 Resources Used

- [Tailwind CSS](https://tailwindcss.com/)
- [Font Awesome](https://fontawesome.com/)
- [Devicons](https://devicons.dev/)
- [Google Fonts](https://fonts.google.com/)

## 📄 License

Personal portfolio project - All rights reserved.

---

**Version:** 2.5.1  
**Last Updated:** 2026
