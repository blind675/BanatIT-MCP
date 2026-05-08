import dotenv from 'dotenv';

dotenv.config();

const API_BASE_URL = process.env.API_BASE_URL;
/**
 * Calls the Google Apps Script API with the given parameters.
 * @param {Object} params - Query parameters (resource, action, id, etc.)
 * @returns {Promise<Object>} The API response
 */
export async function callApi(params) {
  const url = new URL(API_BASE_URL);

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) {
      url.searchParams.append(key, value);
    }
  }

  const response = await fetch(url.toString());
  const data = await response.json();

  if (data.status === 'error') {
    throw new Error(data.message || 'API error');
  }

  return data;
}
