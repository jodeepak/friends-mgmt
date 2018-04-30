var express = require('express')
var router = express.Router()  
var orm = require('orm');

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
                                req.models.Friends.exists({or:[{user_id: userA[0].id,  friend_id: userB[0].id}, {user_id: userB[0].id,  friend_id: userA[0].id}]}, function (err, exists) {
                                    if (err) {
                                        console.log(err);
                                        res.sendStatus(500);
                                    }else{
                                        if (exists) {                                            
                                            jsonResp.success = false;
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

module.exports = router