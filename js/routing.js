(function () {
  const owners = {
    'Academic Concern': 'Dean of Academics',
    'Billing & Tuition': 'Finance Office',
    'Counseling Request': 'School Counselor',
    'Transportation': 'Operations Desk',
    'Schedule Change': 'Registrar'
  };
  const assignOwner = (topic, priority) => {
    const base = owners[topic] || 'Family Liaison';
    return priority === 'High' ? `${base} + Head of School` : base;
  };
  window.CampusRouting = { assignOwner };
})();
