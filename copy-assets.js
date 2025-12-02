const fs = require('fs');
const path = require('path');

const sourceDir = path.join(__dirname, '../public');
const destDir = path.join(__dirname, 'public');

if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
}

fs.readdir(sourceDir, (err, files) => {
    if (err) {
        console.error("Could not list the directory.", err);
        process.exit(1);
    }

    files.forEach((file, index) => {
        const fromPath = path.join(sourceDir, file);
        const toPath = path.join(destDir, file);

        fs.stat(fromPath, (error, stat) => {
            if (error) {
                console.error("Error stating file.", error);
                return;
            }

            if (stat.isFile()) {
                fs.copyFile(fromPath, toPath, (err) => {
                    if (err) {
                        console.error(`Error copying ${file}:`, err);
                    } else {
                        console.log(`Copied ${file}`);
                    }
                });
            } else if (stat.isDirectory()) {
                // For simplicity, we are not doing recursive copy for subdirectories in this script unless needed.
                // The previous list_dir showed no subdirectories in public, so this is fine.
                console.log(`Skipping directory ${file}`);
            }
        });
    });
});
