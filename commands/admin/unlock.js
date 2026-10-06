const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  name: 'unlock',
  aliases: ['dunlock'],
  description: 'Mở khóa kênh chat hiện tại',
  async execute(message, args, db, client, PREFIX) {
    // Kiểm tra quyền quản trị của người dùng
    if (!message.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
      return message.reply('❌ Đạo hữu không đủ quyền lực (Manage Channels) để thi triển chiêu mở khóa kênh này!');
    }

    try {
      // Khôi phục quyền gửi tin nhắn cho everyone trong kênh hiện tại
      await message.channel.permissionOverwrites.edit(message.guild.id, {
        SendMessages: null // Đặt về mặc định của channel
      });

      const embed = new EmbedBuilder()
        .setColor('#2ecc71') // Màu xanh lá mở khóa thành công
        .setTitle('🔓 KÊNH ĐÃ ĐƯỢC MỞ KHÓA')
        .setDescription('Thiên Cung đã ban lệnh giải trừ phong ấn. Thường dân có thể tiếp tục giao lưu bình thường!')
        .setTimestamp()
        .setFooter({ text: `Thực thi bởi ${message.author.tag}`, iconURL: message.author.displayAvatarURL() });

      await message.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Lỗi khi mở khóa kênh:', error);
      message.reply('❌ Đã xảy ra lỗi hệ thống khi cố gắng giải phong ấn kênh này!');
    }
  }
};