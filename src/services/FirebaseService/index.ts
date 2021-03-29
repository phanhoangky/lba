import type { ScreenShotMetadata } from "@/models/devices";
import moment from "moment";
import { firebaseRef } from "./firebase";

export async function fetchScreenShot(macAddress: string) {
  const listRef = firebaseRef.child(macAddress);

  const listAllFile = await listRef.listAll();
  let ref;

  for (let index = 0; index < listAllFile.items.length; index+= 1) {
    ref = listAllFile.items[index];
    
  }
  if (ref) {
    const url = await ref.getDownloadURL();
    const metadata = await ref.getMetadata();
    const result: ScreenShotMetadata = {
      url,
      createDate: moment(metadata.timeCreated).format("YYYY-MM-DD HH:mm:ss")
    }
    console.log('====================================');
    console.log("Result >>>", result, metadata);
    console.log('====================================');
    return result;
  }
  return undefined;

}