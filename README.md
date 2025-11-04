# 🌟 AnitechCS Corporate Website

> **Professional, responsive corporate website built with HTML5, CSS3, JavaScript, and modern web technologies**

![AnitechCS Website](https://img.shields.io/badge/Status-Live-brightgreen) ![GitHub Pages](https://img.shields.io/badge/Deployed%20on-GitHub%20Pages-blue) ![License](https://img.shields.io/badge/License-MIT-green)

## 🚀 Live Demo

**🌐 Website URL:** [https://akshatkardak.github.io/IT-3/](https://akshatkardak.github.io/IT-3/)

---

## 🐛 **GitHub Pages Deployment Error Fix**

**If you're seeing deployment errors, follow these exact steps:**

### **Step 1: Enable GitHub Pages**
```bash
1. Go to your repository: https://github.com/AkshatKardak/IT-3
2. Click "Settings" tab
3. Scroll down to "Pages" section on left sidebar
4. Under "Build and deployment":
   - Source: Select "GitHub Actions" (not "Deploy from a branch")
   - Click "Save"
```

### **Step 2: Fix Workflow Permissions**
```bash
1. Still in Settings, go to "Actions" → "General"
2. Under "Workflow permissions":
   - Select "Read and write permissions" ✓
   - Check "Allow GitHub Actions to create and approve pull requests" ✓
   - Click "Save"
```

### **Step 3: Re-run Deployment**
```bash
1. Go to "Actions" tab
2. Click on the failed "Deploy to Pages" workflow
3. Click "Re-run all jobs" button
4. Wait for green checkmarks
```

### **Step 4: Verify Deployment**
Once successful, your website will be available at:
**https://akshatkardak.github.io/IT-3/**

---

## 📋 Project Overview

AnitechCS is a modern, professional corporate website showcasing IT services including:
- 💻 **Website Development** - Custom web solutions
- ☁️ **Cloud Hosting** - Reliable hosting services
- 🛠️ **Maintenance & Support** - Ongoing website care
- 🔄 **Digital Transformation** - Business modernization

## 🎯 Key Features

### ✨ **Modern Design & UX**
- Fully responsive design (mobile-first approach)
- Clean, professional corporate aesthetics
- Smooth animations and transitions
- Cross-browser compatibility

### 🛡️ **Security & Privacy**
- Math Captcha system (no reCAPTCHA needed)
- Form validation and sanitization
- Secure contact form with mailto integration
- Privacy-compliant features

### 🗺️ **Interactive Elements**
- Interactive Leaflet.js map (no API key required)
- Custom chat widget with smart responses
- FAQ accordion system
- Dynamic pricing with multi-currency support

### 📊 **Analytics & Tracking**
- Google Analytics integration with your API
- Custom event tracking
- User interaction monitoring
- Performance metrics

### 💰 **Advanced Features**
- Static exchange rate system (10 currencies)
- Holiday discount automation
- Admin panel integration
- Professional contact forms

---

## 🏗️ **Technology Stack**

| Category | Technologies |
|----------|-------------|
| **Frontend** | HTML5, CSS3, JavaScript (ES6+) |
| **Frameworks** | Bootstrap 5.3.2 |
| **Icons** | Font Awesome 6.4.0 |
| **Maps** | Leaflet.js 1.9.4 + OpenStreetMap |
| **Analytics** | Google Analytics 4 (Your API) |
| **Deployment** | GitHub Pages + GitHub Actions |
| **Version Control** | Git & GitHub |

---

## 🔧 **Quick Fixes for Common Deployment Errors**

### **❌ Error: "Pages build and deployment failed"**
**Solution:**
1. Repository Settings → Pages
2. Source: Change to "GitHub Actions" ✓
3. Re-run workflow in Actions tab

### **❌ Error: "Resource not accessible by integration"**
**Solution:**
1. Settings → Actions → General
2. Workflow permissions: "Read and write" ✓
3. "Allow GitHub Actions to create PRs": ✓
4. Save and re-run workflow

### **❌ Error: "Workflow run failed"**
**Solution:**
1. Actions tab → Click failed workflow
2. Check logs for specific error
3. Click "Re-run all jobs"
4. If still fails, the workflow file is correct - check repo permissions

---

## 📊 **Features Included**

### ✅ **No API Keys Required**
- **Maps**: Uses free OpenStreetMap
- **Captcha**: Pure JavaScript math problems
- **Chat**: Self-contained widget
- **Exchange Rates**: Static rates with optional live updates

### ✅ **API Integrations Included**
- **Google Analytics**: Your user ID and API key integrated
- **Exchange Rates**: Optional live rate fetching
- **Map Services**: Leaflet.js with OpenStreetMap

### ✅ **Professional Features**
- Comprehensive contact forms
- Interactive office map
- Multi-currency pricing
- Holiday discount system
- FAQ system
- Customer chat widget
- Admin management panel

---

## 🐛 **Troubleshooting**

### **Map Showing Blank Box**
**If the contact page map is blank:**

1. **Check browser console** for errors
2. **Verify Leaflet loaded**: Type `typeof L` in console (should be "object")
3. **Check map height**: Map container should have `height: 400px`
4. **Network issues**: Some networks block OpenStreetMap tiles

**Quick Fix - Add this to contact.html head:**
```html
<style>
#map { 
    min-height: 400px !important; 
    height: 400px !important; 
    background: #f0f0f0;
}
</style>
```

### **Deployment Still Failing**
**If GitHub Pages deployment keeps failing:**

1. **Check repository is public** (or has Pages enabled for private)
2. **Verify index.html exists** at root level ✓
3. **No special characters** in file names
4. **All linked files exist** (CSS, JS, images)

**Alternative: Manual Pages Setup**
```bash
1. Settings → Pages
2. Source: "Deploy from a branch"
3. Branch: "main"
4. Folder: "/ (root)"
5. Save
```

---

## 📞 **Support**

**For website inquiries:**
- 📧 Email: [sales@anitechcs.com](mailto:sales@anitechcs.com)
- 📞 Phone: +1 (555) 123-4567
- 🌐 Live Site: [https://akshatkardak.github.io/IT-3/](https://akshatkardak.github.io/IT-3/)

**For technical repository issues:**
- 🐛 [Open an Issue](https://github.com/AkshatKardak/IT-3/issues)
- 💬 [Discussions](https://github.com/AkshatKardak/IT-3/discussions)

---

## 🚀 **Deployment Status**

- ✅ **Repository**: All files committed
- ✅ **Workflow**: GitHub Actions configured
- ⚙️ **Pages**: Enable in Settings → Pages
- 🔄 **Auto-Deploy**: On every push to main
- 🌐 **Live URL**: [https://akshatkardak.github.io/IT-3/](https://akshatkardak.github.io/IT-3/)

**Next Steps:**
1. Enable GitHub Pages in repository settings
2. Re-run failed workflow if needed
3. Your website will be live!

---

*Built with ❤️ for AnitechCS*