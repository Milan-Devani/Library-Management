import pptxgen from 'pptxgenjs';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pptx = new pptxgen();

// CRITICAL: LAYOUT_WIDE is true 16:9 widescreen (13.333 x 7.5 inches / 12192000 x 6858000 EMUs).
pptx.layout = 'LAYOUT_WIDE';

// Coordinated Professional Palette
const COLORS = {
  primary: '1E3A8A',     // Deep Navy
  accent: '2563EB',      // Royal Blue
  accentLight: 'EFF6FF', // Soft Blue tint
  textDark: '0F172A',    // Dark Slate
  textMuted: '475569',   // Slate Gray
  bgLight: 'F8FAFC',     // Off-white / light slate
  cardBorder: 'E2E8F0',  // Border gray
  white: 'FFFFFF',
  green: '059669',       // Emerald
  amber: 'D97706',       // Amber
  red: 'DC2626'          // Red
};

// Safe Slide Header with explicit bounded margins
function addSlideHeader(slide, title, category = 'LIBRARY MANAGEMENT SYSTEM') {
  // Category banner
  slide.addText(category.toUpperCase(), {
    x: 0.8,
    y: 0.35,
    w: 11.73,
    h: 0.25,
    fontSize: 9.5,
    fontFace: 'Arial',
    bold: true,
    color: COLORS.accent,
    charSpacing: 2
  });

  // Slide Title
  slide.addText(title, {
    x: 0.8,
    y: 0.60,
    w: 11.73,
    h: 0.50,
    fontSize: 21,
    fontFace: 'Arial',
    bold: true,
    color: COLORS.primary
  });

  // Top accent line
  slide.addShape(pptx.ShapeType.rect, {
    x: 0.8,
    y: 1.18,
    w: 1.8,
    h: 0.04,
    fill: { color: COLORS.accent },
    line: { color: COLORS.accent }
  });

  // Footer (safely at y: 6.85, leaving 0.35 in margin before bottom edge 7.5)
  slide.addText('Library Management System — College Full-Stack Project  |  React • PHP • MySQL', {
    x: 0.8,
    y: 6.85,
    w: 8.5,
    h: 0.3,
    fontSize: 8.5,
    fontFace: 'Arial',
    color: '94A3B8'
  });
}

// Helper: Add Screenshot Showcase Slide
function addScreenshotSlide(slide, title, category, imageFilename, caption, badgeText, badgeColor, bullets) {
  addSlideHeader(slide, title, category);

  const imgPath = path.resolve(__dirname, `../screenshots/${imageFilename}`);

  // Left: Framed Screenshot Container
  slide.addShape(pptx.ShapeType.rect, {
    x: 0.8,
    y: 1.45,
    w: 7.7,
    h: 4.95,
    fill: { color: COLORS.white },
    line: { color: COLORS.cardBorder, width: 1 },
    rectRadius: 0.08
  });

  if (fs.existsSync(imgPath)) {
    slide.addImage({
      path: imgPath,
      x: 0.9,
      y: 1.55,
      w: 7.5,
      h: 4.22
    });
  } else {
    slide.addText(`[Screenshot: ${imageFilename}]`, {
      x: 0.9,
      y: 3.0,
      w: 7.5,
      h: 0.5,
      align: 'center',
      fontSize: 14,
      color: COLORS.textMuted
    });
  }

  // Caption below screenshot
  slide.addText(caption, {
    x: 0.9,
    y: 5.85,
    w: 7.5,
    h: 0.4,
    fontSize: 9.5,
    fontFace: 'Arial',
    italic: true,
    color: COLORS.textMuted,
    align: 'center'
  });

  // Right: Key Capabilities Card
  slide.addShape(pptx.ShapeType.rect, {
    x: 8.75,
    y: 1.45,
    w: 3.78,
    h: 4.95,
    fill: { color: COLORS.white },
    line: { color: COLORS.cardBorder, width: 1 },
    rectRadius: 0.08
  });

  // Badge pill
  slide.addShape(pptx.ShapeType.rect, {
    x: 9.0,
    y: 1.65,
    w: 2.2,
    h: 0.32,
    fill: { color: badgeColor },
    rectRadius: 0.06
  });

  slide.addText(badgeText, {
    x: 9.0,
    y: 1.70,
    w: 2.2,
    h: 0.22,
    fontSize: 9,
    fontFace: 'Arial',
    bold: true,
    color: COLORS.white,
    align: 'center'
  });

  slide.addText('Key System Features:', {
    x: 9.0,
    y: 2.10,
    w: 3.28,
    h: 0.30,
    fontSize: 12.5,
    fontFace: 'Arial',
    bold: true,
    color: COLORS.primary
  });

  bullets.forEach((b, bIdx) => {
    const bY = 2.50 + bIdx * 0.70;
    slide.addText(`✓  ${b.title}`, {
      x: 9.0,
      y: bY,
      w: 3.28,
      h: 0.25,
      fontSize: 10.5,
      fontFace: 'Arial',
      bold: true,
      color: COLORS.textDark
    });
    slide.addText(`    ${b.desc}`, {
      x: 9.0,
      y: bY + 0.24,
      w: 3.28,
      h: 0.40,
      fontSize: 9,
      fontFace: 'Arial',
      color: COLORS.textMuted,
      lineSpacing: 14
    });
  });
}

// -------------------------------------------------------------
// SLIDE 1: Title Slide (Full Bleed Hero)
// -------------------------------------------------------------
const slide1 = pptx.addSlide();
slide1.addShape(pptx.ShapeType.rect, {
  x: 0,
  y: 0,
  w: 13.33,
  h: 7.5,
  fill: { color: 'F1F5F9' }
});

slide1.addShape(pptx.ShapeType.rect, {
  x: 0.8,
  y: 0.7,
  w: 11.73,
  h: 6.1,
  fill: { color: COLORS.white },
  line: { color: COLORS.cardBorder, width: 1 },
  rectRadius: 0.12
});

slide1.addText('COLLEGE FULL-STACK PROJECT PRESENTATION', {
  x: 1.4,
  y: 1.2,
  w: 10.5,
  h: 0.35,
  fontSize: 11,
  fontFace: 'Arial',
  bold: true,
  color: COLORS.accent,
  charSpacing: 2.5
});

slide1.addText('Library Management System', {
  x: 1.4,
  y: 1.55,
  w: 10.5,
  h: 1.0,
  fontSize: 34,
  fontFace: 'Arial',
  bold: true,
  color: COLORS.primary
});

