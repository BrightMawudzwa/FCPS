(function () {
  const copy = {
    en: { subtitle: 'Private School Family Support Hub', sla: 'SLA monitor', stable: 'Stable' },
    es: { subtitle: 'Centro de Apoyo Familiar del Colegio', sla: 'Monitor SLA', stable: 'Estable' },
    fr: { subtitle: "Centre de Soutien Familial de l'École", sla: 'Surveillance SLA', stable: 'Stable' }
  };
  const getCopy = (lang) => copy[lang] || copy.en;

  const renderHeader = () => {
    const state = window.CampusStore.getState();
    const t = getCopy(state.language);
    const subtitle = document.getElementById('subtitleText');
    const language = document.getElementById('language');
    if (subtitle) subtitle.textContent = t.subtitle;
    if (language) language.value = state.language;
  };

  const bindLanguage = () => {
    const el = document.getElementById('language');
    if (!el) return;
    el.addEventListener('change', (e) => {
      window.CampusStore.setLanguage(e.target.value);
      renderHeader();
    });
  };

  const nav = () => {
    const path = location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav a').forEach((a) => {
      if (a.getAttribute('href') === path) a.classList.add('active');
    });
  };

  const kpis = () => {
    const board = document.getElementById('kpiBoard');
    if (!board) return;
    const state = window.CampusStore.getState();
    const t = getCopy(state.language);
    const q = state.queue;
    const total = q.length;
    const high = q.filter((i) => i.priority === 'High').length;
    const resolved = q.filter((i) => i.status === 'Resolved').length;
    const avgOpen = Math.round(q.reduce((sum, i) => sum + i.minutesOpen, 0) / (total || 1));
    const risk = q.some((i) => i.priority === 'High' && i.minutesOpen > 60);
    const tiles = [
      ['Active Cases', total, 'Current family requests'],
      ['High Priority', high, 'Needs fast intervention'],
      ['Resolved Today', resolved, 'Closed with follow-up'],
      ['Avg Open Time', `${avgOpen}m`, 'Queue aging']
    ];
    board.innerHTML = tiles.map(([label, value, hint]) => `<section class="kpi"><div class="kpi__label">${label}</div><div class="kpi__value">${value}</div><div class="kpi__hint">${hint}</div></section>`).join('');
    const sla = document.getElementById('slaStatus');
    if (sla) sla.innerHTML = `${t.sla}: <span class="badge ${risk ? 'badge--risk' : 'badge--safe'}">${risk ? 'At Risk' : t.stable}</span>`;
  };

  const queue = (targetId, maxItems) => {
    const list = document.getElementById(targetId);
    if (!list) return;
    const state = window.CampusStore.getState();
    const data = maxItems ? state.queue.slice(0, maxItems) : state.queue;
    const pClass = (p) => `badge--${p.toLowerCase()}`;
    const sClass = (s) => `badge--${s.toLowerCase().replace(' ', '-')}`;
    list.innerHTML = data.map((item) => `
      <li class="queue-item">
        <div class="queue-item__head">
          <p class="queue-item__title">${item.id} • ${item.family}</p>
          <div class="row"><span class="badge ${pClass(item.priority)}">${item.priority}</span><span class="badge ${sClass(item.status)}">${item.status}</span></div>
        </div>
        <div class="queue-item__meta">${item.student} • ${item.topic}<br>Owner: ${item.owner} • Sentiment: ${item.sentiment} • Open: ${item.minutesOpen}m</div>
        <div class="row" style="margin-top:.55rem;">
          <button data-act="start" data-id="${item.id}">Start</button>
          <button data-act="resolve" data-id="${item.id}">Resolve</button>
        </div>
      </li>`).join('');
    list.querySelectorAll('button[data-id]').forEach((btn) => {
      btn.addEventListener('click', () => {
        window.CampusStore.updateStatus(btn.dataset.id, btn.dataset.act === 'resolve' ? 'Resolved' : 'In Progress');
        queue(targetId, maxItems);
        kpis();
      });
    });
  };

  window.CampusUI = { renderHeader, bindLanguage, nav, kpis, queue };
})();
