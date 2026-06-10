import { WorkoutSessions, ExerciseSets, CardioSessions } from './db.js';

// ── Workout plan data ───────────────────────────────────────────────────────
const PLAN = {
  PUSH: {
    label: 'Giorno 1 — Push', subtitle: 'Petto, Spalle, Tricipiti',
    warmup: '☀️ Riscaldamento: Rotazioni spalle + stretching petto da seduto — 8 min',
    exercises: [
      { name:'Panca piana con bilanciere',       sets:4, reps:'10-12', rest:90, note:'Scapole addossate alla panca. Non rimbalzare il bilanciere sul petto.' },
      { name:'Panca inclinata con manubri',       sets:3, reps:'12',    rest:75, note:'Panca a 30-45°. Evita angoli superiori a 45°.' },
      { name:'Shoulder press manubri (seduto)',   sets:4, reps:'10-12', rest:90, note:'Core contratto, schiena supportata. Non iperestendere il lombare.' },
      { name:'Croci ai cavi / manubri (sdraiato)',sets:3, reps:'15',    rest:60, note:'Abbraccia un albero grande. Movimento dal petto, non dalle braccia.' },
      { name:'Alzate laterali manubri (seduto)',  sets:3, reps:'15',    rest:60, note:'Pesi leggeri. Il controllo in discesa è fondamentale.' },
      { name:'Push-down ai cavi (seduto)',        sets:3, reps:'15',    rest:60, note:'Gomiti fissi ai fianchi. Usa solo l\'avambraccio.' },
      { name:'Estensione tricipiti sopratesta',   sets:3, reps:'12',    rest:75, note:'Gomiti vicini alla testa e puntati verso il soffitto.' },
      { name:'Vogatore — finisher metabolico',    sets:3, reps:'3 min', rest:90, note:'Gambe fisse. Ritmo moderato-sostenuto.' },
    ]
  },
  PULL: {
    label: 'Giorno 2 — Pull', subtitle: 'Schiena, Bicipiti',
    warmup: '☀️ Riscaldamento: Rotazioni busto + mobilità spalle da seduto — 8 min',
    exercises: [
      { name:'Lat machine presa larga',            sets:4, reps:'10-12', rest:90, note:'Ferma la barra al petto alto. Scapole schiacciate al massimo.' },
      { name:'Lat machine presa stretta supinata', sets:3, reps:'12',    rest:75, note:'Attiva maggiormente il bicipite e il dorsale basso.' },
      { name:'Pulley basso (seduto)',               sets:4, reps:'10-12', rest:90, note:'Schiena dritta, no slancio. Gomiti indietro al massimo.' },
      { name:'Rematore manubrio sul fianco',        sets:3, reps:'12/lato',rest:75,note:'Sdraiato sul fianco, rematore verticale. Cambia lato.' },
      { name:'Face pull ai cavi (seduto)',          sets:3, reps:'15',    rest:60, note:'Fondamentale per la salute delle spalle. Pausa 1s al massimo.' },
      { name:'Curl con bilanciere (seduto)',        sets:3, reps:'12',    rest:75, note:'Gomiti fissi ai fianchi. No inerzia del busto.' },
      { name:'Curl a martello manubri (seduto)',    sets:3, reps:'12',    rest:75, note:'Presa neutra (pollice verso l\'alto). Attiva brachioradiale.' },
      { name:'Lat machine AMRAP — finisher',        sets:2, reps:'AMRAP', rest:90, note:'60% del massimale. Fermati quando la tecnica cede.' },
    ]
  },
  FULL: {
    label: 'Giorno 3 — Full Upper + Core', subtitle: 'Full Body Upper + Core',
    warmup: '☀️ Riscaldamento: Mobilità generale upper body da seduto — 8 min',
    exercises: [
      { name:'Panca piana con manubri',          sets:3, reps:'12',    rest:75, note:'Range of motion maggiore rispetto al bilanciere.' },
      { name:'Lat machine',                       sets:3, reps:'12',    rest:75, note:'Alterna presa larga e stretta tra le sessioni.' },
      { name:'Shoulder press manubri (seduto)',   sets:3, reps:'12',    rest:75, note:'Concentrati sulla connessione mente-muscolo.' },
      { name:'Curl bilanciere (seduto)',           sets:2, reps:'15',    rest:60, note:'Settimane dispari presa supina, pari presa a martello.' },
      { name:'Push-down ai cavi (seduto)',        sets:2, reps:'15',    rest:60, note:'Usa la corda per massimizzare la contrazione finale.' },
      { name:'Crunch classico',                   sets:4, reps:'20',    rest:45, note:'Espira salendo, inspira scendendo. Non tirare il collo.' },
      { name:'Crunch bicicletta',                 sets:3, reps:'20',    rest:45, note:'Ritmo controllato. Uno dei migliori per gli obliqui.' },
      { name:'Leg raise (sdraiato)',              sets:3, reps:'15',    rest:45, note:'Zona lombare SEMPRE a terra. Pausa a 30° per più difficoltà.' },
      { name:'Russian twist con peso (seduto)',   sets:3, reps:'20',    rest:45, note:'Busto a 45°. Conta destra+sinistra come 1 ripetizione.' },
      { name:'Dead bug',                          sets:3, reps:'10/lato',rest:45, note:'Lombare SEMPRE a terra. Braccio destro + gamba sinistra insieme.' },
    ]
  }
};

