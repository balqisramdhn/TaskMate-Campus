// ══════════════════════════════════════════════════════
//  TaskMate Campus — app.js
// ══════════════════════════════════════════════════════

function saveToStorage() {
  localStorage.setItem('tm_tasks', JSON.stringify(tasks));
  localStorage.setItem('tm_accounts', JSON.stringify(accounts));
  localStorage.setItem('tm_currentUser', JSON.stringify(currentUser));
}

function loadFromStorage() {
  const t = localStorage.getItem('tm_tasks');
  const a = localStorage.getItem('tm_accounts');
  const u = localStorage.getItem('tm_currentUser');

  if (t) tasks = JSON.parse(t);
  if (a) accounts = JSON.parse(a);
  if (u) currentUser = JSON.parse(u);
}

// ── DATA ────────────────────────────────────────────────
let tasks = [
  { id:1, name:'Prototipe Aplikasi IMK',  course:'IMK (Interaksi Manusia Komputer)', priority:'high',   status:'inprogress', deadline:'2024-12-20', note:'Buat prototype UCD',    done:false },
  { id:2, name:'UTS Pemrograman Web',     course:'Pemrograman Web',                  priority:'high',   status:'todo',       deadline:'2024-12-18', note:'Review materi HTML/CSS', done:false },
  { id:3, name:'Laporan Basis Data',      course:'Basis Data Lanjut',                priority:'medium', status:'todo',       deadline:'2024-12-22', note:'ERD dan normalisasi',    done:false },
  { id:4, name:'Presentasi PPT IMK',      course:'IMK (Interaksi Manusia Komputer)', priority:'medium', status:'done',       deadline:'2024-12-15', note:'15 slide',               done:true  },
  { id:5, name:'Quiz Jaringan Komputer',  course:'Jaringan Komputer',                priority:'low',    status:'done',       deadline:'2024-12-12', note:'',                       done:true  },
  { id:6, name:'Review Jurnal KA',        course:'Kecerdasan Buatan',                priority:'medium', status:'todo',       deadline:'2024-12-25', note:'',                       done:false },
  { id:7, name:'Bab 3 Skripsi',           course:'Skripsi',                          priority:'high',   status:'inprogress', deadline:'2025-01-10', note:'Metodologi penelitian',  done:false },
  { id:8, name:'Tugas Individu PW',       course:'Pemrograman Web',                  priority:'low',    status:'todo',       deadline:'2024-12-28', note:'',                       done:false },
];
let nextId = 9;
let editId = null;
let currentFilter = 'all';

// Akun pengguna yang terdaftar (simulasi database)
let accounts = [
  { email: 'siti@mahasiswa.uniba.ac.id', password: '123456', nim: '2021110042', name: 'Siti Aminah', prodi: 'Teknik Informatika', semester: '6' }
];

// Akun yang sedang login
let currentUser = null;

// ── UTILS ─────────────────────────────────────────────
function fmt(dateStr) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return d.toLocaleDateString('id-ID', { day:'numeric', month:'short', year:'numeric' });
}
function daysLeft(dateStr) {
  const diff = new Date(dateStr) - new Date();
  return Math.ceil(diff / 86400000);
}
function priorityBadge(p) {
  const m = { high:'badge-high', medium:'badge-medium', low:'badge-low' };
  const l = { high:'High', medium:'Medium', low:'Low' };
  return `<span class="badge ${m[p]}">${l[p]}</span>`;
}
function statusBadge(s) {
  const m = { done:'badge-done', inprogress:'badge-prog', todo:'badge-todo' };
  const l = { done:'Selesai', inprogress:'Dikerjakan', todo:'Belum' };
  return `<span class="badge ${m[s]}">${l[s]}</span>`;
}
function getInitials(name) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

function updateStats() {
  const total = tasks.length;
  const done  = tasks.filter(t => t.done).length;
  const pend  = total - done;
  document.getElementById('statTotal').textContent   = total;
  document.getElementById('statDone').textContent    = done;
  document.getElementById('statPending').textContent = pend;
  document.getElementById('taskBadge').textContent   = pend;
  document.getElementById('rptDone').textContent     = done;
  document.getElementById('rptPending').textContent  = pend;
  document.getElementById('rptPct').textContent      = total ? Math.round(done/total*100)+'%' : '0%';
  const heroE = Math.round((done/Math.max(total,1))*100 + 40);
  document.getElementById('heroEfficiency').textContent = Math.min(heroE,99)+'%';
}

