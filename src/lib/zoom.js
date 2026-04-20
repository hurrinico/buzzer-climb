// Shared zoom callback registry — set by App, called by card components on hover
let _zoomCb = null;

export function setZoomCallback(cb) {
  _zoomCb = cb;
}

export function triggerZoom(kind, data, extra) {
  _zoomCb?.(kind, data, extra);
}
