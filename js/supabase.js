/* =============================================================
   ELEGANCE BARBER — supabase.js
   Connexion au projet Supabase (base de données + auth)
   Index du fichier :
   1. Configuration (URL + clé publique)
   2. Création du client Supabase
   ============================================================= */

// 1. Configuration — ces deux valeurs viennent de Project Settings > API sur Supabase
// L'URL suit toujours ce format : https://[reference-du-projet].supabase.co
var SUPABASE_URL = 'https://uemhtfqlgoxykvfdjuco.supabase.co';
var SUPABASE_KEY = 'sb_publishable_qirhbKsx1DGn8pBZkDOBPA_VHYbx8nL';

// 2. Création du client Supabase (objet utilisé partout ailleurs pour lire/écrire)
var supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);