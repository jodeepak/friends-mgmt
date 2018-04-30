"use strict";
var express = require('express');
var bodyParser = require('body-parser');
var compression = require('compression');
var orm = require('orm');
var connString = 'mysql://testuser:p@ssw0rd@18.220.214.73/friendsmgmt'
var app = express();
app.disable('x-powered-by');
app.use(compression());

var PORT = process.env.PORT || 80;

app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(bodyParser.json());

var handlebars = require('express-handlebars').create({defaultLayout:'main'}); 
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

//app.use(express.static(__dirname + '/public'));

app.use(orm.express(connString, {
        define: function (db, models) {        
            models.User = db.define("user", {
                name: String,
                email: String,
            });
            models.Friends = db.define("friends", {
                user_id: Number,
                friend_id: Number,
            });
        }
    })); 

app.listen(PORT, function() {
});

app.use(require('./controllers'))
    