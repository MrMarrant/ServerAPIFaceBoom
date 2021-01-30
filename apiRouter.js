var express = require("express");
var usersController = require("./routes/usersController");
var postsController = require("./routes/postsController");

exports.router = (function(){
    var apiRouter = express.Router();

    // Route User
    apiRouter.route("/users/register/").post(usersController.register);
    apiRouter.route("/users/login/").post(usersController.login);
    apiRouter.route("/users/me/").get(usersController.getUserProfile);
    apiRouter.route("/users/me/").put(usersController.updateUserProfile);
    
    // Route Post
    apiRouter.route("/messages/new/").post(postsController.createPost);
    apiRouter.route("/messages/").get(postsController.everyPost);
    apiRouter.route("/messages/user/").get(postsController.userPost);
    apiRouter.route("/messages/del/").delete(postsController.deletePost);
    apiRouter.route("/messages/update/").put(postsController.updatePost);

    return apiRouter;
}) ();