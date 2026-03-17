Voici un message que vous pouvez envoyer au support WHC :

---

**Objet :** Demande d'augmentation de la limite de processus et activation de mod_proxy

Bonjour,

Je suis client sur le serveur **cloud137057.mywhc.ca** (compte : epavillonclimati).

Je développe une application web qui nécessite l'exécution de services backend et frontend en tant que processus persistants sur mon VPS. Pour cela, j'aurais besoin de deux modifications :

**1. Augmentation de la limite de processus (ulimit -u)**
La limite actuelle est de 35 processus, ce qui est insuffisant pour mon architecture applicative. Serait-il possible de l'augmenter à **100 processus** ?

**2. Activation des modules Apache mod_proxy**
J'aurais besoin que les modules suivants soient activés dans la configuration Apache :
- mod_proxy
- mod_proxy_http
- mod_proxy_wstunnel pour le WebSockets

Ces modules me permettront de configurer un reverse proxy via Apache pour rediriger le trafic vers mes services applicatifs qui tournent sur des ports internes.

Merci d'avance pour votre aide.

Cordialement,
[Votre nom]

---

Voulez-vous que je modifie quelque chose dans ce message ?
