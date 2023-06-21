import getImageFromDb from "./getImageFromDb";

export default async function loadProfilePic(data) {
  if (!data) {
    console.log("¡No data passed to load profile pic!");
    return null;
  }
  let result = null;
  if (data.defaultSettings.isDefault == true || data.picId == null) {
    if (data.defaultSettings.defaultIndex != null) {
      result = require(`../../images/defaultIcons/default_icon_${data.defaultSettings.defaultIndex}.png`);
    } else {
      result = require(`../../images/defaultIcons/default_icon_${0}.png`);
    }
  } else {
    await getImageFromDb(data.picId).then((res) => {
      result = res;
    });
  }

  return result;
}
