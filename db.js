const DB_NAME = 'gymtracker';
const DB_VERSION = 1;

let db;

export function openDB() {
  return new Promise((resolve, reject) => {
    if (db) return resolve(db);
    const req = indexedDB.open(DB_NAME, DB_VERSION);

    req.onupgradeneeded = e => {
      const d = e.target.result;

      const sessions = d.createObjectStore('workoutSessions', { keyPath: 'id', autoIncrement: true });
      sessions.createIndex('date', 'date');
      sessions.createIndex('dayType', 'dayType');

      const sets = d.createObjectStore('exerciseSets', { keyPath: 'id', autoIncrement: true });
      sets.createIndex('sessionId', 'sessionId');

      const cardio = d.createObjectStore('cardioSessions', { keyPath: 'id', autoIncrement: true });
      cardio.createIndex('date', 'date');
      cardio.createIndex('cardioType', 'cardioType');
    };

    req.onsuccess = e => { db = e.target.result; resolve(db); };
    req.onerror = () => reject(req.error);
  });
}

function tx(storeName, mode = 'readonly') {
  return db.transaction(storeName, mode).objectStore(storeName);
}

function promisify(req) {
  return new Promise((res, rej) => {
    req.onsuccess = () => res(req.result);
    req.onerror = () => rej(req.error);
  });
}

function getAll(storeName, indexName, key) {
  return openDB().then(() => {
    const store = tx(storeName);
    const req = indexName ? store.index(indexName).getAll(key) : store.getAll();
    return promisify(req);
  });
}

// Workout Sessions
export const WorkoutSessions = {
  add: data => openDB().then(() => promisify(tx('workoutSessions','readwrite').add(data))),
  update: data => openDB().then(() => promisify(tx('workoutSessions','readwrite').put(data))),
  delete: id => openDB().then(() => promisify(tx('workoutSessions','readwrite').delete(id))),
  get: id => openDB().then(() => promisify(tx('workoutSessions').get(id))),
  getAll: () => getAll('workoutSessions').then(r => r.sort((a,b) => b.date.localeCompare(a.date))),
};

// Exercise Sets
export const ExerciseSets = {
  add: data => openDB().then(() => promisify(tx('exerciseSets','readwrite').add(data))),
  update: data => openDB().then(() => promisify(tx('exerciseSets','readwrite').put(data))),
  delete: id => openDB().then(() => promisify(tx('exerciseSets','readwrite').delete(id))),
  getForSession: sessionId => getAll('exerciseSets','sessionId', sessionId)
    .then(r => r.sort((a,b) => a.exerciseName.localeCompare(b.exerciseName) || a.setNumber - b.setNumber)),
  deleteForSession: async sessionId => {
    const sets = await getAll('exerciseSets','sessionId', sessionId);
    await openDB();
    const store = tx('exerciseSets','readwrite');
    return Promise.all(sets.map(s => promisify(store.delete(s.id))));
  }
};

// Cardio Sessions
export const CardioSessions = {
  add: data => openDB().then(() => promisify(tx('cardioSessions','readwrite').add(data))),
  update: data => openDB().then(() => promisify(tx('cardioSessions','readwrite').put(data))),
  delete: id => openDB().then(() => promisify(tx('cardioSessions','readwrite').delete(id))),
  getAll: () => getAll('cardioSessions').then(r => r.sort((a,b) => b.date.localeCompare(a.date))),
  getByType: type => getAll('cardioSessions','cardioType', type)
    .then(r => r.sort((a,b) => b.date.localeCompare(a.date))),
};