slide1.addText('A Full-Stack Web Platform for Automated Book Cataloging, Circulation & Fine Settlement', {
  x: 1.4,
  y: 2.55,
  w: 10.5,
  h: 0.45,
  fontSize: 14,
  fontFace: 'Arial',
  color: COLORS.textMuted
});

// Tech Stack Pill Box
slide1.addShape(pptx.ShapeType.rect, {
  x: 1.4,
  y: 3.2,
  w: 10.5,
  h: 0.65,
  fill: { color: COLORS.accentLight },
  line: { color: 'BFDBFE', width: 1 },
  rectRadius: 0.08
});

slide1.addText('Tech Stack: React.js (Vite)  •  Redux Toolkit  •  Tailwind CSS  •  PHP REST API  •  MySQL (PDO)', {
  x: 1.6,
  y: 3.33,
  w: 10.1,
  h: 0.4,
  fontSize: 12.5,
  fontFace: 'Arial',
  bold: true,
  color: COLORS.accent
});

slide1.addText('Presented by: Student / Project Team\nDepartment of Computer Science & Engineering\nAcademic Year: 2025–2026', {
  x: 1.4,
  y: 4.25,
  w: 5.2,
  h: 1.2,
  fontSize: 11.5,
  fontFace: 'Arial',
  color: COLORS.textDark,
  lineSpacing: 18
});

slide1.addText('Evaluation Mode: Final Year Project / Viva Voce\nArchitecture: 3-Tier Enterprise Web Model\nZero Page-Reload Redux State Synchronization', {
  x: 7.0,
  y: 4.25,
  w: 4.9,
  h: 1.2,
  fontSize: 11.5,
  fontFace: 'Arial',
  color: COLORS.textMuted,
  lineSpacing: 18
});

slide1.addText('Default Admin Credentials: admin@library.com  |  Password: admin123', {
  x: 1.4,
  y: 5.85,
  w: 10.5,
  h: 0.35,
  fontSize: 10,
  fontFace: 'Courier New',
  bold: true,
  color: COLORS.accent
});

// -------------------------------------------------------------
// SLIDE 2: Problem Statement & Motivation
// -------------------------------------------------------------
const slide2 = pptx.addSlide();
addSlideHeader(slide2, 'Problem Statement & Motivation');

const problems = [
  {
    title: 'Manual Paper Registers',
    desc: 'Physical paper registers suffer from torn pages, missing loan records, illegible handwriting, and zero backup capabilities.',
    color: COLORS.red
  },
  {
    title: 'Stock Discrepancies',
    desc: 'Librarians cannot track real-time physical copies available on shelves versus copies currently checked out by students.',
    color: COLORS.amber
  },
  {
    title: 'Manual Fine Computation',
    desc: 'Staff manually calculate overdue days and penalty fees using calendars, creating friction, calculation errors, and audit disputes.',
    color: COLORS.red
  },
  {
    title: 'Zero Self-Visibility',
    desc: 'Students and faculty have no instant way to check borrow history, impending due dates, or catalog availability.',
    color: COLORS.primary
  }
];

problems.forEach((p, idx) => {
  const x = 0.8 + (idx % 2) * 5.9;
  const y = 1.45 + Math.floor(idx / 2) * 2.45;

  slide2.addShape(pptx.ShapeType.rect, {
    x,
    y,
    w: 5.6,
    h: 2.15,
    fill: { color: COLORS.bgLight },
    line: { color: COLORS.cardBorder, width: 1 },
    rectRadius: 0.1
  });

  slide2.addShape(pptx.ShapeType.rect, {
    x: x + 0.3,
    y: y + 0.25,
    w: 0.15,
    h: 1.65,
    fill: { color: p.color },
    line: { color: p.color }
  });

  slide2.addText(p.title, {
    x: x + 0.6,
    y: y + 0.25,
    w: 4.7,
    h: 0.35,
    fontSize: 14,
    fontFace: 'Arial',
    bold: true,
    color: COLORS.textDark
  });

  slide2.addText(p.desc, {
    x: x + 0.6,
    y: y + 0.68,
    w: 4.7,
    h: 1.25,
    fontSize: 11,
    fontFace: 'Arial',
    color: COLORS.textMuted,
    lineSpacing: 16
  });
});

// -------------------------------------------------------------
// SLIDE 3: Project Objectives & Goals
// -------------------------------------------------------------
const slide3 = pptx.addSlide();
addSlideHeader(slide3, 'Project Objectives & Goals');

const objectives = [
  { num: '01', title: 'Automated Catalog Management', desc: 'Centralize book, author, and category CRUD operations with strict ISBN uniqueness and publisher details.' },
  { num: '02', title: 'Real-Time Inventory Synchronization', desc: 'Dynamically track physical copies: decrement available inventory on loan and restore upon return.' },
  { num: '03', title: 'ACID Transactional Guarantees', desc: 'Ensure zero database inconsistency during circulation operations through MySQL atomic transactions.' },
  { num: '04', title: 'Automated Overdue Penalty Engine', desc: 'Eliminate manual math: compute late fees at ₹5.00/day on the server and manage payment collection.' },
  { num: '05', title: 'Zero Page-Reload SPA Experience', desc: 'Leverage Redux Toolkit for seamless state updates and instantaneous UI re-renders without browser refresh.' }
];

objectives.forEach((obj, idx) => {
  const y = 1.45 + idx * 0.98;

  slide3.addShape(pptx.ShapeType.rect, {
    x: 0.8,
    y,
    w: 11.73,
    h: 0.85,
    fill: { color: COLORS.white },
    line: { color: COLORS.cardBorder, width: 1 },
    rectRadius: 0.08
  });

  slide3.addShape(pptx.ShapeType.rect, {
    x: 1.0,
    y: y + 0.12,
    w: 0.6,
    h: 0.6,
    fill: { color: COLORS.accentLight },
    line: { color: 'BFDBFE', width: 1 },
    rectRadius: 0.05
  });

  slide3.addText(obj.num, {
    x: 1.0,
    y: y + 0.22,
    w: 0.6,
    h: 0.4,
    fontSize: 11,
    fontFace: 'Arial',
    bold: true,
    color: COLORS.accent,
    align: 'center'
  });

  slide3.addText(obj.title, {
    x: 1.8,
    y: y + 0.12,
    w: 4.8,
    h: 0.32,
    fontSize: 12.5,
    fontFace: 'Arial',
    bold: true,
    color: COLORS.primary
  });

  slide3.addText(obj.desc, {
    x: 1.8,
    y: y + 0.44,
    w: 10.3,
    h: 0.35,
    fontSize: 10.5,
    fontFace: 'Arial',
    color: COLORS.textMuted
  });
});

