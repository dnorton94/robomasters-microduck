// Browser-level network isolation for Mission mode. The simulator and its
// policies are loaded before a mission starts; while locked, no mission code
// can open an HTTP, WebSocket, EventSource, beacon, or WebRTC connection.
let locked = false;
let installed = false;
const liveConnections = new Set();

const denied = () => new DOMException("Network access is disabled in Mission mode", "NetworkError");

export function installMissionNetworkLock() {
  if (installed || typeof window === "undefined") return;
  installed = true;

  const nativeFetch = window.fetch.bind(window);
  window.fetch = (...args) => locked ? Promise.reject(denied()) : nativeFetch(...args);

  const nativeOpen = window.XMLHttpRequest?.prototype.open;
  if (nativeOpen) window.XMLHttpRequest.prototype.open = function (...args) {
    if (locked) throw denied();
    return nativeOpen.apply(this, args);
  };

  const wrapConnection = (name) => {
    const Native = window[name];
    if (!Native) return;
    window[name] = class MissionGuardedConnection extends Native {
      constructor(...args) {
        if (locked) throw denied();
        super(...args);
        liveConnections.add(this);
        this.addEventListener?.("close", () => liveConnections.delete(this), { once: true });
      }
    };
  };
  wrapConnection("WebSocket");
  wrapConnection("EventSource");
  wrapConnection("RTCPeerConnection");

  if (navigator.sendBeacon) {
    const nativeBeacon = navigator.sendBeacon.bind(navigator);
    navigator.sendBeacon = (...args) => locked ? false : nativeBeacon(...args);
  }
}

export function setMissionNetworkLock(next) {
  locked = !!next;
  if (!locked) return;
  for (const connection of liveConnections) {
    try { connection.close(); } catch {}
  }
  liveConnections.clear();
}

export function isMissionNetworkLocked() {
  return locked;
}
