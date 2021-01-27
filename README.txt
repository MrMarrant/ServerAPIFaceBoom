#ServerAPIFaceBoom

Cloner le projet,
Allumer votre serveur SQL via WAMP ou MAMP sur Mac
ouvrer la console du server MySQL
Créer une base de donnée : create database database_development;
Vous pouvez modifier le nom de la BDD dans le fichier ./config/config.JSON Je vous conseille par ailleurs de faire correspondre vos identifiants de connection de MySQL avec "username" et "password" dans ce fichier.

Ouvrer un nouveau terminal avec le chemin correspondant au projet du ServerAPIFaceBoom
et entrer la commande suivante : sequelize db:migrate
Si tout fonctionne correctement , vous devriez retrouver les tables dans votre base de données MySQL

Allumer le serveur via le terminal en entrant la commande suivante : nodemon index.js


Ouvrer Postman (ou un autre logiciel de requete d'API)
faite les requete nécessaire en tapant http://localhost:8080/api/users/[ApiRoute]  Toutes les routes son dans le fichier apiRouter.js à la racine
Pour la requete get et put, il est nécéssaire d'avoir le token d'identification et donc de passer par la requete Post: Login

Pour les requetes Post il faut indiquer dans le body -> x-www-form-urlencoded 
Pour le login il faut l'email et le password
Pour le register il faut indiquer l'email/username/password/bio

Pour les requetes Get il faut indiquer dans le headers : Content-Type(value:application/x-www-form-urlencoded) et Authorization(value:Bearer [TOKEN]) 
Pour la requete Put il faut indiquer en plus du headers dans le body : bio(value:[NouvelleBio])
