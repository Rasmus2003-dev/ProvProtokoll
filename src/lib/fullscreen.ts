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
  const isBrowserFs = !!(
    doc.fullscreenElement ||
    doc.webkitFullscreenElement ||
    doc.mozFullScreenElement ||
    doc.msFullscreenElement
  );
  const isVirtualFs = document.documentElement.classList.contains('tablet-fullscreen-mode');
  return isBrowserFs || isVirtualFs;
}

export async function toggleAppFullscreen(): Promise<boolean> {
  const docEl = document.documentElement as any;
  if (isCurrentlyFullscreen()) {
    docEl.classList.remove('tablet-fullscreen-mode');
    await exitFullscreen();
    window.dispatchEvent(new Event('appfullscreenchange'));
    return false;
  } else {
    const success = await enterFullscreen();
    if (!success) {
      // Fallback: Virtual fullscreen mode for mobile webviews / tablet browsers
      docEl.classList.add('tablet-fullscreen-mode');
    }
    window.dispatchEvent(new Event('appfullscreenchange'));
    return true;
  }
}

