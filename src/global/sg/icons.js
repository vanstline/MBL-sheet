import { icons } from "../../controllers/constant";

const getIconImgs = (path) => {
  const curImg = new Image();
  curImg.src = path;
  return curImg;
};

const defaultIcons = {};
for (let k in icons) {
  defaultIcons[k] = getIconImgs(icons[k]);
}

export { defaultIcons, getIconImgs };
