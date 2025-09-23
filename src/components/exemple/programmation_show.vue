<template>
    <!-- Photos show-screen -->
    <div v-if="photoShow" style="z-index: 9999;" class="fixed w-screen h-screen flex justify-center items-center bg-opacity-40 backdrop-blur-sm z-50 bg-ifdd-green3 overflow-y-scroll">
        <img class="w-screen h-screen absolute object-contain" :src="programmation.photos[photoIndex].url.split('/')[0] == 'images_uploades' ? '/' + programmation.photos[photoIndex].url : programmation.photos[photoIndex].url" alt="">

        <div class="absolute rounded-t-xl bottom-0 py-4 px-6 bg-ifdd-blue2 bg-opacity-40">
            <div class="flex">
                <button v-if="photoIndex > 0" @click="photoIndex--" class="bg-ifdd-yellow transition-all relative z-0 mb-1 flex text-ifdd-green3 px-3 rounded-full shadow-md">
                    <div><img class="h-4 w-4 -rotate-90 mt-1 mr-3" src="/images/icons/up-arrow-svgrepo-com.svg" alt=""></div>
                    <div class="font-bold">Précédent</div>
                </button>
                <button v-if="photoIndex < (programmation.photos.length - 1)" @click="photoIndex++" class="ml-5 bg-ifdd-yellow transition-all relative z-0 mb-1 flex text-ifdd-green3 px-3 rounded-full shadow-md">
                    <div class="font-bold">Suivant</div>
                    <div><img class="h-4 w-4 rotate-90 mt-1 ml-2" src="/images/icons/up-arrow-svgrepo-com.svg" alt=""></div>
                </button>
            </div>

            <div class="flex">
                <button @click="photoShow = null" class=" bg-red-600 mx-auto transition-all mt-5 relative z-0 mb-1 flex px-3 rounded-full shadow-md">
                    <div class="font-bold text-white">Quitter</div>
                </button>
            </div>
        </div>
    </div>

    <!-- S'inscrire Pop Up -->
    <div style="z-index: 99;" v-if="inscriptionPopUp" class="fixed h-screen w-screen bg-opacity-40 backdrop-blur-sm bg-black z-50 bg-ifdd-green3 overflow-y-scroll">
        <div class="z-50 bg-white shadow-xl rounded-xl mx-auto mt-7 w-80 pr-7 pb-7 pl-7">
            <div class="mx-auto">
                <div class="flex justify-center border-b">
                    <img class="h-10 relative top-3" src="/images/logos/logo-epavillon.svg" alt="">
                    <div class="relative top-3 left-1 mx-2">
                        <img class="h-5 rotate-90" src="/images/icons/up-arrow-svgrepo-com.svg" alt="">
                        <img class="h-5 -rotate-90" src="/images/icons/up-arrow-svgrepo-com.svg" alt="">
                    </div>
                    <img class="h-16" src="/images/logos/zoom-logo.png" alt="">
                </div>
                <div class="text-ifdd-green3 font-extrabold text-xl text-center" style="background: -webkit-linear-gradient(left, red , purple); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
                    INSCRIPTION
                </div>
                <div class="text-xl inline-flex line-clamp-3 my-2 text-center text-gray-600 font-bold bg-"><span class="">{{programmation.titre}}</span></div>
                <div v-if="this.form.message == 'error'" class="bg-ifdd-red border-ifdd-red text-ifdd-red border rounded-md bg-opacity-25 text-center px-2">
                    Nous avons rencontré un problème, veuillez réessayer plus tard
                </div>
                <div v-if="this.form.message == 'deja-inscrit'" class="bg-green-500 border-green-500 text-ifdd-green3 border rounded-md bg-opacity-25 text-center p-2">
                    <div class=" font-bold">Vous êtes déjà inscrit.e <span class="text-2xl">🧐</span></div>
                    <div class="flex mt-1">
                        <button @click="copy" class="bg-ifdd-blue mr-1 text-white rounded-md shadow-md px-2 active:bg-blue-300 hover:bg-blue-500">{{copierLien ? 'Copié' : 'Copier le lien Zoom'}}</button>
                        <input v-on:focus="$event.target.select()" ref="clone" class="rounded-md w-full" type="text"  :value="form.lien" readonly>
                    </div>
                    <div>OU</div>
                    <div class="mt-2 mb-2"><a :href="form.lien" class="px-3 py-2 shadow-md rounded-md text-ifdd-green3 bg-ifdd-yellow">Rejoindre la session</a></div>
                </div>
                <div v-if="this.form.message == 'success'" class="bg-green-500 border-green-500 text-ifdd-green3 border rounded-md bg-opacity-25 text-center p-2">
                    <div class=" font-bold">Inscription réussie <span class="text-2xl">😊</span>! Votre lien de connexion personnel Zoom a été envoyé à l'adresse: {{form.email}}</div>
                    <div class="flex mt-1">
                        <button @click="copy" class="bg-ifdd-blue mr-1 text-white rounded-md shadow-md px-2 active:bg-blue-300 hover:bg-blue-500">{{copierLien ? 'Copié' : 'Copier le lien'}}</button>
                        <input v-on:focus="$event.target.select()" ref="clone" class="rounded-md w-full" type="text"  :value="form.lien" readonly>
                    </div>
                </div>
                <form v-if="!form.message" @submit.prevent="userSubscription">
                    <div class="">
                        <Label class="font-bold" for="nom" style="background: -webkit-linear-gradient(left, red , purple); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Votre nom: </Label>
                        <div><input required v-model="form.nom" class="rounded-md w-full" id="nom" type="text" placeholder="Entrez votre nom ici"></div>
                    </div>

                    <div class="mt-2">
                        <Label class="font-bold" for="prenom" style="background: -webkit-linear-gradient(left, red , purple); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Votre prénom: </Label>
                        <div><input required v-model="form.prenom" class="rounded-md w-full" id="prenom" type="text" placeholder="Entrez votre prénom ici"></div>
                    </div>

                    <div class="mt-2">
                        <Label class="font-bold" for="email" style="background: -webkit-linear-gradient(left, red , purple); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Votre email: </Label>
                        <div><input required v-model="form.email" class="rounded-md w-full" id="email" type="email" placeholder="Entrez email ici"></div>
                    </div>

                    <div class="mt-2 mb-2">
                        <Label class="font-bold" for="sexe" style="background: -webkit-linear-gradient(left, red , purple); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Votre sexe/genre </Label>
                        <select v-model="form.sexe" name="sexe" id="sexe" class="h-10 cursor-pointer rounded-md w-64 focus:outline-none border-green-custom">
                            <option disabled value="">Choisir le sexe</option>
                            <option value="Femme">Femme</option>
                            <option value="Homme">Homme</option>
                        </select>
                    </div>

                    <Label class="font-bold" for="country" style="background: -webkit-linear-gradient(left, red , purple); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Votre pays: </Label>
                    <select
                        class="h-10 cursor-pointer rounded-md w-64 focus:outline-none border-green-custom"
                        id="country"
                        name="country"
                        v-model="form.pays"
                        >
                            <option disabled value="">Choisir pays</option>
                            <optgroup label="A">
                                <option value="AF">Afghanistan</option>
                                        <option value="ZA">Afrique du Sud</option>
                                        <option value="AL">Albanie</option>
                                        <option value="Alg">Algérie</option>
                                        <option value="DE">Allemagne</option>
                                        <option value="MK">Ancienne République yougoslave de Macédoine</option>
                                        <option value="AD">Andorre</option>
                                        <option value="AO">Angola</option>
                                        <option value="AI">Anguilla</option>
                                        <option value="AQ">Antarctique</option>
                                        <option value="AG">Antigua-et-Barbuda</option>
                                        <option value="AN">Antilles néerlandaises</option>
                                        <option value="SA">Arabie saoudite</option>
                                        <option value="AR">Argentine</option>
                                        <option value="AM">Arménie</option>
                                        <option value="AW">Aruba</option>
                                        <option value="AU">Australie</option>
                                        <option value="AT">Autriche</option>
                                        <option value="AZ">Azerbaïdjan</option>
                                    </optgroup>
                                    <optgroup label="B">
                                <option value="BS">Bahamas</option>
                                        <option value="BH">Bahreïn</option>
                                        <option value="BD">Bangladesh</option>
                                        <option value="BB">Barbade</option>
                                        <option value="BE">Belgique</option>
                                        <option value="BZ">Belize</option>
                                        <option value="BJ">Bénin</option>
                                        <option value="BM">Bermudes</option>
                                        <option value="BT">Bhoutan</option>
                                        <option value="BY">Biélorussie</option>
                                        <option value="BO">Bolivie</option>
                                        <option value="BA">Bosnie-et-Herzégovine</option>
                                        <option value="BW">Botswana</option>
                                        <option value="BR">Brésil</option>
                                        <option value="BN">Brunei Darussalam</option>
                                        <option value="BG">Bulgarie</option>
                                        <option value="BF">Burkina Faso</option>
                                        <option value="BI">Burundi</option>
                                    </optgroup>
                                    <optgroup label="C">
                                <option value="KH">Cambodge</option>
                                        <option value="CM">Cameroun</option>
                                        <option value="CA">Canada</option>
                                        <option value="CV">Cap-Vert</option>
                                        <option value="CL">Chili</option>
                                        <option value="CN">Chine</option>
                                        <option value="CY">Chypre</option>
                                        <option value="CO">Colombie</option>
                                        <option value="KM">Comores</option>
                                        <option value="CG">Congo</option>
                                        <option value="CR">Costa Rica</option>
                                        <option value="CI">Côte d'Ivoire</option>
                                        <option value="HR">Croatie</option>
                                        <option value="CU">Cuba</option>
                                    </optgroup>
                                    <optgroup label="D">
                                <option value="DK">Danemark</option>
                                        <option value="DJ">Djibouti</option>
                                        <option value="DM">Dominique</option>
                                    </optgroup>
                                    <optgroup label="E">
                                <option value="EG">Égypte</option>
                                        <option value="SV">El Salvador</option>
                                        <option value="AE">Émirats arabes unis</option>
                                        <option value="EC">Équateur</option>
                                        <option value="ER">Érythrée</option>
                                        <option value="ES">Espagne</option>
                                        <option value="EE">Estonie</option>
                                        <option value="FM">États fédérés de Micronésie</option>
                                        <option value="US">États-Unis</option>
                                        <option value="ET">Éthiopie</option>
                                    </optgroup>
                                    <optgroup label="F">
                                <option value="FJ">Fidji</option>
                                        <option value="FI">Finlande</option>
                                        <option value="FR">France</option>
                                    </optgroup>
                                    <optgroup label="G">
                                <option value="GA">Gabon</option>
                                        <option value="GM">Gambie</option>
                                        <option value="GE">Géorgie</option>
                                        <option value="GS">Géorgie du Sud-et-les Îles Sandwich du Sud</option>
                                        <option value="GH">Ghana</option>
                                        <option value="GI">Gibraltar</option>
                                        <option value="GR">Grèce</option>
                                        <option value="GD">Grenade</option>
                                        <option value="GL">Groenland</option>
                                        <option value="GP">Guadeloupe</option>
                                        <option value="GU">Guam</option>
                                        <option value="GT">Guatemala</option>
                                        <option value="GN">Guinée</option>
                                        <option value="GQ">Guinée équatoriale</option>
                                        <option value="GW">Guinée-Bissau</option>
                                        <option value="GY">Guyane</option>
                                        <option value="GF">Guyane française</option>
                                    </optgroup>
                                    <optgroup label="H">
                                <option value="HT">Haïti</option>
                                        <option value="HN">Honduras</option>
                                        <option value="HK">Hong Kong</option>
                                        <option value="HU">Hongrie</option>
                                    </optgroup>
                                    <optgroup label="I">
                                <option value="BV">Ile Bouvet</option>
                                        <option value="CX">Ile Christmas</option>
                                        <option value="NF">Île Norfolk</option>
                                        <option value="PN">Île Pitcairn</option>
                                        <option value="AX">Iles Aland</option>
                                        <option value="KY">Iles Cayman</option>
                                        <option value="CC">Iles Cocos (Keeling)</option>
                                        <option value="CK">Iles Cook</option>
                                        <option value="FO">Îles Féroé</option>
                                        <option value="HM">Îles Heard-et-MacDonald</option>
                                        <option value="FK">Îles Malouines</option>
                                        <option value="MP">Îles Mariannes du Nord</option>
                                        <option value="MH">Îles Marshall</option>
                                        <option value="UM">Îles mineures éloignées des États-Unis</option>
                                        <option value="SB">Îles Salomon</option>
                                        <option value="TC">Îles Turques-et-Caïques</option>
                                        <option value="VG">Îles Vierges britanniques</option>
                                        <option value="VI">Îles Vierges des États-Unis</option>
                                        <option value="IN">Inde</option>
                                        <option value="ID">Indonésie</option>
                                        <option value="IQ">Iraq</option>
                                        <option value="IE">Irlande</option>
                                        <option value="IS">Islande</option>
                                        <option value="IL">Israël</option>
                                        <option value="IT">Italie</option>
                                    </optgroup>
                                    <optgroup label="J">
                                <option value="LY">Jamahiriya arabe libyenne</option>
                                        <option value="JM">Jamaïque</option>
                                        <option value="JP">Japon</option>
                                        <option value="JO">Jordanie</option>
                                    </optgroup>
                                    <optgroup label="K">
                                <option value="KZ">Kazakhstan</option>
                                        <option value="KE">Kenya</option>
                                        <option value="KG">Kirghizistan</option>
                                        <option value="KI">Kiribati</option>
                                        <option value="KW">Koweït</option>
                                    </optgroup>
                                    <optgroup label="L">
                                <option value="LS">Lesotho</option>
                                        <option value="LV">Lettonie</option>
                                        <option value="LB">Liban</option>
                                        <option value="LR">Libéria</option>
                                        <option value="LI">Liechtenstein</option>
                                        <option value="LT">Lituanie</option>
                                        <option value="LU">Luxembourg</option>
                                    </optgroup>
                                    <optgroup label="M">
                                <option value="MO">Macao</option>
                                        <option value="MG">Madagascar</option>
                                        <option value="MY">Malaisie</option>
                                        <option value="MW">Malawi</option>
                                        <option value="MV">Maldives</option>
                                        <option value="ML">Mali</option>
                                        <option value="MT">Malte</option>
                                        <option value="MA">Maroc</option>
                                        <option value="MQ">Martinique</option>
                                        <option value="MU">Maurice</option>
                                        <option value="MR">Mauritanie</option>
                                        <option value="YT">Mayotte</option>
                                        <option value="MX">Mexique</option>
                                        <option value="MC">Monaco</option>
                                        <option value="MN">Mongolie</option>
                                        <option value="MS">Montserrat</option>
                                        <option value="MZ">Mozambique</option>
                                        <option value="MM">Myanmar</option>
                                    </optgroup>
                                    <optgroup label="N">
                                <option value="NA">Namibie</option>
                                        <option value="NR">Nauru</option>
                                        <option value="NP">Népal</option>
                                        <option value="NI">Nicaragua</option>
                                        <option value="NE">Niger</option>
                                        <option value="NG">Nigéria</option>
                                        <option value="NU">Niué</option>
                                        <option value="NO">Norvège</option>
                                        <option value="NC">Nouvelle-Calédonie</option>
                                        <option value="NZ">Nouvelle-Zélande</option>
                                    </optgroup>
                                    <optgroup label="O">
                                <option value="OM">Oman</option>
                                        <option value="UG">Ouganda</option>
                                        <option value="UZ">Ouzbékistan</option>
                                    </optgroup>
                                    <optgroup label="P">
                                <option value="PK">Pakistan</option>
                                        <option value="PW">Palaos</option>
                                        <option value="PA">Panama</option>
                                        <option value="PG">Papouasie-Nouvelle-Guinée</option>
                                        <option value="PY">Paraguay</option>
                                        <option value="NL">Pays-Bas</option>
                                        <option value="PE">Pérou</option>
                                        <option value="PH">Philippines</option>
                                        <option value="PL">Pologne</option>
                                        <option value="PF">Polynésie française</option>
                                        <option value="PR">Porto Rico</option>
                                        <option value="PT">Portugal</option>
                                        <option value="TW">Province chinoise de Taiwan</option>
                                    </optgroup>
                                    <optgroup label="Q">
                                <option value="QA">Qatar</option>
                                    </optgroup>
                                    <optgroup label="R">
                                <option value="SY">République arabe syrienne</option>
                                        <option value="CF">République centrafricaine</option>
                                        <option value="KR">République de Corée</option>
                                        <option value="MD">République de Moldavie</option>
                                        <option value="CD">République démocratique du Congo</option>
                                        <option value="DO">République dominicaine</option>
                                        <option value="IR">République islamique d'Iran</option>
                                        <option value="KP">République populaire démocratique de Corée</option>
                                        <option value="LA">République Populaire du Laos</option>
                                        <option value="CZ">République tchèque</option>
                                        <option value="TZ">République-Unie de Tanzanie</option>
                                        <option value="RE">Réunion</option>
                                        <option value="RO">Roumanie</option>
                                        <option value="GB">Royaume-Uni</option>
                                        <option value="RU">Russie</option>
                                        <option value="RW">Rwanda</option>
                                    </optgroup>
                                    <optgroup label="S">
                                <option value="EH">Sahara occidental</option>
                                        <option value="KN">Saint-Christophe-et-Niévès</option>
                                        <option value="SM">Saint-Marin</option>
                                        <option value="PM">Saint-Pierre-et-Miquelon</option>
                                        <option value="VA">Saint-Siège (Cité du Vatican)</option>
                                        <option value="VC">Saint-Vincent-et-les Grenadines</option>
                                        <option value="SH">Sainte-Hélène</option>
                                        <option value="LC">Sainte-Lucie</option>
                                        <option value="WS">Samoa</option>
                                        <option value="AS">Samoa américaines</option>
                                        <option value="ST">Sao Tomé-et-Principe</option>
                                        <option value="SN">Sénégal</option>
                                        <option value="CS">Serbie-et-Monténégro</option>
                                        <option value="SC">Seychelles</option>
                                        <option value="SL">Sierra Leone</option>
                                        <option value="SG">Singapour</option>
                                        <option value="SK">Slovaquie</option>
                                        <option value="SI">Slovénie</option>
                                        <option value="SO">Somalie</option>
                                        <option value="SD">Soudan</option>
                                        <option value="LK">Sri Lanka</option>
                                        <option value="SE">Suède</option>
                                        <option value="CH">Suisse</option>
                                        <option value="SR">Suriname</option>
                                        <option value="SJ">Svalbard et Jan Mayen</option>
                                        <option value="SZ">Swaziland</option>
                                    </optgroup>
                                    <optgroup label="T">
                                <option value="TJ">Tadjikistan</option>
                                        <option value="TD">Tchad</option>
                                        <option value="IO">Territoire britannique de l'océan Indien</option>
                                        <option value="TF">Territoire Francais du Sud</option>
                                        <option value="PS">Territoires palestiniens occupés</option>
                                        <option value="TH">Thaïlande</option>
                                        <option value="TL">Timor oriental</option>
                                        <option value="TG">Togo</option>
                                        <option value="TK">Tokelau</option>
                                        <option value="TO">Tonga</option>
                                        <option value="TT">Trinité-et-Tobago</option>
                                        <option value="TN">Tunisie</option>
                                        <option value="TM">Turkménistan</option>
                                        <option value="TR">Turquie</option>
                                        <option value="TV">Tuvalu</option>
                                    </optgroup>
                                    <optgroup label="U">
                                <option value="UA">Ukraine</option>
                                        <option value="UY">Uruguay</option>
                                    </optgroup>
                                    <optgroup label="V">
                                <option value="VU">Vanuatu</option>
                                        <option value="VE">Vénézuéla</option>
                                        <option value="VN">Vietnam</option>
                                    </optgroup>
                                    <optgroup label="W">
                                <option value="WF">Wallis-et-Futuna</option>
                                    </optgroup>
                                    <optgroup label="Y">
                                <option value="YE">Yémen</option>
                                    </optgroup>
                                    <optgroup label="Z">
                                <option value="ZM">Zambie</option>
                                        <option value="ZW">Zimbabwe</option>
                                    </optgroup>
                        </select>

                    <div class="flex justify-center space-x-6 mt-4">
                        <button v-if="!form.processing" @click="form = { nom: null, prenom: null, email: null, processing: false, message: null, lien: null }; inscriptionPopUp = false" class=" bg-ifdd-red px-2 rounded-md text-white active:bg-red-300">Quitter</button>
                        <button type="submit" :class="form.processing ? ' bg-gray-400 cursor-wait' : 'bg-ifdd-green3 hover:bg-green-600 active:bg-green-300'" class=" px-5 py-1 rounded-md text-white">{{!form.processing ? "S'inscrire" : "Inscription en cours..."}}</button>
                    </div>
                </form>
                <button v-else @click="form = { nom: null, prenom: null, email: null, processing: false, message: null, lien: null }; inscriptionPopUp = false" class=" bg-ifdd-red px-2 mt-8 w-full mx-2 rounded-md text-white active:bg-red-300">Fermer</button>
            </div>
        </div>
    </div>

    <!-- Pop Up Questions reponse -->
    <div style="z-index: 99;" v-if="false" class="fixed h-screen w-screen bg-opacity-40 backdrop-blur-sm bg-black z-50 bg-ifdd-green3 overflow-y-scroll">
        <div class="z-50 bg-white bg-opacity-100 pb-44 relative shadow-xl rounded-r-xl w-100 pt-3 pr-5 pl-3 h-screen overflow-y-scroll">

            <div>
                <div class="flex">
                    <div class="rounded-full min-w-10 min-h-10 max-h-10 max-w-10 bg-black"></div>
                    <div class="ml-2 p-2 bg-gray-100 shadow-md rounded-md rounded-bl-md">Lorem ipsum, dolor sit amet consectetur adipisicing elit. Voluptatibus quasi ea sint molestiae, quo excepturi, magnam perspiciatis quis labore, consec</div>
                </div>

                <!-- <div class="w-1 h-8 bg-gray-200 ml-16"></div> -->
                <div class="flex ml-11 mt-4">
                    <div class="rounded-full min-w-10 min-h-10 max-h-10 max-w-10 bg-black"></div>
                    <div class="ml-2 p-2 bg-gray-100 shadow-md rounded-md rounded-bl-md">Lorem ipsum, dolor sit amet consectetur adipisicing elit. Voluptatibus quasi ea sint molestiae, quo excepturi, magnam perspiciatis quis labore, consec</div>
                </div>

                <!-- <div class="w-1 h-8 bg-gray-200 ml-16"></div> -->
                <div class="flex ml-11 mt-4">
                    <div class="rounded-full min-w-10 min-h-10 max-h-10 max-w-10 bg-black"></div>
                    <div class="ml-2 p-2 bg-gray-100 shadow-md rounded-md rounded-bl-md">Lorem ipsum, dolor sit amet consectetur adipisicing elit. Voluptatibus quasi ea sint molestiae, quo excepturi, magnam perspiciatis quis labore, consec</div>
                </div>

                <div class="ml-24 mt-4">
                    <!-- <input placeholder="Ecrire une réponse" class=" rounded-xl w-full" type="text"> -->
                    <textarea placeholder="Ecrire une réponse" class=" rounded-xl w-full active:ring active:ring-black" type="text"></textarea>
                    <div><button class="bg-ifdd-yellow w-full hover:bg-yellow-300 mt-1 hover:scale-105 active:scale-100 transition-all rounded-md text-ifdd-green3 font-bold px-2">Repondre</button></div>
                </div>
            </div>


            <div class="mt-7">
                <div class="flex">
                    <div class="rounded-full min-w-10 min-h-10 max-h-10 max-w-10 bg-black"></div>
                    <div class="ml-2 p-2 bg-gray-100 shadow-md rounded-md rounded-bl-md">Lorem ipsum, dolor sit amet consectetur adipisicing elit. Voluptatibus quasi ea sint molestiae, quo excepturi, magnam perspiciatis quis labore, consec</div>
                </div>

                <!-- <div class="w-1 h-8 bg-gray-200 ml-16"></div> -->
                <div class="flex ml-11 mt-4">
                    <div class="rounded-full min-w-10 min-h-10 max-h-10 max-w-10 bg-black"></div>
                    <div class="ml-2 p-2 bg-gray-100 shadow-md rounded-md rounded-bl-md">Lorem ipsum, dolor sit amet consectetur adipisicing elit. Voluptatibus quasi ea sint molestiae, quo excepturi, magnam perspiciatis quis labore, consec</div>
                </div>

                <!-- <div class="w-1 h-8 bg-gray-200 ml-16"></div> -->
                <div class="flex ml-11 mt-4">
                    <div class="rounded-full min-w-10 min-h-10 max-h-10 max-w-10 bg-black"></div>
                    <div class="ml-2 p-2 bg-gray-100 shadow-md rounded-md rounded-bl-md">Lorem ipsum, dolor sit amet consectetur adipisicing elit. Voluptatibus quasi ea sint molestiae, quo excepturi, magnam perspiciatis quis labore, consec</div>
                </div>

                <div class="ml-24 mt-4">
                    <!-- <input placeholder="Ecrire une réponse" class=" rounded-xl w-full" type="text"> -->
                    <textarea placeholder="Ecrire une réponse" class=" rounded-xl w-full active:ring active:ring-black" type="text"></textarea>
                    <div><button class="bg-ifdd-yellow w-full hover:bg-yellow-300 mt-1 hover:scale-105 active:scale-100 transition-all rounded-md text-ifdd-green3 font-bold px-2">Repondre</button></div>
                </div>
            </div>


            <div class="bg-purple-500 bg-opacity-20 w-100 fixed left-0 bottom-0 p-3 backdrop-blur-md">
                <div class="my-2 relative">
                    <div class="p-2 bg-white rounded-md">
                        <div v-for="(intervenant, index) in programmation.intervenant_tmps" :key="index" class="flex relative border-b pb-1 mb-2 px-2 cursor-pointer">
                            <div class="mr-2">
                                <img :class="getColors(index)" class="w-8 h-8 border-opacity-40 z-20 bg-white mx-auto border-1 rounded-full object-cover" :src="intervenant.photo_url ? '/' + intervenant.photo_url : '/' + programmation.coordinateur.intervenant.user.organisation.logo_url">
                            </div>
                            <div class="text-ifdd-green3 mx-auto max-w-40 text-sm truncate text-center mt-2 whitespace-nowrap"><span>{{intervenant.prenom}}</span> <span class=" font-bold">{{intervenant.nom}}</span></div>
                        </div>
                    </div>
                    <div class="flex">
                        <div class="font-bold">Question pour: </div>
                        <div></div>
                    </div>
                </div>
                <!-- <input placeholder="Ecrire une réponse" class=" rounded-xl w-full" type="text"> -->
                <input placeholder="Poser une question" class=" rounded-xl w-full active:ring active:ring-black" type="text">
            </div>
        </div>
    </div>


    <app-layout>
        <div class="relative bg-gray-100 bg-opacity-80 pb-10">
            <!-- banière -->
            <div class="relative w-screen bg-banniere h-72 mt-16">
                <!-- <img class="w-screen  md:object-cover object-contain relative z-0" :src="'/images/banniere.jpeg'" alt="">
                <div  class="absolute hidden md:block bottom-5 left-5 font-bold p-4 z-50 bg-black/50 text-white border-l-4 border-ifdd-yellow text-4xl">
                    <span style="background: -webkit-linear-gradient(left, #FDCD01 , #00ADEF); -webkit-background-clip: text; -webkit-text-fill-color: transparent;" class="">Programmation du Pavillon de la Francophonie</span>
                </div> -->
                <div class=" absolute top-10 left-3 bg-white rounded-md overflow-hidden" v-if="programmation.coordinateur.intervenant.user.organisation.logo_url"><img class="h-12 ml-2" :src="'/' + programmation.coordinateur.intervenant.user.organisation.logo_url" alt=""></div>
                <div class="text-white mx-4 sm:mx-32 pt-24 text-center text-2xl sm:text-3xl line-clamp-3 uppercase">
                    {{programmation.titre}}
                </div>

                <div class="flex justify-center absolute w-screen left-0 bottom-4 overflow-x-scroll no-scrollbar">
                    <div v-for="(thematique, index) in programmation.thematique" :key="index" class="text-white ml-2 border border-white rounded-md px-2 text-sm bg-white bg-opacity-20 whitespace-nowrap">
                        #{{thematique}}
                    </div>

                    <div v-for="(categorie, index) in programmation.categorie" :key="index" class="text-white ml-2 border border-white rounded-md px-2 text-sm bg-white bg-opacity-20 whitespace-nowrap">
                        #{{categorie}}
                    </div>
                </div>
            </div>

            <!-- <div class="text-ifdd-green3 ml-4 flex text-sm space-x-1">
                <div @click="go('/')" class=" cursor-pointer whitespace-nowrap hover:underline">Accueil ></div>
                <div @click="go(route('programmation.index', 2023))" class=" cursor-pointer whitespace-nowrap hover:underline">Programmation 2023 ></div>
                <div class="underline text-ifdd-gray truncate w-80 text-justify">{{programmation.titre}}</div>
            </div> -->

            <div class="mx-1 sm:mx-5 relative">
                <div class="mb-2 sm:mb-5 bg-opacity-60 p-2 sm:p-5">
                    <div class="w-full">
                        <div v-if="programmation.zoom" class="flex my-2 mx-3 justify-evenly p-2">
                            <!-- <div v-if="programmation.termine != true"><a :href="programmation.zoom.lien_rejoindre"><button class="px-3 py-2 font-bold rounded-md shadow-md hover:shadow-none hover:bg-yellow-200 transition-colors text-sm bg-ifdd-yellow text-ifdd-green3 my-2">S'inscrire/Rejoindre</button></a></div> -->
                            <div v-if="programmation.statut_text != 'termine'">
                                <button @click="inscriptionPopUp = true" class="px-3 py-2 font-bold rounded-md shadow-md hover:shadow-none from-blue-700 to-red-600 bg-gradient-to-r transition-all text-sm text-white hover:via-red-600 hover:scale-105 my-2">S'inscrire/Rejoindre</button>
                            </div>
                            <div @mouseenter="partageHover = true" @mouseleave="partageHover = false" class="relative z-50">
                                <button class="flex px-3  py-2">
                                    <div class="px-1 rounded-sm text-sm font-bold text-ifdd-gray">partager</div><img class="h-5" src="/images/icons/share.svg" alt="">
                                </button>
                                <div v-if="partageHover" class="w-32 py-2 pt-2 bg-white absolute shadow-xl rounded-md">
                                    <div class="hidden sm:block mx-auto ml-10 relative">
                                        <input
                                            class="h-0 w-0 absolute"
                                            v-on:focus="$event.target.select()"
                                            ref="clone"
                                            readonly
                                            :value="'https://epavillon.francophonie.org/programmation/'+programmation.id"/>
                                        <img @click="copy" class="w-10 opacity-60 cursor-pointer h-10 object-cover" src="/images/icons/copy.png" alt="">
                                    </div>
                                    <div class="hidden sm:block text-center text-sm font-semibold" :class="copierLien ? ' text-ifdd-red italic' : 'text-gray-600'">{{copierLien ? 'Copié' : 'Copier le lien'}}</div>
                                    <div class="hidden sm:block text-center font-bold">Ou</div>
                                    <div class="ml-2 text-ifdd-gray">Partager sur...</div>
                                    <ShareNetwork
                                        network="facebook"
                                        :url="'https://epavillon.francophonie.org/programmation/'+programmation.id"
                                        :title="programmation.evenement+': '+ programmation.titre"

                                        >
                                        <img class="h-16 mx-auto mt-1 transition-all hover:scale-110" src="/images/logos/facebook.png" alt="">
                                    </ShareNetwork>
                                    <ShareNetwork
                                        network="whatsapp"
                                        :url="'https://epavillon.francophonie.org/programmation/'+programmation.id"
                                        :title="programmation.evenement+': '+ programmation.titre"

                                        >
                                        <img class="h-16 mx-auto my-1 transition-all hover:scale-110" src="/images/logos/whatsapp.png" alt="">
                                    </ShareNetwork>
                                    <ShareNetwork
                                        network="LinkedIn"
                                        :url="'https://epavillon.francophonie.org/programmation/'+programmation.id"
                                        :title="programmation.evenement+': '+ programmation.titre"

                                        >
                                        <img class="h-16 mx-auto my-1 transition-all hover:scale-110" src="/images/logos/linkedin.png" alt="">
                                    </ShareNetwork>
                                    <ShareNetwork
                                        network="Twitter"
                                        :url="'https://epavillon.francophonie.org/programmation/'+programmation.id"
                                        :title="programmation.evenement+': '+ programmation.titre"

                                        >
                                        <img class="h-16 mx-auto my-1 transition-all hover:scale-110" src="/images/logos/twitter.png" alt="">
                                    </ShareNetwork>
                                </div>
                            </div>
                        </div>
                        <!-- <div class=" inline-flex my-2 font-bold text-ifdd-green3 w-full sm:w-auto sm:mx-0 sm:ml-20 border py-1 border-b-4 border-r-4 shadow-md border-ifdd-green3 px-2">
                            <div><img class="h-4" src="/images/icons/calendar-gray.svg" alt=""></div>
                            <div class="ml-1">{{convertirDate(programmation.date_debut)}}</div>

                            <div class="ml-5"><img class="h-4" src="/images/icons/time-svgrepo-com.svg" alt=""></div>
                            <div class="ml-1">{{convertirHeure(programmation.heure_debut) + (((programmation.evenement == 'CdP27 sur le climat') ||  (programmation.evenement == 'Appel des jeunes 2022')) ? ' GMT' : ' GMT') }}</div>

                            <div class="ml-5"><img class="h-4" src="/images/icons/location_gray.svg" alt=""></div>
                            <div class="ml-1">{{pays.nom}}</div>
                        </div> -->


                        <!-- <div class="italic my-2 text-sm text-ifdd-green3 font-bold"><span class="text-ifdd-gray">{{inscrits}}</span> inscrits</div> -->
                        <div class="flex flex-wrap-reverse justify-between relative z-10">
                            <!-- <div class="w-5/12 h-82 absolute">
                                <img v-if="programmation.evenement == 'COP15 désertification'" class=" rounded-md" :src="'/images/baniere_cop15_abidjan.jpeg'" alt="404">
                                <img v-if="programmation.evenement == null" class=" rounded-md" :src="'/images/baniere_cop26.jpeg'" alt="404">
                                <img v-if="(programmation.evenement != null) && (programmation.evenement != 'COP15 désertification')" class=" rounded-md" :src="'/images/bonne_pratique.jpg'" alt="404">
                            </div> -->
                            <div class="md:w-6/12 lg:w-7/12 xl:w-8/12 mx-auto p-5 rounded-md border-t-4 border-ifdd-green3 shadow-md bg-white">
                                <!-- <div v-if="programmation.zoom && (programmation.id == 470)" class="text-white w-32 mb-2 font-bold bg-gradient-to-br from-ifdd-red to-ifdd-purple px-3 rounded-r-full">
                                    {{nb_inscrits}} inscrit{{nb_inscrits > 1 ? 's':''}}
                                </div>  -->
                                <div class="inline-flex my-2 font-bold text-ifdd-green3 w-full sm:w-auto sm:mx-0 border py-1 border-b-4 border-r-4 shadow-md border-ifdd-green3 px-2">
                                    <div><img class="h-4" src="/images/icons/calendar-gray.svg" alt=""></div>
                                    <div class="ml-1">{{convertirDate(programmation.date_debut_valide_timestamp ?  programmation.date_debut_valide_timestamp : programmation.date_debut)}}</div>

                                    <div class="ml-5"><img class="h-4" src="/images/icons/time-svgrepo-com.svg" alt=""></div>
                                    <div class="ml-1">{{convertirHeure(programmation.date_debut_valide_timestamp ?  programmation.date_debut_valide_timestamp : programmation.heure_debut) + (((programmation.evenement == 'CdP29 sur le climat') ||  (programmation.evenement == 'Appel des jeunes 2022')) ? ' (GMT + 4)' : ' GMT') }}</div>

                                    <div class="ml-5"><img class="h-4" src="/images/icons/location_gray.svg" alt=""></div>
                                    <div class="ml-1">{{programmation.pays?.nom}}</div>
                                </div>
                                <div @click="test()" class="text-2xl sm:text-3xl text-ifdd-green3 text-justify font-bold my-5">
                                    {{programmation.titre}}
                                </div>
                                <div v-if="curseurPhoto == null">
                                    <iframe v-if="programmation.direct_url" class="w-full h-82 z-50 rounded-md mt-2 shadow-md"  :src="'https://www.youtube.com/embed/' + programmation.direct_url" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                                    <img v-else class="w-full  max-h-110 z-50 rounded-md mt-2 shadow-md object-cover" :src="programmation.image_url != null ? '/' + programmation.image_url : '/images/bonne_pratique.jpg'" alt="404">
                                </div>
                                <div v-else>
                                    <img class="w-full  max-h-110 z-50 rounded-md mt-2 shadow-md object-cover" :src="curseurPhoto.url != null ? '/' + curseurPhoto.url : '/images/bonne_pratique.jpg'" alt="404">
                                </div>

                                <div v-if="programmation.photos?.length > 0" class="mt-5">
                                    <div class="text-2xl border-b border-gray-400 font-bold text-ifdd-blue2 w-11/12">Galerie photo</div>
                                    <galery-photo :evenement="programmation" @photoFromChild="photoChild" />
                                </div>

                                    <!-- <button style="background: -webkit-linear-gradient(left, blue , red); -webkit-background-clip: text; -webkit-text-fill-color: transparent;" class=" rounded-md px-2 py-1 border-2 font-bold border-ifdd-yellow mt-2 hover:scale-105 active:scale-100 transition-all">
                                        Questions pour un panéliste
                                    </button> -->

                                <div class="pt-2 sm:pt-0 w-full">
                                    <!-- <div class="mt-5">
                                        <div class=" border-b border-gray-400 font-bold text-ifdd-gray w-11/12">Galerie photo</div>
                                        <galery-photo @afficher_galerie="galeriEvente" :photos="programmation.photos" />
                                    </div> -->
                                    <div class="mt-5">
                                        <div class=" text-2xl border-b border-gray-400 font-bold text-ifdd-blue2 w-11/12">Objectif</div>
                                        <div class=" text-gray-600 text-justify">{{programmation.objectif}}</div>
                                    </div>
                                    <!-- Description de l'évenement -->
                                    <!-- <div class="mt-5">
                                        <div class=" border-b border-gray-400 font-bold text-ifdd-gray w-11/12">Description</div>
                                        <afficheur :valeurAffiche="programmation.presentation" />
                                    </div> -->
                                    <!-- Panéliste -->
                                    <div class="mt-4 text-2xl border-b border-gray-400 font-bold text-ifdd-blue2 w-11/12">Panélistes</div>
                                    <div class="flex flex-wrap mb-2 mt-1 max-w-105 py-4">
                                        <div v-for="(intervenant, index) in programmation.intervenant_tmps" :key="index" class="justify-center content-center mx-1 min-w-40 rounded-md p-4">
                                            <div class="relative z-0">
                                                <!-- <div :class="getColors(index)" class="w-24 h-24 bg-opacity-20 rounded-full absolute z-10 ml-4 scale-110 backdrop-blur-md"></div> -->
                                                <img :class="getColors(index)" class="w-24 h-24 border-opacity-40 relative z-20 bg-white mx-auto border-4 rounded-full object-cover" :src="intervenant.photo_url ? '/' + intervenant.photo_url : '/' + programmation.coordinateur.intervenant.user.organisation.logo_url">
                                            </div>
                                            <div class="text-ifdd-green3 mx-auto max-w-40 text-sm line-clamp-2 text-center mt-2"><span v-if="intervenant.civilite">{{intervenant.civilite + ' '}}</span><span>{{intervenant.prenom}}</span> <span class=" font-bold">{{intervenant.nom}}</span></div>
                                            <div class="text-ifdd-gray mx-auto max-w-40 text-sm line-clamp-3 italic text-center">{{intervenant.fonction}}</div>
                                        </div>
                                    </div>

                                    <!-- Ressource (supports de présentation & docs) -->

                                    <div v-if="programmation.documents.length > 0" class="mt-5">
                                        <div class=" text-2xl border-b border-gray-400 font-bold text-ifdd-blue2 w-11/12">Ressource (supports de présentation & docs)</div>
                                        <div class="flex flex-wrap cursor-pointer">
                                            <a v-for="(doc, index) in programmation.documents" :key="index" :href="doc.url" target="_blank" class="flex items-center mt-2">
                                                <img class="h-4 w-4 mr-1" src="/images/icons/download.svg" alt="">
                                                <div class=" max-w-100 underline hover:no-underline text-ifdd-green3 truncate hover:text-opacity-60">{{doc.titre}}</div>
                                                <div class="mx-2">|</div>
                                            </a>
                                        </div>
                                    </div>

                                    <!-- Résumé de l'évenement -->
                                    <div class="mt-5">
                                        <div class=" text-2xl border-b border-gray-400 font-bold text-ifdd-blue2 w-11/12">Description</div>
                                        <div class="relative -left-3"><afficheur :valeurAffiche="programmation.presentation" /></div>
                                    </div>
                                </div>
                            </div>


                            <div>
                                <div class="w-full flex mt-2 md:w-auto mx-auto sm:px-3 sm:max-w-82 sm:mr-5 border-t-4 border-ifdd-green3 backdrop-blur-md rounded-md shadow-xl">
                                    <div class="h-auto pb-5">
                                        <div class="text-ifdd-green3 mt-3 border-b border-gray-400 mx-2">Présenté par</div>
                                        <div class="text-ifdd-gray font-bold mx-2 line-clamp-2">{{programmation.evenement == 'Le Salon des sciences, technologies et innovations environnementales pour le développement' ? programmation.denomination_organisme : programmation.coordinateur?.intervenant?.user?.organisation?.denomination}}</div>

                                        <div class="text-ifdd-green3 mt-3 border-b border-gray-400 mx-2">Logo</div>
                                        <div v-if="programmation.logo_organisme_url"><img class="h-12 ml-2" :src="'/' + programmation.logo_organisme_url" alt=""></div>
                                        <div v-else-if="programmation.coordinateur?.intervenant?.user?.organisation?.logo_url"><img class="h-12 ml-2" :src="'/' + programmation.coordinateur?.intervenant?.user?.organisation?.logo_url" alt=""></div>

                                        <!-- <div class="text-ifdd-green3 mt-3 border-b border-gray-400 mx-2">Pièce jointe</div>
                                        <div class="text-ifdd-gray font-bold mx-2 line-clamp-2">{{'https://epavillonclimatique.francophonie.org/' + organisme.formulaire_url}}</div> -->

                                        <div class="text-ifdd-green3 mt-3 border-b border-gray-400 mx-2">Format de l'évènement</div>
                                        <div class="text-ifdd-gray font-bold mx-2 line-clamp-2">{{programmation.format}}</div>

                                        <div v-if="programmation.type" class="text-ifdd-green3 mt-3 border-b border-gray-400 mx-2">Type d'évènement</div>
                                        <div class="text-ifdd-gray font-bold mx-2 line-clamp-2">{{programmation.type}}</div>

                                        <div class="text-ifdd-green3 mt-3 border-b border-gray-400 mx-2">Thematiques</div>
                                        <div class=" flex flex-wrap mt-0">
                                            <div v-for="(thematique, index) in programmation.thematique" :key="index" class=" text-gray-600 mt-2 mx-2 border border-ifdd-green3 rounded-md px-2 text-sm border-opacity-60">
                                                #{{thematique}}
                                            </div>
                                        </div>

                                        <div class="text-ifdd-green3 mt-3 border-b border-gray-400 mx-2">Categories</div>
                                        <div class="flex flex-wrap mt-0 mb-4">
                                            <div v-for="(categorie, index) in programmation.categorie" :key="index" class=" text-gray-600 mx-2 mt-2 border border-ifdd-green3 rounded-md px-2 text-sm border-opacity-60">
                                                #{{categorie}}
                                            </div>
                                        </div>

                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </app-layout>