const CARDIO_ICONS = { NUOTO: '🏊', CYCLETTE: '🚴', VOGATORE: '🚣' };
const CARDIO_LABELS = { NUOTO: 'Nuoto', CYCLETTE: 'Cyclette', VOGATORE: 'Vogatore' };
const DAY_ICONS = { PUSH: '💪', PULL: '🔽', FULL: '⚡' };

// ── State ─────────────────────────────────────────────────────────────────
let state = {
  activeSessionId: null,
  activeDayType: null,
  sessionStartTime: null,
  exerciseSets: {},      // { exerciseName: [sets] }
  restTimer: null,
  restRemaining: 0,
  detailSessionId: null,
  cardioTab: 'NUOTO',
  deleteTarget: null,    // { type, id, cb }
};

// ── DOM refs ──────────────────────────────────────────────────────────────
const $ = id => document.getElementById(id);
const screens = {
  home: $('screen-home'),
  workout: $('screen-workout'),
  history: $('screen-history'),
  detail: $('screen-detail'),
  cardio: $('screen-cardio'),
};

function showScreen(name) {
  Object.values(screens).forEach(s => s.classList.remove('active'));
  screens[name].classList.add('active');
}

// ── Date helpers ──────────────────────────────────────────────────────────
function todayISO() { return new Date().toISOString().slice(0,10); }
function formatDate(iso) {
  const d = new Date(iso + 'T12:00:00');
  return d.toLocaleDateString('it-IT', { weekday:'short', day:'numeric', month:'short', year:'numeric' });
}
function formatDateLong(iso) {
  const d = new Date(iso + 'T12:00:00');
  return d.toLocaleDateString('it-IT', { weekday:'long', day:'numeric', month:'long', year:'numeric' });
}

// ══════════════════════════════════════════════════════════════════════════
//  HOME SCREEN
// ══════════════════════════════════════════════════════════════════════════
async function renderHome() {
  // Date subtitle
  $('home-date').textContent = new Date().toLocaleDateString('it-IT',
    { weekday:'long', day:'numeric', month:'long' });

  // Recent sessions
  const sessions = await WorkoutSessions.getAll();
  const container = $('recent-sessions');
  const recent = sessions.slice(0, 5);

  if (recent.length === 0) {
    container.innerHTML = '';
    $('recent-section').style.display = 'none';
  } else {
    $('recent-section').style.display = 'block';
    container.innerHTML = recent.map(s => {
      const typeLabel = { PUSH:'Push', PULL:'Pull', FULL:'Full' }[s.dayType] || s.dayType;
      return `<div class="recent-session" onclick="openDetail(${s.id})">
        <span class="type-badge badge-${s.dayType.toLowerCase()}">${s.dayType}</span>
        <div class="recent-info">
          <strong>${PLAN[s.dayType]?.subtitle || s.dayType}</strong>
          <small>${formatDate(s.date)}</small>
        </div>
        ${s.durationMinutes ? `<span class="recent-dur">${s.durationMinutes} min</span>` : ''}
        <span style="color:var(--text-dim);font-size:16px">›</span>
      </div>`;
    }).join('');
  }
}

window.startWorkout = async function(dayType) {
  const session = await WorkoutSessions.add({
    date: todayISO(), dayType, durationMinutes: 0, notes: ''
  });
  state.activeSessionId = session;
  state.activeDayType = dayType;
  state.sessionStartTime = Date.now();
  state.exerciseSets = {};
  await loadWorkoutSets();
  renderWorkout();
  showScreen('workout');
};

