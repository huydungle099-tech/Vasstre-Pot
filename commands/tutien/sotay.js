const { EmbedBuilder } = require('discord.js');

// Database 40 loài cá (đồng bộ với file cauca)
const DANH_SACH_CA = [
  { id: 1, name: '🐟 Cá Diếc Phàm Trần' },
  { id: 2, name: '🐟 Cá Chép Vàng' },
  { id: 3, name: '🐠 Cá Bống Sông Quê' },
  { id: 4, name: '🦐 Tôm Sú Phàm' },
  { id: 5, name: '🦀 Cua Đồng Nhỏ' },
  { id: 6, name: '🐍 Lươn Bùn' },
  { id: 7, name: '🐟 Cá Trắm Đen' },
  { id: 8, name: '🐟 Cá Rô Phi' },
  { id: 9, name: '🐠 Cá Mè Hoa' },
  { id: 10, name: '🐢 Ba Ba Nhỏ' },
  { id: 11, name: '🐠 Linh Ngư Ngàn Năm' },
  { id: 12, name: '🐟 Ngân Lân Điêu' },
  { id: 13, name: '🦈 Cá Mập Bạc Hải Dương' },
  { id: 14, name: '🦑 Mực Huyết Tinh' },
  { id: 15, name: '🐋 Kinh Ngư Tinh Thể' },
  { id: 16, name: '🦞 Long Tôm Đại Tướng' },
  { id: 17, name: '🦀 Cua Hoàng Kim' },
  { id: 18, name: '🐍 Giao Long Ấu Trùng' },
  { id: 19, name: '🐟 Thần Tiên Ngư' },
  { id: 20, name: '🐢 Huyền Vũ Phân Thân' },
  ...Array.from({ length: 20 }, (_, i) => ({
    id: 21 + i,
    name: `🌟 Thượng Cổ Thần Ngư Thể #${i + 1}`
  }))
];

module.exports = {
  name: 'sotay',
  description: 'Xem sổ tay bộ sưu tập 40 loài cá đã câu được',
  async execute(message, args, db, COLORS, PREFIX) {
    const guildId = message.guild.id;
    const userId = message.author.id;

    const caughtList = (await db.get(`sotay_ca_${guildId}_${userId}`)) || [];
    
    let description = `Đạo hữu đã sưu tầm được **${caughtList.length} / ${DANH_SACH_CA.length}** loài cá kỳ trân dị bảo.\n\n`;
    if (caughtList.length > 0) {
      description += caughtList.map(id => `✅ Đã bắt được ${DANH_SACH_CA.find(c => c.id === id)?.name}`).join('\n');
    } else {
      description += 'Chưa câu được con cá nào, mau ra sông dùng lệnh `!cauca` thả cần đi!';
    }

    const embed = new EmbedBuilder()
      .setColor('#06B6D4')
      .setTitle(`📖 Sổ Tay Câu Cá Của: ${message.author.username}`)
      .setDescription(description)
      .setTimestamp();

    return message.reply({ embeds: [embed] });
  }
};