</template>

<script>
    import AppLayout from '@/Layouts/AppLayout';
    import moment from 'moment';
    import Button from '../../Jetstream/Button.vue';
    import Afficheur from '../Components/Afficheur.vue';
    import Input from '../../Jetstream/Input.vue';
    import GaleryPhoto from '../Components/galeryPhoto.vue';

    export default {
        components: {
            AppLayout,
                Button,
                Afficheur,
                Input,
                GaleryPhoto
        },
        props: ['programmation', 'nb_inscrits'],
        emits: ['afficher_galerie'],
        setup(){

            function galeriEvente(photo){
                emit('afficher_galerie', photo);
            }

            return { galeriEvente }
        },
        data(){
            return {
                photoShow: false,
                photoIndex: 0,
                intervenantsUsers: [],
                partageHover: false,
                copierLien: false,
                curseurPhoto: null,
                inscriptionPopUp: false,
                copierLien: false,
                listeIntervenantHover: false,
                form: {
                    nom: null,
                    prenom: null,
                    pays: "",
                    sexe: "",
                    email: null,
                    processing: false,
                    message: null,
                    lien: null
                }
            }
        },
        methods:{
            test(){
                console.log('------->this.programmation.photos?.length');
                console.log(this.programmation.photos?.length);
                console.log('------->this.programmation.photos?.length');
            },
            photoChild(data){
                this.photoIndex = data.photoSelectedIndex;
                this.photoShow = true;

            },
            copy() {
                const input = this.$refs.clone;
                input.focus();

                try {
                    navigator.clipboard.writeText(input.value);
                    this.copierLien = true;

                    setTimeout(() => {
                    this.copierLien = false;
                    }, 5000);
                } catch (err) {
                    console.error('Impossible de copier le texte', err);
                }
            },
            go(lienRoute) {
                this.$inertia.get(lienRoute);
            },
            userSubscription(){

                // this.form.post(route('zoom.user.suscribe'), {
                //     onSuccess: (res) => {
                //         // this.form.data = res.props.data
                //         console.log('this.form.data');
                //         console.log(res);
                //         console.log('this.form.data');
                //     },
                // });
                this.form.processing = true;
                this.form.message = null;
                if(this.form.pays == ""){
                    this.form.pays = null;
                }
                if(this.form.sexe == ""){
                    this.form.sexe = null;
                }

                axios.post(route('zoom.user.suscribe'),{
                    nom: this.form.nom,
                    prenom: this.form.prenom,
                    sexe: this.form.sexe,
                    pays: this.form.pays,
                    email: this.form.email,
                    evenement_id: this.programmation.id,
                    meetingId: this.programmation.zoom?.id_reunion

                }).then(res =>{
                    this.form.processing = false;
                    this.form.message = null;
                    if(res.status == 200){
                        this.form.message = res.data.message;
                        this.form.lien = res.data.lien;
                    }
                }).catch(e =>{
                    this.form.processing = false;
                    this.form.message = null;
                    console.error(e);
                })
            },
            getColors(index){
                if(index == 0){
                    return 'border-ifdd-yellow'
                }else if(index == 1){
                    return 'border-ifdd-green3'
                }else if(index == 2){
                    return 'border-ifdd-purple'
                }else if(index == 3){
                    return 'border-ifdd-red'
                }else if(index == 4){
                    return 'border-ifdd-blue'
                }else{
                    return 'border-ifdd-yellow'
                }
            },
            convertirDate(date){
                const calendrier = ['janv.', 'fév.', 'mars', 'avril', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.']
                const ladate = moment(String(date))
                return ladate.date() +' '+ calendrier[ladate.month()] +' '+ ladate.year()
            },

            convertirHeure(heure) {
                // console.log('----->heure');
                // console.log(heure);
                let duration = null;
                if(this.programmation.date_debut_valide_timestamp != null){
                    duration = moment.duration(heure.split(' ')[1]);
                }else{
                    duration = moment.duration(heure);
                }


                // return duration.hours() + 'h ' + duration.minutes() + 's';
                return duration.hours() + 'h' + (duration.minutes() < 10 ? '0'+duration.minutes() : duration.minutes());
            },
            /* testTime(){
                const date = new Date();
                const offset = date.getTimezoneOffset();
                console.log(offset + 1)
            } */
            // getUserByMail(intervenantsUsers){

            //     this.intervenants.forEach(function(intervenant) {
            //         axios.post(route('user.ByMail'), {
            //         email: intervenant.email
            //         }).then(res => res.data).catch(error => {
            //             console.log(error);
            //         });
            //     });
            // },
        },

        mounted(){
        }
    }
</script>

<style>
.no-scrollbar::-webkit-scrollbar {
      display: none;
    }


    /* Hide scrollbar for IE, Edge, and Firefox */
    .no-scrollbar {
      -ms-overflow-style: none; /* IE and Edge */
      scrollbar-width: none; /* Firefox */
    }
</style>
