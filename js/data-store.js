(function () {
  const KEY = 'campuscare-state-v2';
  const defaults = {
    counter: 1008,
    language: 'en',
    queue: [
      { id:'CC-1007', family:'Patel Family', student:'N. Patel (Grade 4)', topic:'Transportation', priority:'Low', status:'Open', owner:'Operations Desk', sentiment:'Calm', minutesOpen:15 },
      { id:'CC-1006', family:'Garcia Family', student:'M. Garcia (Grade 10)', topic:'Academic Concern', priority:'Medium', status:'In Progress', owner:'Dean of Academics', sentiment:'Moderate Concern', minutesOpen:73 }
    ]
  };
  const clone = (obj) => JSON.parse(JSON.stringify(obj));
  const read = () => {
    try { return JSON.parse(localStorage.getItem(KEY)) || clone(defaults); }
    catch { return clone(defaults); }
  };
  const write = (state) => localStorage.setItem(KEY, JSON.stringify(state));
  const getState = () => read();
  const setLanguage = (language) => { const s = read(); s.language = language; write(s); };
  const addTicket = (ticket) => {
    const s = read();
    const id = `CC-${s.counter}`;
    s.counter += 1;
    s.queue.unshift({ ...ticket, id });
    write(s);
    return id;
  };
  const updateStatus = (id, status) => { const s = read(); const f = s.queue.find(x => x.id === id); if (f) f.status = status; write(s); };
  const ageQueue = () => { const s = read(); s.queue.forEach(i => { if (i.status !== 'Resolved') i.minutesOpen += 1; }); write(s); };
  window.CampusStore = { getState, setLanguage, addTicket, updateStatus, ageQueue };
})();
