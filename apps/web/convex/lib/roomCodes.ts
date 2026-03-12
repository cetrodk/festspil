const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ"; // 23 chars, no I/L/O

export function generateRoomCode(): string {
  let code = "";
  for (let i = 0; i < 4; i++) {
    code += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return code;
}
