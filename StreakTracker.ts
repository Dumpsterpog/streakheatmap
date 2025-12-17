import { auth, db } from "@/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";

/* Mark today's date as studied */
export async function markStudyActivity() {
  const uid = auth.currentUser?.uid;
  if (!uid) return;

  const today = new Date();
  const key = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(today.getDate()).padStart(2, "0")}`;

  const ref = doc(db, "users", uid, "streaks", "main");

  const snap = await getDoc(ref);
  const oldData = snap.exists() ? snap.data() : {};

  // Mark today as studied
  await setDoc(ref, { ...oldData, [key]: true }, { merge: true });
}
