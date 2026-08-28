import { uploadPdfToCloudinary } from "./cloudinary.service";

/**
 * Upload a PDF blob to Cloudinary and return download URL
 */
export async function uploadCertificatePdf({ certificateId, pdfBlob }) {
  const folder = `certificates/${certificateId}`;
  
  // Convert blob to file
  const file = new File([pdfBlob], `${certificateId}.pdf`, { type: 'application/pdf' });
  
  const url = await uploadPdfToCloudinary(file, folder);
  return { url, path: folder };
}