// -------------------------------------------------------------
// SLIDE 4: Technology Stack Breakdown
// -------------------------------------------------------------
const slide4 = pptx.addSlide();
addSlideHeader(slide4, 'Technology Stack Breakdown');

const stacks = [
  {
    layer: 'Frontend Layer',
    badge: 'Client SPA',
    color: '2563EB',
    items: [
      { name: 'React 18', role: 'Component-based UI architecture' },
      { name: 'Vite 5', role: 'Modern development bundler & HMR' },
      { name: 'Redux Toolkit', role: 'Centralized global state & asyncThunks' },
      { name: 'Tailwind CSS', role: 'Responsive layout and color tokens' },
      { name: 'Axios Client', role: 'HTTP client with Bearer interceptors' },
      { name: 'React Hot Toast', role: 'Interactive user feedback alerts' }
    ]
  },
  {
    layer: 'Backend API Layer',
    badge: 'REST Engine',
    color: '1E3A8A',
    items: [
      { name: 'Native PHP 8.2', role: 'High performance pure REST API' },
      { name: 'Custom Router', role: 'RESTful URI & query parameter routing' },
      { name: 'PDO Extension', role: 'Prepared statements with parameter binding' },
      { name: 'Auth Middleware', role: 'Cryptographic Bearer token verification' },
      { name: 'Bcrypt Hash', role: 'One-way salt password encryption' },
      { name: 'JSON Protocol', role: 'Standardized response envelope' }
    ]
  },
  {
    layer: 'Database Layer',
    badge: 'Relational DB',
    color: '059669',
    items: [
      { name: 'MySQL / MariaDB', role: 'ACID relational database engine' },
      { name: 'Foreign Keys', role: 'Enforces ON DELETE RESTRICT rules' },
      { name: 'Row-Level Locks', role: 'SELECT ... FOR UPDATE prevents race states' },
      { name: 'Indexed Tables', role: 'Fast searches by ISBN, Name, Code' },
      { name: 'Port Fallback', role: 'Auto-detects active port 3306 or 3307' },
      { name: 'Seed Dataset', role: '21 books, 10 authors, 10 students' }
    ]
  }
];

stacks.forEach((st, idx) => {
  const x = 0.8 + idx * 4.0;
  const y = 1.45;
  const cardHeight = 4.95;

  slide4.addShape(pptx.ShapeType.rect, {
    x,
    y,
    w: 3.75,
    h: cardHeight,
    fill: { color: COLORS.white },
    line: { color: COLORS.cardBorder, width: 1 },
    rectRadius: 0.08
  });

  slide4.addShape(pptx.ShapeType.rect, {
    x,
    y,
    w: 3.75,
    h: 0.72,
    fill: { color: st.color },
    rectRadius: 0.08
  });

  slide4.addText(st.layer, {
    x: x + 0.25,
    y: y + 0.10,
    w: 3.25,
    h: 0.30,
    fontSize: 13,
    fontFace: 'Arial',
    bold: true,
    color: COLORS.white
  });

  slide4.addText(st.badge, {
    x: x + 0.25,
    y: y + 0.40,
    w: 3.25,
    h: 0.22,
    fontSize: 9.5,
    fontFace: 'Arial',
    color: 'BFDBFE'
  });

  st.items.forEach((item, iIdx) => {
    const itemY = y + 0.82 + iIdx * 0.65;
    
    slide4.addText(`•  ${item.name}`, {
      x: x + 0.25,
      y: itemY,
      w: 3.25,
      h: 0.24,
      fontSize: 10.5,
      fontFace: 'Arial',
      bold: true,
      color: COLORS.textDark
    });
    
    slide4.addText(`    ${item.role}`, {
      x: x + 0.25,
      y: itemY + 0.24,
      w: 3.25,
      h: 0.22,
      fontSize: 9,
      fontFace: 'Arial',
      color: COLORS.textMuted
    });
  });
});

// -------------------------------------------------------------
// SLIDE 5: 3-Tier System Architecture
// -------------------------------------------------------------
const slide5 = pptx.addSlide();
addSlideHeader(slide5, '3-Tier System Architecture');

const tiers = [
  {
    tier: 'Tier 1: Client Presentation Layer (SPA)',
    desc: 'Runs in the user’s browser via React. Handles route transitions, user interactions, local validation, and Redux state caches.',
    components: ['React Router DOM', 'Redux Toolkit Slices', '17 Common UI Components', 'Axios Bearer Interceptor']
  },
  {
    tier: 'Tier 2: Business Logic & API Layer (PHP)',
    desc: 'Gateway entry point handles CORS and dispatches to controllers. Validates permissions, enforces library rules, and calculates fines.',
    components: ['index.php REST Gateway', 'Auth Token Middleware', '10 Domain Controllers', 'Input Validation Utility']
  },
  {
    tier: 'Tier 3: Persistence Layer (MySQL Database)',
    desc: 'Maintains long-term data integrity with strict constraints, indexes, and InnoDB transaction isolation for circulation checks.',
    components: ['InnoDB Relational Engine', 'ACID Transactions (COMMIT/ROLLBACK)', 'Foreign Keys (RESTRICT)', 'Auto Port 3306/3307 Fallback']
  }
];

tiers.forEach((t, idx) => {
  const y = 1.45 + idx * 1.62;

  slide5.addShape(pptx.ShapeType.rect, {
    x: 0.8,
    y,
    w: 11.73,
    h: 1.45,
    fill: { color: COLORS.white },
    line: { color: COLORS.cardBorder, width: 1 },
    rectRadius: 0.08
  });

  slide5.addText(t.tier, {
    x: 1.1,
    y: y + 0.12,
    w: 11.0,
    h: 0.32,
    fontSize: 13,
    fontFace: 'Arial',
    bold: true,
    color: COLORS.primary
  });

  slide5.addText(t.desc, {
    x: 1.1,
    y: y + 0.44,
    w: 11.0,
    h: 0.32,
    fontSize: 10.5,
    fontFace: 'Arial',
    color: COLORS.textMuted
  });

  t.components.forEach((c, cIdx) => {
    const cX = 1.1 + cIdx * 2.8;
    slide5.addShape(pptx.ShapeType.rect, {
      x: cX,
      y: y + 0.86,
      w: 2.65,
      h: 0.38,
      fill: { color: COLORS.accentLight },
      line: { color: 'BFDBFE', width: 1 },
      rectRadius: 0.05
    });

    slide5.addText(c, {
      x: cX + 0.05,
      y: y + 0.94,
      w: 2.55,
      h: 0.22,
      fontSize: 8.5,
      fontFace: 'Arial',
      bold: true,
      color: COLORS.accent,
      align: 'center'
    });
  });
});

