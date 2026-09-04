export function useLatestRequest() {
  let seq = 0;

  const begin = () => ++seq;
  const isLatest = (id) => id === seq;

  return { begin, isLatest };
}
