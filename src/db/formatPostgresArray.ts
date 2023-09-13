export function formatPostgresObject<T>(obj: T) {
  return `(${Object.values(obj).join(',')})`;
}

export function formatPostgresArray<T>(array: T[]) {
  return `{${array.map(obj => `"${formatPostgresObject(obj)}"`).join(',')}}`
}
