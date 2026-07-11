const form = document.querySelector('#kisForm');
const summary = document.querySelector('#summary');
const copyBtn = document.querySelector('#copyBtn');
const downloadBtn = document.querySelector('#downloadBtn');
const csvBtn = document.querySelector('#csvBtn');
const completionText = document.querySelector('#completionText');
const completionDot = document.querySelector('#completionDot');

const fieldLabels = {
  caseId: 'Fall-ID / Pseudonym',
  entryDate: 'Erfassungsdatum',
  diagnosisConfirmed: 'Diagnosesicherung',
  histology: 'Histologie',
  distanceAnalVerge: 'Tumorabstand ab ano',
  cea: 'CEA',
  diagnosticNotes: 'Diagnostik-Bemerkungen',
  ct: 'cT',
  cn: 'cN',
  cm: 'cM',
  mrf: 'MRF/CRM',
  emvi: 'EMVI',
  sphincter: 'Sphinkter-/Levatorbezug',
  recommendation: 'Primäre Empfehlung',
  operationPlanned: 'OP-Verfahren geplant',
  boardDecision: 'Tumorboard-Beschluss',
  therapyStatus: 'Therapiestatus',
  operationDate: 'OP-Datum',
  rStatus: 'R-Status',
  pt: 'yp/pT',
  pn: 'yp/pN',
  trg: 'Regression/TRG',
  followUpDate: 'Nächster Kontrolltermin',
  followUpPlan: 'Nachsorgeplan',
  openIssues: 'Offene Punkte'
};

const csvFieldOrder = Object.keys(fieldLabels);

const piiPatterns = [
  { name: 'Geburtsdatum', regex: /\b(?:0?[1-9]|[12][0-9]|3[01])[./-](?:0?[1-9]|1[0-2])[./-](?:19|20)\d{2}\b/ },
  { name: 'Versichertennummer', regex: /\b[A-Z][0-9]{9}\b/ },
  { name: 'Telefonnummer', regex: /\b(?:\+49|0)[\d\s()/.-]{7,}\b/ },
  { name: 'E-Mail-Adresse', regex: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i }
];

function formDataToObject() {
  return Object.fromEntries(new FormData(form).entries());
}

function formatValue(value, suffix = '') {
  const trimmed = String(value || '').trim();
  return trimmed ? `${trimmed}${suffix}` : '—';
}

function buildSummary(data) {
  const staging = [data.ct, data.cn, data.cm].filter(Boolean).join(' ');
  return [
    'Rektumkarzinom – strukturierte KIS-Zusammenfassung',
    '=================================================',
    `Fall-ID/Pseudonym: ${formatValue(data.caseId)}`,
    `Erfassungsdatum: ${formatValue(data.entryDate)}`,
    '',
    'Diagnostik',
    `- Diagnosesicherung: ${formatValue(data.diagnosisConfirmed)}`,
    `- Histologie: ${formatValue(data.histology)}`,
    `- Tumorabstand ab ano: ${formatValue(data.distanceAnalVerge, ' cm')}`,
    `- CEA: ${formatValue(data.cea, ' ng/ml')}`,
    `- Bemerkungen: ${formatValue(data.diagnosticNotes)}`,
    '',
    'Staging / MRT',
    `- Klinisches Stadium: ${formatValue(staging)}`,
    `- MRF/CRM: ${formatValue(data.mrf)}`,
    `- EMVI: ${formatValue(data.emvi)}`,
    `- Sphinkter-/Levatorbezug: ${formatValue(data.sphincter)}`,
    '',
    'Therapieplanung',
    `- Empfehlung: ${formatValue(data.recommendation)}`,
    `- OP-Verfahren geplant: ${formatValue(data.operationPlanned)}`,
    `- Tumorboard-Beschluss: ${formatValue(data.boardDecision)}`,
    '',
    'Verlauf / OP / Pathologie',
    `- Therapiestatus: ${formatValue(data.therapyStatus)}`,
    `- OP-Datum: ${formatValue(data.operationDate)}`,
    `- R-Status: ${formatValue(data.rStatus)}`,
    `- yp/pT: ${formatValue(data.pt)}`,
    `- yp/pN: ${formatValue(data.pn)}`,
    `- Regression/TRG: ${formatValue(data.trg)}`,
    '',
    'Nachsorge',
    `- Nächster Kontrolltermin: ${formatValue(data.followUpDate)}`,
    `- Plan: ${formatValue(data.followUpPlan)}`,
    `- Offene Punkte: ${formatValue(data.openIssues)}`
  ].join('\n');
}

