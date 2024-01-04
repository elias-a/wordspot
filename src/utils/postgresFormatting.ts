export function formatPostgresObject<T>(obj: T) {
  return `(${Object.values(obj).join(',')})`;
}

export function formatPostgresArray<T>(array: T[]) {
  return `{${array.map(obj => `"${formatPostgresObject(obj)}"`).join(',')}}`
}

export function formatPostgresArrayOfArrays<T>(array: T[]) {
  return `{${array.map(inner => `"(${inner.join(',')})"`)}}`;
}
