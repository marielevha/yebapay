type LoginFormDefaults = {
  phoneNumber: string;
  password: string;
};

type RegisterFormDefaults = {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  password: string;
};

function readEnv(name: string) {
  const value = process.env[name]?.trim();
  return value ? value : undefined;
}

function buildRegisterSeed() {
  const explicitSeed = readEnv('EXPO_PUBLIC_DEV_REGISTER_SEED');
  if (explicitSeed) {
    return explicitSeed.replace(/[^0-9]/g, '').slice(-7).padStart(7, '0');
  }

  return String(Date.now()).slice(-7).padStart(7, '0');
}

export function getLoginFormDefaults(): LoginFormDefaults {
  if (!__DEV__) {
    return {
      phoneNumber: '',
      password: '',
    };
  }

  return {
    phoneNumber: readEnv('EXPO_PUBLIC_DEV_LOGIN_PHONE') ?? '242060123456',
    password: readEnv('EXPO_PUBLIC_DEV_LOGIN_PASSWORD') ?? 'Secret123',
  };
}

export function getRegisterFormDefaults(): RegisterFormDefaults {
  if (!__DEV__) {
    return {
      firstName: '',
      lastName: '',
      phoneNumber: '',
      email: '',
      password: '',
    };
  }

  const seed = buildRegisterSeed();

  return {
    firstName: readEnv('EXPO_PUBLIC_DEV_REGISTER_FIRST_NAME') ?? 'Maeva',
    lastName: readEnv('EXPO_PUBLIC_DEV_REGISTER_LAST_NAME') ?? 'Ngoma',
    phoneNumber: readEnv('EXPO_PUBLIC_DEV_REGISTER_PHONE') ?? `24206${seed}`,
    email: readEnv('EXPO_PUBLIC_DEV_REGISTER_EMAIL') ?? `dev.${seed}@yebapay.test`,
    password: readEnv('EXPO_PUBLIC_DEV_REGISTER_PASSWORD') ?? 'Secret123',
  };
}
