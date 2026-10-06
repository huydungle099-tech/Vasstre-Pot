const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  name: 'kick',
  aliases: ['dkick', 'sut'],
  description: 'Đá một thành viên ra khỏi server',
  async execute(message, args, db, client, PREFIX) {
    // Kiểm tra quyền Kick Members hoặc Administrator
    if (!message.member.permissions.has(PermissionFlagsBits.KickMembers) && !message.member.permissions.has(PermissionFlagsBits.Administrator)) {
      return message.reply('❌ Đạo hữu không đủ quyền hạn để sử dụng lệnh này!');
    }

    const targetMember = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
    
    if (!targetMember) {
      return message.reply(`❌ Cú pháp không đúng! Vui lòng tag thành viên cần kick. Ví dụ: \`${PREFIX}kick @User Phá phách không lý do\``);
    }

    // Kiểm tra xem thành viên đó có bị kick được không (bot phải cao cấp hơn, không kick chủ server)
    if (!targetMember.kickable) {
      return message.reply('❌ Không thể kick thành viên này! Cấp bậc (Role) của họ cao hơn hoặc ngang bằng bot, hoặc họ là chủ server.');
    }

    // Lấy lý do kick (bỏ qua phần tag user ở args[0])
    const reason = args.slice(1).join(' ') || 'Không có lý do';

    try {
      await targetMember.kick(reason);

      const embed = new EmbedBuilder()
        .setColor('#e67e22') // Màu cam cảnh báo, chuẩn chỉnh không bao giờ lỗi màu
        .setTitle('👢 TRỤC XUẤT THÀNH VIÊN (KICK) 👢')
        .setDescription(`Đã đá thành công đạo hữu **${targetMember.user.tag}** ra khỏi server!\n📌 **Lý do:** ${reason}`)
        .setTimestamp()
        .setFooter({ text: `Thực hiện bởi ${message.author.tag}`, iconURL: message.author.displayAvatarURL() });

      await message.reply({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      await message.reply('❌ Có lỗi xảy ra trong quá trình kick thành viên này!');
    }
  }
};