const bgImages = import.meta.glob('../assets/background_*.png', { eager: true });
export const getBgUrl = (templateId) => bgImages[`../assets/background_${templateId.toLowerCase()}.png`]?.default;

const iconImages = import.meta.glob('../assets/Icon*.png', { eager: true });
export const getIconUrl = (filename) => iconImages[`../assets/${filename}`]?.default;

export const ORE_DEPOSITS = [
  { id: 'IronMalachite', label: 'Iron Malachite', icon: getIconUrl('IconResourceIronMalachiteCombined.png') },
  { id: 'Cassiterite',   label: 'Cassiterite',    icon: getIconUrl('IconResourceCassiterite.png') },
  { id: 'Coal',          label: 'Coal',            icon: getIconUrl('IconResourceCoal.png') },
];
