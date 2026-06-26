export function maskSecret(value: string | undefined | null): string {
  if (!value) return '';
  if (value.length <= 6) return '***';
  return `${value.slice(0, 2)}***${value.slice(-2)}`;
}

export function removeSensitiveKeys<T>(input: T): T {
  if (Array.isArray(input)) {
    return input.map(removeSensitiveKeys) as T;
  }

  if (input && typeof input === 'object') {
    const blocked = new Set(['password', 'senha', 'secret', 'token', 'authorization']);
    const result: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(input as Record<string, unknown>)) {
      if (blocked.has(key.toLowerCase())) {
        result[key] = '***';
      } else {
        result[key] = removeSensitiveKeys(value);
      }
    }

    return result as T;
  }

  return input;
}
