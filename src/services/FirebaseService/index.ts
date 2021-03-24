import { firebaseRef } from "./firebase";

export async function fetchScreenShot(macAddress: string) {
  const listRef = firebaseRef.child(macAddress);

  const listAllFile = await listRef.listAll();
  let url = "";
  let ref: any;
  for (let index = 0; index < listAllFile.items.length; index+= 1) {
    ref = listAllFile.items[index];
    
  }
  if (ref) {
    url = await ref.getDownloadURL();
    return url;
  }
  return undefined;

}