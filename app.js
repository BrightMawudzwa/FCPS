const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('loginError');
const loginCard = document.getElementById('loginCard');
const dashboard = document.getElementById('dashboard');
const logoutBtn = document.getElementById('logoutBtn');
const sessionLabel = document.getElementById('sessionLabel');

const educatorPanel = document.getElementById('educatorPanel');
const studentPanel = document.getElementById('studentPanel');
const taskForm = document.getElementById('taskForm');
const educatorTasksEl = document.getElementById('educatorTasks');
const studentTasksEl = document.getElementById('studentTasks');
const taskTemplate = document.getElementById('taskCardTemplate');

const taskCountEl = document.getElementById('taskCount');
const submissionCountEl = document.getElementById('submissionCount');
const feedbackCountEl = document.getElementById('feedbackCount');

const users = [
  { role: 'educator', email: 'ava.teacher@fcps.edu', password: 'teach123', name: 'Ava Teacher' },
  { role: 'student', email: 'liam.student@fcps.edu', password: 'learn123', name: 'Liam Student' },
  { role: 'student', email: 'zoe.student@fcps.edu', password: 'learn123', name: 'Zoe Student' }
];

let taskSeed = 3;
let currentUser = null;

const tasks = [
  {
    id: 1,
    type: 'Exercise',
    title: 'Grammar Skills: Verb Tenses',
    instructions: 'Complete section A and B in your notebook and submit your answers.',
    dueDate: '2026-03-15',
    educator: 'Ava Teacher',
    submissions: [
      {
        studentEmail: 'liam.student@fcps.edu',
        studentName: 'Liam Student',
        response: 'Completed both sections and added examples for each tense.',
        feedback: 'Great detail and clear examples. Review irregular verbs once more.'
      }
    ]
  },
  {
    id: 2,
    type: 'Assignment',
    title: 'Science Report: Water Cycle',
    instructions: 'Prepare a one-page report and include a labeled diagram.',
    dueDate: '2026-03-18',
    educator: 'Ava Teacher',
    submissions: []
  }
];

function refreshSummary() {
  const totalSubmissions = tasks.reduce((sum, task) => sum + task.submissions.length, 0);
  const totalFeedback = tasks.reduce(
    (sum, task) => sum + task.submissions.filter((submission) => submission.feedback).length,
    0
  );

  taskCountEl.textContent = String(tasks.length);
  submissionCountEl.textContent = String(totalSubmissions);
  feedbackCountEl.textContent = String(totalFeedback);
}

