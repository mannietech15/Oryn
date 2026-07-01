const fs = require('fs');

function removeGradients() {
  const globPattern = './src/**/*.{tsx,ts}';
  // Note: we just iterate manually or since we know the files:
  const files = [
    './src/App.tsx',
    './src/components/Header.tsx',
    './src/components/Sidebar.tsx',
    './src/pages/ChatPage.tsx',
    './src/pages/AnalyticsPage.tsx',
    './src/pages/DashboardPage.tsx',
    './src/pages/SettingsPage.tsx',
    './src/pages/ExplorePage.tsx',
  ];

  for (const file of files) {
    if (!fs.existsSync(file)) continue;
    let code = fs.readFileSync(file, 'utf8');

    // Replace inline gradients with a solid color
    code = code.replace(/background:\s*['"]?(linear|radial)-gradient\([^)]+\)['"]?/g, "background: 'var(--accent-primary)'");
    code = code.replace(/background:\s*`?(linear|radial)-gradient\([^)]+\)`?/g, "background: 'var(--accent-primary)'");

    // Also remove uppercase across all files just in case
    code = code.replace(/textTransform:\s*['"]uppercase['"]/g, "textTransform: 'none'");
    code = code.replace(/letterSpacing:\s*[\d.]+/g, "letterSpacing: 0");

    fs.writeFileSync(file, code);
    console.log(`Cleaned ${file}`);
  }
}

removeGradients();
