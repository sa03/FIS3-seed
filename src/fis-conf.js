fis.set('project.exclude', ['**.svn', '**.git', 'sass/**/*.scss', 'Gruntfile.js', 'package.json', 'docs/**', '**.cmd', '**.sh', 'bin/**', 'tpl/**.tmpl']);

fis.set('project.ignore', ['**.cmd', '**.sh', 'fis3-conf.js', 'fis-conf.js', 'fis-conf-com.js', 'js/libs/treeTable/**']);

// 启用 fis-spriter-csssprites 插件
fis.match('*.scss', {
    parser: fis.plugin('sass'), //启用fis-parser-sass插件
    rExt: '.css'
}).match('*.tmpl', {
    isJsLike: true,
    parser: fis.plugin('utc')
}).match('*.png', {
    // fis-optimizer-png-compressor 插件进行压缩，已内置
    optimizer: fis.plugin('png-compressor', {
        type : 'pngcrush'
    })
}).match('*.{js,tmpl,tpl,html}', {
    postprocessor: fis.plugin('require-async')
}).match('*.js', {
    url: './$0',
    postprocessor: fis.plugin('jswrapper')
}).match(/^\/sass\/((.*)\.(css|less|scss|sass))$/i, {
    // useSprite: true,
    postprocessor: fis.plugin('autoprefixer', {
        browsers: ['> 1%', 'last 2 versions'],
        cascade: true
    }),
    optimizer: fis.plugin('clean-css'),
    release: 'css/$1'
}).match('*.{png,jpg,gif,jpeg,cur}', {
    url: './$0',
    release: './css/$0'
}).match(/^\/sass\/(.*\.(png|jpg|gif|jpeg))$/i, {
    release: 'img/sprite/$1',
    url: '/img/sprite/$1'
}).match('_*.scss', {
    release: false
}).match('\/page\/**.html', {
    release: '$0'
}).match('*.{eot,svg,ttf,woff}', {
    url: './$0',
    release: './css/$0'
})

fis.media('dev').match('*.{js,css}', {
    useHash: false,
    // useSprite: false,
    optimizer: null
});

fis.media('prod').match('*.css', {
    // fis-optimizer-clean-css 插件进行压缩，已内置
    optimizer: fis.plugin('clean-css')
}).match('*.js', {
    // fis-optimizer-uglify-js 插件进行压缩，已内置
    // optimizer: fis.plugin('uglify-js', {
    //     mangle: {
    //         expect: ['require', 'define', '$'] //不想被压的
    //     }
    // })
});