function formatDueDate(dateValue) {
  return new Date(dateValue).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

function renderEducatorView() {
  educatorTasksEl.innerHTML = '';

  if (!tasks.length) {
    educatorTasksEl.innerHTML = '<p>No tasks uploaded yet.</p>';
    return;
  }

  tasks.forEach((task) => {
    const card = taskTemplate.content.cloneNode(true);
    card.querySelector('.task-title').textContent = task.title;
    card.querySelector('.task-type').textContent = task.type;
    card.querySelector('.task-type').classList.add(`type-${task.type.toLowerCase()}`);
    card.querySelector('.task-meta').textContent = `Due: ${formatDueDate(task.dueDate)} · Uploaded by ${task.educator}`;
    card.querySelector('.task-instructions').textContent = task.instructions;

    const submissionArea = card.querySelector('.submission-area');
    const feedbackList = card.querySelector('.feedback-list');

    if (!task.submissions.length) {
      submissionArea.innerHTML = '<p class="muted">No student submissions yet.</p>';
    } else {
      task.submissions.forEach((submission, index) => {
        const block = document.createElement('div');
        block.className = 'submission-block';
        block.innerHTML = `
          <p><strong>${submission.studentName}</strong> submitted:</p>
          <p>${submission.response}</p>
        `;

        const feedbackForm = document.createElement('form');
        feedbackForm.className = 'stacked feedback-form';
        feedbackForm.innerHTML = `
          <label>Educator Feedback
            <textarea name="feedback" rows="2" placeholder="Write feedback for this student...">${submission.feedback || ''}</textarea>
          </label>
          <button type="submit">Save Feedback</button>
        `;

        feedbackForm.addEventListener('submit', (event) => {
          event.preventDefault();
          const feedback = new FormData(feedbackForm).get('feedback').toString().trim();
          task.submissions[index].feedback = feedback;
          renderApp();
        });

        block.appendChild(feedbackForm);
        submissionArea.appendChild(block);
      });
    }

    feedbackList.innerHTML = `<p class="muted">Feedback shared: ${task.submissions.filter((s) => s.feedback).length}</p>`;
    educatorTasksEl.appendChild(card);
  });
}

function renderStudentView() {
  studentTasksEl.innerHTML = '';

  tasks.forEach((task) => {
    const card = taskTemplate.content.cloneNode(true);
    card.querySelector('.task-title').textContent = task.title;
    card.querySelector('.task-type').textContent = task.type;
    card.querySelector('.task-type').classList.add(`type-${task.type.toLowerCase()}`);
    card.querySelector('.task-meta').textContent = `Due: ${formatDueDate(task.dueDate)} · Educator: ${task.educator}`;
    card.querySelector('.task-instructions').textContent = task.instructions;

    const submissionArea = card.querySelector('.submission-area');
    const feedbackList = card.querySelector('.feedback-list');

    const submission = task.submissions.find((entry) => entry.studentEmail === currentUser.email);

    const submitForm = document.createElement('form');
    submitForm.className = 'stacked';
    submitForm.innerHTML = `
      <label>Your Response
        <textarea name="response" rows="3" placeholder="Submit your work or answers here...">${submission?.response || ''}</textarea>
      </label>
      <button type="submit">${submission ? 'Update Submission' : 'Submit Task'}</button>
    `;

    submitForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const response = new FormData(submitForm).get('response').toString().trim();
      if (!response) return;

      if (submission) {
        submission.response = response;
      } else {
        task.submissions.push({
          studentEmail: currentUser.email,
          studentName: currentUser.name,
          response,
          feedback: ''
        });
      }
      renderApp();
    });

    submissionArea.appendChild(submitForm);

    feedbackList.innerHTML = submission?.feedback
      ? `<p class="feedback">Educator Feedback: ${submission.feedback}</p>`
      : '<p class="muted">No feedback yet.</p>';

    studentTasksEl.appendChild(card);
  });
}

function renderApp() {
  refreshSummary();
  if (!currentUser) return;

  const isEducator = currentUser.role === 'educator';
  educatorPanel.hidden = !isEducator;
  studentPanel.hidden = isEducator;

  if (isEducator) {
    renderEducatorView();
  } else {
    renderStudentView();
  }
}

loginForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const data = new FormData(loginForm);
  const role = data.get('role');
  const email = data.get('email').toString().trim().toLowerCase();
  const password = data.get('password').toString();

  const foundUser = users.find((user) => user.role === role && user.email === email && user.password === password);

  if (!foundUser) {
    loginError.hidden = false;
    loginError.textContent = 'Invalid credentials. Please use one of the demo accounts.';
    return;
  }

  currentUser = foundUser;
  loginError.hidden = true;
  loginCard.hidden = true;
  dashboard.hidden = false;
  logoutBtn.hidden = false;
  sessionLabel.textContent = `Logged in as ${currentUser.name} (${currentUser.role})`;

  renderApp();
});

logoutBtn.addEventListener('click', () => {
  currentUser = null;
  loginCard.hidden = false;
  dashboard.hidden = true;
  logoutBtn.hidden = true;
  sessionLabel.textContent = 'Not logged in';
  loginForm.reset();
});

taskForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const data = new FormData(taskForm);
  tasks.unshift({
    id: taskSeed++,
    type: data.get('type').toString(),
    title: data.get('title').toString().trim(),
    instructions: data.get('instructions').toString().trim(),
    dueDate: data.get('dueDate').toString(),
    educator: currentUser.name,
    submissions: []
  });

  taskForm.reset();
  renderApp();
});

refreshSummary();
