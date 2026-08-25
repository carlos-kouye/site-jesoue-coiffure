/* =============================================================
   ELEGANCE BARBER — admin.js
   Index du fichier :
   1. Connexion / déconnexion
   2. Vérification de la session au chargement
   3. Onglets
   4. Chargement et affichage des réservations
   5. Changement de statut d'une réservation
   6. Chargement, ajout et suppression des prestations
   ============================================================= */

document.addEventListener('DOMContentLoaded', function () {

  var connexionEcran = document.getElementById('connexionEcran');
  var adminApp = document.getElementById('adminApp');

  // 1. Connexion / déconnexion
  var btnConnexion = document.getElementById('btnConnexion');
  var connexionErreur = document.getElementById('connexionErreur');

  btnConnexion.addEventListener('click', function () {
    var email = document.getElementById('loginEmail').value;
    var mdp = document.getElementById('loginMdp').value;

    if (!email || !mdp) {
      connexionErreur.textContent = 'Merci de remplir les deux champs.';
      return;
    }

    btnConnexion.disabled = true;
    btnConnexion.textContent = 'Connexion...';

    supabaseClient.auth.signInWithPassword({ email: email, password: mdp }).then(function (reponse) {
      btnConnexion.disabled = false;
      btnConnexion.textContent = 'Se connecter';

      if (reponse.error) {
        connexionErreur.textContent = 'Email ou mot de passe incorrect.';
        return;
      }

      afficherApp();
    });
  });

  var btnDeconnexion = document.getElementById('btnDeconnexion');
  btnDeconnexion.addEventListener('click', function () {
    supabaseClient.auth.signOut().then(function () {
      window.location.reload();
    });
  });

  // 2. Vérification de la session au chargement (déjà connecté ?)
  supabaseClient.auth.getSession().then(function (reponse) {
    if (reponse.data.session) {
      afficherApp();
    }
  });

  function afficherApp() {
    connexionEcran.style.display = 'none';
    adminApp.classList.remove('admin-app--cachee');
    chargerReservations();
    chargerPrestations();
  }

  // 3. Onglets
  var ongletsBtn = document.querySelectorAll('.onglet-btn');
  var ongletsContenu = document.querySelectorAll('.onglet-contenu');

  for (var i = 0; i < ongletsBtn.length; i++) {
    ongletsBtn[i].addEventListener('click', function () {
      for (var j = 0; j < ongletsBtn.length; j++) {
        ongletsBtn[j].classList.remove('onglet-btn--actif');
      }
      this.classList.add('onglet-btn--actif');

      var cible = this.getAttribute('data-onglet');
      for (var k = 0; k < ongletsContenu.length; k++) {
        if (ongletsContenu[k].id === 'onglet' + cible.charAt(0).toUpperCase() + cible.slice(1)) {
          ongletsContenu[k].classList.remove('onglet-contenu--cachee');
        } else {
          ongletsContenu[k].classList.add('onglet-contenu--cachee');
        }
      }
    });
  }

  // 4. Chargement et affichage des réservations
  var listeReservations = document.getElementById('listeReservations');
  var badgeNouveau = document.getElementById('badgeNouveau');

  function chargerReservations() {
    supabaseClient
      .from('reservations')
      .select('*')
      .order('date_rdv', { ascending: true })
      .order('heure_rdv', { ascending: true })
      .then(function (reponse) {
        if (reponse.error || !reponse.data || reponse.data.length === 0) {
          listeReservations.innerHTML = '<p class="admin-vide">Aucune réservation pour le moment.</p>';
          badgeNouveau.classList.add('badge-nouveau--vide');
          return;
        }

        var reservations = reponse.data;
        var nombreNouveau = 0;
        listeReservations.innerHTML = '';

        for (var i = 0; i < reservations.length; i++) {
          var r = reservations[i];
          if (r.statut === 'nouveau') { nombreNouveau++; }
          listeReservations.appendChild(creerCarteReservation(r));
        }

        badgeNouveau.textContent = nombreNouveau;
        badgeNouveau.classList.toggle('badge-nouveau--vide', nombreNouveau === 0);
      });
  }

  function creerCarteReservation(r) {
    var carte = document.createElement('div');
    carte.className = 'carte-reservation' + (r.statut === 'nouveau' ? ' carte-reservation--nouveau' : '');

    var classeStatut = 'reservation-statut--' + r.statut.replace('é', 'e');

    carte.innerHTML =
      '<div class="reservation-infos">' +
        '<p><strong>Nom :</strong> ' + r.nom_client + '</p>' +
        '<p><strong>Téléphone :</strong> ' + r.telephone + '</p>' +
        '<p><strong>Date :</strong> ' + r.date_rdv + ' à ' + r.heure_rdv + '</p>' +
        '<p><strong>Prestations :</strong> ' + r.prestations + ' — ' + r.prix_total + ' FCFA</p>' +
        '<span class="reservation-statut ' + classeStatut + '">' + r.statut + '</span>' +
      '</div>' +
      '<div class="reservation-actions"></div>';

    var actions = carte.querySelector('.reservation-actions');

    // Boutons de contact rapide
    var telephoneNettoye = r.telephone.replace(/[^0-9+]/g, '');

    var lienAppel = document.createElement('a');
    lienAppel.className = 'bouton-contact bouton-contact--appel';
    lienAppel.href = 'tel:' + telephoneNettoye;
    lienAppel.title = 'Appeler';
    lienAppel.innerHTML = '<i class="fa-solid fa-phone"></i>';
    actions.appendChild(lienAppel);

    var lienWhatsapp = document.createElement('a');
    lienWhatsapp.className = 'bouton-contact bouton-contact--whatsapp';
    lienWhatsapp.href = 'https://wa.me/' + telephoneNettoye.replace('+', '');
    lienWhatsapp.title = 'WhatsApp';
    lienWhatsapp.target = '_blank';
    lienWhatsapp.innerHTML = '<i class="fa-brands fa-whatsapp"></i>';
    actions.appendChild(lienWhatsapp);

    if (r.statut === 'nouveau') {
      actions.appendChild(creerBoutonStatut(r.id, 'vu', 'Marquer comme vu'));
    }
    if (r.statut !== 'confirmé') {
      actions.appendChild(creerBoutonStatut(r.id, 'confirmé', 'Confirmer'));
    }

    return carte;
  }

  function creerBoutonStatut(id, nouveauStatut, texte) {
    var bouton = document.createElement('button');
    bouton.className = 'bouton-secondaire';
    bouton.textContent = texte;
    bouton.addEventListener('click', function () {
      changerStatut(id, nouveauStatut);
    });
    return bouton;
  }

  // 5. Changement de statut d'une réservation
  function changerStatut(id, nouveauStatut) {
    supabaseClient
      .from('reservations')
      .update({ statut: nouveauStatut })
      .eq('id', id)
      .then(function () {
        chargerReservations();
      });
  }

  // 6. Chargement, ajout et suppression des prestations
  var listePrestations = document.getElementById('listePrestations');
  var formAjoutPrestation = document.getElementById('formAjoutPrestation');

  function chargerPrestations() {
    supabaseClient
      .from('services')
      .select('*')
      .order('categorie', { ascending: true })
      .then(function (reponse) {
        if (reponse.error || !reponse.data || reponse.data.length === 0) {
          listePrestations.innerHTML = '<p class="admin-vide">Aucune prestation enregistrée.</p>';
          return;
        }

        listePrestations.innerHTML = '';
        for (var i = 0; i < reponse.data.length; i++) {
          listePrestations.appendChild(creerCartePrestation(reponse.data[i]));
        }
      });
  }

  function creerCartePrestation(p) {
    var carte = document.createElement('div');
    carte.className = 'carte-prestation-admin';
    carte.innerHTML =
      '<div>' +
        '<span class="prestation-admin-nom">' + p.nom + '</span> ' +
        '<span class="prestation-admin-details">(' + p.categorie + ')</span>' +
      '</div>' +
      '<div class="prestation-admin-prix">' + p.prix + ' FCFA</div>';

    var btnSupprimer = document.createElement('button');
    btnSupprimer.className = 'bouton-secondaire';
    btnSupprimer.innerHTML = '<i class="fa-solid fa-trash"></i>';
    btnSupprimer.addEventListener('click', function () {
      supprimerPrestation(p.id);
    });
    carte.appendChild(btnSupprimer);

    return carte;
  }

  function supprimerPrestation(id) {
    supabaseClient
      .from('services')
      .delete()
      .eq('id', id)
      .then(function () {
        chargerPrestations();
      });
  }

  formAjoutPrestation.addEventListener('submit', function (evenement) {
    evenement.preventDefault();

    var nom = document.getElementById('nouveauNom').value;
    var categorie = document.getElementById('nouvelleCategorie').value;
    var prix = parseInt(document.getElementById('nouveauPrix').value, 10);

    supabaseClient
      .from('services')
      .insert([{ nom: nom, categorie: categorie, prix: prix }])
      .then(function () {
        formAjoutPrestation.reset();
        chargerPrestations();
      });
  });

});