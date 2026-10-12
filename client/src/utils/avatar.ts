/**
 * Generates cheerful, pastel-colored smiling avatars (no dark/harsh bold colors)
 * Complies with D:\Hayat\Modifications Item 9
 */
export const getHappyPastelAvatar = (seed: string = 'User') => {
  const clean = encodeURIComponent(seed.trim() || 'User');
  return `https://api.dicebear.com/7.x/fun-emoji/svg?seed=${clean}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;
};
