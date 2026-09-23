import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export interface ServiceWorkerState {
  isOnline: boolean;
  updateAvailable: boolean;
  applyUpdate: () => void;
  dismissUpdate: () => void;
  installAvailable: boolean;
  isInstalled: boolean;
  promptInstall: () => void;
  dismissInstall: () => void;
}

export function useServiceWorker(): ServiceWorkerState {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [waitingRegistration, setWaitingRegistration] =
    useState<ServiceWorkerRegistration | null>(null);
  const [installAvailable, setInstallAvailable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    function handleOnline() {
      setIsOnline(true);
    }
    function handleOffline() {
      setIsOnline(false);
    }

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    function handleBeforeInstallPrompt(event: Event) {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
      setInstallAvailable(true);
    }

    function handleAppInstalled() {
      setIsInstalled(true);
      setInstallAvailable(false);
      setDeferredPrompt(null);
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true;
    if (standalone) setIsInstalled(true);

    if (!("serviceWorker" in navigator)) {
      return () => {
        window.removeEventListener("online", handleOnline);
        window.removeEventListener("offline", handleOffline);
        window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
        window.removeEventListener("appinstalled", handleAppInstalled);
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
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
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

  async function promptInstall() {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === "accepted") {
      setIsInstalled(true);
    }
    setInstallAvailable(false);
    setDeferredPrompt(null);
  }

  function dismissInstall() {
    setInstallAvailable(false);
  }

  return {
    isOnline,
    updateAvailable,
    applyUpdate,
    dismissUpdate,
    installAvailable,
    isInstalled,
    promptInstall,
    dismissInstall,
  };
}
