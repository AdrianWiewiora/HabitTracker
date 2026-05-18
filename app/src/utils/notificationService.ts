import { client } from '../api/client';


// Funkcja pomocnicza wymagana przez przeglądarki do konwersji klucza VAPID
function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

export const notificationService = {
    isSupported: (): boolean => {
        return 'Notification' in window && 'serviceWorker' in navigator;
    },

    requestPermission: async (): Promise<boolean> => {
        if (!notificationService.isSupported()) return false;
        if (Notification.permission === 'granted') return true;
        const permission = await Notification.requestPermission();
        return permission === 'granted';
    },

    subscribeUserToPush: async (): Promise<void> => {
        if (!notificationService.isSupported()) return;

        try {
            const baseUrl = import.meta.env.BASE_URL;
            const registration = await navigator.serviceWorker.register(`${baseUrl}sw.js`);
            console.log('Service Worker zarejestrowany pomyślnie pod:', `${baseUrl}sw.js`);

            let serviceWorker = registration.active || registration.installing || registration.waiting;
            if (!registration.active && serviceWorker) {
                await new Promise<void>((resolve) => {
                    serviceWorker!.addEventListener('statechange', (e: any) => {
                        if (e.target.state === 'activated') {
                            resolve();
                        }
                    });
                });
                console.log('Service Worker został pomyślnie aktywowany!');
            }

            const publicVapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
            if (!publicVapidKey) {
                console.error('Brak VITE_VAPID_PUBLIC_KEY w pliku .env frontendu!');
                return;
            }

            const convertedVapidKey = urlBase64ToUint8Array(publicVapidKey);

            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: convertedVapidKey
            });

            await client('/auth/push-subscription', {
                body: { subscription: JSON.stringify(subscription) }
            });

            console.log('Subskrypcja Push wysłana i zapisana na backendzie!');
        } catch (error) {
            console.error('Błąd podczas rejestracji powiadomień Push:', error);
        }
    }
};