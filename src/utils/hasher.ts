import bcrypt from "bcryptjs";

export function hash(password: string): string {
  return bcrypt.hashSync(password);
}

export function compare(password: string, hash: string): boolean {
  return bcrypt.compareSync(password, hash);
}
