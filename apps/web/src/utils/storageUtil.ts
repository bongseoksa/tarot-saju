import CryptoJS from "crypto-js";
import LZString from "lz-string";

const SECRET = "jeomhana-v1";

export function encrypt(data: string): string {
  const compressed = LZString.compressToUTF16(data);
  return CryptoJS.AES.encrypt(compressed, SECRET).toString();
}

export function decrypt(cipher: string): string {
  const bytes = CryptoJS.AES.decrypt(cipher, SECRET);
  const compressed = bytes.toString(CryptoJS.enc.Utf8);
  return LZString.decompressFromUTF16(compressed) ?? "";
}