// ══════════════════════════════════════════════════════════════════════════
//  WORKOUT SCREEN
// ══════════════════════════════════════════════════════════════════════════
async function loadWorkoutSets() {
  if (!state.activeSessionId) return;
  const sets = await ExerciseSets.getForSession(state.activeSessionId);
  state.exerciseSets = {};
  sets.forEach(s => {
    if (!state.exerciseSets[s.exerciseName]) state.exerciseSets[s.exerciseName] = [];
    state.exerciseSets[s.exerciseName].push(s);
  });
}

function renderWorkout() {
  const day = PLAN[state.activeDayType];
  if (!day) return;

  $('workout-title').textContent = day.label;
  $('workout-subtitle').textContent = day.subtitle;
  $('workout-warmup').textContent = day.warmup;

  const list = $('exercises-list');
  list.innerHTML = day.exercises.map((ex, i) => renderExerciseCard(ex, i)).join('');
}

function renderExerciseCard(ex, idx) {
  const sets = state.exerciseSets[ex.name] || [];
  const done = sets.length;
  const complete = done >= ex.sets;

  const setsHTML = sets.map(s => `
    <div class="set-row">
      <span class="set-num">${s.setNumber}</span>
      <span class="set-detail">${s.reps} rip × ${s.weightKg === 0 ? 'corpo libero' : s.weightKg + ' kg'}</span>
      <span class="set-rest">${s.restSeconds}s</span>
      <button class="set-delete" onclick="deleteSet(${s.id},'${encodeURIComponent(ex.name)}')">✕</button>
    </div>`).join('');

  return `<div class="exercise-card ${complete ? 'completed' : ''}" id="exc-${idx}">
    <div class="exercise-header" onclick="toggleExercise(${idx})">
      <span class="exercise-check">${complete ? '✅' : '⬜'}</span>
      <div class="exercise-info">
        <strong>${ex.name}</strong>
        <small>${ex.sets} serie × ${ex.reps} rip &nbsp;·&nbsp; recupero ${ex.rest}s</small>
      </div>
      <span class="exercise-counter ${complete ? 'done' : ''}">${done}/${ex.sets}</span>
      <button class="exercise-expand">⌄</button>
    </div>
    <div class="exercise-body" id="exbody-${idx}">
      <div class="sets-list">${setsHTML}</div>
      ${ex.note ? `<div class="exercise-note">ℹ️ <span>${ex.note}</span></div>` : ''}
      <button class="btn-add-set" onclick="openAddSet('${encodeURIComponent(ex.name)}',${ex.rest},${idx})">
        + Aggiungi serie ${done + 1}
      </button>
    </div>
  </div>`;
}

window.toggleExercise = function(idx) {
  const body = $(`exbody-${idx}`);
  if (body) body.classList.toggle('open');
};

window.deleteSet = async function(setId, encodedName) {
  await ExerciseSets.delete(setId);
  await loadWorkoutSets();
  renderWorkout();
};

// ── Add Set Dialog ────────────────────────────────────────────────────────
let addSetContext = null;

window.openAddSet = function(encodedName, defaultRest, exIdx) {
  const name = decodeURIComponent(encodedName);
  const existingSets = state.exerciseSets[name] || [];
  const last = existingSets[existingSets.length - 1];

  addSetContext = { name, defaultRest, exIdx };

  $('dlg-set-title').textContent = `Serie ${existingSets.length + 1} — ${name}`;
  $('dlg-reps').value = last?.reps || '';
  $('dlg-weight').value = last?.weightKg > 0 ? last.weightKg : '';
  $('dlg-rest').value = last?.restSeconds || defaultRest;
  $('dlg-set-notes').value = '';

  $('overlay-set').classList.remove('hidden');
};

window.closeSetDialog = function() {
  $('overlay-set').classList.add('hidden');
  addSetContext = null;
};

