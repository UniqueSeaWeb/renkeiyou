const fs = require('fs');
const path = require('path');

function searchFiles(dirPath) {
    const dirs = fs.readdirSync(dirPath, { withFileTypes: true });

    const files = [];
    for (const dir of dirs) {
        if (dir.isDirectory()) {
            const fp = path.join(dirPath, dir.name);
            files.push(searchFiles(fp));
        } else if (dir.isFile() && ['.java'].includes(path.extname(dir.name))) {
            const filePath = path.join(dirPath, dir.name);
            const fileContent = fs.readFileSync(filePath, 'utf8');
            const lines = fileContent.split('\n');

            const linesWithDollarAndLineNumber = lines.map((line, index) => {
                if (line.includes('$') && !line.trim().startsWith('//')) {
                    return {
                        line: index + 1,
                        content: line, // 行頭の空白を削除
                    };
                }
                return null;
            }).filter(obj => obj !== null);

            if (linesWithDollarAndLineNumber.length > 0) {
                files.push({
                    dir: filePath,
                    name: dir.name,
                    content: linesWithDollarAndLineNumber,
                });
            }
        }
    }

    return files.flat();
}

const dirPath = './sut';
const results = searchFiles(dirPath);

const output = results.map(file => {
    return `ファイルパス: ./${file.dir.replace('\\', '/')}\n${file.content.map(obj => `行${obj.line}: ${obj.content}\n`).join('')}\n`;
});

fs.writeFileSync('result.txt', output);

console.log('検索結果を result.txt に書き込みました。');
