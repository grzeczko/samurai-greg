const notificationPopupUrl = new URL('../../assets/scrolls/assets/small-notification-popup.png.webp', import.meta.url).href;
const notificationSolidUrl = new URL('../../assets/scrolls/assets/small-notification-solid.png.webp', import.meta.url).href;
const decorativeFrameUrl = new URL('../../assets/scrolls/assets/decorative-frame-solid.png.webp', import.meta.url).href;
const largeQuestWindowUrl = new URL('../../assets/scrolls/assets/large-quest-window.png.webp', import.meta.url).href;
const dialogueBoxUrl = new URL('../../assets/scrolls/assets/bottom-dialogue-box-solid.png.webp', import.meta.url).href;

export const SCROLL_ASSET_URLS = {
  mainPanel: notificationPopupUrl,
  cleanPanel: notificationSolidUrl,
  titleBanner: notificationSolidUrl,
  slimBanner: decorativeFrameUrl,
  buttonScroll: dialogueBoxUrl,
  footerRibbon: largeQuestWindowUrl,
  tileset: decorativeFrameUrl,
};