function detectPotentialPii(data) {
  const findings = [];
  Object.entries(data).forEach(([key, value]) => {
    if (!value) return;
    piiPatterns.forEach(pattern => {
      if (pattern.regex.test(value)) {
        findings.push(`${fieldLabels[key] || key}: mögliches ${pattern.name}`);
      }
    });
  });
  return findings;
}

function validateForm() {
  const requiredFields = Array.from(form.querySelectorAll('[required]'));
  let firstInvalid = null;

  requiredFields.forEach(field => {
    const invalid = !field.value.trim();
    field.classList.toggle('invalid', invalid);
    if (invalid && !firstInvalid) firstInvalid = field;
  });

  if (firstInvalid) {
    firstInvalid.focus();
    return false;
  }

  const findings = detectPotentialPii(formDataToObject());
  if (findings.length > 0) {
    alert(`Bitte vor der Ausgabe prüfen: Es wurden potenzielle personenbezogene Daten erkannt.\n\n${findings.join('\n')}`);
    return false;
  }

  return true;
}

function updateCompletion() {
  const requiredFields = Array.from(form.querySelectorAll('[required]'));
  const completed = requiredFields.filter(field => field.value.trim()).length;
  const percent = requiredFields.length === 0 ? 100 : Math.round((completed / requiredFields.length) * 100);

  completionText.textContent = `${percent}% vollständig`;
  completionDot.className = 'status-dot';
  if (percent === 100) completionDot.classList.add('complete');
  else if (percent > 0) completionDot.classList.add('partial');
}

function safeFileId(data) {
  return (data.caseId || 'fall').replace(/[^a-z0-9_-]/gi, '_');
}

function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function downloadJson(data) {
  const payload = {
    schema: 'rektumkarzinom-kis-eingabemaske/v1',
    exportedAt: new Date().toISOString(),
    data
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  triggerDownload(blob, `${safeFileId(data)}_rektumca_kis.json`);
}

function escapeCsvValue(value) {
  const normalized = String(value || '').replace(/[\r\n]+/g, ' ').trim();
  return `"${normalized.replace(/"/g, '""')}"`;
}

function buildCsv(data) {
  const columns = ['schema', 'exportedAt', ...csvFieldOrder];
  const row = [
    'rektumkarzinom-kis-eingabemaske/v1',
    new Date().toISOString(),
    ...csvFieldOrder.map(field => data[field] || '')
  ];

  return [columns, row]
    .map(values => values.map(escapeCsvValue).join(';'))
    .join('\r\n');
}

function downloadCsv(data) {
  const csvWithBom = `\ufeff${buildCsv(data)}`;
  const blob = new Blob([csvWithBom], { type: 'text/csv;charset=utf-8' });
  triggerDownload(blob, `${safeFileId(data)}_rektumca_kis.csv`);
}

form.addEventListener('submit', event => {
  event.preventDefault();
  if (!validateForm()) return;
  summary.textContent = buildSummary(formDataToObject());
});

form.addEventListener('input', updateCompletion);
form.addEventListener('change', updateCompletion);
form.addEventListener('reset', () => {
  setTimeout(() => {
    summary.textContent = 'Noch keine Zusammenfassung erzeugt.';
    form.querySelectorAll('.invalid').forEach(field => field.classList.remove('invalid'));
    updateCompletion();
  });
});

copyBtn.addEventListener('click', async () => {
  if (summary.textContent.startsWith('Noch keine')) {
    if (!validateForm()) return;
    summary.textContent = buildSummary(formDataToObject());
  }
  await navigator.clipboard.writeText(summary.textContent);
  copyBtn.textContent = 'Kopiert';
  setTimeout(() => { copyBtn.textContent = 'Zusammenfassung kopieren'; }, 1400);
});

downloadBtn.addEventListener('click', () => {
  if (!validateForm()) return;
  const data = formDataToObject();
  summary.textContent = buildSummary(data);
  downloadJson(data);
});

csvBtn.addEventListener('click', () => {
  if (!validateForm()) return;
  const data = formDataToObject();
  summary.textContent = buildSummary(data);
  downloadCsv(data);
});

const today = new Date().toISOString().slice(0, 10);
form.elements.entryDate.value = today;
updateCompletion();
