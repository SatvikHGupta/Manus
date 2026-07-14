export function canUseWebShareFiles() {
  return typeof navigator !== 'undefined' && !!navigator.share && !!navigator.canShare;
}

export async function shareFiles(files, meta = {}) {
  if (!canUseWebShareFiles()) {
    throw new Error("Sharing isn't supported on this browser - try Download instead.");
  }
  const shareData = { files, ...meta };
  if (!navigator.canShare(shareData)) {
    throw new Error("This file can't be shared on this device - try Download instead.");
  }
  await navigator.share(shareData);
}
