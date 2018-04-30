var express = require('express')
var router = express.Router()  
var orm = require('orm');
var connString = 'mysql://testuser:p@ssw0rd@18.220.214.73/friendsmgmt'

/**
1. As a user, I need an API to create a friend connection between two email addresses.
POST Request http://localhost/api/user/addFriend
Request:
{
  "friends":
    [
      "andy@example.com",
      "john@example.com"
    ]
}
Response Success: 
{"success":true}
Response Failure:
{"success":false,"info":"User not Found!"}
*/
router.post('/addFriend',function(req,res){
    const body = req.body;    
    var jsonResp = {};
    res.set('Content-Type', 'text/plain');
    //console.log(body);
    if(body.friends.length == 2){
        req.models.User.find({ email: body.friends[0]},1, function (err, userA) {
            if (err) {
                console.log(err);
                res.sendStatus(500);
            }else{
                if(userA[0] != null){
                    req.models.User.find({ email: body.friends[1]},1, function (err, userB) {
                        if (err) {
                            console.log(err);
                            res.sendStatus(500);
                        }else{
                            if(userB[0] != null){
                                req.models.BlockUser.exists({or:[{requestor: userA[0].id,  target: userB[0].id}, {requestor: userB[0].id,  target: userA[0].id}]}, function (err, exists) {
                                    if (err) {
                                        console.log(err);
                                        res.sendStatus(500);
                                    }else{
                                        if (exists) {
                                            jsonResp.success = false;
                                            jsonResp.info = "Blocked User, cannot add as a friend";
                                            res.send(JSON.stringify(jsonResp));
                                        }else{
                                            req.models.Friends.exists({or:[{user_id: userA[0].id,  friend_id: userB[0].id}, {user_id: userB[0].id,  friend_id: userA[0].id}]}, function (err, exists) {
                                                if (err) {
                                                    console.log(err);
                                                    res.sendStatus(500);
                                                }else{
                                                    if (exists) {                                            
                                                        jsonResp.success = true;
                                                        jsonResp.info = "Already Friends";
                                                        res.send(JSON.stringify(jsonResp));
                                                    }else{
                                                        req.models.Friends.create([
                                                            {
                                                                user_id: userA[0].id,
                                                                friend_id: userB[0].id       
                                                            }
                                                        ], function (err, items) {
                                                            if (err) {
                                                                console.log(err);
                                                                res.sendStatus(500);
                                                            }
                                                            jsonResp.success = true;
                                                            jsonResp.info = "Added Friends";
                                                            res.send(JSON.stringify(jsonResp));
                                                            }
                                                        );
                                                    }
                                                }
                                            });
                                        }
                                    }
                                });
                            }else{
                                jsonResp.success = false;
                                jsonResp.info = "User '" + body.friends[1] + "' does not exists";
                                res.send(JSON.stringify(jsonResp));
                            }
                        }
                    });
                }else{
                    jsonResp.success = false;
                    jsonResp.info = "User '" + body.friends[0] + "' does not exists";  
                    res.send(JSON.stringify(jsonResp));
                }
            }
        });
        
    }else{
        jsonResp.success = false;
        jsonResp.info = "Friends array in the request should be of length 2";    
        res.send(JSON.stringify(jsonResp));
    }
});


/**
2. As a user, I need an API to retrieve the friends list for an email address.
POST Request http://localhost/api/user/getFriends
Request:
{
  email: 'andy@example.com'
}
Response Success: 
{
  "success": true,
  "friends" :
    [
      'john@example.com'
    ],
  "count" : 1   
}
Response Failure:
{"success":false,"info":"User not Found!"}
*/
router.post('/getFriends',function(req,res){
    const body = req.body;    
    var jsonResp = {};
    res.set('Content-Type', 'text/plain');
    //console.log(body);
    req.models.User.find({ email: body.email},1, function (err, userA) {
        if (err) {
            console.log(err);
            res.sendStatus(500);
        }else{
            if(userA[0] != null){
                req.models.Friends.find({or:[{user_id: userA[0].id},{friend_id: userA[0].id}]}, function (err, friends) {
                    if (err) {
                        console.log(err);
                        res.sendStatus(500);
                    }else{        
                        var users = []                        
                        friends.forEach(function(element) {
                            users.push(element.user_id)
                            users.push(element.friend_id)
                        });               
                        console.log(users)
                        req.models.User.find({ id: users}, function (err, usersrows) {
                            if (err) {
                                console.log(err);
                                res.sendStatus(500);
                            }else{
                                var usersEmail = []                        
                                usersrows.forEach(function(element2) {
                                    if(element2.email != body.email)
                                        usersEmail.push(element2.email)
                                });  
                                jsonResp.success = true;
                                jsonResp.friends = usersEmail;
                                jsonResp.count = usersEmail.length;
                                res.send(JSON.stringify(jsonResp));
                            }
                        });
                    }
                });                    
            }else{
                jsonResp.success = false;
                jsonResp.info = "User '" + body.email + "' does not exists";  
                res.send(JSON.stringify(jsonResp));
            }
        }
    });    
});

