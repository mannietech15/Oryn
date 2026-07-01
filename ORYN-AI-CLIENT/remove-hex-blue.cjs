const fs = require('fs');

function removeHexBlue() {
  const files = [
    './src/pages/DashboardPage.tsx',
    './src/pages/ChatPage.tsx',
    './src/pages/AnalyticsPage.tsx',
    './src/pages/SettingsPage.tsx',
    './src/pages/ExplorePage.tsx',
    './src/components/Header.tsx',
    './src/components/Sidebar.tsx',
    './src/components/DashboardScene.tsx',
  ];

  for (const file of files) {
    if (!fs.existsSync(file)) continue;
    let code = fs.readFileSync(file, 'utf8');

    // Replace #00d4ff and #0095ff with #f97316 (or var(--accent-primary) if inside a style tag, but hex is safer)
    // Actually, in SVGs, stroke="#00d4ff" is common. 
    code = code.replace(/#00d4ff/gi, "#f97316");
    code = code.replace(/#0095ff/gi, "#ea580c");

    fs.writeFileSync(file, code);
    console.log(`Removed hex blue from ${file}`);
  }
}

removeHexBlue();
