export function pad4(n) {
  return String(n).padStart(4, "0");
}

export function makeMemberId(counter) {
  const year = new Date().getFullYear();
  return `CIB-${year}-${pad4(counter)}`;
}

export function makeCertificateId(counter) {
  const year = new Date().getFullYear();
  return `CERT-${year}-${pad4(counter)}`;
}