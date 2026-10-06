const { PermissionsBitField } = require('discord.js');

module.exports = {
  name: 'clear',
  aliases: ['purge', 'delmsg'],
  description: 'Dọn dẹp tin nhắn hàng loạt trong kênh (Chỉ dành cho Quản trị viên)',

  async execute(message, args, db, client, PREFIX) {
    // Kiểm tra quyền Administrator hoặc ManageMessages
    if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator) && 
        !message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
      return message.reply('❌ **Lệnh cấm!** Chỉ có **Quản trị viên (Admin)** mới có quyền sử dụng pháp lực dọn dẹp kênh chat!');
    }

    const deleteCount = parseInt(args[0]);
    if (!deleteCount || isNaN(deleteCount) || deleteCount < 1 || deleteCount > 100) {
      return message.reply(`⚠️ Vui lòng nhập số lượng tin nhắn cần xóa hợp lệ từ **1 đến 100**! Cú pháp: \`${PREFIX}clear <số_lượng>\``);
    }

    try {
      const fetched = await message.channel.messages.fetch({ limit: deleteCount + 1 }); // Bao gồm cả tin nhắn gõ lệnh
      await message.channel.bulkDelete(fetched, true);

      const confirmMsg = await message.channel.send(`🧹 Tôn giá **${message.author.username}** đã dọn dẹp thành công **${deleteCount}** tin nhắn.`);
      setTimeout(() => confirmMsg.delete().catch(() => {}), 4000); 
    } catch (err) {
      console.error(err);
      return message.reply('❌ Có lỗi xảy ra! Lưu ý Discord không cho phép xóa hàng loạt các tin nhắn đã cũ hơn 14 ngày.');
    }
  }
};