// -------------------------------------------------------------
// SLIDE 6: UI Showcase: Live Analytics Dashboard (NEW SCREENSHOT)
// -------------------------------------------------------------
const slide6 = pptx.addSlide();
addScreenshotSlide(
  slide6,
  'UI Demonstration: Live Analytics Dashboard',
  'SYSTEM INTERFACE DEMONSTRATION',
  '02_dashboard.png',
  'Figure 1: Real-time Admin Dashboard displaying 8 KPI stat cards, recent borrow logs, and overdue attention lists.',
  'REAL-TIME ANALYTICS',
  COLORS.accent,
  [
    { title: '8 Real-Time Counter Cards', desc: 'Instant visibility of Total Books, Total Inventory, Active Issues, and Overdue Returns.' },
    { title: 'Recent Borrow Activity', desc: 'Live circulation ledger showing who borrowed which book with timestamp badges.' },
    { title: 'Overdue Attention Alert', desc: 'Highlights students with pending overdue loans requiring immediate fine settlement.' },
    { title: 'Zero Page-Reload Sync', desc: 'Redux Toolkit synchronizes changes without full browser refresh cycles.' }
  ]
);

// -------------------------------------------------------------
// SLIDE 7: UI Showcase: Book Catalog & Inventory (NEW SCREENSHOT)
// -------------------------------------------------------------
const slide7 = pptx.addSlide();
addScreenshotSlide(
  slide7,
  'UI Demonstration: Book Catalog & Inventory Management',
  'SYSTEM INTERFACE DEMONSTRATION',
  '03_books.png',
  'Figure 2: Complete book catalog table with multi-attribute filtering, available stock counts, and CRUD action triggers.',
  'INVENTORY CONTROL',
  COLORS.green,
  [
    { title: 'Instant Keyword Search', desc: 'Filter through catalog by Title, Author, Category, or unique 13-digit ISBN.' },
    { title: 'Real-Time Stock Ratio', desc: 'Tracks Available Copies vs Total Physical Copies to prevent overselling on loans.' },
    { title: 'Shelf & Rack Tagging', desc: 'Guides librarians to physical bookshelf racks for rapid book location in library.' },
    { title: 'Protected Actions', desc: 'Edit, View Details, and Delete buttons with foreign-key restriction alerts.' }
  ]
);

// -------------------------------------------------------------
// SLIDE 8: UI Showcase: Book Circulation & Issues (NEW SCREENSHOT)
// -------------------------------------------------------------
const slide8 = pptx.addSlide();
addScreenshotSlide(
  slide8,
  'UI Demonstration: Circulation & Issue Verification',
  'SYSTEM INTERFACE DEMONSTRATION',
  '04_issues.png',
  'Figure 3: Active book loan circulation ledger showing issue dates, return due dates, and return action buttons.',
  'ACID CIRCULATION',
  COLORS.primary,
  [
    { title: 'Active Loan Guardrails', desc: 'Verifies student borrowing quota (max 3 books) and active student status.' },
    { title: 'Duplicate Loan Check', desc: 'Prevents the same student from borrowing two identical copies simultaneously.' },
    { title: '1-Click Return Trigger', desc: 'Directly initiates the return modal with automatic overdue days estimation.' },
    { title: 'Status Pill Badges', desc: 'Color-coded visual indicators for "Issued", "Returned", and "Overdue".' }
  ]
);

// -------------------------------------------------------------
// SLIDE 9: UI Showcase: Overdue Fine Settlement Ledger (NEW SCREENSHOT)
// -------------------------------------------------------------
const slide9 = pptx.addSlide();
addScreenshotSlide(
  slide9,
  'UI Demonstration: Overdue Fine Settlement Ledger',
  'SYSTEM INTERFACE DEMONSTRATION',
  '05_fines.png',
  'Figure 4: Financial ledger showing calculated late fees, payment statuses, and counter payment recording.',
  'FINANCIAL AUDIT',
  COLORS.amber,
  [
    { title: 'Server-Calculated Math', desc: 'Computed via ₹5.00/day rate multiplied by days past the designated due date.' },
    { title: 'Settlement Status', desc: 'Audited records tracked as "Unpaid" or "Paid" with payment date timestamps.' },
    { title: 'Counter Cash Recording', desc: 'Librarians can record student cash payments, instantly updating ledger.' },
    { title: 'Export & Audit Ready', desc: 'Complete financial accountability with linked Issue and Student records.' }
  ]
);

// -------------------------------------------------------------
// SLIDE 10: UI Showcase: Student & Member Directory (NEW SCREENSHOT)
// -------------------------------------------------------------
const slide10 = pptx.addSlide();
addScreenshotSlide(
  slide10,
  'UI Demonstration: Student & Member Directory',
  'SYSTEM INTERFACE DEMONSTRATION',
  '06_members.png',
  'Figure 5: Student and faculty registry tracking academic departments, contact info, and active loan allowances.',
  'MEMBER REGISTRY',
  COLORS.accent,
  [
    { title: 'Academic Profile Data', desc: 'Captures Student Name, Roll Number, Branch (CSE, IT, ECE), and Semester.' },
    { title: 'Contact Verification', desc: 'Stores verified email address and phone number for overdue reminders.' },
    { title: 'Status Guard', desc: 'Suspended students are automatically blocked from borrowing any library assets.' },
    { title: 'Borrowing History Link', desc: 'Quick access to all past and present books checked out by the member.' }
  ]
);

// -------------------------------------------------------------
// SLIDE 11: Core Functional Modules
// -------------------------------------------------------------
const slide11 = pptx.addSlide();
addSlideHeader(slide11, 'Core Functional Modules Summary');

