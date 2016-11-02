var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var RedisStore = require('connect-redis')(session);
var routes = require('./routes/routes');
var index = require('./routes/index');
var client = require('./routes/client');
var redisInfo = require('./conf/redisInfo')
var settings = require('./conf/settings')
var app = express();
/*模板引擎*/
var partials = require('express-partials');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(partials());

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/:domain', express.static(path.join(__dirname, 'public')));


app.use(cookieParser());
//设置session相关信息
app.use(session({
    secret:'ceyesclund',
    key:'ceyesclund',//cookie的名字
    cookie:{maxAge:1000 * 60 * 60 * 1},//1小时生存期
    //resave : 是指每次请求都重新设置session cookie，假设你的cookie是10分钟过期，每次请求都会再设置10分钟
    resave: true,
    //saveUninitialized: 是指无论有没有session cookie，每次请求都设置个session cookie ，默认给个标示为 connect.sid
    saveUninitialized: true,
    store: new RedisStore(redisInfo)
}))
app.use(function(req, res, next){
    // req.session.touch();

    //登陆用户的用户名
    res.locals.username = req.session.username;
    res.locals.networkConfig = req.session.networkConfig
    //用户信息
    res.locals.token = req.session.token;
    // console.log('res.locals.deviceCount',res.session.deviceCount)

    next();
});
//路由控制器
//路由控制器
app.use('/login',index)

app.use('/admin',routes)

app.use('/user',client)

// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      title: settings.TITLE,
      message: err.message,
      domain:req.baseUrl
      // error: err
    });
  });
}


console.log('a')

module.exports = app;
