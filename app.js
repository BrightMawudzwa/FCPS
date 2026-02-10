const form = document.getElementById('ticketForm');
const queueBody = document.getElementById('queueBody');
const rowTemplate = document.getElementById('rowTemplate');
const autoAssignBtn = document.getElementById('autoAssignBtn');
const languageSelect = document.getElementById('languageSelect');
const openCasesEl = document.getElementById('openCases');
const slaRiskEl = document.getElementById('slaRisk');
const aiInsightEl = document.getElementById('aiInsight');

const owners = ['Admissions Team', 'Finance Office', 'Dean of Students', 'Transport Desk', 'Athletics Director'];
let caseSeed = 1042;

const cases = [
  {
    id: 'CC-1040', family: 'Liu Family', student: 'Ethan Liu', category: 'Transportation',
    priority: 'High', sentiment: 'Concerned', owner: 'Transport Desk', status: 'In Progress'
  },
  {
    id: 'CC-1041', family: 'Garcia Family', student: 'Sofia Garcia', category: 'Billing',
    priority: 'Medium', sentiment: 'Neutral', owner: 'Finance Office', status: 'Open'
  }
];

function analyzeSentiment(text) {
  const lowered = text.toLowerCase();
  if (/(urgent|upset|frustrated|angry|immediately|not safe|asap)/.test(lowered)) return 'Concerned';
  if (/(thank|appreciate|great|happy)/.test(lowered)) return 'Positive';
  return 'Neutral';
}

function inferPriority(category, sentiment) {
  if (sentiment === 'Concerned' || category === 'Wellbeing') return 'High';
  if (category === 'Billing' || category === 'Transportation') return 'Medium';
  return 'Low';
}

function assignOwner(category) {
  const map = {
    Academics: 'Dean of Students',
    Billing: 'Finance Office',
    Transportation: 'Transport Desk',
    Wellbeing: 'Dean of Students',
    Athletics: 'Athletics Director'
  };
  return map[category] || owners[Math.floor(Math.random() * owners.length)];
}

function renderCases() {
  queueBody.innerHTML = '';
  for (const c of cases) {
    const clone = rowTemplate.content.cloneNode(true);
    clone.querySelector('.id').textContent = c.id;
    clone.querySelector('.family').textContent = c.family;
    clone.querySelector('.student').textContent = c.student;
    clone.querySelector('.category').textContent = c.category;

    const priority = clone.querySelector('.priority');
    priority.textContent = c.priority;
    priority.className = `pill priority priority-${c.priority.toLowerCase()}`;

    const sentiment = clone.querySelector('.sentiment');
    sentiment.textContent = c.sentiment;
    sentiment.className = `pill sentiment sentiment-${c.sentiment.toLowerCase()}`;

    clone.querySelector('.owner').textContent = c.owner;

    const statusSelect = clone.querySelector('.statusSelect');
    statusSelect.value = c.status;
    statusSelect.addEventListener('change', (e) => {
      c.status = e.target.value;
      refreshKpis();
    });

    queueBody.appendChild(clone);
  }
  refreshKpis();
}

function refreshKpis() {
  const open = cases.filter((c) => c.status !== 'Resolved').length;
  const risks = cases.filter((c) => c.priority === 'High' && c.status === 'Open').length;
  openCasesEl.textContent = String(open);
  slaRiskEl.textContent = String(risks);

  if (risks > 1) {
    aiInsightEl.textContent = 'AI Insight: Escalate to Dean and trigger SMS outreach for high-priority families.';
  } else if (open > 5) {
    aiInsightEl.textContent = 'AI Insight: Queue volume rising. Offer chatbot deflection for routine billing and transport FAQs.';
  } else {
    aiInsightEl.textContent = 'AI Insight: Great service pace. No urgent intervention needed.';
  }
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const data = new FormData(form);
  const message = data.get('message');
  const category = data.get('category');
  const sentiment = analyzeSentiment(message);
  const priority = inferPriority(category, sentiment);
  cases.unshift({
    id: `CC-${caseSeed++}`,
    family: `${data.get('name')} Family`,
    student: data.get('student'),
    category,
    priority,
    sentiment,
    owner: 'Unassigned',
    status: 'Open'
  });
  renderCases();
  form.reset();
});

autoAssignBtn.addEventListener('click', () => {
  cases.forEach((c) => {
    if (c.owner === 'Unassigned') c.owner = assignOwner(c.category);
  });
  renderCases();
});

languageSelect.addEventListener('change', () => {
  const lang = languageSelect.value;
  document.documentElement.lang = lang;
  if (lang === 'es') {
    aiInsightEl.textContent = 'Perspectiva IA: Ritmo de servicio excelente. No se necesita intervención urgente.';
  } else if (lang === 'fr') {
    aiInsightEl.textContent = 'Aperçu IA : excellent rythme de service. Aucune intervention urgente nécessaire.';
  } else {
    refreshKpis();
  }
});

renderCases();