const modules = [
  { name: '1. Authentication', points: ['Bcrypt encrypted login & register', 'Bearer token session tracking', 'Protected routes & role guards'] },
  { name: '2. Live Dashboard', points: ['8 Real-time KPI stat cards', 'Recent borrow transaction logs', 'Overdue attention list with fines'] },
  { name: '3. Books Catalog', points: ['Complete inventory CRUD', 'ISBN uniqueness verification', 'Dynamic available copies counter'] },
  { name: '4. Member Registry', points: ['Student & faculty cards', 'Department & course tracking', 'Active loan capacity protection'] },
  { name: '5. Book Circulation', points: ['Active loan issue modal', 'Zero stock issue prevention', 'Duplicate book loan blocking'] },
  { name: '6. Returns & Fines', points: ['Transactional return check-in', '₹5.00/day overdue math', 'Payment settlement audit ledger'] }
];

modules.forEach((m, idx) => {
  const x = 0.8 + (idx % 3) * 4.0;
  const y = 1.45 + Math.floor(idx / 3) * 2.45;

  slide11.addShape(pptx.ShapeType.rect, {
    x,
    y,
    w: 3.75,
    h: 2.25,
    fill: { color: COLORS.white },
    line: { color: COLORS.cardBorder, width: 1 },
    rectRadius: 0.08
  });

  slide11.addText(m.name, {
    x: x + 0.25,
    y: y + 0.18,
    w: 3.25,
    h: 0.32,
    fontSize: 12.5,
    fontFace: 'Arial',
    bold: true,
    color: COLORS.primary
  });

  m.points.forEach((p, pIdx) => {
    slide11.addText(`•  ${p}`, {
      x: x + 0.25,
      y: y + 0.58 + pIdx * 0.48,
      w: 3.25,
      h: 0.38,
      fontSize: 10,
      fontFace: 'Arial',
      color: COLORS.textMuted
    });
  });
});

// -------------------------------------------------------------
// SLIDE 12: Working Mechanism (Redux & REST Sync)
// -------------------------------------------------------------
const slide12 = pptx.addSlide();
addSlideHeader(slide12, 'Working Mechanism: Redux Toolkit & REST Sync');

const steps = [
  { step: '1', title: 'User Action', desc: 'Staff initiates circulation action in React modal (e.g. clicks "Issue Book").' },
  { step: '2', title: 'Dispatch Thunk', desc: 'Component dispatches createAsyncThunk action with form payload.' },
  { step: '3', title: 'Axios Interceptor', desc: 'Automatically appends Authorization Bearer token to request headers.' },
  { step: '4', title: 'PHP API Gateway', desc: 'Authenticates token against database and launches transactional controller.' },
  { step: '5', title: 'Database Commit', desc: 'MySQL locks rows, decrements stock, records issue, and commits.' },
  { step: '6', title: 'Redux Mutation', desc: 'Slice extraReducers update local store with zero page-reload.' }
];

steps.forEach((st, idx) => {
  const x = 0.8 + (idx % 3) * 4.0;
  const y = 1.45 + Math.floor(idx / 3) * 2.45;

  slide12.addShape(pptx.ShapeType.rect, {
    x,
    y,
    w: 3.75,
    h: 2.25,
    fill: { color: COLORS.bgLight },
    line: { color: COLORS.cardBorder, width: 1 },
    rectRadius: 0.08
  });

  slide12.addShape(pptx.ShapeType.rect, {
    x: x + 0.25,
    y: y + 0.22,
    w: 0.45,
    h: 0.45,
    fill: { color: COLORS.accent },
    rectRadius: 0.22
  });

  slide12.addText(st.step, {
    x: x + 0.25,
    y: y + 0.30,
    w: 0.45,
    h: 0.30,
    fontSize: 11,
    fontFace: 'Arial',
    bold: true,
    color: COLORS.white,
    align: 'center'
  });

  slide12.addText(st.title, {
    x: x + 0.85,
    y: y + 0.26,
    w: 2.65,
    h: 0.35,
    fontSize: 12.5,
    fontFace: 'Arial',
    bold: true,
    color: COLORS.textDark
  });

  slide12.addText(st.desc, {
    x: x + 0.25,
    y: y + 0.80,
    w: 3.25,
    h: 1.25,
    fontSize: 10.5,
    fontFace: 'Arial',
    color: COLORS.textMuted,
    lineSpacing: 15
  });
});

// -------------------------------------------------------------
// SLIDE 13: Database Design & Relationships
// -------------------------------------------------------------
const slide13 = pptx.addSlide();
addSlideHeader(slide13, 'Database Design & Relational Constraints');

const tables = [
  { table: 'books', rel: 'N:1 with authors & categories', rules: 'Restricts deletion of author or category while assigned to active titles.' },
  { table: 'issues', rel: 'N:1 with books & members', rules: 'Restricts deletion of student or book while an active loan is recorded.' },
  { table: 'fines', rel: '1:1 with issues', rules: 'Tied to specific loan record; tracks monetary settlement status (Unpaid/Paid).' },
  { table: 'user_tokens', rel: 'N:1 with users', rules: 'Cryptographic 64-char tokens revoked automatically upon logout.' }
];

slide13.addText('Core Schema Entities & Strict Relational Integrity Constraints:', {
  x: 0.8,
  y: 1.45,
  w: 11.73,
  h: 0.35,
  fontSize: 13,
  fontFace: 'Arial',
  bold: true,
  color: COLORS.primary
});

tables.forEach((t, idx) => {
  const y = 1.90 + idx * 1.12;

  slide13.addShape(pptx.ShapeType.rect, {
    x: 0.8,
    y,
    w: 11.73,
    h: 0.95,
    fill: { color: COLORS.white },
    line: { color: COLORS.cardBorder, width: 1 },
    rectRadius: 0.08
  });

  slide13.addText(`Table: ${t.table}`, {
    x: 1.1,
    y: y + 0.12,
    w: 3.5,
    h: 0.32,
    fontSize: 12.5,
    fontFace: 'Courier New',
    bold: true,
    color: COLORS.accent
  });

  slide13.addText(`Relationship: ${t.rel}`, {
    x: 4.8,
    y: y + 0.12,
    w: 7.2,
    h: 0.32,
    fontSize: 11.5,
    fontFace: 'Arial',
    bold: true,
    color: COLORS.textDark
  });

  slide13.addText(`Constraint Guarantee: ${t.rules}`, {
    x: 1.1,
    y: y + 0.48,
    w: 11.0,
    h: 0.32,
    fontSize: 10.5,
    fontFace: 'Arial',
    color: COLORS.textMuted
  });
});

