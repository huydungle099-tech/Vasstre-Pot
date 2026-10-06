const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  name: 'lock', // Tên lệnh nội bộ
  aliases: ['dlock'], // Hỗ trợ luôn biến thể dlock nếu cần
  description: 'Khóa kênh chat hiện tại',
  async execute(message, args, db, client, PREFIX) {
    // Kiểm tra quyền quản trị của người dùng
    if (!message.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
      return message.reply('❌ Đạo hữu không đủ quyền lực (Manage Channels) để thi triển chiêu khóa kênh này!');
    }

    try {
      // Thiết lập quyền gửi tin nhắn thành false cho everyone trong kênh hiện tại
      await message.channel.permissionOverwrites.edit(message.guild.id, {
        SendMessages: false
      });

      const embed = new EmbedBuilder()
        .setColor('#e74c3c')
        .setTitle('🔒 KÊNH ĐÃ BỊ KHÓA')
        .setDescription('Thiên Cung đã hạ lệnh phong ấn kênh chat này. Thường dân tạm thời không thể gửi tin nhắn!')
        .setTimestamp()
        .setFooter({ text: `Thực thi bởi ${message.author.tag}`, iconURL: message.author.displayAvatarURL() });

      await message.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Lỗi khi khóa kênh:', error);
      message.reply('❌ Đã xảy ra lỗi hệ thống khi cố gắng phong ấn kênh này!');
    }
  }
};