// ── TOAST ─────────────────────────────────────────────
function showToast(msg, type='info') {
  const icons = { success:'✅', error:'❌', warning:'⚠️', info:'ℹ️' };
  const c = document.getElementById('toastContainer');
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.innerHTML = `<span>${icons[type]||'ℹ️'}</span><span>${msg}</span>`;
  c.appendChild(t);
  setTimeout(() => {
    t.style.animation = 'slideOut .3s ease forwards';
    setTimeout(() => t.remove(), 300);
  }, 3000);
}

// ── LOGIN / LOGOUT ─────────────────────────────────────
function doLogin() {
  const email = document.getElementById('loginEmail').value.trim();
  const pass  = document.getElementById('loginPass').value;
  let ok = true;
  saveToStorage();

  const errEmail  = document.getElementById('errEmail');
  const emailInput = document.getElementById('loginEmail');
  if (!email || !email.includes('@')) {
    errEmail.classList.add('show');
    emailInput.classList.add('invalid');
    ok = false;
  } else {
    errEmail.classList.remove('show');
    emailInput.classList.remove('invalid');
  }

  const errPass  = document.getElementById('errPass');
  const passInput = document.getElementById('loginPass');
  if (pass.length < 6) {
    errPass.classList.add('show');
    passInput.classList.add('invalid');
    ok = false;
  } else {
    errPass.classList.remove('show');
    passInput.classList.remove('invalid');
  }

  if (!ok) return;

  // Cek akun terdaftar
  const found = accounts.find(a => a.email === email && a.password === pass);
  if (!found) {
    errEmail.textContent = '⚠ Email atau password salah!';
    errEmail.classList.add('show');
    emailInput.classList.add('invalid');
    passInput.classList.add('invalid');
    return;
  }

  // Reset error
  errEmail.textContent = '⚠ Email tidak boleh kosong dan harus mengandung @';
  errEmail.classList.remove('show');
  emailInput.classList.remove('invalid');
  passInput.classList.remove('invalid');

  currentUser = found;
  loadUserToUI();
  document.getElementById('loginPage').style.display = 'none';
  showToast(`Selamat datang, ${currentUser.name}! 👋`, 'success');
  renderAll();
}

function doLogout() {
  currentUser = null;
  document.getElementById('loginPage').style.display = 'flex';
  document.getElementById('loginEmail').value = '';
  document.getElementById('loginPass').value  = '';
}

// ── LOAD USER INFO KE UI ────────────────────────────────
function loadUserToUI() {
  if (!currentUser) return;
  const ini = getInitials(currentUser.name);

  // Sidebar
  document.getElementById('sidebarAvatar').textContent    = ini;
  document.getElementById('sidebarUserName').textContent  = currentUser.name;
  document.getElementById('sidebarUserNim').textContent   = currentUser.nim;

  // Dashboard hero
  const firstName = currentUser.name.split(' ')[0];
  document.getElementById('heroBanner').innerHTML =
    `Selamat pagi, ${firstName}! 👋`;

  // Profile page
  document.getElementById('profileAvatarBig').textContent     = ini;
  document.getElementById('profileName').textContent          = currentUser.name;
  document.getElementById('profileSubtitle').textContent      = `${currentUser.nim} · ${currentUser.prodi} · Semester ${currentUser.semester}`;
  document.getElementById('inputNamaLengkap').value           = currentUser.name;
  document.getElementById('inputNIM').value                   = currentUser.nim;
  document.getElementById('inputProdi').value                 = currentUser.prodi;
  document.getElementById('inputSemester').value              = currentUser.semester;
  document.getElementById('inputEmail').value                 = currentUser.email;
}

// ── SIMPAN PERUBAHAN PROFIL ─────────────────────────────
function saveProfile() {
  const name     = document.getElementById('inputNamaLengkap').value.trim();
  const nim      = document.getElementById('inputNIM').value.trim();
  const prodi    = document.getElementById('inputProdi').value.trim();
  const semester = document.getElementById('inputSemester').value.trim();
  const email    = document.getElementById('inputEmail').value.trim();

  if (!name) { showToast('Nama lengkap tidak boleh kosong!', 'error'); return; }
  if (!nim)  { showToast('NIM tidak boleh kosong!', 'error'); return; }

  // Update object currentUser
  currentUser.name     = name;
  currentUser.nim      = nim;
  currentUser.prodi    = prodi;
  currentUser.semester = semester;
  currentUser.email    = email;

  // Sinkronisasi ke daftar accounts
  const idx = accounts.findIndex(a => a.nim === nim || a.email === email);
  if (idx >= 0) accounts[idx] = { ...accounts[idx], ...currentUser };

  // Perbarui semua tampilan
  loadUserToUI();
  showToast('Profil berhasil disimpan! ✨', 'success');
  saveToStorage();
}

