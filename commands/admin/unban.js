const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  name: 'unban',
  aliases: ['dunban', 'ub'],
  description: 'Gỡ cấm (unban) cho người dùng khỏi server',
  async execute(message, args, db, client, PREFIX) {
    // Kiểm tra quyền Ban Members hoặc Administrator
    if (!message.member.permissions.has(PermissionFlagsBits.BanMembers) && !message.member.permissions.has(PermissionFlagsBits.Administrator)) {
      return message.reply('❌ Đạo hữu không đủ quyền hạn để sử dụng lệnh này!');
    }

    const userId = args[0]?.replace(/[<@!>]/g, ''); // Lọc sạch ID nếu lỡ tag nhầm
    
    if (!userId || isNaN(userId)) {
      return message.reply(`❌ Cú pháp không đúng! Vui lòng nhập ID người cần unban. Ví dụ: \`${PREFIX}unban 123456789012345678\``);
    }

    try {
      // Tiến hành unban dựa trên ID
      await message.guild.members.unban(userId);

      const embed = new EmbedBuilder()
        .setColor('#2ecc71') // Màu xanh lá an toàn, không bao giờ lỗi Invalid Color
        .setTitle('🔓 GỠ BAN THÀNH CÔNG 🔓')
        .setDescription(`Đã gỡ cấm thành công cho người dùng có ID: \`${userId}\` khỏi server! ✨`)
        .setTimestamp()
        .setFooter({ text: `Thực hiện bởi ${message.author.tag}`, iconURL: message.author.displayAvatarURL() });

      await message.reply({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      await message.reply('❌ Không thể gỡ ban người này! Có thể ID không chính xác hoặc người này không nằm trong danh sách bị ban của server.');
    }
  }
};