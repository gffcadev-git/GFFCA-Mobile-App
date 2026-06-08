import React from 'react';
import { Image, ImageStyle, StyleProp } from 'react-native';

type Props = Readonly<{
  /** Remote graphic URL from the dynamic theme (useAssets). Empty → fallback */
  uri?: string;
  style?: StyleProp<ImageStyle>;
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'center';
  /** Rendered when no remote graphic is configured (icon / text placeholder) */
  fallback: React.ReactNode;
}>;

/**
 * Renders a remote, admin-configurable graphic when its URL is present in the
 * dynamic theme; otherwise falls back to the bundled icon/text. Lets the
 * brand logo and illustration graphics be swapped over-the-air without a
 * release, while icon glyphs stay bundled.
 */
export function AssetImage({ uri, style, resizeMode = 'contain', fallback }: Props) {
  if (!uri) {
    return <>{fallback}</>;
  }
  return <Image source={{ uri }} style={style} resizeMode={resizeMode} />;
}
