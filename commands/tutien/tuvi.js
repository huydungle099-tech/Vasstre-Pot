const { EmbedBuilder } = require('discord.js');
// Đạo hữu chú ý điều chỉnh lại đường dẫn ../../utils/tuTienHelper cho đúng với vị trí thực tế của file helper trong bot nhé!
const { getRealmFromXp } = require('../../utils/tuTienHelper');

module.exports = {
  name: 'tuvi',
  aliases: ['tv', 'profile', 'rank'],
  description: 'Xem cảnh giới, tu vi và tiến độ thăng cấp của bản thân hoặc đạo hữu khác',

  async execute(message, args, db, client, PREFIX) {
    const targetUser = message.mentions.users.first() || message.author;
    
    // Lấy tổng XP từ Database (Ví dụ dùng Quick.db)
    const userXp = (await db.get(`xp_${targetUser.id}`)) || 0;

    // Gọi hàm tính toán cảnh giới dựa trên tổng XP tích lũy
    const tuVi = getRealmFromXp(userXp);

    // Xử lý hiển thị thanh tiến độ (Progress bar) cho sinh động
    let progressBar = '▰▰▰▰▰▰▰▰▰▰';
    if (!tuVi.isMax && tuVi.requiredXpForNextTier > 0) {
      const percentage = Math.min(Math.max(tuVi.currentRealmXp / tuVi.requiredXpForNextTier, 0), 1);
      const filledBlocks = Math.round(percentage * 10);
      progressBar = '▰'.repeat(filledBlocks) + '▱'.repeat(10 - filledBlocks);
    }

    const embed = new EmbedBuilder()
      .setColor(0xf1c40f)
      .setTitle(`📜 ĐẠO HỮU PHÁP TƯỚNG - ${targetUser.username.toUpperCase()} 📜`)
      .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
      .setDescription(`
        🔹 **Tổng tích lũy:** \`${userXp.toLocaleString('vi-VN')} XP\`
        ⚡ **Cảnh giới:** **${tuVi.realmName} - Tầng ${tuVi.tier}**
        
        📊 **Tiến độ tầng:**
        \`${progressBar}\` (${tuVi.isMax ? 'Đại Viên Mãn' : `${tuVi.currentRealmXp.toLocaleString('vi-VN')} /${tuVi.requiredXpForNextTier.toLocaleString('vi-VN')} XP`})
      `)
      .setFooter({ text: 'Hệ thống tu tiên đại đạo vạn cổ • Vững bước phi thăng' })
      .setTimestamp();

    return message.reply({ embeds: [embed] });
  }
};