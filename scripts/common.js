const fs = require('fs');
const path = require('path');

/**
 * 获取目录结构
 */
function getCategorys () {
    const rootdir = path.join(process.cwd(), 'source/_posts');
    const categorys = fs.readdirSync(rootdir);

    for (let i = 0; i < categorys.length; i++) {
        const files = fs.readdirSync(path.join(rootdir, categorys[i]));
        const obj = new Object();
        obj.category = categorys[i];
        obj.books = files;
        categorys[i] = obj;
    }

    return categorys;
}

module.exports = {
    getCategorys,
}