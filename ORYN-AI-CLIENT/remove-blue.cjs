const fs = require('fs');

function removeBlue() {
  const files = [
    './src/pages/DashboardPage.tsx',
    './src/pages/ChatPage.tsx',
    './src/pages/AnalyticsPage.tsx',
    './src/pages/SettingsPage.tsx',
    './src/pages/ExplorePage.tsx',
    './src/components/Header.tsx',
    './src/components/Sidebar.tsx',
  ];

  for (const file of files) {
    if (!fs.existsSync(file)) continue;
    let code = fs.readFileSync(file, 'utf8');

    // Replace hardcoded cyan/blue RGBA values with orange RGBA values
    // Orange is 249, 115, 22
    code = code.replace(/rgba\(\s*0\s*,\s*240\s*,\s*255/g, "rgba(249, 115, 22");
    // Replace hardcoded other blue/cyan variations (e.g. 0,136,255 or 0,149,255 or 0,212,255)
    code = code.replace(/rgba\(\s*0\s*,\s*1[34]9\s*,\s*255/g, "rgba(249, 115, 22");
    code = code.replace(/rgba\(\s*0\s*,\s*136\s*,\s*255/g, "rgba(249, 115, 22");
    code = code.replace(/rgba\(\s*0\s*,\s*212\s*,\s*255/g, "rgba(249, 115, 22");

    fs.writeFileSync(file, code);
    console.log(`Removed hardcoded blue from ${file}`);
  }
}

removeBlue();
