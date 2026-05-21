const fs = require('fs');
const path = require('path');

hexo.extend.helper.register('get_music_list', function() {
    const musicDir = path.join(hexo.source_dir, 'music');
    let musicFiles = [];
    try {
        if (fs.existsSync(musicDir)) {
            musicFiles = fs.readdirSync(musicDir).filter(function(file) {
                const ext = path.extname(file).toLowerCase();
                return ext === '.mp3' || ext === '.wav' || ext === '.ogg';
            }).map(function(file) {
                // Return relative path for browser
                return '/music/' + file;
            });
        }
    } catch (err) {
        console.error('Error reading music directory:', err);
    }
    return JSON.stringify(musicFiles);
});
