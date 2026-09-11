/**
 * Cross-platform Fullscreen helper for Desktop, Android tablets, iPads and webviews.
 */
export async function enterFullscreen(): Promise<boolean> {
  const docEl = document.documentElement as any;
  try {
    if (docEl.requestFullscreen) {
      await docEl.requestFullscreen();
      return true;
    } else if (docEl.webkitRequestFullscreen) {
      /* Safari, older Chrome & Android webview */
      await docEl.webkitRequestFullscreen();
      return true;
    } else if (docEl.msRequestFullscreen) {
      await docEl.msRequestFullscreen();
      return true;
    } else if (docEl.mozRequestFullScreen) {
      await docEl.mozRequestFullScreen();
      return true;
    }
  } catch (err) {
    console.warn('Fullscreen request failed or was dismissed:', err);
  }
  return false;
}

export async function exitFullscreen(): Promise<boolean> {
  const doc = document as any;
  try {
    if (doc.exitFullscreen) {
      await doc.exitFullscreen();
      return true;
    } else if (doc.webkitExitFullscreen) {
      await doc.webkitExitFullscreen();
      return true;
    } else if (doc.msExitFullscreen) {
      await doc.msExitFullscreen();
      return true;
    } else if (doc.mozCancelFullScreen) {
      await doc.mozCancelFullScreen();
      return true;
    }
  } catch (err) {
    console.warn('Exit fullscreen failed:', err);
  }
  return false;
}

export function isCurrentlyFullscreen(): boolean {
  const doc = document as any;
  return !!(
    doc.fullscreenElement ||
    doc.webkitFullscreenElement ||
    doc.mozFullScreenElement ||
    doc.msFullscreenElement
  );
}

export function toggleAppFullscreen(): Promise<boolean> {
  if (isCurrentlyFullscreen()) {
    return exitFullscreen();
  } else {
    return enterFullscreen();
  }
}
