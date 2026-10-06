// Danh sách các cảnh giới tu tiên
const REALMS = [
  { name: 'Luyện Khí', maxTier: 9, stepXp: 3000 },
  { name: 'Trúc Cơ', maxTier: 9, stepXp: 4000 },
  { name: 'Kim Đan', maxTier: 9, stepXp: 5000 },
  { name: 'Nguyên Anh', maxTier: 9, stepXp: 6000 },
  { name: 'Hóa Thần', maxTier: 9, stepXp: 7000 },
  { name: 'Luyện Hư', maxTier: 9, stepXp: 8000 },
  { name: 'Hợp Thể', maxTier: 9, stepXp: 9000 },
  { name: 'Đại Thừa', maxTier: 9, stepXp: 10000 },
  { name: 'Độ Kiếp', maxTier: 9, stepXp: 11000 },
  { name: 'Hạ cấp Tiên nhân', maxTier: 13, stepXp: 15000 },
  { name: 'Trung cấp Tiên nhân', maxTier: 13, stepXp: 20000 },
  { name: 'Thượng cấp Tiên nhân', maxTier: 13, stepXp: 25000 },
  { name: 'Tiên thiên hạ phẩm', maxTier: 15, stepXp: 40000 },
  { name: 'Tiên thiên trung phẩm', maxTier: 15, stepXp: 50000 },
  { name: 'Tiên thiên Thượng phẩm', maxTier: 15, stepXp: 60000 },
  { name: 'Tiên Đế', maxTier: 23, stepXp: 100000 }
];

/**
 * Hàm tính toán cảnh giới và tầng dựa trên tổng số XP
 * @param {number} totalXp 
 */
function getRealmFromXp(totalXp) {
  let remainingXp = totalXp;

  for (let rIndex = 0; rIndex < REALMS.length; rIndex++) {
    const realm = REALMS[rIndex];
    
    let realmTotalXp = 0;
    for (let t = 1; t <= realm.maxTier; t++) {
      realmTotalXp += t * realm.stepXp;
    }

    if (remainingXp < realmTotalXp) {
      let accumulatedTierXp = 0;
      for (let t = 1; t <= realm.maxTier; t++) {
        let tierCost = t * realm.stepXp;
        if (remainingXp < accumulatedTierXp + tierCost) {
          return {
            realmName: realm.name,
            tier: t,
            currentRealmXp: remainingXp - accumulatedTierXp,
            requiredXpForNextTier: tierCost,
            isMax: false
          };
        }
        accumulatedTierXp += tierCost;
      }
    } else {
      remainingXp -= realmTotalXp;
    }
  }

  // Nếu vượt ngưỡng Tiên Đế
  const maxRealm = REALMS[REALMS.length - 1];
  return {
    realmName: maxRealm.name,
    tier: maxRealm.maxTier,
    currentRealmXp: remainingXp,
    requiredXpForNextTier: 0,
    isMax: true
  };
}

module.exports = { REALMS, getRealmFromXp };