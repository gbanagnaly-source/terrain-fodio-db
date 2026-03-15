'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'fr' | 'en';

interface Translations {
  // App
  appTitle: string;
  terrainManagement: string;
  
  // Navigation
  dashboard: string;
  terrains: string;
  addTerrain: string;
  search: string;
  settings: string;
  language: string;
  french: string;
  english: string;
  
  // Statistics
  statistics: string;
  generalStatistics: string;
  available: string;
  sold: string;
  total: string;
  numberOfIlots: string;
  numberOfLots: string;
  
  // Filters
  byGroup: string;
  bySector: string;
  byExecution: string;
  byNature: string;
  byTP: string;
  byPubJO: string;
  
  // Table
  ilot: string;
  lot: string;
  group: string;
  sector: string;
  parcel: string;
  execution: string;
  state: string;
  landTitle: string;
  tp: string;
  titleNumber: string;
  year: string;
  pubJO: string;
  date: string;
  nature: string;
  surface: string;
  owner: string;
  contact: string;
  email: string;
  status: string;
  actions: string;
  
  // Forms
  newTerrain: string;
  editTerrain: string;
  save: string;
  cancel: string;
  delete: string;
  confirm: string;
  yes: string;
  no: string;
  
  // Messages
  terrainAdded: string;
  terrainUpdated: string;
  terrainDeleted: string;
  confirmDelete: string;
  noResults: string;
  loading: string;
  error: string;
  
  // Filter options
  groupA: string;
  groupB: string;
  sectorDW: string;
  sectorMO: string;
  execNF: string;
  execF: string;
  statusDispo: string;
  statusVendu: string;
  
  // Recent Activities
  recentActivities: string;
  recentlyAdded: string;
  recentSearches: string;
  searchSuccess: string;
  searchFailed: string;
  noRecentActivity: string;
  addedOn: string;
  searchedFor: string;
  found: string;
  notFound: string;
  
  // Advanced Search
  advancedSearch: string;
  searchBy: string;
  searchByIlot: string;
  searchByLot: string;
  enterIlot: string;
  enterLot: string;
  searchResult: string;
  terrainFound: string;
  noTerrainFound: string;
  
  // Settings
  appSettings: string;
  languageSettings: string;
  themeSettings: string;
  chartSettings: string;
  fontSettings: string;
  theme: string;
  chartColors: string;
  fontSize: string;
  fontFamily: string;
  resetSettings: string;
  resetConfirm: string;
  apply: string;
}

