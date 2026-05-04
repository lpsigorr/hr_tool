// ── Data store ──
const DB = {
  drivers: [
    {
      id: 1, firstName: 'Marc', lastName: 'Dubois', initials: 'MD',
      phone: '+32 477 12 34 56', email: 'marc.dubois@transport.be',
      birthDate: '1981-03-14', address: 'Rue de la Gare 12, 1000 Bruxelles',
      contract: 'CDI', startDate: '2018-06-01', vehicle: 'Mercedes Sprinter · BXL-492',
      licence: 'C+E', niss: '81.03.14-123.45',
      status: 'active', alertLevel: 'danger'
    },
    {
      id: 2, firstName: 'Sophie', lastName: 'Laurent', initials: 'SL',
      phone: '+32 496 23 45 67', email: 'sophie.laurent@transport.be',
      birthDate: '1990-07-22', address: 'Avenue Louise 88, 1050 Bruxelles',
      contract: 'CDI', startDate: '2020-02-10', vehicle: 'Iveco Daily · LGE-331',
      licence: 'C', niss: '90.07.22-234.56',
      status: 'active', alertLevel: 'warn'
    },
    {
      id: 3, firstName: 'Karim', lastName: 'Benali', initials: 'KB',
      phone: '+32 483 34 56 78', email: 'karim.benali@transport.be',
      birthDate: '1986-11-05', address: 'Rue Haute 44, 4000 Liège',
      contract: 'CDD', contractEnd: '2025-06-30', startDate: '2024-01-15', vehicle: 'Renault Master · ANV-881',
      licence: 'C', niss: '86.11.05-345.67',
      status: 'active', alertLevel: 'warn'
    },
    {
      id: 4, firstName: 'Luc', lastName: 'Moreau', initials: 'LM',
      phone: '+32 471 45 67 89', email: 'luc.moreau@transport.be',
      birthDate: '1978-09-30', address: 'Chaussée de Namur 22, 5000 Namur',
      contract: 'CDI', startDate: '2015-03-01', vehicle: 'DAF XF · NAM-774',
      licence: 'C+E', niss: '78.09.30-456.78',
      status: 'active', alertLevel: 'warn'
    },
    {
      id: 5, firstName: 'Pierre', lastName: 'Verbeke', initials: 'PV',
      phone: '+32 468 56 78 90', email: 'pierre.verbeke@transport.be',
      birthDate: '1983-04-17', address: 'Steenstraat 7, 8000 Brugge',
      contract: 'CDI', startDate: '2019-09-01', vehicle: 'MAN TGX · BRG-225',
      licence: 'C+E', niss: '83.04.17-567.89',
      status: 'absent', alertLevel: 'info'
    },
    {
      id: 6, firstName: 'Nathalie', lastName: 'Simon', initials: 'NS',
      phone: '+32 476 67 89 01', email: 'nathalie.simon@transport.be',
      birthDate: '1992-02-28', address: 'Rue des Bouchers 3, 1000 Bruxelles',
      contract: 'CDI', startDate: '2021-04-12', vehicle: 'Ford Transit · BXL-118',
      licence: 'C', niss: '92.02.28-678.90',
      status: 'active', alertLevel: 'ok'
    },
  ],

  hours: {
    19: [
      { driverId: 1, days: [8, 7, 8, 8, 7] },
      { driverId: 2, days: [9, 9, 9, 9, 8] },
      { driverId: 3, days: [7, 8, 7, 8, 7] },
      { driverId: 4, days: [8, 8, 8, 8, 8] },
      { driverId: 5, days: [0, 0, 0, 0, 0] },
      { driverId: 6, days: [8, 7, 8, 7, 8] },
    ],
    18: [
      { driverId: 1, days: [8, 8, 8, 8, 8] },
      { driverId: 2, days: [8, 7, 8, 7, 8] },
      { driverId: 3, days: [7, 7, 7, 7, 7] },
      { driverId: 4, days: [8, 8, 8, 8, 8] },
      { driverId: 5, days: [8, 8, 8, 8, 8] },
      { driverId: 6, days: [8, 8, 8, 8, 8] },
    ],
    17: [
      { driverId: 1, days: [9, 9, 9, 9, 9] },
      { driverId: 2, days: [8, 8, 8, 8, 8] },
      { driverId: 3, days: [8, 8, 8, 8, 8] },
      { driverId: 4, days: [7, 7, 7, 7, 7] },
      { driverId: 5, days: [8, 8, 8, 8, 8] },
      { driverId: 6, days: [8, 8, 8, 8, 8] },
    ],
  },

  absences: [
    { id: 1, driverId: 5, type: 'Maladie', from: '2025-04-29', to: '2025-05-09', days: 9, status: 'En cours' },
    { id: 2, driverId: 2, type: 'Congé annuel', from: '2025-06-02', to: '2025-06-06', days: 5, status: 'Planifié' },
    { id: 3, driverId: 1, type: 'Congé annuel', from: '2025-07-14', to: '2025-07-25', days: 10, status: 'Planifié' },
    { id: 4, driverId: 3, type: 'Récupération', from: '2025-05-23', to: '2025-05-23', days: 1, status: 'Planifié' },
  ],

  leaveBalances: [
    { driverId: 1, total: 20, used: 5 },
    { driverId: 2, total: 20, used: 8 },
    { driverId: 3, total: 20, used: 2 },
    { driverId: 4, total: 20, used: 12 },
    { driverId: 5, total: 20, used: 0 },
    { driverId: 6, total: 20, used: 6 },
  ],

  documents: [
    { id: 1, driverId: 1, type: 'Permis de conduire', number: 'BE-1234567', issued: '2015-05-16', expires: '2025-05-16', status: 'urgent' },
    { id: 2, driverId: 1, type: 'Carte conducteur', number: 'BE-CC-98765', issued: '2021-09-01', expires: '2026-09-01', status: 'ok' },
    { id: 3, driverId: 1, type: 'Contrat CDI', number: 'CTR-2018-001', issued: '2018-06-01', expires: null, status: 'ok' },
    { id: 4, driverId: 1, type: 'Certificat médical', number: 'MED-2024-11', issued: '2024-11-03', expires: '2026-11-03', status: 'ok' },
    { id: 5, driverId: 2, type: 'Permis de conduire', number: 'BE-2345678', issued: '2020-03-12', expires: '2028-03-12', status: 'ok' },
    { id: 6, driverId: 2, type: 'Carte conducteur', number: 'BE-CC-87654', issued: '2022-01-15', expires: '2027-01-15', status: 'ok' },
    { id: 7, driverId: 3, type: 'Permis de conduire', number: 'BE-3456789', issued: '2019-06-20', expires: '2025-06-20', status: 'warn' },
    { id: 8, driverId: 3, type: 'Contrat CDD', number: 'CTR-2024-003', issued: '2024-01-15', expires: '2025-06-30', status: 'warn' },
    { id: 9, driverId: 4, type: 'Carte conducteur', number: 'BE-CC-76543', issued: '2023-03-01', expires: '2028-03-01', status: 'ok' },
    { id: 10, driverId: 4, type: 'Permis de conduire', number: 'BE-4567890', issued: '2018-01-15', expires: '2025-05-30', status: 'warn' },
    { id: 11, driverId: 5, type: 'Permis de conduire', number: 'BE-5678901', issued: '2019-04-17', expires: '2027-04-17', status: 'ok' },
    { id: 12, driverId: 5, type: 'Certificat médical', number: 'MED-2023-09', issued: '2023-10-03', expires: '2025-10-03', status: 'ok' },
    { id: 13, driverId: 6, type: 'Permis de conduire', number: 'BE-6789012', issued: '2021-02-28', expires: '2029-02-28', status: 'ok' },
  ],

  issues: [
    {
      id: 1, driverId: 2, title: 'Dépassement heures réglementaires',
      desc: 'Sophie Laurent a effectué 44h lors de la semaine 19, dépassant le plafond légal de 42h. Vérification nécessaire.',
      priority: 'warn', status: 'open', date: '2025-05-04', category: 'Heures'
    },
    {
      id: 2, driverId: 1, title: 'Permis de conduire expirant dans 12 jours',
      desc: 'Le permis de Marc Dubois expire le 16 mai 2025. Sans renouvellement, il ne peut plus conduire légalement.',
      priority: 'danger', status: 'open', date: '2025-05-02', category: 'Documents'
    },
    {
      id: 3, driverId: 5, title: 'Arrêt maladie prolongé',
      desc: 'Pierre Verbeke est en arrêt depuis le 29 avril. Le certificat médical a été reçu. Suivi avec mutuelle en cours.',
      priority: 'info', status: 'progress', date: '2025-04-29', category: 'Absence'
    },
    {
      id: 4, driverId: 4, title: 'Carte conducteur non soumise (mars)',
      desc: 'Luc Moreau n\'a pas transmis sa carte conducteur pour le mois de mars. Rappel envoyé le 2 avril.',
      priority: 'warn', status: 'resolved', date: '2025-04-01', category: 'Documents'
    },
  ],

  history: {
    1: [
      { type: 'danger', msg: 'Permis de conduire expire dans 12 jours — action requise', date: '2 mai 2025' },
      { type: 'ok', msg: 'Visite médicale annuelle passée avec succès', date: '3 novembre 2024' },
      { type: 'info', msg: 'Formation conduite défensive complétée', date: '14 juin 2024' },
      { type: 'warn', msg: 'Retard de 45 min signalé — incident mineur', date: '23 mars 2024' },
      { type: 'ok', msg: 'Contrat CDI renouvelé et signé', date: '1 juin 2023' },
      { type: 'gray', msg: 'Embauche — prise de poste chauffeur poids lourd', date: '1 juin 2018' },
    ],
    2: [
      { type: 'warn', msg: 'Dépassement heures sem. 19 — 44h travaillées', date: '4 mai 2025' },
      { type: 'ok', msg: 'Évaluation annuelle positive — prime attribuée', date: '10 janvier 2025' },
      { type: 'ok', msg: 'Renouvellement carte conducteur effectué', date: '15 janvier 2022' },
    ],
    3: [
      { type: 'warn', msg: 'Permis expire le 20 juin 2025 — renouvellement en cours', date: '1 mai 2025' },
      { type: 'warn', msg: 'Contrat CDD expire le 30 juin — décision renouvellement attendue', date: '28 avril 2025' },
    ],
    4: [
      { type: 'ok', msg: 'Carte conducteur soumise — retard résolu', date: '5 avril 2025' },
      { type: 'warn', msg: 'Carte conducteur mars non soumise', date: '1 avril 2025' },
    ],
    5: [
      { type: 'info', msg: 'Arrêt maladie en cours depuis le 29 avril', date: '29 avril 2025' },
      { type: 'ok', msg: 'Retour de congé sans incident', date: '3 mars 2025' },
    ],
    6: [
      { type: 'ok', msg: 'Tous les documents en ordre', date: '1 avril 2025' },
    ],
  }
};

// Helpers
function getDriver(id) {
  return DB.drivers.find(d => d.id === id);
}

function getDriverName(id) {
  const d = getDriver(id);
  return d ? `${d.firstName} ${d.lastName}` : '—';
}

function getDocsByDriver(id) {
  return DB.documents.filter(d => d.driverId === id);
}

function daysUntil(dateStr) {
  if (!dateStr) return null;
  const diff = new Date(dateStr) - new Date();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('fr-BE', { day: 'numeric', month: 'short', year: 'numeric' });
}

function docStatus(doc) {
  if (!doc.expires) return { label: 'Permanent', cls: 'chip-gray' };
  const days = daysUntil(doc.expires);
  if (days < 0) return { label: 'Expiré', cls: 'chip-danger' };
  if (days <= 30) return { label: `Urgent · ${days}j`, cls: 'chip-danger' };
  if (days <= 90) return { label: `Dans ${days}j`, cls: 'chip-warn' };
  return { label: 'Valide', cls: 'chip-ok' };
}