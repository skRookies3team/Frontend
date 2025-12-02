const fs = require('fs');
const path = require('path');
console.log("Node is working");
const sourceDir = path.join(__dirname, '../public');
try {
    const files = fs.readdirSync(sourceDir);
    console.log(`Found ${files.length} files in source`);
    console.log(files.slice(0, 5));
} catch (e) {
    console.error("Error reading source:", e);
}
