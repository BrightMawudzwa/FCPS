(function () {
  const urgent = ['urgent', 'immediately', 'today', 'asap', 'safety', 'bullying', 'crisis'];
  const concern = ['worried', 'anxious', 'struggling', 'drop', 'decline', 'frustrated'];
  const positive = ['thanks', 'grateful', 'appreciate', 'happy'];
  const analyzeSentiment = (text = '') => {
    const s = text.toLowerCase();
    let score = 0;
    concern.forEach((w) => s.includes(w) && (score -= 2));
    urgent.forEach((w) => s.includes(w) && (score -= 3));
    positive.forEach((w) => s.includes(w) && (score += 2));
    if (score <= -6) return 'High Concern';
    if (score <= -2) return 'Moderate Concern';
    return 'Calm';
  };
  const inferPriority = (topic, details = '') => {
    const s = details.toLowerCase();
    if (urgent.some((w) => s.includes(w)) || topic === 'Counseling Request') return 'High';
    if (['Academic Concern', 'Billing & Tuition'].includes(topic)) return 'Medium';
    return 'Low';
  };
  window.CampusAI = { analyzeSentiment, inferPriority };
})();
