var jwtUtils = require('../utils/jwt.utils');
var models = require("../models");
var asyncLib  = require('async');
//const { query } = require("express");
const ITEMS_LIMIT   = 50;

module.exports = {
    createPost: function(req, res){
        // Get l'authentification du Header
        var headerAuth  = req.headers['authorization'];
        var userId      = jwtUtils.getUserId(headerAuth);

        // Paramètres
        var title  = req.body.title;
        var description = req.body.description;
        var image = req.body.image;

        if (title.length == null ||  description == null) {
            return res.status(400).json({ 'error': 'Paramètres manquant' });
        }

        if (title.length <= 2 ||  description.length <= 4) {
            return res.status(400).json({ 'error': 'Paramètres invalide' });
        }
        asyncLib.waterfall([
            function(done){
                models.User.findOne({
                    where: { id: userId }
                })
                .then(function(userFound) {
                    done(null, userFound);
                })
                .catch(function(err) {
                    return res.status(500).json({ 'error': 'Impossible de vérifier lutilisateur' });
                });
            },
            function(userFound, done) {
                if (userFound) {
                    models.Post.create({
                        title : title,
                        description: description,
                        image: image,
                        UserId: userFound.id
                    })
                    .then(function (newPost) {
                        done(newPost);
                    });
                
                } else {
                    return res.status(404).json({ 'error': 'Utilisateur non trouvé' });
                }
            },
        ], function(newPost){
                if (newPost) {
                    return res.status(201).json(newPost);
                }
                else {
                    return res.status(500).json({"error": "Impossible d'envoyer le post"});
                }
        });
    },
    everyPost: function(req, res){
        var fields = req.query.fields;
        var limit = parseInt(req.query.limit);
        var offset = parseInt(req.query.offset)
        var order = req.query.order;
        if (limit > ITEMS_LIMIT) {
            limit = ITEMS_LIMIT;
        } 

        models.Post.findAll({
            order: [(order != null) ? order.split(':') : ['title', 'ASC']],
            attributes: (fields !== '*' && fields != null) ? fields.split(',') : null,
            limit: (!isNaN(limit)) ? limit : null,
            offset: (!isNaN(offset)) ? offset : null,
            include: [{
                model: models.User,
                attributes: [ 'username' ]
            }]
        }).then(function(messages) {
            if (messages) {
            res.status(200).json(messages);
            } else {
            res.status(404).json({ "error": "Post Non trouvé" });
            }
        }).catch(function(err) {
            console.log(err);
            res.status(500).json({ "error": "Champs Invalide" });
        });
    },
    userPost: function(req, res){
        var headerAuth  = req.headers['authorization'];
        var userId      = jwtUtils.getUserId(headerAuth);

        var fields = req.query.fields;
        var limit = parseInt(req.query.limit);
        var offset = parseInt(req.query.offset)
        var order = req.query.order;
        if (limit > ITEMS_LIMIT) {
            limit = ITEMS_LIMIT;
        } 

        models.Post.findAll({
            order: [(order != null) ? order.split(':') : ['title', 'ASC']],
            attributes: (fields !== '*' && fields != null) ? fields.split(',') : null,
            limit: (!isNaN(limit)) ? limit : null,
            offset: (!isNaN(offset)) ? offset : null,
            where: { userId: userId },
            include: [{
                model: models.User,
                attributes: [ 'username' ]
            }]
        }).then(function(messages) {
            if (messages) {
            res.status(200).json(messages);
            } else {
            res.status(404).json({ "error": "Post Non trouvé" });
            }
        }).catch(function(err) {
            console.log(err);
            res.status(500).json({ "error": "Champs Invalide" });
        });
    },
    deletePost: function(req, res){
        var idPost    = req.body.id;
        var headerAuth  = req.headers['authorization'];
        var userId      = jwtUtils.getUserId(headerAuth);

        asyncLib.waterfall([
            function(done){
                models.Post.findOne({
                    where: { id: idPost,
                            UserId: userId},
                    truncate: true
                })
                .then(function(postFound) {
                    console.log(postFound)
                    done(null, postFound);
                })
                .catch(function(err) {
                    return res.status(500).json({ 'error': "Impossible de trouver le post ou vous n'avez pas les droits nécéssaire" });
                });
            },
            function(postFound, done) {
                if (postFound) {
                    models.Post.destroy({
                        where: { id: idPost }
                    })
                    .then(function (deletePost) {
                        done(deletePost);
                    });
                
                } else {
                    return res.status(404).json({ 'error': 'Post non trouvé' });
                }
            },
        ], function(deletePost){
                if (deletePost) {
                    return res.status(201).json(deletePost);
                }
                else {
                    return res.status(500).json({"error": "Impossible de supprimer le post"});
                }
        });
    },
}