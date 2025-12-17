import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

/* ---------------- GLOBAL HANDLER ---------------- */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/* ---------------- ANDROID CHANNELS ---------------- */
if (Platform.OS === "android") {
  Notifications.setNotificationChannelAsync("study-reminders", {
    name: "Study Reminders",
    importance: Notifications.AndroidImportance.HIGH,
    sound: "default",
  }).catch(() => {});

  Notifications.setNotificationChannelAsync("streak-alerts", {
    name: "Streak Alerts",
    importance: Notifications.AndroidImportance.HIGH,
    sound: "default",
  }).catch(() => {});
}

/* ---------------- MESSAGES ---------------- */
const studyMessages = [
  { title: "⏳ Time to Study!", body: "Stay consistent and keep your streak alive!" },
  { title: "📚 Quick Review Time", body: "Open your flashcards for a 5-minute session!" },
  { title: "🔥 Keep Going!", body: "You're building a strong habit — continue now!" },
  { title: "💡 Study Tip", body: "Short study bursts beat long cramming sessions!" },
  { title: "🧠 Strengthen Your Memory", body: "A quick revision goes a long way!" },
];

/* ---------------- PERMISSION ---------------- */
export async function requestNotificationPermission() {
  const { status } = await Notifications.getPermissionsAsync();

  if (status !== "granted") {
    const res = await Notifications.requestPermissionsAsync();
    return res.status === "granted";
  }

  return true;
}

/* ---------------- CLEAR HELPERS ---------------- */
export async function clearStudyReminders() {
  const all = await Notifications.getAllScheduledNotificationsAsync();
  const studyIds = all
    .filter(n => n.content?.categoryIdentifier === "study")
    .map(n => n.identifier);

  await Promise.all(
    studyIds.map(id =>
      Notifications.cancelScheduledNotificationAsync(id)
    )
  );
}

export async function clearStreakAlerts() {
  const all = await Notifications.getAllScheduledNotificationsAsync();
  const streakIds = all
    .filter(n => n.content?.categoryIdentifier === "streak")
    .map(n => n.identifier);

  await Promise.all(
    streakIds.map(id =>
      Notifications.cancelScheduledNotificationAsync(id)
    )
  );
}

/* ---------------- STUDY REMINDERS (ANDROID SAFE) ---------------- */
/**
 * intervalHours → 1, 3, 6, 24 etc
 * Uses repeating trigger (ONLY 1 SYSTEM ALARM)
 */
export async function scheduleStudyReminder(intervalHours: number) {
  const allowed = await requestNotificationPermission();
  if (!allowed) return;

  await clearStudyReminders();

  const msg =
    studyMessages[Math.floor(Math.random() * studyMessages.length)];

  await Notifications.scheduleNotificationAsync({
    content: {
      title: msg.title,
      body: msg.body,
      sound: "default",
      categoryIdentifier: "study",
    },
    trigger: {
      seconds: intervalHours * 60 * 60,
      repeats: true,
    },
  });
}

/* ---------------- DAILY STREAK ALERT ---------------- */
export async function scheduleDailyStreakAlert(hour = 21) {
  const allowed = await requestNotificationPermission();
  if (!allowed) return;

  await clearStreakAlerts();

  const date = new Date();
  date.setHours(hour, 0, 0, 0);

  // if already passed today → tomorrow
  if (date <= new Date()) {
    date.setDate(date.getDate() + 1);
  }

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "🔥 Don’t break your streak",
      body: "Study once today to keep your progress going!",
      sound: "default",
      categoryIdentifier: "streak",
    },
    trigger: {
      type: "date",
      date,
      repeats: true,
    },
  });
}
