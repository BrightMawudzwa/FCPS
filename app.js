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
    fileName: 'verb-tenses-exercise.pdf',
    fileType: 'PDF',
    instructions: 'Complete section A and B in your notebook and submit your file.',
    dueDate: '2026-03-15',
    educator: 'Ava Teacher',
    submissions: [
      {
        studentEmail: 'liam.student@fcps.edu',
        studentName: 'Liam Student',
        comment: 'I have attached my completed worksheet.',
        fileName: 'liam-verb-tenses.docx',
        feedback: 'Great detail and clear examples. Review irregular verbs once more.'
      }
    ]
  },
  {
    id: 2,
    type: 'Assignment',
    title: 'Science Report: Water Cycle',
    fileName: 'water-cycle-assignment.docx',
    fileType: 'Word',
    instructions: 'Prepare a one-page report and include a labeled diagram.',
    dueDate: '2026-03-18',
    educator: 'Ava Teacher',
    submissions: []
  }
];

function fileKind(name = '') {
  const lowered = name.toLowerCase();
  if (lowered.endsWith('.pdf')) return 'PDF';
  return 'Word';
}

function refreshSummary() {
  const totalSubmissions = tasks.reduce((sum, task) => sum + task.submissions.length, 0);
  const totalFeedback = tasks.reduce((sum, task) => sum + task.submissions.filter((s) => s.feedback).length, 0);

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

function baseTaskCard(task, metaLabel) {
  const card = taskTemplate.content.cloneNode(true);
  card.querySelector('.task-title').textContent = task.title;
  card.querySelector('.task-type').textContent = task.type;
  card.querySelector('.task-type').classList.add(`type-${task.type.toLowerCase()}`);
  card.querySelector('.task-meta').textContent = `Due: ${formatDueDate(task.dueDate)} · ${metaLabel}: ${task.educator}`;
  card.querySelector('.task-file').textContent = `Task file: ${task.fileName} (${task.fileType})`;
  card.querySelector('.task-instructions').textContent = `Instructions / Comments: ${task.instructions}`;
  return card;
}

function renderEducatorView() {
  educatorTasksEl.innerHTML = '';

  if (!tasks.length) {
    educatorTasksEl.innerHTML = '<p>No tasks uploaded yet.</p>';
    return;
  }

  tasks.forEach((task) => {
    const card = baseTaskCard(task, 'Uploaded by');
    const submissionArea = card.querySelector('.submission-area');
    const feedbackList = card.querySelector('.feedback-list');

    if (!task.submissions.length) {
      submissionArea.innerHTML = '<p class="muted">No student submissions yet.</p>';
    } else {
      task.submissions.forEach((submission, index) => {
        const block = document.createElement('div');
        block.className = 'submission-block';
        block.innerHTML = `
          <p><strong>${submission.studentName}</strong> submitted <strong>${submission.fileName || 'no file'}</strong>.</p>
          <p>Student comment: ${submission.comment || 'No comment added.'}</p>
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
    const card = baseTaskCard(task, 'Educator');
    const submissionArea = card.querySelector('.submission-area');
    const feedbackList = card.querySelector('.feedback-list');

    const submission = task.submissions.find((entry) => entry.studentEmail === currentUser.email);

    const submitForm = document.createElement('form');
    submitForm.className = 'stacked';
    submitForm.innerHTML = `
      <label>Completed File (PDF or Word)
        <input type="file" name="submissionFile" accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" ${submission ? '' : 'required'} />
      </label>
      <label>Submission Comment
        <textarea name="comment" rows="2" placeholder="Add comments for your teacher...">${submission?.comment || ''}</textarea>
      </label>
      <button type="submit">${submission ? 'Update Submission' : 'Submit Task'}</button>
    `;

    submitForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const data = new FormData(submitForm);
      const comment = data.get('comment').toString().trim();
      const upload = data.get('submissionFile');
      const hasUpload = upload && typeof upload === 'object' && upload.name;

      if (!hasUpload && !submission) return;

      if (submission) {
        submission.comment = comment;
        if (hasUpload) submission.fileName = upload.name;
      } else {
        task.submissions.push({
          studentEmail: currentUser.email,
          studentName: currentUser.name,
          comment,
          fileName: upload.name,
          feedback: ''
        });
      }

      renderApp();
    });

    submissionArea.appendChild(submitForm);

    feedbackList.innerHTML = `
      <p class="muted">Your latest file: ${submission?.fileName || 'No submission yet.'}</p>
      ${submission?.feedback ? `<p class="feedback">Educator Feedback: ${submission.feedback}</p>` : '<p class="muted">No feedback yet.</p>'}
    `;

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
  const taskUpload = data.get('taskFile');
  if (!taskUpload || typeof taskUpload !== 'object' || !taskUpload.name) return;

  tasks.unshift({
    id: taskSeed++,
    type: data.get('type').toString(),
    title: data.get('title').toString().trim(),
    fileName: taskUpload.name,
    fileType: fileKind(taskUpload.name),
    instructions: data.get('instructions').toString().trim(),
    dueDate: data.get('dueDate').toString(),
    educator: currentUser.name,
    submissions: []
  });

  taskForm.reset();
  renderApp();
});

refreshSummary();
