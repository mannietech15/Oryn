const fs = require('fs');
const path = './src/pages/DashboardPage.tsx';
let code = fs.readFileSync(path, 'utf8');

// Inject framer-motion
code = code.replace(
  "import React, { useState, useEffect, useRef, useCallback } from 'react';",
  "import React, { useState, useEffect, useRef, useCallback } from 'react';\nimport { motion } from 'framer-motion';"
);

// Upgrade Card component to motion.div and glass-panel
code = code.replace(
  "function Card({ title, accent, children, style }: { title: string; accent?: string; children: React.ReactNode; style?: React.CSSProperties }) {\n  return (\n    <div style={{\n      background: 'rgba(6,17,36,0.72)', border: '1px solid rgba(0,212,255,0.15)',\n      borderRadius: 16, padding: '26px 26px 22px', backdropFilter: 'blur(16px)',\n      boxShadow: '0 8px 40px rgba(0,0,0,0.35)', position: 'relative', overflow: 'hidden',\n      display: 'flex', flexDirection: 'column', gap: 18, ...style,\n    }}>",
  "function Card({ title, accent, children, style, delay = 0 }: { title: string; accent?: string; children: React.ReactNode; style?: React.CSSProperties; delay?: number }) {\n  return (\n    <motion.div\n      initial={{ opacity: 0, y: 20 }}\n      animate={{ opacity: 1, y: 0 }}\n      transition={{ duration: 0.5, delay, ease: [0.23, 1, 0.32, 1] }}\n      className=\"glass-panel\"\n      style={{\n        borderRadius: 16, padding: '26px 26px 22px',\n        position: 'relative', overflow: 'hidden',\n        display: 'flex', flexDirection: 'column', gap: 18, ...style,\n      }}\n    >"
);

// Close Card with </motion.div>
code = code.replace(
  "      {children}\n    </div>\n  );\n}",
  "      {children}\n    </motion.div>\n  );\n}"
);

// Add delay to Cards
code = code.replace(/<Card title="ORYN Daily Briefing"/g, '<Card delay={0.1} title="ORYN Daily Briefing"');
code = code.replace(/<Card title="Business Health Score"/g, '<Card delay={0.2} title="Business Health Score"');
code = code.replace(/<Card title="Monthly Revenue Trend"/g, '<Card delay={0.3} title="Monthly Revenue Trend"');
code = code.replace(/<Card title="Smart Alert Feed"/g, '<Card delay={0.4} title="Smart Alert Feed"');
code = code.replace(/<Card title="Goal & OKR Tracker"/g, '<Card delay={0.5} title="Goal & OKR Tracker"');
code = code.replace(/<Card title="Connected Integrations"/g, '<Card delay={0.6} title="Connected Integrations"');
code = code.replace(/<Card title="AI Engine Health"/g, '<Card delay={0.7} title="AI Engine Health"');

// Fix KPI Cards
code = code.replace(
  /padding: '14px 18px', background: 'rgba\(6,17,36,0\.72\)', borderRadius: 12, border: '1px solid rgba\(0,212,255,0\.12\)',/g,
  "padding: '14px 18px', borderRadius: 12,"
);
code = code.replace(
  /<div key={k.label}\n            style={{ padding/g,
  `<motion.div key={k.label}\n            initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}\n            className="glass-panel"\n            style={{ padding`
);
code = code.replace(
  /Ask ORYN ▶<\/button>\n            <\/div>\n          <\/div>/g,
  "Ask ORYN ▶</button>\n            </div>\n          </motion.div>"
);

// Fix Hero Header background
code = code.replace(
  "background: 'rgba(6,17,36,0.7)', border: '1px solid rgba(0,240,255,0.2)', borderRadius: 12, padding: '12px 20px', backdropFilter: 'blur(10px)',",
  "borderRadius: 12, padding: '12px 20px',"
);
code = code.replace(
  /<div style={{ borderRadius: 12, padding: '12px 20px', textAlign: 'right' }}/g,
  '<div className="glass-panel" style={{ borderRadius: 12, padding: \'12px 20px\', textAlign: \'right\' }}'
);

// Fix Command bar
code = code.replace(
  "background: 'rgba(6,17,36,0.85)', border: '1px solid rgba(0,240,255,0.25)', borderRadius: 16,\n          backdropFilter: 'blur(20px)', boxShadow: '0 8px 40px rgba(0,0,0,0.4), 0 0 0 1px rgba(0,240,255,0.05) inset',",
  "borderRadius: 16,"
);
code = code.replace(
  /<div style={{\n          borderRadius: 16,\n          overflow: 'hidden',\n        }}>/g,
  '<div className="glass-panel" style={{\n          borderRadius: 16,\n          overflow: \'hidden\',\n        }}>'
);

// Make the outer command bar div a motion.div
code = code.replace(
  /<div style={{ position: 'relative', zIndex: 1 }}>\n        <div className="glass-panel" style={{\n          borderRadius: 16,\n          overflow: 'hidden',\n        }}>/g,
  "<motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }} style={{ position: 'relative', zIndex: 1 }}>\n        <div className=\"glass-panel\" style={{\n          borderRadius: 16,\n          overflow: 'hidden',\n        }}>"
);

code = code.replace(
  /<\/div>\n      <\/div>\n\n      {\/\* ─── KPI Row ─── \*\/}/g,
  "</div>\n      </motion.div>\n\n      {/* ─── KPI Row ─── */}"
);

// Global variable replacements for cleaner styles
code = code.replace(/var\(--cyan\)/g, 'var(--accent-cyan)');
code = code.replace(/rgba\(6,17,36,0\.[\d]+\)/g, 'var(--card-bg)');
code = code.replace(/rgba\(4,14,31,0\.6\)/g, 'var(--card-bg)');
code = code.replace(/rgba\(0,2[14]0?,255,0\.[12][52]?\)/g, 'var(--glass-border)');
code = code.replace(/var\(--white\)/g, 'var(--text-primary)');
code = code.replace(/var\(--muted\)/g, 'var(--text-secondary)');

fs.writeFileSync(path, code);
console.log('Refactor complete.');
