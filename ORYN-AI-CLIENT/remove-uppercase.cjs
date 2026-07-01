const fs = require('fs');

function removeUppercase() {
  const files = [
    './src/pages/DashboardPage.tsx',
    './src/components/Header.tsx',
    './src/components/Sidebar.tsx',
  ];

  for (const file of files) {
    if (!fs.existsSync(file)) continue;
    let code = fs.readFileSync(file, 'utf8');

    code = code.replace(/textTransform:\s*['"]uppercase['"]/g, "textTransform: 'none'");
    code = code.replace(/letterSpacing:\s*[\d.]+/g, "letterSpacing: 0");

    fs.writeFileSync(file, code);
    console.log(`Cleaned uppercase from ${file}`);
  }
}

removeUppercase();