// ── REGISTER ───────────────────────────────────────────
function openRegister() {
  ['regNama','regNim','regProdi','regSemester','regEmail','regPass','regConfPass']
    .forEach(id => { document.getElementById(id).value = ''; document.getElementById(id).classList.remove('invalid'); });
  ['errRegNama','errRegEmail','errRegPass','errRegConfPass']
    .forEach(id => document.getElementById(id).classList.remove('show'));
  document.getElementById('registerModal').classList.add('open');
}

function closeRegister() {
  document.getElementById('registerModal').classList.remove('open');
}

function doRegister() {
  const nama     = document.getElementById('regNama').value.trim();
  const nim      = document.getElementById('regNim').value.trim();
  const prodi    = document.getElementById('regProdi').value.trim();
  const semester = document.getElementById('regSemester').value.trim();
  const email    = document.getElementById('regEmail').value.trim();
  const pass     = document.getElementById('regPass').value;
  const conf     = document.getElementById('regConfPass').value;
  let ok = true;
  saveToStorage();

  // Validasi nama
  const errNama = document.getElementById('errRegNama');
  if (!nama) {
    errNama.classList.add('show');
    document.getElementById('regNama').classList.add('invalid');
    ok = false;
  } else {
    errNama.classList.remove('show');
    document.getElementById('regNama').classList.remove('invalid');
  }

  // Validasi email
  const errEmail = document.getElementById('errRegEmail');
  if (!email || !email.includes('@')) {
    errEmail.textContent = '⚠ Email harus valid dan mengandung @';
    errEmail.classList.add('show');
    document.getElementById('regEmail').classList.add('invalid');
    ok = false;
  } else if (accounts.find(a => a.email === email)) {
    errEmail.textContent = '⚠ Email sudah terdaftar!';
    errEmail.classList.add('show');
    document.getElementById('regEmail').classList.add('invalid');
    ok = false;
  } else {
    errEmail.classList.remove('show');
    document.getElementById('regEmail').classList.remove('invalid');
  }

  // Validasi password
  const errPass = document.getElementById('errRegPass');
  if (pass.length < 6) {
    errPass.classList.add('show');
    document.getElementById('regPass').classList.add('invalid');
    ok = false;
  } else {
    errPass.classList.remove('show');
    document.getElementById('regPass').classList.remove('invalid');
  }

  // Validasi konfirmasi password
  const errConf = document.getElementById('errRegConfPass');
  if (pass !== conf) {
    errConf.classList.add('show');
    document.getElementById('regConfPass').classList.add('invalid');
    ok = false;
  } else {
    errConf.classList.remove('show');
    document.getElementById('regConfPass').classList.remove('invalid');
  }

  if (!ok) return;

  // Daftarkan akun baru
  accounts.push({ email, password: pass, nim: nim || '-', name: nama, prodi: prodi || '-', semester: semester || '-' });
  closeRegister();
  showToast(`Akun "${nama}" berhasil dibuat! Silakan login 🎉`, 'success');

  // Auto-fill login
  document.getElementById('loginEmail').value = email;
  document.getElementById('loginPass').value  = pass;
}

// ── NAVIGATION ─────────────────────────────────────────
function gotoPage(id, el) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById('page-'+id).classList.add('active');
  if (el) el.classList.add('active');
  const titles = { dashboard:'Dashboard', tasks:'Daftar Tugas', calendar:'Kalender Akademik', report:'Laporan & Statistik', profile:'Profil Saya', settings:'Pengaturan' };
  document.getElementById('pageTitle').textContent = titles[id] || id;
  if (id === 'tasks')    renderFullTaskList();
  if (id === 'calendar') renderBigCalendar();
  if (id === 'report')   renderReport();
}

