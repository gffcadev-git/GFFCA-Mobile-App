/**
 * OCR glue — turns an image into plain text via ML Kit, plus a gallery picker.
 *
 * Everything downstream (VIN / container / seal extraction) consumes the plain
 * string this returns, so the rest of the app stays OCR-engine-agnostic
 * (design/FIELD_PARSING_SPEC.md §1).
 */
import TextRecognition from '@react-native-ml-kit/text-recognition';
import { launchImageLibrary } from 'react-native-image-picker';

/** ML Kit needs a URI; vision-camera hands back a bare path on some platforms. */
function toUri(pathOrUri: string): string {
  return /^[a-z]+:\/\//i.test(pathOrUri) ? pathOrUri : `file://${pathOrUri}`;
}

/**
 * Reject after `ms` so a wedged native call can't freeze the UI in a busy
 * state forever — a late native result is simply ignored.
 */
export function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  let timer: ReturnType<typeof setTimeout>;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(`${label} timed out`)), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer)) as Promise<T>;
}

/** Recognition should take a few seconds; past this something is wedged. */
const OCR_TIMEOUT_MS = 30_000;

/** Run text recognition on a captured/selected image. Returns the raw text. */
export async function recognizeImageText(pathOrUri: string): Promise<string> {
  const result = await withTimeout(
    TextRecognition.recognize(toUri(pathOrUri)),
    OCR_TIMEOUT_MS,
    'Text recognition',
  );
  return result.text ?? '';
}

/**
 * Let the user pick an image from their library and OCR it.
 * Returns the recognised text, or null if they cancelled / picked nothing.
 */
export async function pickImageAndRecognize(): Promise<string | null> {
  const res = await launchImageLibrary({ mediaType: 'photo', selectionLimit: 1 });
  if (res.didCancel) return null;
  if (res.errorCode) throw new Error(res.errorMessage ?? res.errorCode);
  const uri = res.assets?.[0]?.uri;
  if (!uri) return null;
  return recognizeImageText(uri);
}
