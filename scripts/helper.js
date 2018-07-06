const { getCategorys } = require('./common');
const cheerio = require('cheerio');
const _ = require('lodash');

const colors = [
    '#ff924a',     // 橘色
    '#222222',        // 黑色
    '#a4c19e',
    '#cfa6ef',
    '#888888',     // 粉色
    '#80B3FF',     // 蓝色
    '#FD6E8A',     // 红色
    '#A2122F',     // 大红
    '#439877',
    '#5E445D',
    '#A8936D',
    '#a4c19e',
];

// 生成书柜内容
hexo.extend.helper.register('shelf_bookcase', function(posts) {
    // 处理数据
    /**
        [
            { title: 'xx', path: 'xx', categories: 'Node' }, 
            { title: 'yy', path: 'yy', categories: 'Node' }
        ]
     */
    let data = posts.map(item => {
        const { title, path, categories } = item;

        if (!categories.data[0]) {
            return { title, path };
        }

        return { title, path, categories: categories.data[0].name };
    })

    /**
        [
            { 
                category: 'Node', 
                books: [
                    { title: 'xx', path: 'xx' },
                    { title: 'yy', path: 'yy' }
                ]
            }    
        ]
     */
    let map = {}, dest = [];
    // 过滤文章头部 Front-matter 中没有 categories 字段的文章
    data = data.filter(item => item.categories);

    if (data.length === 0) {
        return '<h2 style="padding: 10px 20px;">要给文章加分类字段哦！categories ~</h2>'
    }

    // 重构数据结构
    for (let i = 0; i < data.length; i++) {
        if (!map[data[i].categories]) {
            dest.push({
                category: data[i].categories,
                books: [ data[i] ],
            });
            map[data[i].categories] = data[i].categories;
        } else {
            for(var j = 0; j < dest.length; j++){
                if (dest[j].category === data[i].categories) {
                    dest[j].books.push(data[i]);
                    break;
                }
            }
        }
    }

    // 组装 html
    let result = '';
    for (let i = 0; i < dest.length; i++) {
        result += `
            <div class="bookcase">
                <div class="category">
                    ${dest[i].category}(${dest[i].books.length})
                </div>
                <ul>`;
            
        for (let j = 0; j < dest[i].books.length; j++) {
            result += `
                    <li>
                        <a href="${dest[i].books[j].path}">
                            <div class="front" style="background-color: ${colors[j % colors.length]}">${dest[i].books[j].title}</div>
                            <div class="left" style="background-color: ${colors[j % colors.length]}"></div>
                            <div class="right" style="background-color: ${colors[j % colors.length]}"></div>
                            <div class="top"></div>
                        </a>
                    </li>
            `;
        }
        
        result += `
            </ul>
        </div>
        `;
    }
    
    return result;
});

// 生成文章章节目录
hexo.extend.helper.register('article_sidebar', function(str, options={}) {
	const $ = cheerio.load(str);
    
	const headingsSelector = ['h1', 'h2', 'h3'].join(',');
	const headings = $(headingsSelector);
    if (!headings.length) return '';

    // 获取标题数据
    let headArr = [];
    let h1 = false, h2 = false, h3 = false;
    headings.each(function () {
        const obj = {};
        obj.level = +this.name[1];    // 标题级别 h1-h6 分别为 1-6
		obj.id = $(this).attr('id');  // id
        obj.text = _.escape($(this).text());      // 标题内文字
        
        if (obj.level  === 1) {
            h1 = true;
        } else if (obj.level === 2) {
            h2 = true;
        } else {
            h3 = true;
        }

        headArr.push(obj);
    });

    let $h1 = null;
    let $h2 = null;
    const $ul = $('<ul class="sidebar"></ul>');

    if (h1) {   // 存在 h1 标签
        for (let i = 0; i < headArr.length; i++) {
            if (headArr[i].level === 1) {
                const $li = $(`<li><a href="#${headArr[i].id}">${headArr[i].text}</a><ul class="one"></ul></li>`)
                $ul.append($li);
                $h1 = $li;
            } else if (headArr[i].level === 2) {
                const $li = $(`<li><a href="#${headArr[i].id}">${headArr[i].text}</a><ul class="two"></ul></li>`);
                if ($h1) {
                    $h1.find('ul.one').append($li);
                } else {
                    $ul.append($li);
                }
                $h2 = $li;
            } else {
                const $li = $(`<li><a href="#${headArr[i].id}">${headArr[i].text}</a></li>`);
                if ($h2) {
                    $h2.find('ul.two').append($li);
                } else {
                    $ul.append($li);
                }
            }
        }   
    } else if (h2) {
        for (let i = 0; i < headArr.length; i++) {
            if (headArr[i].level === 2) {
                const $li = $(`<li><a href="#${headArr[i].id}">${headArr[i].text}</a><ul class="one"></ul></li>`);
                $ul.append($li);
                $h2 = $li;
            } else {
                const $li = $(`<li><a href="#${headArr[i].id}">${headArr[i].text}</a></li>`);
                if ($h2) {
                    $h2.find('ul.one').append($li);
                } else {
                    $ul.append($li);
                }
            }
        }   
    } else if (h3) {
        for (let i = 0; i < headArr.length; i++) {
            const $li = $(`<li><a href="#${headArr[i].id}">${headArr[i].text}</a></li>`);
            $ul.append($li);
        }   
    } else {
        return null;
    }

    const $div = $('<div></div>');
    $div.append($ul);

	return $div.html();
});