// ── RENDER TASK ITEM ───────────────────────────────────
function taskHTML(t, mini=false) {
  const dl = daysLeft(t.deadline);
  const dlText = dl < 0
    ? `<span style="color:var(--error)">Terlambat ${Math.abs(dl)}h</span>`
    : dl === 0 ? `<span style="color:var(--error)">Hari ini!</span>`
    : dl === 1 ? `<span style="color:var(--warn)">Besok</span>`
    : `${fmt(t.deadline)}`;
  return `<div class="task-item" id="ti-${t.id}">
    <div class="task-check ${t.done?'done':''}" onclick="toggleTask(${t.id})">${t.done?'✓':''}</div>
    <div class="task-info">
      <div class="task-name ${t.done?'done':''}">${t.name}</div>
      <div class="task-meta">
        ${t.course ? `<span>📚 ${t.course}</span>` : ''}
        <span>📅 ${dlText}</span>
      </div>
    </div>
    ${priorityBadge(t.priority)}
    ${!mini ? `<button class="task-del" onclick="editTask(${t.id})" title="Edit">✏️</button> onclick="deleteTask(${t.id})" title="Hapus">🗑</button>` : ''}
  </div>`;
}

// ── RENDER TODAY'S TASKS ───────────────────────────────
function renderTodayTasks() {
  const el = document.getElementById('todayTaskList');
  const shown = tasks.filter(t => !t.done).slice(0,4);
  if (!shown.length) {
    el.innerHTML = `<div class="empty-state"><div class="empty-icon">🎉</div><p>Semua tugas selesai!</p></div>`;
    return;
  }
  el.innerHTML = shown.map(t => taskHTML(t, true)).join('');
}

// ── RENDER FULL TASK LIST ──────────────────────────────
function renderFullTaskList() {
  const el = document.getElementById('fullTaskList');
  let filtered = [...tasks];
  if      (currentFilter === 'done')       filtered = tasks.filter(t => t.done);
  else if (currentFilter === 'todo')       filtered = tasks.filter(t => t.status==='todo');
  else if (currentFilter === 'inprogress') filtered = tasks.filter(t => t.status==='inprogress');
  else if (currentFilter === 'high')       filtered = tasks.filter(t => t.priority==='high');
  else if (currentFilter === 'medium')     filtered = tasks.filter(t => t.priority==='medium');
  else if (currentFilter === 'low')        filtered = tasks.filter(t => t.priority==='low');

  document.getElementById('taskListTitle').textContent = `Semua Tugas (${filtered.length})`;
  if (!filtered.length) {
    el.innerHTML = `<div class="empty-state"><div class="empty-icon">📭</div><p>Tidak ada tugas</p><span>Coba filter lain atau tambah tugas baru</span></div>`;
    return;
  }
  el.innerHTML = filtered.map(t => `<div class="task-item" id="ti2-${t.id}">
    <div class="task-check ${t.done?'done':''}" onclick="toggleTask(${t.id});renderFullTaskList()">${t.done?'✓':''}</div>
    <div class="task-info">
      <div class="task-name ${t.done?'done':''}">${t.name}</div>
      <div class="task-meta">
        ${t.course ? `<span>📚 ${t.course.split(' ')[0]}</span>` : ''}
        <span>📅 ${fmt(t.deadline)}</span>
        ${t.note ? `<span>📌 ${t.note}</span>` : ''}
      </div>
    </div>
    <div style="display:flex;gap:6px;align-items:center;flex-shrink:0">
      ${priorityBadge(t.priority)}
      ${statusBadge(t.status)}
      <button class="task-del" onclick="deleteTask(${t.id})" title="Hapus">🗑</button>
    </div>
  </div>`).join('');
}

// ── TOGGLE / DELETE ────────────────────────────────────
function toggleTask(id) {
  const t = tasks.find(x => x.id===id);
  if (!t) return;
  t.done = !t.done;
  t.status = t.done ? 'done' : 'todo';
  updateStats();
  renderTodayTasks();
  renderCourseProgress();
  showToast(t.done ? `"${t.name}" ditandai selesai ✅` : `"${t.name}" dibatalkan`, t.done?'success':'info');
  saveToStorage();
}
function deleteTask(id) {
  const t = tasks.find(x => x.id===id);
  if (!t) return;
  tasks = tasks.filter(x => x.id!==id);
  updateStats();
  renderTodayTasks();
  renderFullTaskList();
  renderCourseProgress();
  showToast(`Tugas "${t.name}" dihapus`, 'warning');
  saveToStorage();
}