/**
3. As a user, I need an API to retrieve the common friends list between two email addresses.
POST Request http://localhost/api/user/getCommonFriends
Request:
{
  friends:
    [
      'andy@example.com',
      'john@example.com'
    ]
}
Response Success: 
{
  "success": true,
  "friends" :
    [
      'common@example.com'
    ],
  "count" : 1   
}
Response Failure:
{"success":false,"info":"User not Found!"}
*/
router.post('/getCommonFriends',function(req,res){
    const body = req.body;    
    var jsonResp = {};
    res.set('Content-Type', 'text/plain');
    //console.log(body);
    if(body.friends.length == 2){
        req.models.User.find({ email: body.friends[0]},1, function (err, userA) {
            if (err) {
                console.log(err);
                res.sendStatus(500);
            }else{
                if(userA[0] != null){
                    req.models.User.find({ email: body.friends[1]},1, function (err, userB) {
                        if (err) {
                            console.log(err);
                            res.sendStatus(500);
                        }else{
                            if(userB[0] != null){                         
                                var db = orm.express(connString, {
                                    define: function (db, models) {   
                                        db.driver.execQuery(
                                            "SELECT email FROM user where id in(SELECT user1.friend_id FROM friends AS user1 JOIN friends AS user2 USING (friend_id) WHERE user1.user_id = ? AND user2.user_id = ?);",
                                            [userA[0].id, userB[0].id],
                                            function (err, data) { 
                                                console.log(data);
                                                var commons = []
                                                data.forEach(function(el){
                                                    commons.push(el.email)
                                                });
                                                jsonResp.success = true;
                                                jsonResp.friends = commons;
                                                jsonResp.count = commons.length;
                                                res.send(JSON.stringify(jsonResp));
                                            }
                                          )       
                                    }
                                });                                                        
                            }else{
                                jsonResp.success = false;
                                jsonResp.info = "User '" + body.friends[1] + "' does not exists";
                                res.send(JSON.stringify(jsonResp));
                            }
                        }
                    });
                }else{
                    jsonResp.success = false;
                    jsonResp.info = "User '" + body.friends[0] + "' does not exists";  
                    res.send(JSON.stringify(jsonResp));
                }
            }
        });
        
    }else{
        jsonResp.success = false;
        jsonResp.info = "Friends array in the request should be of length 2";    
        res.send(JSON.stringify(jsonResp));
    }
});

/**
4. As a user, I need an API to subscribe to updates from an email address.
POST Request http://localhost/api/user/subscribeUser
Request:
{
  "requestor": "lisa@example.com",
  "target": "john@example.com"
}

Response Success: 
{"success":true}
Response Failure:
{"success":false,"info":"User not Found!"}
*/
router.post('/subscribeUser',function(req,res){
    const body = req.body;    
    var jsonResp = {};
    res.set('Content-Type', 'text/plain');
    //console.log(body);
    req.models.User.find({ email: body.requestor},1, function (err, userA) {
        if (err) {
            console.log(err);
            res.sendStatus(500);
        }else{
            if(userA[0] != null){
                req.models.User.find({ email: body.target},1, function (err, userB) {
                    if (err) {
                        console.log(err);
                        res.sendStatus(500);
                    }else{
                        if(userB[0] != null){
                            req.models.Subscribe.exists({requestor: userA[0].id,  target: userB[0].id}, function (err, exists) {
                                if (err) {
                                    console.log(err);
                                    res.sendStatus(500);
                                }else{
                                    if (exists) {                                            
                                        jsonResp.success = true;
                                        jsonResp.info = "Already Subscribed";
                                        res.send(JSON.stringify(jsonResp));
                                    }else{
                                        req.models.Subscribe.create([
                                            {
                                                requestor: userA[0].id,
                                                target: userB[0].id       
                                            }
                                        ], function (err, items) {
                                            if (err) {
                                                console.log(err);
                                                res.sendStatus(500);
                                            }
                                            jsonResp.success = true;
                                            jsonResp.info = "Subscribed";
                                            res.send(JSON.stringify(jsonResp));
                                            }
                                        );
                                    }
                                }
                            });
                        }else{
                            jsonResp.success = false;
                            jsonResp.info = "User '" + body.target + "' does not exists";
                            res.send(JSON.stringify(jsonResp));
                        }
                    }
                });
            }else{
                jsonResp.success = false;
                jsonResp.info = "User '" + body.requestor + "' does not exists";  
                res.send(JSON.stringify(jsonResp));
            }
        }
    });        
});

