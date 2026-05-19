// src/utils/reminderScheduler.ts
import prisma from "./prisma.js";
import webpush from "web-push";


export const initReminderScheduler = () => {
    console.log('Budzik przypomnień został uruchomiony...');

    const publicKey = process.env.VAPID_PUBLIC_KEY;
    const privateKey = process.env.VAPID_PRIVATE_KEY;

    if (!publicKey || !privateKey) {
        console.warn('⚠️ Ostrzeżenie: Brak kluczy VAPID w pliku .env! Powiadomienia PUSH nie będą działać.');
    } else {
        webpush.setVapidDetails(
            'mailto:adi7878787@gmail.com',
            publicKey,
            privateKey
        );
    }

    setInterval(async () => {
        try {
            // Pobieramy aktualną godzinę serwera w formacie "HH:mm" (np. "21:30")
            const now = new Date();
            const currentHour = String(now.getHours()).padStart(2, '0');
            const currentMinute = String(now.getMinutes()).padStart(2, '0');
            const timeToMatch = `${currentHour}:${currentMinute}`;

            const habitsToRemind = await prisma.habit.findMany({
                where: {
                    reminderTime: timeToMatch,
                },
                include: {
                    creator: true
                }
            });

            if (habitsToRemind.length === 0) return;

            console.log(`[Scheduler] Znaleziono ${habitsToRemind.length} przypomnień na godzinę ${timeToMatch}`);

            for (const habit of habitsToRemind) {
                const associatedUser = habit.creator;

                if (associatedUser && associatedUser.pushSubscription) {
                    try {
                        const subscription = JSON.parse(associatedUser.pushSubscription);

                        const payload = JSON.stringify({
                            title: 'Habit Reminder! 🎯',
                            body: `Hey ${associatedUser.username}, time for your habit: "${habit.name}"!`
                        });

                        await webpush.sendNotification(subscription, payload);
                        console.log(`[Push] Wysłano powiadomienie dla ${associatedUser.username}: "${habit.name}"`);
                    } catch (pushError) {
                        console.error(`[Push Error] Nie udało się wysłać powiadomienia dla nawyku ID ${habit.id}:`, pushError);
                    }
                }
            }

        } catch (error) {
            console.error('[Scheduler Błąd]:', error);
        }
    }, 60000); // Odpala się co 60 000 ms, czyli równo co minutę
};