import AsyncStorage from '@react-native-async-storage/async-storage';

export type AuthUser = {
  id: string;
  email: string;
  name: string;
};

type StoredAccount = AuthUser & {
  password: string;
};

const accountsKey = 'silver-potato.mock-auth.accounts';
const sessionKey = 'silver-potato.mock-auth.session';

async function getAccounts() {
  const stored = await AsyncStorage.getItem(accountsKey);

  if (!stored) {
    return [];
  }

  try {
    return JSON.parse(stored) as StoredAccount[];
  } catch {
    return [];
  }
}

async function saveAccounts(accounts: StoredAccount[]) {
  await AsyncStorage.setItem(accountsKey, JSON.stringify(accounts));
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function validateCredentials(email: string, password: string) {
  if (!email.trim() || !password.trim()) {
    throw new Error('Email and password are required.');
  }

  if (!email.includes('@')) {
    throw new Error('Enter a valid email address.');
  }

  if (password.length < 6) {
    throw new Error('Password must be at least 6 characters.');
  }
}

export const mockAuth = {
  async getSession() {
    const stored = await AsyncStorage.getItem(sessionKey);

    if (!stored) {
      return null;
    }

    try {
      return JSON.parse(stored) as AuthUser;
    } catch {
      await AsyncStorage.removeItem(sessionKey);
      return null;
    }
  },

  async signUp(name: string, email: string, password: string) {
    validateCredentials(email, password);

    const accounts = await getAccounts();
    const normalizedEmail = normalizeEmail(email);
    const existingAccount = accounts.find(
      (account) => account.email === normalizedEmail,
    );

    if (existingAccount) {
      throw new Error('An account already exists for that email.');
    }

    const user: AuthUser = {
      id: Date.now().toString(36),
      email: normalizedEmail,
      name: name.trim() || normalizedEmail.split('@')[0],
    };

    await saveAccounts([...accounts, { ...user, password }]);
    await AsyncStorage.setItem(sessionKey, JSON.stringify(user));

    return user;
  },

  async signIn(email: string, password: string) {
    validateCredentials(email, password);

    const normalizedEmail = normalizeEmail(email);
    const accounts = await getAccounts();
    const account = accounts.find(
      (storedAccount) => storedAccount.email === normalizedEmail,
    );

    if (!account || account.password !== password) {
      throw new Error('Invalid email or password.');
    }

    const user = {
      id: account.id,
      email: account.email,
      name: account.name,
    };

    await AsyncStorage.setItem(sessionKey, JSON.stringify(user));

    return user;
  },

  async signOut() {
    await AsyncStorage.removeItem(sessionKey);
  },
};