/**
5. As a user, I need an API to block updates from an email address.
POST Request http://localhost/api/user/blockUser
Request:
{
  "requestor": "andy@example.com",
  "target": "john@example.com"
}

Response Success: 
{"success":true}
Response Failure:
{"success":false,"info":"User not Found!"}
*/
router.post('/blockUser',function(req,res){
    const body = req.body;    
    var jsonResp = {};
    res.set('Content-Type', 'text/plain');
    //console.log(body);
    req.models.User.find({ email: body.requestor},1, function (err, userA) {
        if (err) {
            console.log(err);
            res.sendStatus(500);
        }else{
            if(userA[0] != null){
                req.models.User.find({ email: body.target},1, function (err, userB) {
                    if (err) {
                        console.log(err);
                        res.sendStatus(500);
                    }else{
                        if(userB[0] != null){
                            req.models.BlockUser.exists({requestor: userA[0].id,  target: userB[0].id}, function (err, exists) {
                                if (err) {
                                    console.log(err);
                                    res.sendStatus(500);
                                }else{
                                    if (exists) {                                            
                                        jsonResp.success = true;
                                        jsonResp.info = "Already Blocked";
                                        res.send(JSON.stringify(jsonResp));
                                    }else{
                                        req.models.BlockUser.create([
                                            {
                                                requestor: userA[0].id,
                                                target: userB[0].id       
                                            }
                                        ], function (err, items) {
                                            if (err) {
                                                console.log(err);
                                                res.sendStatus(500);
                                            }
                                            jsonResp.success = true;
                                            jsonResp.info = "User Blocked";
                                            res.send(JSON.stringify(jsonResp));
                                            }
                                        );
                                    }
                                }
                            });
                        }else{
                            jsonResp.success = false;
                            jsonResp.info = "User '" + body.target + "' does not exists";
                            res.send(JSON.stringify(jsonResp));
                        }
                    }
                });
            }else{
                jsonResp.success = false;
                jsonResp.info = "User '" + body.requestor + "' does not exists";  
                res.send(JSON.stringify(jsonResp));
            }
        }
    });        
});

/**
6. As a user, I need an API to retrieve all email addresses that can receive updates from an email address.
POST Request http://localhost/api/user/notifyUsers
Request:
{
  "sender":  "john@example.com",
  "text": "Hello World! kate@example.com"
}
Response Success: 
{
  "success": true
  "recipients":
    [
      "lisa@example.com",
      "kate@example.com"
    ]
}
Response Failure:
{"success":false,"info":"User not Found!"}
*/
router.post('/notifyUsers',function(req,res){
    const body = req.body;    
    var jsonResp = {};
    res.set('Content-Type', 'text/plain');
    //console.log(body);
    req.models.User.find({ email: body.sender},1, function (err, userA) {
        if (err) {
            console.log(err);
            res.sendStatus(500);
        }else{
            if(userA[0] != null){                     
                orm.express(connString, {
                    define: function (db, models) {   
                        db.driver.execQuery(
                            "SELECT requestor from subscribe where target = ? and requestor not in (select requestor from block_user where target = ?)",
                            [userA[0].id, userA[0].id],
                            function (err, data) { 
                                console.log(data);
                                var commons = []
                                data.forEach(function(el){
                                    commons.push(el.requestor)
                                });
                                orm.express(connString, {
                                    define: function (db, models) {   
                                        db.driver.execQuery(
                                            "SELECT * from friends where (user_id = ? or friend_id = ?) and user_id not in (select requestor from block_user where requestor = ? or target = ?) and friend_id not in (select requestor from block_user where requestor = ? or target = ?)",
                                            [userA[0].id, userA[0].id,userA[0].id, userA[0].id,userA[0].id, userA[0].id],
                                            function (err, data) { 
                                                console.log(data);
                                                data.forEach(function(el){
                                                    commons.push(el.friend_id)
                                                    commons.push(el.user_id)
                                                });
                                                console.log(commons)
                                                req.models.User.find({ id: commons}, function (err, users) {
                                                    if (err) {
                                                        console.log(err);
                                                        res.sendStatus(500);
                                                    }else{
                                                        var notifyUsers = []
                                                        users.forEach(function(el){
                                                            if(el.email != body.sender){
                                                                notifyUsers.push(el.email)
                                                            }
                                                        });
                                                        jsonResp.success = true;
                                                        jsonResp.recipients = notifyUsers;
                                                        res.send(JSON.stringify(jsonResp));
                                                    }
                                                });

                                            }
                                        )       
                                    }
                                });
                            }
                        )       
                    }
                });
            }else{
                jsonResp.success = false;
                jsonResp.info = "User '" + body.sender + "' does not exists";  
                res.send(JSON.stringify(jsonResp));
            }
        }
    });
});


module.exports = router