import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  fr: {
    translation: {
      // Auth
      login: 'Connexion',
      email: 'Email',
      password: 'Mot de passe',

      // Dashboard
      dashboard: 'Tableau de bord',
      shops: 'Magasins',
      reports: 'Rapports',

      // Operations
      send: 'Envoyer',
      receive: 'Recevoir',
      amount: 'Montant',
      currency: 'Devise',

      // Common
      save: 'Enregistrer',
      cancel: 'Annuler',
      delete: 'Supprimer',
      edit: 'Modifier',
      add: 'Ajouter',

      // Currencies
      usd: 'Dollars',
      fc: 'Francs Congolais',

      // Reports
      dailyReport: 'Rapport Journalier',
      balance: 'Solde',
      cash: 'Espèces',

      // Admin
      addShop: 'Ajouter un magasin',
      addAgent: 'Ajouter un agent',
      initialCapital: 'Capital initial',
    },
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: 'fr',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
