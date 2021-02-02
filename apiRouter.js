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

     // Route Admin
    apiRouter.route("/messages/del/admin").delete(postsController.deletePostAdmin);
    apiRouter.route("/messages/update/admin").put(postsController.updatePostAdmin);
    apiRouter.route("/users/delete/").delete(usersController.deleteUser);

    return apiRouter;
}) ();