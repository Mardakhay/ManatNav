import { useEffect, useState } from "react";

export interface ServiceWorkerState {
  isOnline: boolean;
  updateAvailable: boolean;
  applyUpdate: () => void;
  dismissUpdate: () => void;
}

export function useServiceWorker(): ServiceWorkerState {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [waitingRegistration, setWaitingRegistration] =
    useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    function handleOnline() {
      setIsOnline(true);
    }
    function handleOffline() {
      setIsOnline(false);
    }

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    if (!("serviceWorker" in navigator)) {
      return () => {
        window.removeEventListener("online", handleOnline);
        window.removeEventListener("offline", handleOffline);
      };
    }

    let registration: ServiceWorkerRegistration | null = null;

    navigator.serviceWorker
      .register("/sw.js")
      .then((reg) => {
        registration = reg;

        function checkWaiting() {
          if (reg.waiting) {
            setWaitingRegistration(reg);
            setUpdateAvailable(true);
          }
        }

        checkWaiting();
        reg.addEventListener("updatefound", checkWaiting);
      })
      .catch(() => {
        // Registration failures are non-fatal — app still works without offline support.
      });

    function handleControllerChange() {
      window.location.reload();
    }

    navigator.serviceWorker.addEventListener("controllerchange", handleControllerChange);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      navigator.serviceWorker.removeEventListener("controllerchange", handleControllerChange);
      registration?.removeEventListener?.("updatefound", () => {});
    };
  }, []);

  function applyUpdate() {
    if (waitingRegistration?.waiting) {
      waitingRegistration.waiting.postMessage("skipWaiting");
    }
  }

  function dismissUpdate() {
    setUpdateAvailable(false);
  }

  return { isOnline, updateAvailable, applyUpdate, dismissUpdate };
}
