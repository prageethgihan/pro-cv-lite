import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase";

export async function uploadProfileImage(file, uid, cvId, onProgress) {
  const ext = file.type.split("/")[1] || "jpg";
  const path = `users/${uid}/cvs/${cvId}/profile.${ext}`;
  const storageRef = ref(storage, path);

  const task = uploadBytesResumable(storageRef, file);

  await new Promise((resolve, reject) => {
    task.on(
      "state_changed",
      (snap) => {
        const pct = Math.round((snap.bytesTransferred / snap.totalBytes) * 100);
        onProgress?.(pct);
      },
      reject,
      resolve
    );
  });

  return await getDownloadURL(task.snapshot.ref);
}