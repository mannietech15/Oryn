const fs = require('fs');

function refactorFile(filePath) {
  let code = fs.readFileSync(filePath, 'utf8');

  // Remove uppercase and reduce letterSpacing
  code = code.replace(/textTransform:\s*['"]uppercase['"]/g, "textTransform: 'none'");
  code = code.replace(/letterSpacing:\s*[\d.]+/g, (match) => {
    // reduce letter spacing. 3 -> 0.5, 2 -> 0.5, 1.5 -> 0, etc.
    return "letterSpacing: 0";
  });

  // Remove any lingering gradients in the components
  code = code.replace(/background:\s*`?linear-gradient\([^)]+\)`?/g, "background: 'var(--accent-primary)'");
  code = code.replace(/background:\s*['"]linear-gradient\([^)]+\)['"]/g, "background: 'var(--accent-primary)'");
  
  fs.writeFileSync(filePath, code);
  console.log(`Refactored ${filePath}`);
}

refactorFile('./src/pages/DashboardPage.tsx');
refactorFile('./src/components/Sidebar.tsx');
refactorFile('./src/components/Header.tsx');
