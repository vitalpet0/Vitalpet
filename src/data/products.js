// src/data/products.js
// Catalogue VitalPet — 80 produits
// Images génériques locales pour un rendu propre et rapide à charger.

const CROQ_IMG = "/img/croquettes.jpg";
const SNACK_IMG = "/img/friandises.jpg";

// === Données brutes (inchangées) ===
const RAW_PRODUCTS = [
  /* ------------------------- CROQUETTES CHAT (20) ------------------------- */
  { id: "cc-01", name: "Royal Canin Kitten 2kg", brand: "Royal Canin", age: "Chaton", price: 11.5, pet: "chat", cat: "Croquettes", feature: "Croissance chatons", size: "2kg" },
  { id: "cc-02", name: "Royal Canin Indoor 2kg", brand: "Royal Canin", age: "Adulte", price: 9.8, pet: "chat", cat: "Croquettes", feature: "Chats d'intérieur", size: "2kg" },
  { id: "cc-03", name: "Royal Canin Outdoor 2kg", brand: "Royal Canin", age: "Adulte", price: 10.0, pet: "chat", cat: "Croquettes", feature: "Chats actifs", size: "2kg" },
  { id: "cc-04", name: "Royal Canin Sterilised 37 2kg", brand: "Royal Canin", age: "Adulte stérilisé", price: 10.5, pet: "chat", cat: "Croquettes", feature: "Contrôle du poids", size: "2kg" },
  { id: "cc-05", name: "Royal Canin Hairball Care 2kg", brand: "Royal Canin", age: "Adulte", price: 10.8, pet: "chat", cat: "Croquettes", feature: "Réduction boules de poils", size: "2kg" },
  { id: "cc-06", name: "Royal Canin Digestive Care 2kg", brand: "Royal Canin", age: "Adulte", price: 11.0, pet: "chat", cat: "Croquettes", feature: "Digestion sensible", size: "2kg" },
  { id: "cc-07", name: "Royal Canin Senior Ageing 12+ 2kg", brand: "Royal Canin", age: "Senior", price: 11.2, pet: "chat", cat: "Croquettes", feature: "Senior 12+", size: "2kg" },
  { id: "cc-08", name: "Royal Canin Urinary Care 2kg", brand: "Royal Canin", age: "Adulte", price: 10.7, pet: "chat", cat: "Croquettes", feature: "Santé urinaire", size: "2kg" },
  { id: "cc-09", name: "Royal Canin Hypoallergenic 2kg", brand: "Royal Canin", age: "Adulte", price: 12.5, pet: "chat", cat: "Croquettes", feature: "Prescription vétérinaire", size: "2kg" },
  { id: "cc-10", name: "Royal Canin Renal 2kg", brand: "Royal Canin", age: "Senior", price: 13.0, pet: "chat", cat: "Croquettes", feature: "Soutien rénal", size: "2kg" },
  { id: "cc-11", name: "Purina Pro Plan Kitten 1.5kg", brand: "Purina Pro Plan", age: "Chaton", price: 10.2, pet: "chat", cat: "Croquettes", feature: "Croissance chaton", size: "1.5kg" },
  { id: "cc-12", name: "Purina Pro Plan Sterilised Adult 1.5kg", brand: "Purina Pro Plan", age: "Adulte stérilisé", price: 9.9, pet: "chat", cat: "Croquettes", feature: "Contrôle du poids", size: "1.5kg" },
  { id: "cc-13", name: "Purina Pro Plan Delicate Digestion 1.5kg", brand: "Purina Pro Plan", age: "Adulte", price: 10.0, pet: "chat", cat: "Croquettes", feature: "Digestion sensible", size: "1.5kg" },
  { id: "cc-14", name: "Purina Pro Plan Urinary 1.5kg", brand: "Purina Pro Plan", age: "Adulte", price: 10.8, pet: "chat", cat: "Croquettes", feature: "Santé urinaire", size: "1.5kg" },
  { id: "cc-15", name: "Hill's Science Plan Sterilised Cat 1.5kg", brand: "Hill's", age: "Adulte stérilisé", price: 11.4, pet: "chat", cat: "Croquettes", feature: "Gestion du poids", size: "1.5kg" },
  { id: "cc-16", name: "Hill's Science Plan Sensitive Stomach 1.5kg", brand: "Hill's", age: "Adulte", price: 11.2, pet: "chat", cat: "Croquettes", feature: "Estomac sensible", size: "1.5kg" },
  { id: "cc-17", name: "Ultima Cat Indoor 1.5kg", brand: "Ultima", age: "Adulte", price: 7.9, pet: "chat", cat: "Croquettes", feature: "Faible activité", size: "1.5kg" },
  { id: "cc-18", name: "Ultima Sterilised Salmon 1.5kg", brand: "Ultima", age: "Adulte stérilisé", price: 8.5, pet: "chat", cat: "Croquettes", feature: "Riche en saumon", size: "1.5kg" },
  { id: "cc-19", name: "Edgard & Cooper Adult Poulet 1.75kg", brand: "Edgard & Cooper", age: "Adulte", price: 12.9, pet: "chat", cat: "Croquettes", feature: "Ingrédients naturels", size: "1.75kg" },
  { id: "cc-20", name: "Farmina N&D Pumpkin Sterilised 1.5kg", brand: "Farmina", age: "Adulte stérilisé", price: 14.5, pet: "chat", cat: "Croquettes", feature: "Sans céréales", size: "1.5kg" },

  /* ------------------------- CROQUETTES CHIEN (20) ------------------------ */
  { id: "cd-01", name: "Royal Canin Mini Adult 3kg", brand: "Royal Canin", age: "Adulte", price: 12.9, pet: "chien", cat: "Croquettes", feature: "Petites races", size: "3kg" },
  { id: "cd-02", name: "Royal Canin Medium Adult 4kg", brand: "Royal Canin", age: "Adulte", price: 14.9, pet: "chien", cat: "Croquettes", feature: "Races moyennes", size: "4kg" },
  { id: "cd-03", name: "Royal Canin Maxi Adult 4kg", brand: "Royal Canin", age: "Adulte", price: 15.9, pet: "chien", cat: "Croquettes", feature: "Grandes races", size: "4kg" },
  { id: "cd-04", name: "Royal Canin Sterilised 3kg", brand: "Royal Canin", age: "Adulte stérilisé", price: 13.9, pet: "chien", cat: "Croquettes", feature: "Contrôle du poids", size: "3kg" },
  { id: "cd-05", name: "Royal Canin Digestive Care 3kg", brand: "Royal Canin", age: "Adulte", price: 14.2, pet: "chien", cat: "Croquettes", feature: "Digestion sensible", size: "3kg" },
  { id: "cd-06", name: "Purina Pro Plan Puppy Medium 3kg", brand: "Purina Pro Plan", age: "Chiot", price: 12.5, pet: "chien", cat: "Croquettes", feature: "Croissance chiot", size: "3kg" },
  { id: "cd-07", name: "Purina Pro Plan Adult Sensitive Skin 3kg", brand: "Purina Pro Plan", age: "Adulte", price: 13.5, pet: "chien", cat: "Croquettes", feature: "Peau sensible (saumon)", size: "3kg" },
  { id: "cd-08", name: "Hill's Science Plan Adult Large 3kg", brand: "Hill's", age: "Adulte", price: 14.8, pet: "chien", cat: "Croquettes", feature: "Grandes races", size: "3kg" },
  { id: "cd-09", name: "Hill's Science Plan Light 3kg", brand: "Hill's", age: "Adulte", price: 13.7, pet: "chien", cat: "Croquettes", feature: "Light / contrôle du poids", size: "3kg" },
  { id: "cd-10", name: "Edgard & Cooper Adult Bœuf 2.5kg", brand: "Edgard & Cooper", age: "Adulte", price: 15.5, pet: "chien", cat: "Croquettes", feature: "Ingrédients naturels", size: "2.5kg" },
  { id: "cd-11", name: "Edgard & Cooper Senior Poulet 2.5kg", brand: "Edgard & Cooper", age: "Senior", price: 16.2, pet: "chien", cat: "Croquettes", feature: "Senior + glucosamine", size: "2.5kg" },
  { id: "cd-12", name: "Carnilove Salmon Adult 2.5kg", brand: "Carnilove", age: "Adulte", price: 16.8, pet: "chien", cat: "Croquettes", feature: "Sans céréales, saumon", size: "2.5kg" },
  { id: "cd-13", name: "Farmina N&D Pumpkin Puppy 2.5kg", brand: "Farmina", age: "Chiot", price: 17.5, pet: "chien", cat: "Croquettes", feature: "Sans céréales", size: "2.5kg" },
  { id: "cd-14", name: "Royal Canin Renal 2kg", brand: "Royal Canin", age: "Adulte", price: 18.0, pet: "chien", cat: "Croquettes", feature: "Soutien rénal (vétérinaire)", size: "2kg" },
  { id: "cd-15", name: "Royal Canin Hypoallergenic 2kg", brand: "Royal Canin", age: "Adulte", price: 18.5, pet: "chien", cat: "Croquettes", feature: "Allergies (vétérinaire)", size: "2kg" },
  { id: "cd-16", name: "Ultima Adult Poulet 3kg", brand: "Ultima", age: "Adulte", price: 9.9, pet: "chien", cat: "Croquettes", feature: "Rapport qualité/prix", size: "3kg" },
  { id: "cd-17", name: "Ultima Sterilised 3kg", brand: "Ultima", age: "Adulte stérilisé", price: 10.5, pet: "chien", cat: "Croquettes", feature: "Poids contrôlé", size: "3kg" },
  { id: "cd-18", name: "Advance Sensitive Lamb 3kg", brand: "Advance", age: "Adulte", price: 13.9, pet: "chien", cat: "Croquettes", feature: "Agneau, peau/poil", size: "3kg" },
  { id: "cd-19", name: "Orijen Original 2kg", brand: "Orijen", age: "Adulte", price: 22.9, pet: "chien", cat: "Croquettes", feature: "Très riche en protéines", size: "2kg" },
  { id: "cd-20", name: "Acana Puppy & Junior 2kg", brand: "Acana", age: "Chiot", price: 18.9, pet: "chien", cat: "Croquettes", feature: "Recette naturelle", size: "2kg" },

  /* ---------------------------- SNACKS CHAT (20) --------------------------- */
  { id: "sc-01", name: "Stick au Saumon x8", brand: "VitalPet", age: "Adulte", price: 2.9, pet: "chat", cat: "Friandises", feature: "Appétence + oméga 3", size: "8 pcs" },
  { id: "sc-02", name: "Creamy Licks Poulet x12", brand: "Vitakraft", age: "Adulte", price: 3.5, pet: "chat", cat: "Friandises", feature: "Crèmes à lécher", size: "12 pcs" },
  { id: "sc-03", name: "Crunchy Bites Fromage 60g", brand: "Whiskas", age: "Adulte", price: 1.9, pet: "chat", cat: "Friandises", feature: "Croustillant fourré", size: "60g" },
  { id: "sc-04", name: "Anti-Hairball Malt 50g", brand: "GimCat", age: "Adulte", price: 3.2, pet: "chat", cat: "Friandises", feature: "Boules de poils", size: "50g" },
  { id: "sc-05", name: "Liofilisé 100% Saumon 30g", brand: "Orijen", age: "Adulte", price: 4.9, pet: "chat", cat: "Friandises", feature: "Monoprotéine", size: "30g" },
  { id: "sc-06", name: "Herbe à chat en sticks", brand: "Vitakraft", age: "Tous âges", price: 2.2, pet: "chat", cat: "Friandises", feature: "Herbe à chat", size: "5 pcs" },
  { id: "sc-07", name: "Dentaires Greenies 60g", brand: "Greenies", age: "Adulte", price: 4.2, pet: "chat", cat: "Friandises", feature: "Soin dentaire", size: "60g" },
  { id: "sc-08", name: "Freeze-Dried Poulet 35g", brand: "Applaws", age: "Adulte", price: 3.9, pet: "chat", cat: "Friandises", feature: "Naturel, sans céréales", size: "35g" },
  { id: "sc-09", name: "Pâte Multi-Vitamines 50g", brand: "GimCat", age: "Adulte", price: 3.7, pet: "chat", cat: "Friandises", feature: "Vitalité & pelage", size: "50g" },
  { id: "sc-10", name: "Bâtonnets Thon x5", brand: "Vitakraft", age: "Adulte", price: 2.0, pet: "chat", cat: "Friandises", feature: "Sans sucres ajoutés", size: "5 pcs" },
  { id: "sc-11", name: "Mini-Fish 100% Poisson 40g", brand: "Trixie", age: "Adulte", price: 2.6, pet: "chat", cat: "Friandises", feature: "Riche en protéines", size: "40g" },
  { id: "sc-12", name: "Cubes Fromage 50g", brand: "Vitakraft", age: "Adulte", price: 1.8, pet: "chat", cat: "Friandises", feature: "Gourmand", size: "50g" },
  { id: "sc-13", name: "Churu Tuna x20", brand: "Inaba", age: "Adulte", price: 10.9, pet: "chat", cat: "Friandises", feature: "Sticks à lécher", size: "20 pcs" },
  { id: "sc-14", name: "Bio Snack Poulet 40g", brand: "Edgard & Cooper", age: "Adulte", price: 3.1, pet: "chat", cat: "Friandises", feature: "Bio / naturel", size: "40g" },
  { id: "sc-15", name: "Crispy Lamb 40g", brand: "Applaws", age: "Adulte", price: 3.3, pet: "chat", cat: "Friandises", feature: "Sans céréales", size: "40g" },
  { id: "sc-16", name: "Pâtée Gourmande 70g", brand: "Schesir", age: "Adulte", price: 1.6, pet: "chat", cat: "Friandises", feature: "Filets naturels", size: "70g" },
  { id: "sc-17", name: "Filets de Poulet séchés 40g", brand: "Trixie", age: "Adulte", price: 2.7, pet: "chat", cat: "Friandises", feature: "100% viande", size: "40g" },
  { id: "sc-18", name: "Mini Hearts Saumon 50g", brand: "Vitakraft", age: "Adulte", price: 1.9, pet: "chat", cat: "Friandises", feature: "Petites récompenses", size: "50g" },
  { id: "sc-19", name: "Hairball Treats 60g", brand: "Whiskas", age: "Adulte", price: 2.1, pet: "chat", cat: "Friandises", feature: "Fibres anti-boules", size: "60g" },
  { id: "sc-20", name: "Freeze-Dried Canard 35g", brand: "Orijen", age: "Adulte", price: 5.1, pet: "chat", cat: "Friandises", feature: "Monoprotéine", size: "35g" },

  /* --------------------------- SNACKS CHIEN (20) --------------------------- */
  { id: "sd-01", name: "Os à mâcher pressés x5", brand: "VitalPet", age: "Adulte", price: 3.9, pet: "chien", cat: "Friandises", feature: "Mastication", size: "5 pcs" },
  { id: "sd-02", name: "Bâtonnets dentaires Medium x7", brand: "Pedigree Dentastix", age: "Adulte", price: 3.6, pet: "chien", cat: "Friandises", feature: "Hygiène dentaire", size: "7 pcs" },
  { id: "sd-03", name: "Filets de Poulet séchés 80g", brand: "Trixie", age: "Adulte", price: 3.8, pet: "chien", cat: "Friandises", feature: "Riche en protéines", size: "80g" },
  { id: "sd-04", name: "Lamelles d’Agneau 100g", brand: "Carnilove", age: "Adulte", price: 4.5, pet: "chien", cat: "Friandises", feature: "Sans céréales", size: "100g" },
  { id: "sd-05", name: "Petits cœurs au fromage 80g", brand: "Vitakraft", age: "Adulte", price: 2.4, pet: "chien", cat: "Friandises", feature: "Gourmand", size: "80g" },
  { id: "sd-06", name: "Oreilles de Porc x3", brand: "Vitakraft", age: "Adulte", price: 5.2, pet: "chien", cat: "Friandises", feature: "Mastication longue", size: "3 pcs" },
  { id: "sd-07", name: "Gâteries d’éducation mini 200g", brand: "Trixie", age: "Adulte", price: 3.1, pet: "chien", cat: "Friandises", feature: "Dressage / récompenses", size: "200g" },
  { id: "sd-08", name: "Barre énergétique Poulet 50g", brand: "Advance", age: "Adulte", price: 2.2, pet: "chien", cat: "Friandises", feature: "Sport & activité", size: "50g" },
  { id: "sd-09", name: "Friandises fonctionnelles Articulations 100g", brand: "Edgard & Cooper", age: "Adulte", price: 4.9, pet: "chien", cat: "Friandises", feature: "Glucosamine & chondroïtine", size: "100g" },
  { id: "sd-10", name: "Bâtonnet de Yak 70g", brand: "Himalayan", age: "Adulte", price: 6.9, pet: "chien", cat: "Friandises", feature: "Très longue mastication", size: "70g" },
  { id: "sd-11", name: "Dentaires Greenies Large x4", brand: "Greenies", age: "Adulte", price: 7.9, pet: "chien", cat: "Friandises", feature: "Hygiène bucco-dentaire", size: "4 pcs" },
  { id: "sd-12", name: "Cubes de saumon 80g", brand: "Lily's Kitchen", age: "Adulte", price: 4.2, pet: "chien", cat: "Friandises", feature: "Naturel / sans céréales", size: "80g" },
  { id: "sd-13", name: "Bouchées agneau Hypo 100g", brand: "Woolf", age: "Adulte", price: 3.9, pet: "chien", cat: "Friandises", feature: "Hypoallergénique", size: "100g" },
  { id: "sd-14", name: "Peaux de Bœuf tressées 2pcs", brand: "Trixie", age: "Adulte", price: 3.4, pet: "chien", cat: "Friandises", feature: "Mastication", size: "2 pcs" },
  { id: "sd-15", name: "Saucisses Poulet 100g", brand: "Vitakraft", age: "Adulte", price: 2.9, pet: "chien", cat: "Friandises", feature: "Moelleux", size: "100g" },
  { id: "sd-16", name: "Bâtonnets Veau Mini x8", brand: "Pedigree", age: "Adulte", price: 2.1, pet: "chien", cat: "Friandises", feature: "Petits formats", size: "8 pcs" },
  { id: "sd-17", name: "Friandises Entraînement 500g", brand: "Trainer", age: "Adulte", price: 6.5, pet: "chien", cat: "Friandises", feature: "Sachet économique", size: "500g" },
  { id: "sd-18", name: "Ramen Canin (ludique) 70g", brand: "Pet Nerd", age: "Adulte", price: 3.0, pet: "chien", cat: "Friandises", feature: "Jeu & gourmandise", size: "70g" },
  { id: "sd-19", name: "Bâtonnet Veau Maxi x2", brand: "Pedigree", age: "Adulte", price: 2.3, pet: "chien", cat: "Friandises", feature: "Format XL", size: "2 pcs" },
  { id: "sd-20", name: "Trainer Natural Bones 90g", brand: "Trainer", age: "Adulte", price: 3.2, pet: "chien", cat: "Friandises", feature: "Petits os croustillants", size: "90g" },
];

// === Post-traitement : injecte les images génériques ===
const PRODUCTS = RAW_PRODUCTS.map((p) => {
  const cat = (p.cat || "").toLowerCase();
  const img =
    cat === "croquettes" ? CROQ_IMG :
    cat === "friandises" ? SNACK_IMG :
    p.img || null;
  return { ...p, img };
});

export { PRODUCTS };
export default PRODUCTS;
