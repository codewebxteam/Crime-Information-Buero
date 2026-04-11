/**
 * Cloudinary Service for Image Uploads
 * Uses signed uploads with API secret - browser compatible
 */

const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const API_KEY = import.meta.env.VITE_CLOUDINARY_API_KEY;
const API_SECRET = import.meta.env.VITE_CLOUDINARY_API_SECRET;

// Debug: Log the configuration on startup
console.log('Cloudinary Configuration:', {
  cloudName: CLOUDINARY_CLOUD_NAME,
  apiKey: API_KEY ? 'configured' : 'missing',
  apiSecret: API_SECRET ? 'configured' : 'missing'
});

const isConfigured = () => {
  return CLOUDINARY_CLOUD_NAME && 
         CLOUDINARY_CLOUD_NAME !== 'your_cloud_name' && 
         CLOUDINARY_CLOUD_NAME.trim() !== '' &&
         API_KEY &&
         API_SECRET;
};

// Generate SHA256 signature using Web Crypto API (browser compatible)
async function generateSignature(message) {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

/**
 * Upload an image file to Cloudinary using signed upload
 * @param {File} file - The file to upload
 * @param {string} folder - The folder in Cloudinary (e.g., 'photos', 'kyc', 'certificates')
 * @returns {Promise<string>} - The secure URL of the uploaded image
 */
export async function uploadImageToCloudinary(file, folder = 'general') {
  if (!file) return '';
  
  if (!isConfigured()) {
    console.error('Cloudinary not configured. Please add VITE_CLOUDINARY_CLOUD_NAME and API credentials to .env file.');
    alert('Cloudinary is not configured. Please contact administrator.');
    return '';
  }

  const timestamp = Math.round((new Date()).getTime() / 1000);
  const signature = await generateSignature(`folder=${folder}&timestamp=${timestamp}${API_SECRET}`);

  const formData = new FormData();
  formData.append('file', file);
  formData.append('api_key', API_KEY);
  formData.append('timestamp', timestamp);
  formData.append('signature', signature);
  formData.append('folder', folder);

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Cloudinary error:', errorData);
      throw new Error(errorData.error?.message || `Upload failed: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Cloudinary upload success:', data.secure_url);
    return data.secure_url;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    alert('Photo upload failed. Please try again or contact administrator.');
    return '';
  }
}

/**
 * Upload a PDF to Cloudinary using signed upload
 * @param {File} file - The PDF file to upload
 * @param {string} folder - The folder in Cloudinary (e.g., 'certificates')
 * @returns {Promise<string>} - The secure URL of the uploaded PDF
 */
export async function uploadPdfToCloudinary(file, folder = 'certificates') {
  if (!file) return '';
  
  if (!isConfigured()) {
    console.error('Cloudinary not configured. Please add VITE_CLOUDINARY_CLOUD_NAME and API credentials to .env file.');
    alert('Cloudinary is not configured. Please contact administrator.');
    return '';
  }

  const timestamp = Math.round((new Date()).getTime() / 1000);
  const signature = await generateSignature(`folder=${folder}&timestamp=${timestamp}${API_SECRET}`);

  const formData = new FormData();
  formData.append('file', file);
  formData.append('api_key', API_KEY);
  formData.append('timestamp', timestamp);
  formData.append('signature', signature);
  formData.append('folder', folder);

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/auto/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Cloudinary error:', errorData);
      throw new Error(errorData.error?.message || `Upload failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.secure_url;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    alert('Document upload failed. Please try again or contact administrator.');
    return '';
  }
}

/**
 * Upload a file (image or document) to Cloudinary using signed upload
 * @param {File} file - The file to upload
 * @param {string} folder - The folder in Cloudinary
 * @param {string} resourceType - 'image', 'raw', or 'auto'
 * @returns {Promise<string>} - The secure URL of the uploaded file
 */
export async function uploadToCloudinary(file, folder = 'general', resourceType = 'auto') {
  if (!file) return '';
  
  if (!isConfigured()) {
    console.error('Cloudinary not configured. Please add VITE_CLOUDINARY_CLOUD_NAME and API credentials to .env file.');
    alert('Cloudinary is not configured. Please contact administrator.');
    return '';
  }

  const timestamp = Math.round((new Date()).getTime() / 1000);
  const signature = await generateSignature(`folder=${folder}&timestamp=${timestamp}${API_SECRET}`);

  const formData = new FormData();
  formData.append('file', file);
  formData.append('api_key', API_KEY);
  formData.append('timestamp', timestamp);
  formData.append('signature', signature);
  formData.append('folder', folder);

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Cloudinary error:', errorData);
      throw new Error(errorData.error?.message || `Upload failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.secure_url;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    alert('File upload failed. Please try again or contact administrator.');
    return '';
  }
}