window.saveSet = async function() {
  if (!addSetContext || !state.activeSessionId) return;
  const reps = parseInt($('dlg-reps').value);
  if (!reps || reps < 1) { $('dlg-reps').focus(); return; }
  const weight = parseFloat($('dlg-weight').value) || 0;
  const rest = parseInt($('dlg-rest').value) || addSetContext.defaultRest;
  const notes = $('dlg-set-notes').value.trim();
  const existingSets = state.exerciseSets[addSetContext.name] || [];

  await ExerciseSets.add({
    sessionId: state.activeSessionId,
    exerciseName: addSetContext.name,
    setNumber: existingSets.length + 1,
    reps, weightKg: weight, restSeconds: rest, notes
  });

  closeSetDialog();
  startRestTimer(rest);
  await loadWorkoutSets();
  renderWorkout();
  // Re-open the exercise body
  const body = $(`exbody-${addSetContext?.exIdx}`);
  if (body) body.classList.add('open');
};

// ── Rest Timer ─────────────────────────────────────────────────────────────
function startRestTimer(seconds) {
  clearInterval(state.restTimer);
  state.restRemaining = seconds;
  $('rest-bar').style.display = 'flex';
  updateRestDisplay();
  state.restTimer = setInterval(() => {
    state.restRemaining--;
    if (state.restRemaining <= 0) {
      clearInterval(state.restTimer);
      $('rest-bar').style.display = 'none';
      // Vibrate if supported
      if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
    } else {
      updateRestDisplay();
    }
  }, 1000);
}

function updateRestDisplay() {
  $('rest-text').textContent = `⏱ Recupero: ${state.restRemaining}s`;
}

window.stopRestTimer = function() {
  clearInterval(state.restTimer);
  state.restRemaining = 0;
  $('rest-bar').style.display = 'none';
};

// ── Finish Session ─────────────────────────────────────────────────────────
window.openFinishDialog = function() {
  $('dlg-finish-notes').value = '';
  $('overlay-finish').classList.remove('hidden');
};

window.closeFinishDialog = function() {
  $('overlay-finish').classList.add('hidden');
};

window.finishSession = async function() {
  if (!state.activeSessionId) return;
  const duration = Math.max(1, Math.round((Date.now() - state.sessionStartTime) / 60000));
  const notes = $('dlg-finish-notes').value.trim();
  const session = await WorkoutSessions.get(state.activeSessionId);
  if (session) {
    await WorkoutSessions.update({ ...session, durationMinutes: duration, notes });
  }
  stopRestTimer();
  closeFinishDialog();
  state.activeSessionId = null;
  await renderHome();
  showScreen('home');
};

window.backFromWorkout = function() {
  showConfirmDelete(
    'Esci senza terminare?',
    'La sessione verrà salvata ma senza durata. Potrai continuarla dallo storico.',
    async () => {
      stopRestTimer();
      await renderHome();
      showScreen('home');
    }
  );
};

// ══════════════════════════════════════════════════════════════════════════
//  HISTORY SCREEN
// ══════════════════════════════════════════════════════════════════════════
async function renderHistory() {
  const sessions = await WorkoutSessions.getAll();

  const pushC = sessions.filter(s => s.dayType === 'PUSH').length;
  const pullC = sessions.filter(s => s.dayType === 'PULL').length;
  const fullC = sessions.filter(s => s.dayType === 'FULL').length;

  $('hist-push').textContent = pushC;
  $('hist-pull').textContent = pullC;
  $('hist-full').textContent = fullC;
  $('hist-tot').textContent = sessions.length;

  const list = $('history-list');
  if (sessions.length === 0) {
    list.innerHTML = `<div class="empty-state"><span class="icon">📋</span>
      <p>Nessun allenamento registrato</p></div>`;
    return;
  }

  list.innerHTML = sessions.map(s => {
    const typeLabel = PLAN[s.dayType]?.subtitle || s.dayType;
    return `<div class="history-card" onclick="openDetail(${s.id})">
      <span class="type-badge badge-${s.dayType.toLowerCase()}">${s.dayType}</span>
      <div style="flex:1;min-width:0">
        <strong style="font-size:13px">${typeLabel}</strong>
        <small style="display:block;font-size:11px;color:var(--text-dim)">${formatDate(s.date)}</small>
        ${s.notes ? `<small style="font-size:11px;color:var(--text-dim);opacity:.7">${s.notes}</small>` : ''}
      </div>
      <div class="history-right">
        ${s.durationMinutes ? `<small>${s.durationMinutes} min</small>` : ''}
        <button class="history-del" onclick="event.stopPropagation();confirmDeleteSession(${s.id})">🗑</button>
      </div>
    </div>`;
  }).join('');
}

