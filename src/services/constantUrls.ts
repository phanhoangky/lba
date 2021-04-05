export enum CONSTANTS_LBA {
  DEVICES_URL = 'devices',
  DEVICES_TYPE_URL = 'device-types',
  ACCOUNTS_URL = 'accounts',
  AREAS_URL = 'areas',
  CAMPAIGN_REPORTS_URL = 'campaign-reports',
  CAMPAIGN_URL = `campaigns`,
  LAYOUTS_URL = `layouts`,
  MEDIA_SRC_URL = `media-sources`,
  MEDIA_SRC_TYPE_URL = `media-source-types`,
  PLAYLIST_URL = `playlists`,
  PLAYLIST_ITEM_URL = `playlists/items`,
  SCENARIO_URL = `scenarios`,
  BRAND_URL = `brands`,
  LOCATION_URL = `locations`,
  MOMO_PAYMENT_URL = 'momopayment',
  FEE_URL = "fee",
  TRANSACTION_URL = "transactions",
}

export enum CONSTANTS_TOMO {
  TRANSACTIONS = 'token-txs',
  LIST_BY_ACCOUNT = 'listByAccount',
  TOKEN_TYPE = "trc21"
}

export enum CONSTANTS_PUBLITIO {
  FILE_URL = '/files',
  GET_FILES_URL = '/files/list',
  GET_FOLDERS_URL = '/folders/list',
  CREATE_FOLDER_URL = '/folders/create',
  UPDATE_FILE_URL = '/files/update',
  REMOVE_FOLDER_URL = '/folders/delete',
  UPDATE_FOLDER_URL = "/folders/update",
}

export enum CONSTANTS_RAPID {
  GEOCODE = "geocode"
}

export enum CONSTANTS_LOCATIONIQ {
  REVERSE_GEOCODING = 'reverse.php',
  AUTOCOMPLETE = "autocomplete.php",
  GEOCODING = "search.php"
}

// export enum TYPE_TRANSACTIONS {
//   TRANSFER_MONEY = 0,
//   CREATE_CAMPAIGN = 1, //
//   DELETE_CAMPAIGN = 2, //
//   SIGN_MEDIA = 3,
// }

export const TYPE_TRANSACTIONS: string[] = ["Transfer", "Create Campaign", "Delete Campaign", "Sign Media"]

export const LIST_SUPPORTED_FILES: string[] = ["jpg", 'jpeg', 'jpe', 'png', 'gif', 'bmp', 'psd', 'webp', 'ai', 'tif', 'tiff', 'svg', 'ico', 'mp4'];

export const LIST_AVATAR_SUPPORTED_FILES: string[] = ["jpg", 'jpeg', 'jpe', 'png', 'gif'];