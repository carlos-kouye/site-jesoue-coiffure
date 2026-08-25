/* =============================================================
   ELEGANCE BARBER — services.js
   Index du fichier :
   1. Toggle mode sombre/clair
   2. Menu mobile
   3. Année automatique du footer
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

  // 3. Année automatique dans le footer
  var anneeSpan = document.getElementById('annee');
  if (anneeSpan) {
    anneeSpan.textContent = new Date().getFullYear();
  }

});