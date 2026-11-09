export function defined<T>(value: T | undefined | null, message: string): T {
  if (value === undefined || value === null) {
    throw new Error(message);
  }
  return value;
}

export function fail(message: string): never {
  throw new Error(message);
}
