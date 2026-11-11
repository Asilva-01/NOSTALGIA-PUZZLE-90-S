import type { ProgressState, SavedSession } from './types.ts';

const DB_NAME = 'puzzle-universe';
const DB_VERSION = 1;
const SESSION_STORE = 'sessions';
const PROGRESS_STORE = 'progress';
const SETTINGS_STORE = 'settings';

export type AppSettings = {
  helpPreset: 'casual' | 'desafio';
  timerEnabled: boolean;
  reducedMotion: boolean;
  soundEnabled: boolean;
  /** true só depois do jogador tocar Som; settings antigas sem este campo são migradas para som ligado. */
  soundChoiceMade: boolean;
};

export const DEFAULT_SETTINGS: AppSettings = {
  helpPreset: 'casual',
  timerEnabled: true,
  reducedMotion: false,
  soundEnabled: true,
  soundChoiceMade: false,
};

type StoredSettings = Partial<AppSettings> & { appId?: string };

/**
 * O default antigo era `soundEnabled: false`. Quem só herdou esse valor
 * (sites recém-publicados) passa a ter som ligado até desligar de propósito.
 */
export function normalizeSettings(raw?: StoredSettings | null): AppSettings {
  const soundChoiceMade = Boolean(raw?.soundChoiceMade);
  return {
    helpPreset: raw?.helpPreset === 'desafio' ? 'desafio' : DEFAULT_SETTINGS.helpPreset,
    timerEnabled: raw?.timerEnabled ?? DEFAULT_SETTINGS.timerEnabled,
    reducedMotion: raw?.reducedMotion ?? DEFAULT_SETTINGS.reducedMotion,
    soundEnabled: soundChoiceMade ? Boolean(raw?.soundEnabled) : true,
    soundChoiceMade,
  };
}

export function withSoundEnabled(settings: AppSettings, enabled: boolean): AppSettings {
  return { ...settings, soundEnabled: enabled, soundChoiceMade: true };
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(SESSION_STORE)) {
        db.createObjectStore(SESSION_STORE, { keyPath: 'key' });
      }
      if (!db.objectStoreNames.contains(PROGRESS_STORE)) {
        db.createObjectStore(PROGRESS_STORE, { keyPath: 'appId' });
      }
      if (!db.objectStoreNames.contains(SETTINGS_STORE)) {
        db.createObjectStore(SETTINGS_STORE, { keyPath: 'appId' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('Falha ao abrir IndexedDB'));
  });
}

function txDone(tx: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error('Transação IndexedDB falhou'));
    tx.onabort = () => reject(tx.error ?? new Error('Transação IndexedDB abortada'));
  });
}

export function sessionKey(appId: string): string {
  return `${appId}:current`;
}

export function emptyProgress(appId: string): ProgressState {
  return {
    version: 1,
    appId,
    completedPhaseIds: [],
    unlockedPhaseIds: ['phase-1'],
    stars: {},
    bestScores: {},
    lastRandomId: null,
    randomHistory: [],
    stats: { completedGames: 0, totalTimeMs: 0 },
  };
}

export class PersistStore {
  constructor(readonly appId: string) {}

  async saveSession(session: SavedSession): Promise<void> {
    try {
      const db = await openDb();
      const tx = db.transaction(SESSION_STORE, 'readwrite');
      tx.objectStore(SESSION_STORE).put({
        key: sessionKey(this.appId),
        ...session,
      });
      await txDone(tx);
      db.close();
    } catch {
      // Recuperação: dados corrompidos não derrubam a partida.
    }
  }

  async loadSession(): Promise<SavedSession | null> {
    try {
      const db = await openDb();
      const tx = db.transaction(SESSION_STORE, 'readonly');
      const request = tx.objectStore(SESSION_STORE).get(sessionKey(this.appId));
      const row = await requestToPromise<SavedSession & { key: string }>(request);
      await txDone(tx);
      db.close();
      if (!row || row.version !== 1 || row.appId !== this.appId) {
        return null;
      }
      return row;
    } catch {
      return null;
    }
  }

  async clearSession(): Promise<void> {
    try {
      const db = await openDb();
      const tx = db.transaction(SESSION_STORE, 'readwrite');
      tx.objectStore(SESSION_STORE).delete(sessionKey(this.appId));
      await txDone(tx);
      db.close();
    } catch {
      // ignore
    }
  }

  async loadProgress(): Promise<ProgressState> {
    try {
      const db = await openDb();
      const tx = db.transaction(PROGRESS_STORE, 'readonly');
      const request = tx.objectStore(PROGRESS_STORE).get(this.appId);
      const row = await requestToPromise<ProgressState>(request);
      await txDone(tx);
      db.close();
      if (!row || row.version !== 1) {
        return emptyProgress(this.appId);
      }
      return {
        ...emptyProgress(this.appId),
        ...row,
        unlockedPhaseIds:
          row.unlockedPhaseIds.length > 0 ? row.unlockedPhaseIds : ['phase-1'],
      };
    } catch {
      return emptyProgress(this.appId);
    }
  }

  async saveProgress(progress: ProgressState): Promise<void> {
    try {
      const db = await openDb();
      const tx = db.transaction(PROGRESS_STORE, 'readwrite');
      tx.objectStore(PROGRESS_STORE).put(progress);
      await txDone(tx);
      db.close();
    } catch {
      // ignore
    }
  }

  async loadSettings(): Promise<AppSettings> {
    try {
      const db = await openDb();
      const tx = db.transaction(SETTINGS_STORE, 'readonly');
      const request = tx.objectStore(SETTINGS_STORE).get(this.appId);
      const row = await requestToPromise<AppSettings & { appId: string }>(request);
      await txDone(tx);
      db.close();
      return normalizeSettings(row);
    } catch {
      return normalizeSettings();
    }
  }

  async saveSettings(settings: AppSettings): Promise<void> {
    try {
      const db = await openDb();
      const tx = db.transaction(SETTINGS_STORE, 'readwrite');
      tx.objectStore(SETTINGS_STORE).put({ appId: this.appId, ...settings });
      await txDone(tx);
      db.close();
    } catch {
      // ignore
    }
  }
}

function requestToPromise<T>(request: IDBRequest<T | undefined>): Promise<T | undefined> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('Leitura IndexedDB falhou'));
  });
}
