var bcrypt = require("bcrypt");
var jwtUtils = require('../utils/jwt.utils');
var models = require("../models");
var asyncLib  = require('async');
//const user = require("../models/user");

//Constante
//Rejette tout les mails foireux
const EMAIL_REGEX = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const PASSWORD_REGEX = /^(?=.*\d).{4,8}$/;

module.exports = {
    register: function(req, res) {
    
        var email = req.body.email; 
        var username = req.body.username; 
        var password = req.body.password; 
        var bio = req.body.bio; 


        if (email == null || username == null || password == null) {
            return res.status(400).json({"error": "Paramètres Manquant"});
        }

        if (username.length >= 13 || username.length <= 4 ) {
            return res.status(400).json({"error": "Le Nom d'utilisateur doit être compris entre 5 et 12 caractères"});
        }

        if (!EMAIL_REGEX.test(email)) {
            return res.status(400).json({"error": "Email Non Valide"});           
        }

        if (!PASSWORD_REGEX.test(password)) {
            return res.status(400).json({"error": "Mot de Passe Non Valide"});           
        }

        asyncLib.waterfall([
            function(done) {
              models.User.findOne({
                attributes: ['email'],
                where: { email: email }
              })
              .then(function(userFound) {
                done(null, userFound);
              })
              .catch(function(err) {
                return res.status(500).json({ 'error': "Impossible de vérifier l'utilisateur" });
              });
            },
            function(userFound, done) {
              if (!userFound) {
                bcrypt.hash(password, 5, function( err, bcryptedPassword ) {
                  done(null, userFound, bcryptedPassword);
                });
              } else {
                return res.status(409).json({ 'error': 'Utilisateur déjà existant' });
              }
            },
            function(userFound, bcryptedPassword, done) {
              var newUser = models.User.create({
                email: email,
                username: username,
                password: bcryptedPassword,
                bio: bio,
                isAdmin: 0
              })
              .then(function(newUser) {
                done(newUser);
              })
              .catch(function(err) {
                return res.status(500).json({ 'error': 'cannot add user' });
              });
            }
          ], function(newUser) {
            if (newUser) {
              return res.status(201).json({
                'userId': newUser.id
              });
            } else {
              return res.status(500).json({ 'error': 'cannot add user' });
            }
          });
        },


        login: function(req, res) {
          
          // Params
          var email    = req.body.email;
          var password = req.body.password;
      
          if (email == null ||  password == null) {
            return res.status(400).json({ 'error': 'Paramètres manquant' });
          }
      
          asyncLib.waterfall([
            function(done) {
              models.User.findOne({
                where: { email: email }
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
                bcrypt.compare(password, userFound.password, function(errBycrypt, resBycrypt) {
                  done(null, userFound, resBycrypt);
                });
              } else {
                return res.status(404).json({ 'error': 'Utilisateur inexistant sur la BDD' });
              }
            },
            function(userFound, resBycrypt, done) {
              if(resBycrypt) {
                done(userFound);
              } else {
                return res.status(403).json({ 'error': 'Mot De Passe Invalide' });
              }
            }
          ], function(userFound) {
            if (userFound) {
              return res.status(201).json({
                'userId': userFound.id,
                'token': jwtUtils.generateTokenForUser(userFound)
              });
            } else {
              return res.status(500).json({ 'error': 'Impossible de se connecter sur cet utilisateur' });
            }
          });
        },
        getUserProfile: function(req, res) {
          // Get l'authentification du Header
          var headerAuth  = req.headers['authorization'];
          var userId      = jwtUtils.getUserId(headerAuth);
      
          if (userId < 0)
            return res.status(400).json({ 'error': 'mauvais token' });
      
          models.User.findOne({
            attributes: [ 'id', 'email', 'username', 'bio','createdAt','updatedAt' ],
            where: { id: userId }
          }).then(function(user) {
            if (user) {
              res.status(201).json(user);
            } else {
              res.status(404).json({ 'error': 'Utilisateur non trouvé' });
            }
          }).catch(function(err) {
            res.status(500).json({ 'error': 'cannot fetch user' });
          });
        },
        deleteUser: function(req, res){
          var headerAuth  = req.headers['authorization'];
          var userId      = jwtUtils.getUserId(headerAuth);
          var isAdmin     = req.body.isAdmin;
          var banHammer   = req.body.idDelet;
  
          asyncLib.waterfall([
              function(done){
                if (isAdmin == 1){}
                else{return res.status(500).json({ 'error': "l'utilisateur n'est pas Admin" });}
                  models.User.findOne({
                      where: { id: banHammer},
                      truncate: true
                  })
                  .then(function(UserFound) {
                      console.log(UserFound)
                      done(null, UserFound);
                  })
                  .catch(function(err) {
                      return res.status(500).json({ 'error': "Impossible de trouver l'utilisateur ou vous n'avez pas les droits nécéssaire" });
                  });
              },
              function(UserFound, done) {
                  if (UserFound) {
                      models.User.destroy({
                          where: { id: banHammer }
                      })
                      .then(function (deleteUser) {
                          done(deleteUser);
                      });
                  
                  } else {
                      return res.status(404).json({ 'error': 'Utilisateur non trouvé' });
                  }
              },
          ], function(deleteUser){
                  if (deleteUser) {
                      return res.status(201).json(deleteUser);
                  }
                  else {
                      return res.status(500).json({"error": "Impossible de supprimer le l'utilisateur"});
                  }
          });
      },
        updateUserProfile: function(req, res) {
          // Getting auth header
          var headerAuth  = req.headers['authorization'];
          var userId      = jwtUtils.getUserId(headerAuth);
      
          // Params
          var bio = req.body.bio;
      
          asyncLib.waterfall([
            function(done) {
              models.User.findOne({
                attributes: ['id', 'bio'],
                where: { id: userId }
              }).then(function (userFound) {
                done(null, userFound);
              })
              .catch(function(err) {
                return res.status(500).json({ 'error': 'Impossible de vérifier lutilisateur' });
              });
            },
            function(userFound, done) {
              if(userFound) {
                userFound.update({
                  bio: (bio ? bio : userFound.bio)
                }).then(function() {
                  done(userFound);
                }).catch(function(err) {
                  res.status(500).json({ 'error': 'Impossible de mettre à jour lutilisateur' });
                });
              } else {
                res.status(404).json({ 'error': 'Utilisateur non trouvé' });
              }
            },
          ], function(userFound) {
            if (userFound) {
              return res.status(201).json(userFound);
            } else {
              return res.status(500).json({ 'error': 'Impossible de mettre à jour le profil de lutilisateur' });
            }
          });
        }
      }






/*
        models.User.findOne({
            attributes: ['email'], 
            where: { email: email}
        })
        .then(function(userFound){
            if (!userFound) {
                
                bcrypt.hash(password, 5, function( err, bcryptedPassword){
                    var newUser = models.User.create({
                        email: email,
                        username: username,
                        password: bcryptedPassword,
                        bio: bio,
                        isAdmin: 0
                    })
                    .then(function(newUser){
                        return res.status(201).json({
                            'userId': newUser.id
                        })
                    })
                    .catch(function(err){
                        return res.status(500).json({ 'error': 'cannot add user'});
                    });
                });
            
        } else {
            return res.status(409).json({ 'error': 'user already exist'}); 
        }
    })

    },
    login: function(req, res) {
        var email = req.body.email; 
        var password = req.body.password; 

        if (email == null || password == null) {
            return res.status(400).json({"error": "Paramètres Manquant"});
        }

        models.User.findOne({
            where: { email: email}
        })
        .then(function(userFound){
            if (userFound) {
                bcrypt.compare(password,userFound.password, function( errBycrypt, resBycrypt){
                    if (resBycrypt) {
                        return res.status(200).json({
                            'userId': userFound.id,
                            'token': jwtUtils.genereateTokenForUser(userFound)
                        });                      
                    }
                    else {
                        return res.status(403).json({ 'error': 'Mot de passe Invalide'}); 
                    }
                });

            
        } else {
            return res.status(404).json({ 'error': 'Utilisateur inexistant dans la db'}); 
        }
    })
    .catch(function(err){
        return res.status(500).json({ 'error': 'Impossible de vérifier lutilisateur'}); 
    });
    }
} */