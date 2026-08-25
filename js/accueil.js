/* =============================================================
   ELEGANCE BARBER — accueil.js
   Index du fichier :
   1. Toggle mode sombre/clair
   2. Menu mobile
   3. Bouton j'aime sur les images
   4. Carousel des services (flèches)
   5. Filtres de la galerie
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

  // 3. Bouton j'aime sur les cartes de prestations
  var boutonsJaime = document.querySelectorAll('.bouton-jaime');
  for (var j = 0; j < boutonsJaime.length; j++) {
    boutonsJaime[j].addEventListener('click', function (evenement) {
      evenement.preventDefault();
      var estAime = this.getAttribute('data-jaime') === 'true';
      var compteSpan = this.querySelector('.bouton-jaime-compte');
      var compteActuel = parseInt(this.getAttribute('data-compte'), 10);

      var nouveauCompte = estAime ? compteActuel - 1 : compteActuel + 1;
      this.setAttribute('data-compte', nouveauCompte);
      this.setAttribute('data-jaime', estAime ? 'false' : 'true');
      compteSpan.textContent = nouveauCompte;

      var icone = this.querySelector('i');
      icone.classList.toggle('fa-regular', estAime);
      icone.classList.toggle('fa-solid', !estAime);
    });
  }

  // 4. Carousel des services (flèches)
  var grilleServices = document.querySelector('.grille-services');
  var flecheGauche = document.getElementById('flecheGauche');
  var flecheDroite = document.getElementById('flecheDroite');

  if (grilleServices && flecheGauche && flecheDroite) {
    flecheGauche.addEventListener('click', function () {
      var carte = grilleServices.querySelector('.carte-service');
      var largeurCarte = carte.offsetWidth + 22;
      grilleServices.scrollBy({ left: -largeurCarte, behavior: 'smooth' });
    });

    flecheDroite.addEventListener('click', function () {
      var carte = grilleServices.querySelector('.carte-service');
      var largeurCarte = carte.offsetWidth + 22;
      grilleServices.scrollBy({ left: largeurCarte, behavior: 'smooth' });
    });
  }

  // 5. Filtres de la galerie
  var boutonsFiltre = document.querySelectorAll('.filtre-btn');
  var cartesGalerie = document.querySelectorAll('.galerie-carte');

  for (var k = 0; k < boutonsFiltre.length; k++) {
    boutonsFiltre[k].addEventListener('click', function () {
      for (var m = 0; m < boutonsFiltre.length; m++) {
        boutonsFiltre[m].classList.remove('filtre-btn--actif');
      }
      this.classList.add('filtre-btn--actif');

      var filtre = this.getAttribute('data-filtre');

      for (var n = 0; n < cartesGalerie.length; n++) {
        var carte = cartesGalerie[n];
        if (filtre === 'tout' || carte.getAttribute('data-categorie') === filtre) {
          carte.classList.remove('cachee');
        } else {
          carte.classList.add('cachee');
        }
      }
    });
  }

  // 6. Année automatique dans le footer
  var anneeSpan = document.getElementById('annee');
  if (anneeSpan) {
    anneeSpan.textContent = new Date().getFullYear();
  }

});