// -------------------------------------------------------------
// SLIDE 14: ACID Transactions in Circulation
// -------------------------------------------------------------
const slide14 = pptx.addSlide();
addSlideHeader(slide14, 'ACID Transactions: Issue vs. Return');

slide14.addShape(pptx.ShapeType.rect, {
  x: 0.8,
  y: 1.45,
  w: 5.75,
  h: 5.0,
  fill: { color: COLORS.white },
  line: { color: COLORS.accent, width: 1.5 },
  rectRadius: 0.08
});

slide14.addText('Issue Book Transaction (BEGIN ... COMMIT)', {
  x: 1.05,
  y: 1.65,
  w: 5.25,
  h: 0.35,
  fontSize: 12.5,
  fontFace: 'Arial',
  bold: true,
  color: COLORS.primary
});

const issueSteps = [
  'Verify member status == "active"',
  'Check student active loans count < 3 (loan limit)',
  'Verify student has no duplicate active loan of this title',
  'Lock book row (SELECT ... FOR UPDATE) & verify available > 0',
  'INSERT INTO issues (book_id, member_id, issue_date, due_date)',
  'UPDATE books SET available_copies = available_copies - 1',
  'COMMIT TRANSACTION (or ROLLBACK on failure)'
];

issueSteps.forEach((s, idx) => {
  slide14.addText(`${idx + 1}.  ${s}`, {
    x: 1.05,
    y: 2.15 + idx * 0.54,
    w: 5.25,
    h: 0.42,
    fontSize: 10,
    fontFace: 'Arial',
    color: COLORS.textDark
  });
});

slide14.addShape(pptx.ShapeType.rect, {
  x: 6.78,
  y: 1.45,
  w: 5.75,
  h: 5.0,
  fill: { color: COLORS.white },
  line: { color: COLORS.green, width: 1.5 },
  rectRadius: 0.08
});

slide14.addText('Return Book Transaction (BEGIN ... COMMIT)', {
  x: 7.05,
  y: 1.65,
  w: 5.25,
  h: 0.35,
  fontSize: 12.5,
  fontFace: 'Arial',
  bold: true,
  color: COLORS.green
});

const returnSteps = [
  'Lock issue record & verify status == "issued"',
  'Compute overdue days = max(0, Return Date - Due Date)',
  'Query fine_per_day setting (default ₹5.00/day)',
  'Calculate fine amount = overdue_days * fine_rate',
  'UPDATE issues SET status = "returned", returned_at = NOW()',
  'UPDATE books SET available_copies = available_copies + 1',
  'If fine > 0: INSERT INTO fines (payment_status="unpaid")',
  'COMMIT TRANSACTION (zero inventory corruption)'
];

returnSteps.forEach((s, idx) => {
  slide14.addText(`${idx + 1}.  ${s}`, {
    x: 7.05,
    y: 2.15 + idx * 0.48,
    w: 5.25,
    h: 0.40,
    fontSize: 9.5,
    fontFace: 'Arial',
    color: COLORS.textDark
  });
});

// -------------------------------------------------------------
// SLIDE 15: Automatic Overdue Fine Engine
// -------------------------------------------------------------
const slide15 = pptx.addSlide();
addSlideHeader(slide15, 'Automated Overdue Fine Calculation Engine');

slide15.addShape(pptx.ShapeType.rect, {
  x: 0.8,
  y: 1.45,
  w: 11.73,
  h: 1.25,
  fill: { color: COLORS.accentLight },
  line: { color: 'BFDBFE', width: 1 },
  rectRadius: 0.08
});

slide15.addText('MATHEMATICAL CALCULATION ENGINE (ENFORCED ON BACKEND)', {
  x: 1.1,
  y: 1.62,
  w: 11.0,
  h: 0.28,
  fontSize: 9.5,
  fontFace: 'Arial',
  bold: true,
  color: COLORS.accent
});

slide15.addText('Overdue Days = MAX( 0,  Return Date  −  Due Date )\nFine Amount   = Overdue Days  ×  Fine Per Day (₹5.00)', {
  x: 1.1,
  y: 1.95,
  w: 11.0,
  h: 0.60,
  fontSize: 12.5,
  fontFace: 'Courier New',
  bold: true,
  color: COLORS.primary
});

const fineSteps = [
  { title: '1. Live UI Preview', desc: 'When selecting return date in the modal, the frontend calculates a real-time estimate so the librarian sees the penalty immediately before submitting.' },
  { title: '2. Server Enforcement', desc: 'The PHP backend re-calculates days and fines with PDO queries to prevent client-side manipulation or date tampering.' },
  { title: '3. Settlement Ledger', desc: 'Fines are recorded as "unpaid". Once collected at the counter, staff mark it "paid", updating dashboard financial metrics in real-time.' }
];

fineSteps.forEach((fs, idx) => {
  const x = 0.8 + idx * 4.0;
  const y = 2.95;

  slide15.addShape(pptx.ShapeType.rect, {
    x,
    y,
    w: 3.75,
    h: 3.45,
    fill: { color: COLORS.white },
    line: { color: COLORS.cardBorder, width: 1 },
    rectRadius: 0.08
  });

  slide15.addText(fs.title, {
    x: x + 0.3,
    y: y + 0.25,
    w: 3.15,
    h: 0.35,
    fontSize: 13,
    fontFace: 'Arial',
    bold: true,
    color: COLORS.primary
  });

  slide15.addText(fs.desc, {
    x: x + 0.3,
    y: y + 0.75,
    w: 3.15,
    h: 2.35,
    fontSize: 11,
    fontFace: 'Arial',
    color: COLORS.textMuted,
    lineSpacing: 17
  });
});

// -------------------------------------------------------------
// SLIDE 16: Security & Data Protection
// -------------------------------------------------------------
const slide16 = pptx.addSlide();
addSlideHeader(slide16, 'Security & Data Protection Implementations');

const securityItems = [
  {
    title: 'Bcrypt Password Hashing',
    desc: 'Passwords are never stored in plain text. PHP password_hash($password, PASSWORD_BCRYPT) ensures strong one-way cryptographic encryption.'
  },
  {
    title: 'SQL Injection Defense',
    desc: '100% of queries use PDO prepared statements with parameter binding (:id, :isbn), neutralizing SQL injection attack vectors.'
  },
  {
    title: 'Session & Bearer Token Protocol',
    desc: 'Stateless 64-character hexadecimal tokens with 30-day expiration timestamps validate every protected API request.'
  },
  {
    title: 'CORS & XSS Sanitization',
    desc: 'Centralized CORS response headers in response.php and HTML entity escaping prevent cross-site scripting vulnerabilities.'
  }
];

