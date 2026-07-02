import bcrypt from "bcryptjs";

const rounds = process.env == "development"? 1 : 12;

async function hash(password) {
  return bcrypt.hash(password, rounds);
}

async function compare(providedPassword, storedPassword) {
  return bcrypt.compare(providedPassword, storedPassword);
}


const password = { hash, compare }
export default password;