// ── FILTER ─────────────────────────────────────────────
function filterTasks(f, el) {
  currentFilter = f;
  document.querySelectorAll('#taskFilter .filter-chip').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  renderFullTaskList();
}

// ── MODAL ADD / EDIT TASK ──────────────────────────────
function openAddTask() {
  editId = null;
  document.getElementById('modalTitle').textContent = '➕ Tambah Tugas Baru';
  ['taskName','taskNote'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('taskPriority').value = 'medium';
  document.getElementById('taskStatus').value   = 'todo';
  document.getElementById('taskCourse').value   = '';
  document.getElementById('taskDeadline').value = '';
  ['errTaskName','errDeadline'].forEach(id => document.getElementById(id).classList.remove('show'));
  ['taskName','taskDeadline'].forEach(id => document.getElementById(id).classList.remove('invalid'));
  document.getElementById('addTaskModal').classList.add('open');
}
function closeModal() {
  document.getElementById('addTaskModal').classList.remove('open');
}

function saveTask() {
  const name     = document.getElementById('taskName').value.trim();
  const deadline = document.getElementById('taskDeadline').value;
  let ok = true;
  saveToStorage();

  const errName  = document.getElementById('errTaskName');
  const nameInput = document.getElementById('taskName');
  if (!name) {
    errName.classList.add('show');
    nameInput.classList.add('invalid');
    ok = false;
  } else { errName.classList.remove('show'); nameInput.classList.remove('invalid'); }

  const errDL  = document.getElementById('errDeadline');
  const dlInput = document.getElementById('taskDeadline');
  if (!deadline) {
    errDL.classList.add('show');
    dlInput.classList.add('invalid');
    ok = false;
  } else { errDL.classList.remove('show'); dlInput.classList.remove('invalid'); }

  if (!ok) return;

  const task = {
    id:       editId || nextId++,
    name,
    course:   document.getElementById('taskCourse').value,
    priority: document.getElementById('taskPriority').value,
    status:   document.getElementById('taskStatus').value,
    deadline,
    note:     document.getElementById('taskNote').value,
    done:     document.getElementById('taskStatus').value === 'done',
  };
  if (editId) { const i = tasks.findIndex(t => t.id===editId); if (i>=0) tasks[i]=task; }
  else tasks.push(task);

  closeModal();
  updateStats();
  renderTodayTasks();
  renderFullTaskList();
  renderCourseProgress();
  showToast(editId ? 'Tugas berhasil diperbarui! ✏️' : 'Tugas baru berhasil ditambahkan! 🎯', 'success');
}


// ── COURSE PROGRESS ────────────────────────────────────
function renderCourseProgress() {
  const courses = {};
  tasks.forEach(t => {
    if (!t.course) return;
    if (!courses[t.course]) courses[t.course] = { total:0, done:0 };
    courses[t.course].total++;
    if (t.done) courses[t.course].done++;
  });
  const html = Object.entries(courses).map(([c,v]) => {
    const pct = Math.round(v.done/v.total*100);
    const short = c.split(' ')[0];
    return `<div class="progress-wrap">
      <div class="progress-label"><span>${short}</span><span>${v.done}/${v.total}</span></div>
      <div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div>
    </div>`;
  }).join('');
  const el = document.getElementById('courseProgress');
  if (el) el.innerHTML = html;
}

// ── REPORT ─────────────────────────────────────────────
function renderReport() {
  updateStats();
  const courses = {};
  tasks.forEach(t => {
    if (!t.course) return;
    if (!courses[t.course]) courses[t.course] = {total:0,done:0};
    courses[t.course].total++;
    if (t.done) courses[t.course].done++;
  });
  document.getElementById('reportCourseBar').innerHTML = Object.entries(courses).map(([c,v]) => {
    const pct = Math.round(v.done/v.total*100);
    return `<div class="chart-bar-row"><span>${c.split(' ')[0]}</span><div class="bar-track"><div class="bar-fill" style="width:${pct}%"></div></div><span class="pct">${pct}%</span></div>`;
  }).join('');

  const p = {high:{t:0,d:0},medium:{t:0,d:0},low:{t:0,d:0}};
  tasks.forEach(t => { p[t.priority].t++; if(t.done) p[t.priority].d++; });
  const pl = {high:'🔴 Tinggi',medium:'🟡 Sedang',low:'🟢 Rendah'};
  document.getElementById('reportPriorityBar').innerHTML = Object.entries(p).map(([k,v]) => {
    const pct = v.t ? Math.round(v.d/v.t*100) : 0;
    return `<div class="chart-bar-row"><span>${pl[k]}</span><div class="bar-track"><div class="bar-fill gold" style="width:${pct}%"></div></div><span class="pct">${pct}%</span></div>`;
  }).join('');
}

// ── CALENDAR ─────────────────────────────────────────
let calDate = new Date(2024, 11, 1);
function renderBigCalendar() {
  const el = document.getElementById('bigCalendar');
  const y = calDate.getFullYear(), m = calDate.getMonth();
  const first = new Date(y, m, 1).getDay();
  const days  = new Date(y, m+1, 0).getDate();
  const months = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
  const taskDays = new Set(tasks.map(t => { const d = new Date(t.deadline); return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`; }));

  let html = `<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">
    <button class="cal-nav" onclick="calPrev()">‹</button>
    <h3 style="font-family:'Sora',sans-serif;font-size:16px">${months[m]} ${y}</h3>
    <button class="cal-nav" onclick="calNext()">›</button>
  </div>
  <div class="cal-grid" style="gap:4px">
    ${['Min','Sen','Sel','Rab','Kam','Jum','Sab'].map(d=>`<div class="cal-day-name">${d}</div>`).join('')}
    ${Array(first).fill('<div></div>').join('')}
    ${Array.from({length:days},(_,i)=>{
      const day = i+1;
      const key = `${y}-${m}-${day}`;
      const isToday = y===2024 && m===11 && day===15;
      const hasTask = taskDays.has(key);
      return `<div class="cal-day ${isToday?'today':''} ${hasTask&&!isToday?'has-task':''}">${day}</div>`;
    }).join('')}
  </div>`;
  el.innerHTML = html;

  const monthTasks = tasks.filter(t => { const d=new Date(t.deadline); return d.getFullYear()===y && d.getMonth()===m; });
  const ct = document.getElementById('calTaskList');
  if (!monthTasks.length) { ct.innerHTML = `<div class="empty-state"><div class="empty-icon">📅</div><p>Tidak ada tugas bulan ini</p></div>`; return; }
  ct.innerHTML = monthTasks.map(t => taskHTML(t, true)).join('');
}
function calPrev() { calDate.setMonth(calDate.getMonth()-1); renderBigCalendar(); }
function calNext() { calDate.setMonth(calDate.getMonth()+1); renderBigCalendar(); }

function renderMiniCalendar() {
  const el = document.getElementById('miniCalendarDash');
  if (!el) return;
  const y = 2024, m = 11;
  const first = new Date(y,m,1).getDay();
  const days  = new Date(y,m+1,0).getDate();
  const taskDays = new Set(tasks.map(t => { const d=new Date(t.deadline); return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`; }));
  el.innerHTML = `
    <div class="cal-header"><h4>Desember 2024</h4><span style="font-size:12px;color:var(--gray-400)">Hari ini: 15</span></div>
    <div class="cal-grid">
      ${['M','S','S','R','K','J','S'].map(d=>`<div class="cal-day-name">${d}</div>`).join('')}
      ${Array(first).fill('<div></div>').join('')}
      ${Array.from({length:days},(_,i)=>{
        const day=i+1;
        const key=`${y}-${m}-${day}`;
        const isToday = day===15;
        const hasTask = taskDays.has(key);
        return `<div class="cal-day ${isToday?'today':''} ${hasTask&&!isToday?'has-task':''}" style="font-size:11px;padding:4px 1px">${day}</div>`;
      }).join('')}
    </div>`;
}

// ── ACTIVITY FEED ─────────────────────────────────────
function renderActivity() {
  const feed = [
    { icon:'✅', text:'Presentasi PPT IMK ditandai selesai', time:'2 jam lalu' },
    { icon:'➕', text:'Tugas Bab 3 Skripsi ditambahkan', time:'Kemarin' },
    { icon:'🔔', text:'Deadline UTS Pemrograman Web besok!', time:'Kemarin' },
    { icon:'✅', text:'Quiz Jaringan Komputer selesai', time:'3 hari lalu' },
  ];
  const el = document.getElementById('activityFeed');
  if (!el) return;
  el.innerHTML = feed.map(f => `<div style="display:flex;gap:10px;padding:10px 0;border-bottom:1px solid var(--gray-100)">
    <span style="font-size:18px;flex-shrink:0">${f.icon}</span>
    <div><div style="font-size:13px;font-weight:500;color:var(--gray-800)">${f.text}</div>
    <div style="font-size:11.5px;color:var(--gray-400);margin-top:1px">${f.time}</div></div>
  </div>`).join('');
}

// ── SEARCH ─────────────────────────────────────────────
function handleSearch(q) {
  if (!q) return;
  const results = tasks.filter(t => t.name.toLowerCase().includes(q.toLowerCase()));
  if (results.length) showToast(`Ditemukan ${results.length} tugas untuk "${q}"`, 'info');
  else showToast(`Tidak ada tugas untuk "${q}"`, 'warning');
}

// ── CHANGE PASSWORD ────────────────────────────────────
function changePassword() {
  const op  = document.getElementById('oldPass').value;
  const np  = document.getElementById('newPass').value;
  const cp  = document.getElementById('confPass').value;

  const errOld   = document.getElementById('errOldPass');
  const errMatch = document.getElementById('errPassMatch');
  const errNew   = document.getElementById('errNewPass');
  let ok = true;

  // Validasi password lama
  if (!currentUser || op !== currentUser.password) {
    errOld.classList.add('show');
    document.getElementById('oldPass').classList.add('invalid');
    ok = false;
  } else {
    errOld.classList.remove('show');
    document.getElementById('oldPass').classList.remove('invalid');
  }

  // Validasi panjang password baru
  if (np.length < 8) {
    errNew.classList.add('show');
    document.getElementById('newPass').classList.add('invalid');
    ok = false;
  } else {
    errNew.classList.remove('show');
    document.getElementById('newPass').classList.remove('invalid');
  }

  // Validasi konfirmasi password
  if (np !== cp) {
    errMatch.classList.add('show');
    document.getElementById('confPass').classList.add('invalid');
    ok = false;
  } else {
    errMatch.classList.remove('show');
    document.getElementById('confPass').classList.remove('invalid');
  }

  if (!ok) return;

  // Simpan password baru
  currentUser.password = np;
  const idx = accounts.findIndex(a => a.email === currentUser.email);
  if (idx >= 0) accounts[idx].password = np;

  // Bersihkan field
  ['oldPass','newPass','confPass'].forEach(id => document.getElementById(id).value = '');
  showToast('Password berhasil diubah! 🔐', 'success');
}

// ── RENDER ALL ─────────────────────────────────────────
function renderAll() {
  updateStats();
  renderTodayTasks();
  renderCourseProgress();
  renderMiniCalendar();
  renderActivity();
}

function editTask(id) {
  const t = tasks.find(x => x.id === id);
  if (!t) return;

  editId = id;

  document.getElementById('modalTitle').textContent = '✏️ Edit Tugas';
  document.getElementById('taskName').value = t.name;
  document.getElementById('taskCourse').value = t.course;
  document.getElementById('taskPriority').value = t.priority;
  document.getElementById('taskStatus').value = t.status;
  document.getElementById('taskDeadline').value = t.deadline;
  document.getElementById('taskNote').value = t.note;

  document.getElementById('addTaskModal').classList.add('open');
}

function toggleDarkMode() {
  document.body.classList.toggle('dark');

  const isDark = document.body.classList.contains('dark');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
}

function loadTheme() {
  const theme = localStorage.getItem('theme');
  if (theme === 'dark') {
    document.body.classList.add('dark');
  }
}

loadTheme();
let isDarkMode = false;

// load state
function loadTheme() {
  const saved = localStorage.getItem("tm_theme");
  if (saved === "dark") {
    isDarkMode = true;
    document.body.classList.add("dark");
  }
}

function toggleDarkMode() {
  isDarkMode = !isDarkMode;

  document.body.classList.toggle("dark", isDarkMode);
  localStorage.setItem("tm_theme", isDarkMode ? "dark" : "light");

  showToast(isDarkMode ? "Mode gelap aktif 🌙" : "Mode terang aktif ☀️", "info");
}

// Pre-render saat halaman dimuat
loadFromStorage();
if (currentUser) {
  document.getElementById('loginPage').style.display = 'none';
  loadUserToUI();
}
renderAll();

