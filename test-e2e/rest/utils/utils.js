const fs = require('fs');
const path = require('path');

function findInDir (dir, fileList = []) {
    const files = fs.readdirSync(dir);

    files.forEach((file) => {
        const filePath = path.join(dir, file);
        const fileStat = fs.lstatSync(filePath);

        if (fileStat.isDirectory()) {
            findInDir(filePath, fileList);
        } else {
            fileList.push(filePath);
        }
    });

    return fileList;
}

const getAnsiStripRegExp = () => {
    const pattern = [
        '[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:[a-zA-Z\\d]*(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?\\u0007)',
        '(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-ntqry=><~]))'
    ].join('|');

    return new RegExp(pattern, 'g');
};
const ansiRegExp = getAnsiStripRegExp();
const stripAnsiCodes = str => str.replace(ansiRegExp, '')


exports.findInDir = findInDir;
exports.stripAnsiCodes = stripAnsiCodes;
