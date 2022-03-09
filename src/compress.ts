export default function compress(map: string) {
  return map
    .trim()
    .replaceAll('\n', '')  // gets rid of new lines
    .replace(/\s\s+/g, ' ') // shrinks multiple spaces (including tabs) into one space
    .replace(/(\(|\))(?=([^"]*"[^"]*")*[^"]*$)/g, (rep: string) => rep === '(' ? '[' : ']') // replaces (,) to [,] when not inside a string
    .replace(/({ | }|\[ | \])(?=([^"]*"[^"]*")*[^"]*$)/g, (rep: string) => rep.trim()) // trims spaces left over around brackets when not inside a string
}
