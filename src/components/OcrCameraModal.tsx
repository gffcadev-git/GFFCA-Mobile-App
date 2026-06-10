import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  Vibration,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
  usePhotoOutput,
} from 'react-native-vision-camera';
import { useColors, useSpacing, useTypography } from '../theme';
import { Icon } from './Icon';
import { recognizeImageText, withTimeout } from '../services/ocrService';

type Props = Readonly<{
  visible: boolean;
  /** Short instruction shown over the frame, e.g. "Scan the VIN". */
  prompt?: string;
  onClose: () => void;
  /** Called with the OCR text once a photo is captured and recognised. */
  onCapture: (text: string) => void;
  /**
   * When provided, the camera auto-scans: it silently photographs every
   * ~1.5 s and locks onto the first frame whose text parses, so the user
   * never sees a single bad frame as a failure. The shutter stays as a
   * manual fallback.
   */
  parse?: (ocrText: string) => string | null;
}>;

/** Cadence of silent auto-scan captures while waiting for a parseable frame. */
const AUTO_SCAN_INTERVAL_MS = 1500;
/** A capture past this is wedged — give up on it so the scan loop stays alive. */
const CAPTURE_TIMEOUT_MS = 10_000;

/**
 * Full-screen camera that takes a photo and returns the recognised text.
 * Handles the permission flow itself; the caller just toggles `visible`.
 */
