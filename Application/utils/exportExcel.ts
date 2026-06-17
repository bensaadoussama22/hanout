import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { getToken, ApiError } from './api';

// Keep in sync with utils/api.ts
const API_URL = 'http://10.0.2.2:4000/api';

export async function downloadAndShareExcelReport() {
  const token = await getToken();
  const url = `${API_URL}/export/excel`;
  const filename = `rapport-gestion-${new Date().toISOString().split('T')[0]}.xlsx`;
  const destination = new File(Paths.document, filename);

  let file: File;
  try {
    file = await File.downloadFileAsync(url, destination, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      idempotent: true,
    });
  } catch (err: any) {
    throw new ApiError(err.message || 'Erreur de téléchargement', 0);
  }

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(file.uri);
  }
}