securityItems.forEach((sec, idx) => {
  const x = 0.8 + (idx % 2) * 5.9;
  const y = 1.45 + Math.floor(idx / 2) * 2.45;

  slide16.addShape(pptx.ShapeType.rect, {
    x,
    y,
    w: 5.6,
    h: 2.15,
    fill: { color: COLORS.white },
    line: { color: COLORS.cardBorder, width: 1 },
    rectRadius: 0.08
  });

  slide16.addShape(pptx.ShapeType.rect, {
    x: x + 0.3,
    y: y + 0.25,
    w: 0.15,
    h: 1.65,
    fill: { color: COLORS.green },
    line: { color: COLORS.green }
  });

  slide16.addText(sec.title, {
    x: x + 0.6,
    y: y + 0.25,
    w: 4.7,
    h: 0.35,
    fontSize: 13.5,
    fontFace: 'Arial',
    bold: true,
    color: COLORS.primary
  });

  slide16.addText(sec.desc, {
    x: x + 0.6,
    y: y + 0.70,
    w: 4.7,
    h: 1.25,
    fontSize: 11,
    fontFace: 'Arial',
    color: COLORS.textMuted,
    lineSpacing: 16
  });
});

// -------------------------------------------------------------
// SLIDE 17: Engineering Challenges Faced
// -------------------------------------------------------------
const slide17 = pptx.addSlide();
addSlideHeader(slide17, 'Engineering Challenges Faced');

const challenges = [
  {
    num: 'CHALLENGE 1',
    title: 'Dual Port Environments (3306 vs 3307)',
    desc: 'Developer and college machines often have both MySQL 8.0 and XAMPP MariaDB installed on ports 3306 and 3307, causing connection refused errors.'
  },
  {
    num: 'CHALLENGE 2',
    title: 'Concurrency & Stock Depletion',
    desc: 'Preventing race conditions where multiple librarians issue the last physical copy of a book at the exact same second.'
  },
  {
    num: 'CHALLENGE 3',
    title: 'Zero Page-Reload Synchronization',
    desc: 'Ensuring inventory numbers, active borrow limits, and fine totals immediately reflect in Redux without requiring browser reloads.'
  },
  {
    num: 'CHALLENGE 4',
    title: 'Responsive Table Overflow',
    desc: 'Large tabular views (ISBN, Borrower, Status, Actions) breaking mobile viewports on smaller student phone screens.'
  }
];

challenges.forEach((ch, idx) => {
  const x = 0.8 + (idx % 2) * 5.9;
  const y = 1.45 + Math.floor(idx / 2) * 2.45;

  slide17.addShape(pptx.ShapeType.rect, {
    x,
    y,
    w: 5.6,
    h: 2.15,
    fill: { color: COLORS.bgLight },
    line: { color: COLORS.cardBorder, width: 1 },
    rectRadius: 0.08
  });

  slide17.addText(ch.num, {
    x: x + 0.4,
    y: y + 0.22,
    w: 4.8,
    h: 0.24,
    fontSize: 9,
    fontFace: 'Arial',
    bold: true,
    color: COLORS.amber
  });

  slide17.addText(ch.title, {
    x: x + 0.4,
    y: y + 0.50,
    w: 4.8,
    h: 0.35,
    fontSize: 12.5,
    fontFace: 'Arial',
    bold: true,
    color: COLORS.primary
  });

  slide17.addText(ch.desc, {
    x: x + 0.4,
    y: y + 0.90,
    w: 4.8,
    h: 1.1,
    fontSize: 10.5,
    fontFace: 'Arial',
    color: COLORS.textMuted,
    lineSpacing: 15
  });
});

// -------------------------------------------------------------
// SLIDE 18: Technical Solutions & Decisions
// -------------------------------------------------------------
const slide18 = pptx.addSlide();
addSlideHeader(slide18, 'Technical Solutions & Engineering Decisions');

const solutions = [
  {
    title: 'PDO Port Auto-Fallback Connector',
    desc: 'Implemented a smart singleton in database.php that tests port 3306 and seamlessly falls back to 3307 if refused, guaranteeing zero setup configuration hassle.'
  },
  {
    title: 'Pessimistic Row Locking',
    desc: 'Utilized SELECT ... FOR UPDATE within MySQL transactions to lock rows during issue and return queries, strictly avoiding overselling copies.'
  },
  {
    title: 'Optimistic Reducer Mutation',
    desc: 'Redux slice extraReducers locally mutate items in state upon fulfilled promises, synchronizing counts and badges with zero page reload.'
  },
  {
    title: 'Responsive Table Architecture',
    desc: 'Encapsulated data tables in overflow-x wrappers with collapsible navigation drawers for complete responsiveness across mobile, tablet, and desktop.'
  }
];

solutions.forEach((sol, idx) => {
  const x = 0.8 + (idx % 2) * 5.9;
  const y = 1.45 + Math.floor(idx / 2) * 2.45;

  slide18.addShape(pptx.ShapeType.rect, {
    x,
    y,
    w: 5.6,
    h: 2.15,
    fill: { color: COLORS.white },
    line: { color: COLORS.accent, width: 1 },
    rectRadius: 0.08
  });

  slide18.addText(`SOLUTION ${idx + 1}`, {
    x: x + 0.4,
    y: y + 0.22,
    w: 4.8,
    h: 0.24,
    fontSize: 9,
    fontFace: 'Arial',
    bold: true,
    color: COLORS.accent
  });

  slide18.addText(sol.title, {
    x: x + 0.4,
    y: y + 0.50,
    w: 4.8,
    h: 0.35,
    fontSize: 12.5,
    fontFace: 'Arial',
    bold: true,
    color: COLORS.primary
  });

  slide18.addText(sol.desc, {
    x: x + 0.4,
    y: y + 0.90,
    w: 4.8,
    h: 1.1,
    fontSize: 10.5,
    fontFace: 'Arial',
    color: COLORS.textMuted,
    lineSpacing: 15
  });
});

// -------------------------------------------------------------
// SLIDE 19: Future Scope & Enhancements
// -------------------------------------------------------------
const slide19 = pptx.addSlide();
addSlideHeader(slide19, 'Future Scope & Enhancements');

