/**
 * Optional export frame: a rectangle with fixed aspect ratio, centered in the
 * window. When the frame is set, exports are cropped to it.
 */
// Minimum distance between the frame and the window edges (px). Vertical
// margin leaves room for the controls at the top.
const MARGIN_X = 32;
const MARGIN_Y = 64;

export const FRAME_PRESETS = [
  {label: 'None', value: ''},
  {label: '1:1', value: '1:1'},
  {label: '4:3', value: '4:3'},
  {label: '3:4', value: '3:4'},
  {label: '3:2', value: '3:2'},
  {label: '2:3', value: '2:3'},
  {label: '16:9', value: '16:9'},
  {label: '9:16', value: '9:16'},
  {label: 'A4 landscape', value: '1.414:1'},
  {label: 'A4 portrait', value: '1:1.414'},
  {label: 'Mug (approx.)', value: '2.4:1'},
];

let ratio = null;

/**
 * Sets the frame from a `width:height` string. Empty or invalid value removes the frame.
 */
export function setFrame(value) {
  ratio = parseRatio(value);
}

/**
 * Returns the frame rectangle in window coordinates, multiplied by `scale`
 * (e.g. pixel ratio), or null if there is no frame.
 */
export function getFrameRect(scale = 1) {
  if (!ratio) return null;

  let maxWidth = Math.max(window.innerWidth - 2 * MARGIN_X, 1);
  let maxHeight = Math.max(window.innerHeight - 2 * MARGIN_Y, 1);
  let width = Math.min(maxWidth, maxHeight * ratio);
  let height = width / ratio;
  return {
    left: Math.round((window.innerWidth - width) / 2 * scale),
    top: Math.round((window.innerHeight - height) / 2 * scale),
    width: Math.round(width * scale),
    height: Math.round(height * scale)
  };
}

/**
 * Returns the frame bounds as `[south, west, north, east]`, as expected by the
 * overpass bbox filter.
 */
export function getFrameBBox(renderer, projector) {
  let rect = getFrameRect();
  let [west, north] = toLonLat(rect.left, rect.top);
  let [east, south] = toLonLat(rect.left + rect.width, rect.top + rect.height);
  return [south, west, north, east];

  function toLonLat(clientX, clientY) {
    let sceneCoordinate = renderer.getSceneCoordinate(clientX, clientY);
    // Grid flips the y axis of the projector, see Grid.getProjector()
    return projector.invert([sceneCoordinate[0], -sceneCoordinate[1]]);
  }
}

function parseRatio(value) {
  let match = /^(\d*\.?\d+):(\d*\.?\d+)$/.exec(value || '');
  if (!match) return null;

  let parsed = Number(match[1]) / Number(match[2]);
  return parsed > 0 && Number.isFinite(parsed) ? parsed : null;
}
