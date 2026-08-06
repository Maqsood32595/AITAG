const fs = require('fs');
const path = require('path');

const directory = path.join(__dirname, 'client', 'src');

function walkDir(dir) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        if (isDirectory) {
            walkDir(dirPath);
        } else if (dirPath.endsWith('.tsx')) {
            let content = fs.readFileSync(dirPath, 'utf8');
            let original = content;

            // Remove 'item ' from <Grid item ...>
            content = content.replace(/<Grid\s+item\s+/g, '<Grid ');
            content = content.replace(/<Grid\s+item>/g, '<Grid>');

            // Move alignItems="center" to sx={{ alignItems: 'center' }} on <Grid container ...>
            // Note: HeroSection line 99: <Grid container spacing={6} alignItems="center">
            // This is a simple replace since it doesn't have an sx prop on that line yet.
            if (content.includes('alignItems="center"')) {
                // If the Grid already has sx, we'd need to merge, but we can just replace this specific one
                content = content.replace(/<Grid container spacing=\{6\} alignItems="center">/g, "<Grid container spacing={6} sx={{ alignItems: 'center' }}>");
            }

            if (content !== original) {
                fs.writeFileSync(dirPath, content, 'utf8');
                console.log(`Updated ${f}`);
            }
        }
    });
}

walkDir(directory);
console.log('Done!');