const translations: Record<Language, Translations> = {
  fr: {
    // App
    appTitle: 'TERRAIN BESSIKOI',
    terrainManagement: 'Application de Gestion de Terrains',
    
    // Navigation
    dashboard: 'Tableau de bord',
    terrains: 'Terrains',
    addTerrain: 'Ajouter un terrain',
    search: 'Rechercher',
    settings: 'Paramètres',
    language: 'Langue',
    french: 'Français',
    english: 'Anglais',
    
    // Statistics
    statistics: 'Statistiques',
    generalStatistics: 'Statistiques Générales',
    available: 'Disponible',
    sold: 'Vendu',
    total: 'Total',
    numberOfIlots: "Nombre d'Îlots",
    numberOfLots: 'Nombre de Lots',
    
    // Filters
    byGroup: 'Par Groupe',
    bySector: 'Par Section',
    byExecution: 'Par Exécution',
    byNature: 'Par Nature',
    byTP: 'Par TP',
    byPubJO: 'Par PubJO',
    
    // Table
    ilot: 'Îlot',
    lot: 'Lot',
    group: 'Groupe',
    sector: 'Section',
    parcel: 'Parcelle',
    execution: 'Exécution',
    state: 'État',
    landTitle: 'Titre Foncier',
    tp: 'TP',
    titleNumber: 'N° Titre Prop',
    year: 'Année',
    pubJO: 'PubJO',
    date: 'Date',
    nature: 'Nature',
    surface: 'Surface',
    owner: 'Possesseur',
    contact: 'Contact',
    email: 'Email',
    status: 'Statut',
    actions: 'Actions',
    
    // Forms
    newTerrain: 'Nouveau Terrain',
    editTerrain: 'Modifier le Terrain',
    save: 'Enregistrer',
    cancel: 'Annuler',
    delete: 'Supprimer',
    confirm: 'Confirmer',
    yes: 'Oui',
    no: 'Non',
    
    // Messages
    terrainAdded: 'Terrain ajouté avec succès',
    terrainUpdated: 'Terrain modifié avec succès',
    terrainDeleted: 'Terrain supprimé avec succès',
    confirmDelete: 'Êtes-vous sûr de vouloir supprimer ce terrain ?',
    noResults: 'Aucun résultat trouvé',
    loading: 'Chargement...',
    error: 'Une erreur est survenue',
    
    // Filter options
    groupA: 'Groupe A',
    groupB: 'Groupe B',
    sectorDW: 'DW',
    sectorMO: 'MO',
    execNF: 'Non Finalisé',
    execF: 'Finalisé',
    statusDispo: 'Disponible',
    statusVendu: 'Vendu',
    
    // Recent Activities
    recentActivities: 'Activités Récentes',
    recentlyAdded: 'Récemment Ajoutés',
    recentSearches: 'Recherches Récentes',
    searchSuccess: 'Recherche Réussie',
    searchFailed: 'Recherche Échouée',
    noRecentActivity: 'Aucune activité récente',
    addedOn: 'Ajouté le',
    searchedFor: 'Recherche',
    found: 'Trouvé',
    notFound: 'Non trouvé',
    
    // Advanced Search
    advancedSearch: 'Vérifier un terrain',
    searchBy: 'Rechercher par',
    searchByIlot: 'Par Îlot',
    searchByLot: 'Par Lot',
    enterIlot: 'Entrer le numéro d\'îlot',
    enterLot: 'Entrer le numéro de lot',
    searchResult: 'Résultat de la recherche',
    terrainFound: 'Terrain trouvé',
    noTerrainFound: 'Aucun terrain trouvé',
    
    // Settings
    appSettings: 'Paramètres de l\'application',
    languageSettings: 'Langue',
    themeSettings: 'Thème',
    chartSettings: 'Couleurs des graphiques',
    fontSettings: 'Police',
    theme: 'Thème',
    chartColors: 'Couleurs des graphiques',
    fontSize: 'Taille de police',
    fontFamily: 'Police',
    resetSettings: 'Réinitialiser',
    resetConfirm: 'Réinitialiser les paramètres ?',
    apply: 'Appliquer',
  },
  en: {
    // App
    appTitle: 'TERRAIN BESSIKOI',
    terrainManagement: 'Terrain Management Application',
    
    // Navigation
    dashboard: 'Dashboard',
    terrains: 'Terrains',
    addTerrain: 'Add Terrain',
    search: 'Search',
    settings: 'Settings',
    language: 'Language',
    french: 'French',
    english: 'English',
    
    // Statistics
    statistics: 'Statistics',
    generalStatistics: 'General Statistics',
    available: 'Available',
    sold: 'Sold',
    total: 'Total',
    numberOfIlots: 'Number of Ilots',
    numberOfLots: 'Number of Lots',
    
    // Filters
    byGroup: 'By Group',
    bySector: 'By Section',
    byExecution: 'By Execution',
    byNature: 'By Nature',
    byTP: 'By TP',
    byPubJO: 'By PubJO',
    
    // Table
    ilot: 'Ilot',
    lot: 'Lot',
    group: 'Group',
    sector: 'Section',
    parcel: 'Parcel',
    execution: 'Execution',
    state: 'State',
    landTitle: 'Land Title',
    tp: 'TP',
    titleNumber: 'Title Number',
    year: 'Year',
    pubJO: 'PubJO',
    date: 'Date',
    nature: 'Nature',
    surface: 'Surface',
    owner: 'Owner',
    contact: 'Contact',
    email: 'Email',
    status: 'Status',
    actions: 'Actions',
    
    // Forms
    newTerrain: 'New Terrain',
    editTerrain: 'Edit Terrain',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    confirm: 'Confirm',
    yes: 'Yes',
    no: 'No',
    
    // Messages
    terrainAdded: 'Terrain added successfully',
    terrainUpdated: 'Terrain updated successfully',
    terrainDeleted: 'Terrain deleted successfully',
    confirmDelete: 'Are you sure you want to delete this terrain?',
    noResults: 'No results found',
    loading: 'Loading...',
    error: 'An error occurred',
    
    // Filter options
    groupA: 'Group A',
    groupB: 'Group B',
    sectorDW: 'DW',
    sectorMO: 'MO',
    execNF: 'Not Finalized',
    execF: 'Finalized',
    statusDispo: 'Available',
    statusVendu: 'Sold',
    
    // Recent Activities
    recentActivities: 'Recent Activities',
    recentlyAdded: 'Recently Added',
    recentSearches: 'Recent Searches',
    searchSuccess: 'Search Successful',
    searchFailed: 'Search Failed',
    noRecentActivity: 'No recent activity',
    addedOn: 'Added on',
    searchedFor: 'Searched for',
    found: 'Found',
    notFound: 'Not found',
    
    // Advanced Search
    advancedSearch: 'Verify a Terrain',
    searchBy: 'Search by',
    searchByIlot: 'By Ilot',
    searchByLot: 'By Lot',
    enterIlot: 'Enter ilot number',
    enterLot: 'Enter lot number',
    searchResult: 'Search Result',
    terrainFound: 'Terrain found',
    noTerrainFound: 'No terrain found',
    
    // Settings
    appSettings: 'Application Settings',
    languageSettings: 'Language',
    themeSettings: 'Theme',
    chartSettings: 'Chart Colors',
    fontSettings: 'Font',
    theme: 'Theme',
    chartColors: 'Chart Colors',
    fontSize: 'Font Size',
    fontFamily: 'Font Family',
    resetSettings: 'Reset',
    resetConfirm: 'Reset all settings?',
    apply: 'Apply',
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const getInitialLanguage = (): Language => {
  if (typeof window === 'undefined') return 'fr';
  const savedLang = localStorage.getItem('language') as Language;
  if (savedLang && (savedLang === 'fr' || savedLang === 'en')) {
    return savedLang;
  }
  return 'fr';
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(getInitialLanguage);

  const handleSetLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage: handleSetLanguage,
        t: translations[language],
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
