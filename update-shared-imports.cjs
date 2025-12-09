const fs = require('fs');
const path = require('path');

const sharedPath = path.join(__dirname, 'src', 'shared');

// Replacement rules for shared folder
const replacements = [
    // Utils
    ['@/lib/utils', '@/shared/lib/utils'],

    // UI components (internal references within shared/ui)
    ['@/components/ui/', '@/shared/ui/'],

    // Auth context
    ['@/lib/auth-context', '@/features/auth/context/auth-context'],

    // Hooks
    ['@/hooks/use-mobile', '@/shared/hooks/use-mobile'],
    ['@/hooks/use-toast', '@/shared/hooks/use-toast'],

    // Shared components
    ['@/components/logo', '@/shared/components/logo'],
    ['@/components/notifications-dropdown', '@/features/social/components/notifications-dropdown'],
    ['@/components/user-search-modal', '@/features/social/components/user-search-modal'],

    // 3D components
    ['@/components/3d/', '@/shared/components/3d/'],
];

function getAllFiles(dirPath, arrayOfFiles = []) {
    const files = fs.readdirSync(dirPath);
    files.forEach(file => {
        const fullPath = path.join(dirPath, file);
        if (fs.statSync(fullPath).isDirectory()) {
            getAllFiles(fullPath, arrayOfFiles);
        } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
            arrayOfFiles.push(fullPath);
        }
    });
    return arrayOfFiles;
}

function updateFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    const original = content;

    replacements.forEach(([from, to]) => {
        content = content.split(from).join(to);
    });

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Updated:', filePath);
        return true;
    }
    return false;
}

console.log('=== Updating shared folder imports ===');
console.log('Path:', sharedPath);

const files = getAllFiles(sharedPath);
let updatedCount = 0;

files.forEach(file => {
    if (updateFile(file)) {
        updatedCount++;
    }
});

console.log('\n=== Complete! Updated ' + updatedCount + ' files ===');
