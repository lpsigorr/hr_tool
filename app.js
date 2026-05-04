// ── State ──
let currentView = 'dashboard';
let previousView = 'dashboard';
let currentDriverId = null;

// ── Init ──
document.addEventListener('DOMContentLoaded', () => {
  setTodayDate();
  renderDashboard();
  renderDriverGrid();
  renderHours();
  renderAbsences();
  renderDocuments();
  renderIssues();
  bindNav();
});

function setTodayDate() {
  const el = document.getElementById('today-date');
  if (el) el.textContent = new Date().toLocaleDateString('fr-BE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

// ── Navigation ──
function bindNav() {
  document.querySelectorAll('[data-view]').forEach(el => {
    el.addEventListener('click', e => {
      e.preventDefault();
      navigateTo(el.dataset.view);
    });
  });
}

function navigateTo(view) {
  if (view === currentView) return;
  previousView = currentView;
  currentView = view;
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  const target = document.getElementById('view-' + view);
  if (target) target.classList.add('active');
  document.querySelectorAll('.nav-item').forEach(n => {
    n.classList.toggle('active', n.dataset.view === view);
  });
}

function goBack() {
  navigateTo(previousView);
}

function openDriverProfile(driverId) {
  currentDriverId = driverId;
  renderProfile(driverId);
  navigateTo('profile');
}

// ── Dashboard ──
function renderDashboard() {
  renderAlerts();
  renderDriverPreview();
}

function renderAlerts() {
  const alerts = [
    { type: 'danger', msg: 'Permis de <strong>Marc Dubois</strong> expire dans 12 jours', meta: 'Documents · Urgent' },
    { type: 'warn', msg: '<strong>Sophie Laurent</strong> a dépassé 42h cette semaine (44h)', meta: 'Heures · Semaine 19' },
    { type: 'warn', msg: 'Contrat de <strong>Karim Benali</strong> expire le 30 juin', meta: 'Contrats · Dans 27 jours' },
    { type: 'warn', msg: 'Permis de <strong>Luc Moreau</strong> expire dans 26 jours', meta: 'Documents · À surveiller' },
  ];
  const el = document.getElementById('alert-list');
  if (!el) return;
  el.innerHTML = alerts.map(a => `
    <div class="alert-item">
      <div class="alert-dot ${a.type}"></div>
      <div>
        <div class="alert-msg">${a.msg}</div>
        <div class="alert-meta">${a.meta}</div>
      </div>
    </div>
  `).join('');
}

function renderDriverPreview() {
  const el = document.getElementById('driver-preview');
  if (!el) return;
  el.innerHTML = DB.drivers.slice(0, 5).map(d => {
    const contract = d.contract === 'CDD'
      ? `<span class="chip chip-warn">${d.contract}</span>`
      : `<span class="chip chip-ok">${d.contract}</span>`;
    const alertIcon = d.alertLevel === 'danger'
      ? `<span class="chip chip-danger">⚠ Urgent</span>`
      : d.alertLevel === 'warn'
      ? `<span class="chip chip-warn">Attention</span>`
      : `<span class="chip chip-ok">OK</span>`;
    return `
      <div class="driver-row" style="cursor:pointer" onclick="openDriverProfile(${d.id})">
        <div class="driver-row-left">
          <div class="driver-mini-ava">${d.initials}</div>
          <span style="font-size:13px;font-weight:500">${d.firstName} ${d.lastName}</span>
        </div>
        <div style="display:flex;gap:5px;align-items:center">${contract}${alertIcon}</div>
      </div>`;
  }).join('');
}

// ── Drivers ──
function renderDriverGrid(filtered = null) {
  const el = document.getElementById('driver-grid');
  if (!el) return;
  const drivers = filtered || DB.drivers;
  el.innerHTML = drivers.map(d => {
    const docs = getDocsByDriver(d.id);
    const urgentDoc = docs.find(doc => doc.status === 'urgent');
    const warnDoc = docs.find(doc => doc.status === 'warn');
    const statusTag = d.status === 'absent'
      ? `<span class="chip chip-info">Absent</span>`
      : `<span class="chip chip-ok">Actif</span>`;
    const contractTag = d.contract === 'CDD'
      ? `<span class="chip chip-warn">CDD · exp. ${formatDate(d.contractEnd)}</span>`
      : `<span class="chip chip-gray">CDI</span>`;
    const docTag = urgentDoc
      ? `<span class="chip chip-danger">Permis urgent</span>`
      : warnDoc
      ? `<span class="chip chip-warn">Doc à renouveler</span>`
      : `<span class="chip chip-ok">Docs OK</span>`;
    return `
      <div class="driver-card" onclick="openDriverProfile(${d.id})">
        <div class="driver-card-top">
          <div class="driver-ava${d.alertLevel === 'warn' || d.alertLevel === 'danger' ? ' warn-ava' : ''}">${d.initials}</div>
          <div>
            <div class="driver-name">${d.firstName} ${d.lastName}</div>
            <div class="driver-role">Chauffeur · ${d.licence}</div>
          </div>
        </div>
        <div class="driver-tags">${statusTag}${contractTag}${docTag}</div>
        <div class="driver-meta">
          <span>${d.vehicle.split('·')[0].trim()}</span>
          <span>Depuis ${new Date(d.startDate).getFullYear()}</span>
        </div>
      </div>`;
  }).join('');
}

function filterDrivers() {
  const q = document.getElementById('driver-search').value.toLowerCase();
  const filtered = q ? DB.drivers.filter(d =>
    `${d.firstName} ${d.lastName}`.toLowerCase().includes(q) ||
    d.vehicle.toLowerCase().includes(q) ||
    d.contract.toLowerCase().includes(q)
  ) : null;
  renderDriverGrid(filtered);
}

// ── Hours ──
function renderHours() {
  const week = parseInt(document.getElementById('week-select')?.value || 19);
  const rows = DB.hours[week] || [];
  const body = document.getElementById('hours-body');
  if (!body) return;
  const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven'];
  let totalHours = 0, overCount = 0, extraHours = 0, absCount = 0;
  body.innerHTML = rows.map(r => {
    const d = getDriver(r.driverId);
    if (!d) return '';
    const total = r.days.reduce((a, b) => a + b, 0);
    const absent = total === 0;
    const over = total > 42;
    totalHours += total;
    if (over) { overCount++; extraHours += total - 40; }
    if (absent) absCount++;
    const statusChip = absent
      ? `<span class="chip chip-info">Absent</span>`
      : over
      ? `<span class="chip chip-warn">Dépassement</span>`
      : `<span class="chip chip-ok">Normal</span>`;
    const daysCells = r.days.map(h => `<td>${h > 0 ? h + 'h' : '<span style="color:var(--text3)">—</span>'}</td>`).join('');
    return `
      <tr>
        <td>
          <div class="cell-name">
            <div class="cell-ava">${d.initials}</div>
            <span style="cursor:pointer" onclick="openDriverProfile(${d.id})">${d.firstName} ${d.lastName}</span>
          </div>
        </td>
        ${daysCells}
        <td class="${over ? 'hours-over' : ''}" style="font-weight:500">${total}h</td>
        <td>${statusChip}</td>
      </tr>`;
  }).join('');
  const setEl = (id, val) => { const e = document.getElementById(id); if (e) e.textContent = val; };
  setEl('total-hours', totalHours + 'h');
  setEl('total-over', overCount.toString());
  setEl('total-extra', extraHours + 'h');
  setEl('total-abs', absCount.toString());
}

function exportHours() {
  const week = document.getElementById('week-select')?.value || 19;
  const rows = DB.hours[week] || [];
  let csv = 'Chauffeur,Lun,Mar,Mer,Jeu,Ven,Total\n';
  rows.forEach(r => {
    const d = getDriver(r.driverId);
    if (!d) return;
    const total = r.days.reduce((a, b) => a + b, 0);
    csv += `"${d.firstName} ${d.lastName}",${r.days.join(',')},${total}\n`;
  });
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `heures_sem${week}.csv`; a.click();
  URL.revokeObjectURL(url);
  showToast('Heures exportées en CSV');
}

// ── Absences ──
function renderAbsences() {
  const body = document.getElementById('absences-body');
  if (body) {
    body.innerHTML = DB.absences.map(a => {
      const d = getDriver(a.driverId);
      const statusCls = a.status === 'En cours' ? 'chip-warn' : a.status === 'Planifié' ? 'chip-info' : 'chip-ok';
      return `
        <tr>
          <td><div class="cell-name"><div class="cell-ava">${d?.initials}</div>${d?.firstName} ${d?.lastName}</div></td>
          <td>${a.type}</td>
          <td>${formatDate(a.from)}</td>
          <td>${formatDate(a.to)}</td>
          <td>${a.days}j</td>
          <td><span class="chip ${statusCls}">${a.status}</span></td>
        </tr>`;
    }).join('');
  }

  const balances = document.getElementById('leave-balances');
  if (balances) {
    balances.innerHTML = DB.leaveBalances.map(b => {
      const d = getDriver(b.driverId);
      const pct = Math.round((b.used / b.total) * 100);
      const remaining = b.total - b.used;
      return `
        <div class="leave-item">
          <div class="leave-name">
            <span>${d?.firstName} ${d?.lastName}</span>
            <span style="font-size:12px;color:var(--text3)">${remaining}j restants</span>
          </div>
          <div class="progress-wrap">
            <div class="progress-track">
              <div class="progress-fill" style="width:${pct}%"></div>
            </div>
            <span style="font-size:11px;color:var(--text3);min-width:60px">${b.used} / ${b.total}j</span>
          </div>
        </div>`;
    }).join('');
  }
}

// ── Documents ──
function renderDocuments(filtered = null) {
  const body = document.getElementById('docs-body');
  if (!body) return;
  const docs = filtered || DB.documents;
  body.innerHTML = docs.map(doc => {
    const d = getDriver(doc.driverId);
    const st = docStatus(doc);
    return `
      <tr>
        <td><div class="cell-name"><div class="cell-ava">${d?.initials}</div>${d?.firstName} ${d?.lastName}</div></td>
        <td style="font-weight:500">${doc.type}</td>
        <td style="font-family:'DM Mono',monospace;font-size:12px;color:var(--text2)">${doc.number}</td>
        <td style="color:var(--text2)">${formatDate(doc.issued)}</td>
        <td style="color:var(--text2)">${formatDate(doc.expires)}</td>
        <td><span class="chip ${st.cls}">${st.label}</span></td>
        <td>
          <div style="display:flex;gap:6px">
            <button class="btn-sm" onclick="showToast('Rappel envoyé à ${d?.firstName}')">Relancer</button>
            <button class="btn-sm" onclick="openDriverProfile(${doc.driverId})">Profil</button>
          </div>
        </td>
      </tr>`;
  }).join('');
}

function filterDocs() {
  const q = document.getElementById('doc-search')?.value.toLowerCase() || '';
  const filter = document.getElementById('doc-filter')?.value || 'all';
  let docs = DB.documents;
  if (q) docs = docs.filter(doc => {
    const d = getDriver(doc.driverId);
    return doc.type.toLowerCase().includes(q) ||
      `${d?.firstName} ${d?.lastName}`.toLowerCase().includes(q);
  });
  if (filter !== 'all') docs = docs.filter(doc => {
    const st = docStatus(doc);
    if (filter === 'urgent') return st.cls === 'chip-danger';
    if (filter === 'warn') return st.cls === 'chip-warn';
    if (filter === 'ok') return st.cls === 'chip-ok';
    return true;
  });
  renderDocuments(docs);
}

// ── Issues ──
function renderIssues() {
  const open = DB.issues.filter(i => i.status === 'open');
  const progress = DB.issues.filter(i => i.status === 'progress');
  const resolved = DB.issues.filter(i => i.status === 'resolved');

  const setCount = (id, n) => { const e = document.getElementById(id); if (e) e.textContent = n; };
  setCount('open-count', open.length);
  setCount('progress-count', progress.length);
  setCount('resolved-count', resolved.length);
  setCount('issues-badge', open.length + progress.length);
  setCount('issues-count', open.length);

  const renderCol = (colId, items) => {
    const el = document.getElementById(colId);
    if (!el) return;
    el.innerHTML = items.map(issue => {
      const d = getDriver(issue.driverId);
      const priCls = issue.priority === 'danger' ? 'chip-danger' : issue.priority === 'warn' ? 'chip-warn' : 'chip-info';
      const priLabel = issue.priority === 'danger' ? 'Urgent' : issue.priority === 'warn' ? 'Moyen' : 'Suivi';
      return `
        <div class="issue-card" onclick="openDriverProfile(${issue.driverId})">
          <div class="issue-card-title">${issue.title}</div>
          <div class="issue-card-driver">
            <div class="cell-ava" style="width:20px;height:20px;font-size:9px">${d?.initials}</div>
            ${d?.firstName} ${d?.lastName}
          </div>
          <p style="font-size:11px;color:var(--text2);line-height:1.4">${issue.desc.slice(0, 90)}…</p>
          <div class="issue-card-foot">
            <span class="issue-date">${issue.date}</span>
            <span class="chip ${priCls}" style="font-size:10px">${priLabel}</span>
          </div>
        </div>`;
    }).join('') || `<p style="font-size:12px;color:var(--text3);padding:8px 0">Aucun problème</p>`;
  };

  renderCol('issues-open', open);
  renderCol('issues-progress', progress);
  renderCol('issues-resolved', resolved);
}

// ── Profile ──
function renderProfile(driverId) {
  const d = getDriver(driverId);
  if (!d) return;
  const el = document.getElementById('profile-content');
  if (!el) return;

  const docs = getDocsByDriver(driverId);
  const urgentDoc = docs.find(doc => docStatus(doc).cls === 'chip-danger');
  const history = DB.history[driverId] || [];
  const balance = DB.leaveBalances.find(b => b.driverId === driverId);
  const pct = balance ? Math.round((balance.used / balance.total) * 100) : 0;
  const issues = DB.issues.filter(i => i.driverId === driverId && i.status !== 'resolved');

  const contractChip = d.contract === 'CDD'
    ? `<span class="chip chip-warn">CDD · exp. ${formatDate(d.contractEnd)}</span>`
    : `<span class="chip chip-ok">CDI</span>`;
  const statusChip = d.status === 'absent'
    ? `<span class="chip chip-info">Absent</span>`
    : `<span class="chip chip-ok">Actif</span>`;

  const alertBanner = urgentDoc ? `
    <div class="alert-banner">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style="flex-shrink:0"><circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="1.5"/><path d="M8 5v3M8 10.5v.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
      <span><strong>${urgentDoc.type}</strong> expire le ${formatDate(urgentDoc.expires)} — renouvellement requis immédiatement.</span>
    </div>` : '';

  el.innerHTML = `
    ${alertBanner}
    <div class="profile-hero">
      <div class="profile-ava">${d.initials}</div>
      <div>
        <div class="profile-name">${d.firstName} ${d.lastName}</div>
        <div class="profile-sub">Chauffeur · Permis ${d.licence} · ${d.vehicle}</div>
        <div class="profile-chips">${statusChip}${contractChip}<span class="chip chip-gray">${d.licence}</span></div>
      </div>
      <div class="profile-actions">
        <button class="btn-outline" onclick="showToast('Email envoyé à ${d.firstName}')">Envoyer email</button>
        <button class="btn-sm" onclick="openModal('add-issue')">Signaler problème</button>
      </div>
    </div>

    <div class="profile-grid">
      <div class="panel">
        <div class="panel-head"><h2>Informations personnelles</h2></div>
        <div class="info-item"><div class="info-label">Date de naissance</div><div class="info-value">${formatDate(d.birthDate)}</div></div>
        <div class="info-item"><div class="info-label">NISS</div><div class="info-value" style="font-family:'DM Mono',monospace;font-size:13px">${d.niss}</div></div>
        <div class="info-item"><div class="info-label">Adresse</div><div class="info-value">${d.address}</div></div>
        <div class="info-item"><div class="info-label">Téléphone</div><div class="info-value">${d.phone}</div></div>
        <div class="info-item"><div class="info-label">Email</div><div class="info-value" style="color:var(--info)">${d.email}</div></div>
      </div>

      <div class="panel">
        <div class="panel-head"><h2>Contrat & poste</h2></div>
        <div class="info-item"><div class="info-label">Type de contrat</div><div class="info-value">${d.contract}${d.contractEnd ? ' · jusqu\'au ' + formatDate(d.contractEnd) : ''}</div></div>
        <div class="info-item"><div class="info-label">Date d'entrée</div><div class="info-value">${formatDate(d.startDate)}</div></div>
        <div class="info-item"><div class="info-label">Ancienneté</div><div class="info-value">${Math.floor((new Date() - new Date(d.startDate)) / (365.25 * 24 * 3600 * 1000))} ans</div></div>
        <div class="info-item"><div class="info-label">Véhicule assigné</div><div class="info-value">${d.vehicle}</div></div>
        <div class="info-item"><div class="info-label">Catégorie permis</div><div class="info-value">${d.licence}</div></div>
        ${balance ? `
        <div class="info-item">
          <div class="info-label">Congés 2025</div>
          <div style="margin-top:4px">
            <div class="progress-wrap">
              <div class="progress-track"><div class="progress-fill" style="width:${pct}%"></div></div>
              <span style="font-size:11px;color:var(--text2)">${balance.used} / ${balance.total}j utilisés</span>
            </div>
          </div>
        </div>` : ''}
      </div>
    </div>

    <div class="panel" style="margin-bottom:16px">
      <div class="panel-head"><h2>Documents</h2><button class="btn-sm" onclick="openModal('add-doc')">+ Ajouter</button></div>
      <table class="data-table">
        <thead><tr><th>Document</th><th>Numéro</th><th>Émis le</th><th>Expire le</th><th>Statut</th><th></th></tr></thead>
        <tbody>
          ${docs.map(doc => {
            const st = docStatus(doc);
            return `
              <tr>
                <td style="font-weight:500">${doc.type}</td>
                <td style="font-family:'DM Mono',monospace;font-size:12px;color:var(--text2)">${doc.number}</td>
                <td>${formatDate(doc.issued)}</td>
                <td>${formatDate(doc.expires)}</td>
                <td><span class="chip ${st.cls}">${st.label}</span></td>
                <td><button class="btn-sm" onclick="showToast('Rappel envoyé')">Relancer</button></td>
              </tr>`;
          }).join('')}
        </tbody>
      </table>
    </div>

    ${issues.length > 0 ? `
    <div class="panel" style="margin-bottom:16px">
      <div class="panel-head"><h2>Problèmes ouverts</h2><span class="chip chip-danger">${issues.length}</span></div>
      ${issues.map(i => `
        <div class="alert-item">
          <div class="alert-dot ${i.priority}"></div>
          <div>
            <div class="alert-msg" style="font-weight:500">${i.title}</div>
            <div class="alert-meta" style="margin-top:3px;color:var(--text2);line-height:1.4">${i.desc}</div>
            <div class="alert-meta">${i.date} · ${i.category}</div>
          </div>
        </div>`).join('')}
    </div>` : ''}

    <div class="panel">
      <div class="panel-head"><h2>Historique RH</h2></div>
      ${history.map(h => `
        <div class="timeline-item">
          <div class="tl-dot ${h.type}"></div>
          <div>
            <div class="tl-msg">${h.msg}</div>
            <div class="tl-date">${h.date}</div>
          </div>
        </div>`).join('')}
    </div>
  `;
}

// ── Modals ──
const modalForms = {
  'add-driver': {
    title: 'Nouveau chauffeur',
    html: `
      <div class="form-grid">
        <div class="form-group"><label>Prénom</label><input type="text" placeholder="Prénom"></div>
        <div class="form-group"><label>Nom</label><input type="text" placeholder="Nom"></div>
      </div>
      <div class="form-grid">
        <div class="form-group"><label>Téléphone</label><input type="tel" placeholder="+32 4xx xx xx xx"></div>
        <div class="form-group"><label>Email</label><input type="email" placeholder="email@transport.be"></div>
      </div>
      <div class="form-grid">
        <div class="form-group"><label>Type de contrat</label><select><option>CDI</option><option>CDD</option><option>Intérim</option></select></div>
        <div class="form-group"><label>Catégorie permis</label><select><option>C</option><option>C+E</option><option>B</option></select></div>
      </div>
      <div class="form-group"><label>Véhicule assigné</label><input type="text" placeholder="ex. Mercedes Sprinter · BXL-492"></div>
      <div class="form-actions">
        <button class="btn-outline" onclick="closeModal()">Annuler</button>
        <button class="btn-primary" onclick="saveAndClose('Chauffeur ajouté avec succès')">Enregistrer</button>
      </div>`
  },
  'add-absence': {
    title: 'Nouvelle absence',
    html: `
      <div class="form-group"><label>Chauffeur</label><select>${DB.drivers.map(d => `<option value="${d.id}">${d.firstName} ${d.lastName}</option>`).join('')}</select></div>
      <div class="form-group"><label>Type d'absence</label><select><option>Congé annuel</option><option>Maladie</option><option>Récupération</option><option>Congé sans solde</option><option>Maternité / Paternité</option></select></div>
      <div class="form-grid">
        <div class="form-group"><label>Date de début</label><input type="date"></div>
        <div class="form-group"><label>Date de fin</label><input type="date"></div>
      </div>
      <div class="form-group"><label>Commentaire</label><textarea rows="2" placeholder="Remarques..."></textarea></div>
      <div class="form-actions">
        <button class="btn-outline" onclick="closeModal()">Annuler</button>
        <button class="btn-primary" onclick="saveAndClose('Absence enregistrée')">Enregistrer</button>
      </div>`
  },
  'add-doc': {
    title: 'Ajouter un document',
    html: `
      <div class="form-group"><label>Chauffeur</label><select>${DB.drivers.map(d => `<option value="${d.id}">${d.firstName} ${d.lastName}</option>`).join('')}</select></div>
      <div class="form-group"><label>Type de document</label><select><option>Permis de conduire</option><option>Carte conducteur</option><option>Contrat</option><option>Certificat médical</option><option>Autre</option></select></div>
      <div class="form-group"><label>Numéro</label><input type="text" placeholder="ex. BE-1234567"></div>
      <div class="form-grid">
        <div class="form-group"><label>Date d'émission</label><input type="date"></div>
        <div class="form-group"><label>Date d'expiration</label><input type="date"></div>
      </div>
      <div class="form-actions">
        <button class="btn-outline" onclick="closeModal()">Annuler</button>
        <button class="btn-primary" onclick="saveAndClose('Document enregistré')">Enregistrer</button>
      </div>`
  },
  'add-issue': {
    title: 'Signaler un problème',
    html: `
      <div class="form-group"><label>Chauffeur concerné</label><select>${DB.drivers.map(d => `<option value="${d.id}">${d.firstName} ${d.lastName}</option>`).join('')}</select></div>
      <div class="form-group"><label>Titre du problème</label><input type="text" placeholder="Décrivez le problème en quelques mots"></div>
      <div class="form-group"><label>Description</label><textarea rows="3" placeholder="Détails, contexte..."></textarea></div>
      <div class="form-grid">
        <div class="form-group"><label>Priorité</label><select><option value="warn">Moyen</option><option value="danger">Urgent</option><option value="info">Suivi</option></select></div>
        <div class="form-group"><label>Catégorie</label><select><option>Heures</option><option>Documents</option><option>Absence</option><option>Conduite</option><option>Autre</option></select></div>
      </div>
      <div class="form-actions">
        <button class="btn-outline" onclick="closeModal()">Annuler</button>
        <button class="btn-primary" onclick="saveAndClose('Problème signalé')">Enregistrer</button>
      </div>`
  }
};

function openModal(type) {
  const form = modalForms[type];
  if (!form) return;
  document.getElementById('modal-title').textContent = form.title;
  document.getElementById('modal-body').innerHTML = form.html;
  document.getElementById('modal-overlay').classList.add('open');
}

function closeModal() {
  document.getElementById('modal-overlay').classList.remove('open');
}

function saveAndClose(msg) {
  closeModal();
  showToast(msg);
}

// ── Toast ──
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2500);
}