window.confirmDeleteSession = function(id) {
  showConfirmDelete(
    'Eliminare la sessione?',
    'Verranno eliminati anche tutti gli esercizi registrati.',
    async () => {
      await ExerciseSets.deleteForSession(id);
      await WorkoutSessions.delete(id);
      await renderHistory();
    }
  );
};

window.openHistory = async function() {
  await renderHistory();
  showScreen('history');
};

// ══════════════════════════════════════════════════════════════════════════
//  SESSION DETAIL
// ══════════════════════════════════════════════════════════════════════════
window.openDetail = async function(sessionId) {
  state.detailSessionId = sessionId;
  const session = await WorkoutSessions.get(sessionId);
  if (!session) return;

  $('detail-title').textContent = PLAN[session.dayType]?.label || session.dayType;
  $('detail-meta').innerHTML = `
    📅 ${formatDateLong(session.date)}
    ${session.durationMinutes ? `&nbsp;·&nbsp; ⏱ ${session.durationMinutes} min` : ''}
    <button class="continue-btn" onclick="continueSession(${sessionId},'${session.dayType}')">Continua ›</button>
  `;

  const sets = await ExerciseSets.getForSession(sessionId);
  const byExercise = {};
  sets.forEach(s => {
    if (!byExercise[s.exerciseName]) byExercise[s.exerciseName] = [];
    byExercise[s.exerciseName].push(s);
  });

  const list = $('detail-exercises');
  if (Object.keys(byExercise).length === 0) {
    list.innerHTML = `<div class="empty-state"><p>Nessun esercizio registrato</p></div>`;
  } else {
    list.innerHTML = Object.entries(byExercise).map(([name, exSets]) => {
      const volume = exSets.reduce((sum, s) => sum + s.reps * s.weightKg, 0);
      return `<div class="ex-summary">
        <strong>${name}</strong>
        ${exSets.map(s => `
          <div class="ex-summary-row">
            <span class="ex-summary-num">Serie ${s.setNumber}</span>
            <span class="ex-summary-detail">${s.reps} rip × ${s.weightKg === 0 ? 'corpo libero' : s.weightKg + ' kg'} &nbsp;·&nbsp; ${s.restSeconds}s recupero</span>
          </div>`).join('')}
        ${volume > 0 ? `<div class="ex-volume">Volume totale: ${volume.toFixed(0)} kg</div>` : ''}
      </div>`;
    }).join('');
  }

  showScreen('detail');
};

window.continueSession = async function(sessionId, dayType) {
  const session = await WorkoutSessions.get(sessionId);
  if (!session) return;
  state.activeSessionId = sessionId;
  state.activeDayType = dayType;
  state.sessionStartTime = Date.now();
  await loadWorkoutSets();
  renderWorkout();
  showScreen('workout');
};

// ══════════════════════════════════════════════════════════════════════════
//  CARDIO SCREEN
// ══════════════════════════════════════════════════════════════════════════
async function renderCardio() {
  const all = await CardioSessions.getAll();
  const filtered = all.filter(s => s.cardioType === state.cardioTab);

  // Tab buttons
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === state.cardioTab);
  });

  // Stats
  const total = filtered.length;
  const totalMin = filtered.reduce((s, c) => s + c.durationMinutes, 0);
  const totalDist = filtered.reduce((s, c) => s + c.distanceMeters, 0);
  $('cardio-stats').innerHTML = `
    <div class="stat-item"><strong>${total}</strong><small>Sessioni</small></div>
    <div class="stat-item"><strong>${totalMin}</strong><small>Minuti</small></div>
    ${totalDist > 0 ? `<div class="stat-item"><strong>${totalDist}</strong><small>Metri</small></div>` : ''}
  `;

  const list = $('cardio-list');
  if (filtered.length === 0) {
    list.innerHTML = `<div class="empty-state"><span class="icon">${CARDIO_ICONS[state.cardioTab]}</span>
      <p>Nessuna sessione registrata</p><small>Premi + per aggiungerne una</small></div>`;
    return;
  }

  list.innerHTML = filtered.map(s => {
    const details = [
      `${s.durationMinutes} min`,
      s.distanceMeters > 0 && `${s.distanceMeters}m`,
      s.avgHeartRate > 0 && `${s.avgHeartRate} bpm`,
      s.calories > 0 && `${s.calories} kcal`,
      s.cardioType === 'CYCLETTE' && s.resistanceLevel > 0 && `Resistenza ${s.resistanceLevel}`,
      s.cardioType === 'NUOTO' && s.poolLaps > 0 && `${s.poolLaps} vasche`,
      s.style && s.style,
    ].filter(Boolean).join(' · ');

    return `<div class="cardio-card">
      <span class="cardio-icon">${CARDIO_ICONS[s.cardioType]}</span>
      <div class="cardio-info">
        <strong>${formatDate(s.date)}</strong>
        <small>${details}</small>
        ${s.notes ? `<small style="opacity:.6">${s.notes}</small>` : ''}
      </div>
      <button class="cardio-del" onclick="confirmDeleteCardio(${s.id})">🗑</button>
    </div>`;
  }).join('');
}

