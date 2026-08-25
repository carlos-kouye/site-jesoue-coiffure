/* =============================================================
   ELEGANCE BARBER — reservation.js
   Index du fichier :
   1. Toggle mode sombre/clair
   2. Menu mobile
   3. Sélection des prestations + récapitulatif
   4. Navigation entre les étapes
   5. Confirmation de la réservation (vérifie la capacité + doublon, enregistre dans Supabase, notifie par EmailJS)
   6. Année automatique du footer
   ============================================================= */

document.addEventListener('DOMContentLoaded', function () {

  // 1. Toggle mode sombre/clair
  var themeToggle = document.getElementById('themeToggle');
  var htmlEl = document.documentElement;
  var themeIcon = themeToggle.querySelector('i');

  var themeSauvegarde = localStorage.getItem('theme');
  if (themeSauvegarde === 'dark') {
    htmlEl.setAttribute('data-theme', 'dark');
    themeIcon.classList.replace('fa-moon', 'fa-sun');
  }

  themeToggle.addEventListener('click', function () {
    var estSombre = htmlEl.getAttribute('data-theme') === 'dark';
    htmlEl.setAttribute('data-theme', estSombre ? 'light' : 'dark');
    themeIcon.classList.replace(estSombre ? 'fa-sun' : 'fa-moon', estSombre ? 'fa-moon' : 'fa-sun');
    localStorage.setItem('theme', estSombre ? 'light' : 'dark');
  });

  // 2. Menu mobile
  var burgerBtn = document.getElementById('burgerBtn');
  var navMobile = document.getElementById('navMobile');

  burgerBtn.addEventListener('click', function () {
    navMobile.classList.toggle('ouvert');
  });

  var liensMobile = navMobile.querySelectorAll('a');
  for (var i = 0; i < liensMobile.length; i++) {
    liensMobile[i].addEventListener('click', function () {
      navMobile.classList.remove('ouvert');
    });
  }

  // 3. Sélection des prestations + récapitulatif
  var casesChoix = document.querySelectorAll('.choix-case');
  var recapListe = document.getElementById('recapListe');
  var recapVide = document.getElementById('recapVide');
  var recapTotal = document.getElementById('recapTotal');
  var btnEtapeSuivante = document.getElementById('btnEtapeSuivante');

  function mettreAJourRecap() {
    var casesCochees = document.querySelectorAll('.choix-case:checked');
    var total = 0;

    recapListe.innerHTML = '';

    if (casesCochees.length === 0) {
      recapListe.appendChild(recapVide);
      btnEtapeSuivante.disabled = true;
    } else {
      for (var j = 0; j < casesCochees.length; j++) {
        var nom = casesCochees[j].getAttribute('data-nom');
        var prix = parseInt(casesCochees[j].getAttribute('data-prix'), 10);
        total += prix;

        var ligne = document.createElement('li');
        ligne.className = 'recap-item';
        ligne.innerHTML = '<span>' + nom + '</span><span>' + prix.toLocaleString('fr-FR') + ' FCFA</span>';
        recapListe.appendChild(ligne);
      }
      btnEtapeSuivante.disabled = false;
    }

    recapTotal.textContent = total.toLocaleString('fr-FR') + ' FCFA';
  }

  for (var k = 0; k < casesChoix.length; k++) {
    casesChoix[k].addEventListener('change', mettreAJourRecap);
  }

  // 4. Navigation entre les étapes
  var etapeUn = document.getElementById('etapeUn');
  var etapeDeux = document.getElementById('etapeDeux');
  var indicateurUn = document.querySelector('.etape[data-etape="1"]');
  var indicateurDeux = document.querySelector('.etape[data-etape="2"]');
  var btnEtapePrecedente = document.getElementById('btnEtapePrecedente');

  btnEtapeSuivante.addEventListener('click', function () {
    etapeUn.classList.add('etape-contenu--cachee');
    etapeDeux.classList.remove('etape-contenu--cachee');
    indicateurUn.classList.remove('etape--active');
    indicateurDeux.classList.add('etape--active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  btnEtapePrecedente.addEventListener('click', function () {
    etapeDeux.classList.add('etape-contenu--cachee');
    etapeUn.classList.remove('etape-contenu--cachee');
    indicateurDeux.classList.remove('etape--active');
    indicateurUn.classList.add('etape--active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // 5. Confirmation de la réservation
  var btnConfirmer = document.getElementById('btnConfirmer');
  var reservationSection = document.querySelector('.reservation-section');
  var etapesIndicateur = document.querySelector('.etapes-indicateur');
  var confirmationSection = document.getElementById('confirmationSection');

  btnConfirmer.addEventListener('click', function () {
    var champDate = document.getElementById('champDate');
    var champHeure = document.getElementById('champHeure');
    var champNom = document.getElementById('champNom');
    var champTelephone = document.getElementById('champTelephone');

    if (!champDate.value || !champHeure.value || !champNom.value || !champTelephone.value) {
      alert('Merci de remplir tous les champs avant de confirmer.');
      return;
    }

    btnConfirmer.disabled = true;
    btnConfirmer.textContent = 'Vérification du créneau...';

    // Vérifie d'abord la capacité max du jour choisi (paramètre modifiable dans Supabase)
    supabaseClient
      .from('parametres')
      .select('valeur')
      .eq('cle', 'capacite_max_jour')
      .single()
      .then(function (reponseParametre) {
        var capaciteMax = reponseParametre.data ? parseInt(reponseParametre.data.valeur, 10) : 15;

        return supabaseClient
          .from('reservations')
          .select('id', { count: 'exact' })
          .eq('date_rdv', champDate.value)
          .then(function (reponseCompte) {
            var nombreDejaReserve = reponseCompte.count || 0;

            if (nombreDejaReserve >= capaciteMax) {
              btnConfirmer.disabled = false;
              btnConfirmer.textContent = 'Confirmer la réservation';
              alert('Cette journée est complète (' + capaciteMax + ' rendez-vous déjà pris). Merci de choisir une autre date — nous garderons vos informations si vous préférez qu\'on vous rappelle.');
              return;
            }

            // Vérifie qu'il n'y a pas déjà une réservation avec le même téléphone, même date, même heure
            supabaseClient
              .from('reservations')
              .select('id')
              .eq('telephone', champTelephone.value)
              .eq('date_rdv', champDate.value)
              .eq('heure_rdv', champHeure.value)
              .then(function (reponseDoublon) {
                if (reponseDoublon.data && reponseDoublon.data.length > 0) {
                  btnConfirmer.disabled = false;
                  btnConfirmer.textContent = 'Confirmer la réservation';
                  alert('Vous avez déjà un rendez-vous à ce créneau. Pour ajouter une prestation à votre réservation existante, merci de nous appeler directement.');
                  return;
                }

                enregistrerReservation(champDate, champHeure, champNom, champTelephone);
              });
          });
      });
  });

  function enregistrerReservation(champDate, champHeure, champNom, champTelephone) {
    // Construit le résumé texte des prestations choisies + le total
    var casesCochees = document.querySelectorAll('.choix-case:checked');
    var nomsPrestations = [];
    var total = 0;

    for (var p = 0; p < casesCochees.length; p++) {
      nomsPrestations.push(casesCochees[p].getAttribute('data-nom'));
      total += parseInt(casesCochees[p].getAttribute('data-prix'), 10);
    }

    btnConfirmer.textContent = 'Envoi en cours...';

    // Enregistrement dans Supabase (table reservations)
    supabaseClient
      .from('reservations')
      .insert([{
        nom_client: champNom.value,
        telephone: champTelephone.value,
        date_rdv: champDate.value,
        heure_rdv: champHeure.value,
        prestations: nomsPrestations.join(', '),
        prix_total: total,
        statut: 'nouveau'
      }])
      .then(function (reponse) {
        if (reponse.error) {
          alert('Une erreur est survenue, merci de réessayer. (' + reponse.error.message + ')');
          btnConfirmer.disabled = false;
          btnConfirmer.textContent = 'Confirmer la réservation';
          return;
        }

        // Envoi de l'email de notification au coiffeur via EmailJS
        emailjs.send('service_i8suopm', 'template_97fj75n', {
          nom_client: champNom.value,
          telephone: champTelephone.value,
          date_rdv: champDate.value,
          heure_rdv: champHeure.value,
          prestations: nomsPrestations.join(', '),
          prix_total: total
        });

        reservationSection.style.display = 'none';
        etapesIndicateur.style.display = 'none';
        confirmationSection.classList.remove('confirmation-section--cachee');
      });
  }

  // 6. Année automatique dans le footer
  var anneeSpan = document.getElementById('annee');
  if (anneeSpan) {
    anneeSpan.textContent = new Date().getFullYear();
  }

});