const futureItems = [
  { icon: '📷', title: 'Barcode & QR Scanner', desc: 'Hardware scanner integration at checkout desk for instant student ID card and book ISBN barcode scanning.' },
  { icon: '📱', title: 'Student Portal', desc: 'Dedicated mobile view for students to search catalogs, check due dates, reserve books, and view reading logs.' },
  { icon: '🔔', title: 'SMS & Email Alerts', desc: 'Scheduled cron tasks alerting students 2 days prior to loan expiry to minimize fines.' },
  { icon: '💳', title: 'UPI Fine Payments', desc: 'Integration with Razorpay / UPI QR codes to allow direct digital settlement of overdue penalties.' },
  { icon: '📡', title: 'RFID Security Gate', desc: 'Automated library entrance detection tracking walk-outs to prevent unissued books leaving premises.' },
  { icon: '📊', title: 'AI Recommendations', desc: 'Personalized book suggestions for students based on their course curriculum and previous borrow records.' }
];

futureItems.forEach((fi, idx) => {
  const x = 0.8 + (idx % 3) * 4.0;
  const y = 1.45 + Math.floor(idx / 3) * 2.45;

  slide19.addShape(pptx.ShapeType.rect, {
    x,
    y,
    w: 3.75,
    h: 2.25,
    fill: { color: COLORS.white },
    line: { color: COLORS.cardBorder, width: 1 },
    rectRadius: 0.08
  });

  slide19.addText(fi.icon, {
    x: x + 0.25,
    y: y + 0.18,
    w: 0.5,
    h: 0.35,
    fontSize: 16,
    fontFace: 'Arial'
  });

  slide19.addText(fi.title, {
    x: x + 0.75,
    y: y + 0.20,
    w: 2.75,
    h: 0.35,
    fontSize: 12,
    fontFace: 'Arial',
    bold: true,
    color: COLORS.primary
  });

  slide19.addText(fi.desc, {
    x: x + 0.25,
    y: y + 0.65,
    w: 3.25,
    h: 1.45,
    fontSize: 10,
    fontFace: 'Arial',
    color: COLORS.textMuted,
    lineSpacing: 15
  });
});

// -------------------------------------------------------------
// SLIDE 20: Conclusion & Summary of Achievements
// -------------------------------------------------------------
const slide20 = pptx.addSlide();
addSlideHeader(slide20, 'Conclusion & Summary of Achievements');

const achievements = [
  'Successfully engineered an enterprise-grade Library Management System suitable for university production deployment.',
  'Achieved zero discrepancy in inventory counts using atomic MySQL transactions for circulation check-out and check-in.',
  'Implemented full Redux Toolkit state architecture with 7 feature slices for an instantaneous zero page-reload experience.',
  'Enforced security standards: Bcrypt hashing, 64-character Bearer token sessions, and prepared PDO SQL queries.',
  'Supplied comprehensive realistic seed data (21 textbooks, 10 authors, 8 categories, 10 students, active loans, and fines).'
];

achievements.forEach((ach, idx) => {
  const y = 1.45 + idx * 0.98;

  slide20.addShape(pptx.ShapeType.rect, {
    x: 0.8,
    y,
    w: 11.73,
    h: 0.85,
    fill: { color: COLORS.white },
    line: { color: COLORS.cardBorder, width: 1 },
    rectRadius: 0.08
  });

  slide20.addShape(pptx.ShapeType.rect, {
    x: 1.0,
    y: y + 0.20,
    w: 0.35,
    h: 0.35,
    fill: { color: COLORS.green },
    rectRadius: 0.17
  });

  slide20.addText('✓', {
    x: 1.0,
    y: y + 0.23,
    w: 0.35,
    h: 0.3,
    fontSize: 11,
    fontFace: 'Arial',
    bold: true,
    color: COLORS.white,
    align: 'center'
  });

  slide20.addText(ach, {
    x: 1.6,
    y: y + 0.18,
    w: 10.6,
    h: 0.50,
    fontSize: 11,
    fontFace: 'Arial',
    color: COLORS.textDark
  });
});

// -------------------------------------------------------------
// SLIDE 21: Q&A / Thank You
// -------------------------------------------------------------
const slide21 = pptx.addSlide();
slide21.addShape(pptx.ShapeType.rect, {
  x: 0,
  y: 0,
  w: 13.33,
  h: 7.5,
  fill: { color: COLORS.primary }
});

slide21.addText('Thank You!', {
  x: 1.0,
  y: 1.9,
  w: 11.33,
  h: 1.2,
  fontSize: 46,
  fontFace: 'Arial',
  bold: true,
  color: COLORS.white,
  align: 'center'
});

slide21.addText('Library Management System — Full-Stack College Project', {
  x: 1.0,
  y: 3.2,
  w: 11.33,
  h: 0.5,
  fontSize: 16,
  fontFace: 'Arial',
  color: '93C5FD',
  align: 'center'
});

slide21.addShape(pptx.ShapeType.rect, {
  x: 5.66,
  y: 4.0,
  w: 2.0,
  h: 0.05,
  fill: { color: '60A5FA' },
  line: { color: '60A5FA' }
});

slide21.addText('Demonstration & Questions Welcome', {
  x: 1.0,
  y: 4.3,
  w: 11.33,
  h: 0.5,
  fontSize: 14,
  fontFace: 'Arial',
  color: 'E2E8F0',
  align: 'center'
});

// Output filepath in root directory and parent directory
const outputRootV2 = path.resolve(__dirname, '../Library_Management_System_Presentation_v2.pptx');
const outputRoot = path.resolve(__dirname, '../Library_Management_System_Presentation.pptx');
const outputParent = path.resolve(__dirname, '../../Library_Management_System_Presentation.pptx');

pptx.writeFile({ fileName: outputRootV2 })
  .then(() => {
    console.log(`PPTX_SAVED_V2: ${outputRootV2}`);
    // Try to update original root file if not locked
    try {
      fs.copyFileSync(outputRootV2, outputRoot);
      console.log(`PPTX_UPDATED_ORIGINAL: ${outputRoot}`);
    } catch (e) {
      console.log(`Original file is currently open in PowerPoint: ${e.message}`);
    }
    // Also copy to parent if needed
    try {
      fs.copyFileSync(outputRootV2, outputParent);
      console.log(`PPTX_COPIED_PARENT: ${outputParent}`);
    } catch (e) {
      // Ignored if parent not writable
    }
  })
  .catch((err) => {
    console.error('ERROR_GENERATING_PPTX:', err);
    process.exit(1);
  });