window.switchTab = async function(type) {
  state.cardioTab = type;
  await renderCardio();
};

window.confirmDeleteCardio = function(id) {
  showConfirmDelete(
    'Eliminare la sessione cardio?', '',
    async () => { await CardioSessions.delete(id); await renderCardio(); }
  );
};

// ── Add Cardio Dialog ─────────────────────────────────────────────────────
window.openAddCardio = function() {
  $('dlg-cardio-type').querySelectorAll('.chip').forEach(c => {
    c.classList.toggle('active', c.dataset.type === state.cardioTab);
  });
  updateCardioFields(state.cardioTab);
  $('dlg-duration').value = '';
  $('dlg-distance').value = '';
  $('dlg-hr').value = '';
  $('dlg-calories').value = '';
  $('dlg-resistance').value = '';
  $('dlg-laps').value = '';
  $('dlg-style').value = '';
  $('dlg-cardio-notes').value = '';
  $('overlay-cardio').classList.remove('hidden');
};

window.closeCardioDialog = function() {
  $('overlay-cardio').classList.add('hidden');
};

window.selectCardioType = function(el, type) {
  $('dlg-cardio-type').querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  updateCardioFields(type);
};

function updateCardioFields(type) {
  $('fields-cyclette').classList.toggle('show', type === 'CYCLETTE');
  $('fields-nuoto').classList.toggle('show', type === 'NUOTO');
}

window.saveCardio = async function() {
  const duration = parseInt($('dlg-duration').value);
  if (!duration || duration < 1) { $('dlg-duration').focus(); return; }
  const type = $('dlg-cardio-type').querySelector('.chip.active')?.dataset.type || state.cardioTab;

  await CardioSessions.add({
    date: todayISO(),
    cardioType: type,
    durationMinutes: duration,
    distanceMeters: parseInt($('dlg-distance').value) || 0,
    avgHeartRate: parseInt($('dlg-hr').value) || 0,
    calories: parseInt($('dlg-calories').value) || 0,
    resistanceLevel: parseInt($('dlg-resistance').value) || 0,
    poolLaps: parseInt($('dlg-laps').value) || 0,
    style: $('dlg-style').value.trim(),
    notes: $('dlg-cardio-notes').value.trim(),
  });

  closeCardioDialog();
  state.cardioTab = type;
  await renderCardio();
};

// ══════════════════════════════════════════════════════════════════════════
//  CONFIRM DELETE
// ══════════════════════════════════════════════════════════════════════════
function showConfirmDelete(title, msg, cb) {
  $('confirm-title').textContent = title;
  $('confirm-msg').textContent = msg;
  state.deleteTarget = cb;
  $('confirm-overlay').classList.remove('hidden');
}

window.cancelDelete = function() {
  $('confirm-overlay').classList.add('hidden');
  state.deleteTarget = null;
};

window.executeDelete = async function() {
  $('confirm-overlay').classList.add('hidden');
  if (state.deleteTarget) await state.deleteTarget();
  state.deleteTarget = null;
};

// ══════════════════════════════════════════════════════════════════════════
//  NAVIGATION
// ══════════════════════════════════════════════════════════════════════════
window.goHome = async function() {
  await renderHome();
  showScreen('home');
};

window.openCardio = async function() {
  state.cardioTab = 'NUOTO';
  await renderCardio();
  showScreen('cardio');
};

// Prevent browser back from closing the app when in standalone mode
window.addEventListener('popstate', () => {
  if ($('screen-workout').classList.contains('active')) return;
  showScreen('home');
});

// ══════════════════════════════════════════════════════════════════════════
//  INIT
// ══════════════════════════════════════════════════════════════════════════
(async function init() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  }
  await renderHome();
  showScreen('home');
})();