export function OcrCameraModal({ visible, prompt, onClose, onCapture, parse }: Props) {
  const colors = useColors();
  const sp     = useSpacing();
  const typo   = useTypography();
  const insets = useSafeAreaInsets();
  const styles = makeStyles(sp, typo);

  const { hasPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice('back');
  const photoOutput = usePhotoOutput({ qualityPrioritization: 'balanced' });

  const [busy, setBusy] = useState(false);
  const [denied, setDenied] = useState(false);

  // One capture/OCR at a time (shared by the auto-scan loop and the shutter);
  // locked once a value is accepted so late frames can't fire twice.
  const capturingRef = useRef(false);
  const lockedRef = useRef(false);

  // Ask for permission the first time the sheet opens.
  useEffect(() => {
    if (!visible) return;
    lockedRef.current = false;
    if (hasPermission) { setDenied(false); return; }
    requestPermission().then(granted => setDenied(!granted));
  }, [visible, hasPermission, requestPermission]);

  const capture = async () => {
    if (busy || capturingRef.current || lockedRef.current) return;
    capturingRef.current = true;
    setBusy(true);
    try {
      const file = await photoOutput.capturePhotoToFile({ flashMode: 'off' }, {});
      const text = await recognizeImageText(file.filePath);
      lockedRef.current = true;
      onCapture(text);
      onClose();
    } catch {
      // Non-destructive — let the user simply retry from the same sheet.
    } finally {
      capturingRef.current = false;
      setBusy(false);
    }
  };

  const ready = hasPermission && !!device;
  // Keep the session running while a capture is in flight — deactivating
  // mid-capture aborts the photo.
  const cameraActive = visible && ready;

  // Auto-scan: silently photograph on an interval and stop on the first frame
  // whose text parses. Failed frames are invisible — the loop just keeps going.
  useEffect(() => {
    if (!visible || !ready || !parse) return;
    const tick = async () => {
      if (capturingRef.current || lockedRef.current) return;
      capturingRef.current = true;
      try {
        const file = await withTimeout(
          photoOutput.capturePhotoToFile({ flashMode: 'off', enableShutterSound: false }, {}),
          CAPTURE_TIMEOUT_MS,
          'Photo capture',
        );
        if (lockedRef.current) return;
        const text = await recognizeImageText(file.filePath);
        if (lockedRef.current || !parse(text)) return;
        lockedRef.current = true;
        Vibration.vibrate(150);
        onCapture(text);
        onClose();
      } catch {
        // Bad frame — keep scanning.
      } finally {
        capturingRef.current = false;
      }
    };
    const id = setInterval(tick, AUTO_SCAN_INTERVAL_MS);
    return () => clearInterval(id);
  }, [visible, ready, parse, photoOutput, onCapture, onClose]);

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <View style={styles.root}>
        {ready ? (
          <Camera
            style={StyleSheet.absoluteFill}
            device={device}
            isActive={cameraActive}
            outputs={[photoOutput]}
          />
        ) : (
          <View style={[styles.fallback, { backgroundColor: colors.background.default }]}>
            <Icon name="camera-outline" size={48} color={colors.text.secondary} />
            <Text style={[styles.fallbackText, { color: colors.text.primary }]}>
              {denied
                ? 'Camera access is off. Enable it in Settings to scan.'
                : device
                  ? 'Requesting camera access…'
                  : 'No camera available on this device.'}
            </Text>
            {denied && (
              <TouchableOpacity onPress={() => Linking.openSettings()} style={[styles.settingsBtn, { borderColor: colors.border }]}>
                <Text style={[styles.settingsText, { color: colors.text.link }]}>Open Settings</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Frame guide + prompt */}
        {ready && (
          <View style={styles.overlay} pointerEvents="none">
            <View style={[styles.frame, { borderColor: colors.primary.contrastText }]} />
            {!!prompt && <Text style={styles.prompt}>{prompt}</Text>}
            {!!parse && (
              <Text style={styles.promptSub}>
                Scanning automatically — hold steady, or use the shutter
              </Text>
            )}
          </View>
        )}

        {/* Close button */}
        <TouchableOpacity
          onPress={onClose}
          hitSlop={12}
          style={[styles.closeBtn, { top: insets.top + sp.sm }]}
        >
          <Icon name="close" size={26} color="#FFFFFF" />
        </TouchableOpacity>

        {/* Shutter */}
        {ready && (
          <View style={[styles.shutterRow, { bottom: insets.bottom + sp.xl }]}>
            <TouchableOpacity
              onPress={capture}
              disabled={busy}
              style={styles.shutter}
              activeOpacity={0.7}
            >
              {busy
                ? <ActivityIndicator color="#FFFFFF" />
                : <View style={styles.shutterInner} />}
            </TouchableOpacity>
            {busy && <Text style={styles.reading}>Reading…</Text>}
          </View>
        )}
      </View>
    </Modal>
  );
}

function makeStyles(
  sp:   ReturnType<typeof useSpacing>,
  typo: ReturnType<typeof useTypography>,
) {
  return StyleSheet.create({
    root: { flex: 1, backgroundColor: '#000000' },

    fallback: {
      flex:           1,
      alignItems:     'center',
      justifyContent: 'center',
      gap:            sp.md,
      paddingHorizontal: sp.xl,
    },
    fallbackText: { fontSize: typo.fontSize.md, textAlign: 'center', lineHeight: typo.lineHeight.normal },
    settingsBtn: {
      borderWidth:       1,
      borderRadius:      typo.borderRadius.md,
      paddingHorizontal: sp.lg,
      paddingVertical:   sp.sm,
    },
    settingsText: { fontSize: typo.fontSize.md, fontWeight: typo.fontWeight.semiBold },

    overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' },
    frame: {
      width:        '82%',
      height:       120,
      borderWidth:  2,
      borderRadius: typo.borderRadius.md,
      borderStyle:  'dashed',
    },
    prompt: {
      marginTop:         sp.md,
      color:             '#FFFFFF',
      fontSize:          typo.fontSize.md,
      fontWeight:        typo.fontWeight.semiBold,
      textAlign:         'center',
      paddingHorizontal: sp.lg,
    },
    promptSub: {
      marginTop:         sp.xs,
      color:             'rgba(255,255,255,0.85)',
      fontSize:          typo.fontSize.sm,
      textAlign:         'center',
      paddingHorizontal: sp.lg,
    },

    closeBtn: {
      position: 'absolute',
      right:    sp.md,
      width:    40,
      height:   40,
      alignItems:     'center',
      justifyContent: 'center',
      borderRadius:   20,
      backgroundColor: 'rgba(0,0,0,0.45)',
    },

    shutterRow: { position: 'absolute', alignSelf: 'center', alignItems: 'center', gap: sp.sm },
    shutter: {
      width:          74,
      height:         74,
      borderRadius:   37,
      borderWidth:    4,
      borderColor:    '#FFFFFF',
      alignItems:     'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(255,255,255,0.2)',
    },
    shutterInner: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#FFFFFF' },
    reading: { color: '#FFFFFF', fontSize: typo.fontSize.sm, fontWeight: typo.fontWeight.semiBold },
  });
}
