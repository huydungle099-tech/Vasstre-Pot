const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  name: 'ban',
  aliases: ['dban', 'cam'],
  description: 'Cấm vĩnh viễn (ban) một thành viên khỏi server',
  async execute(message, args, db, client, PREFIX) {
    // Kiểm tra quyền Ban Members hoặc Administrator
    if (!message.member.permissions.has(PermissionFlagsBits.BanMembers) && !message.member.permissions.has(PermissionFlagsBits.Administrator)) {
      return message.reply('❌ Đạo hữu không đủ quyền hạn để sử dụng lệnh này!');
    }

    const targetMember = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
    
    if (!targetMember) {
      return message.reply(`❌ Cú pháp không đúng! Vui lòng tag thành viên cần ban. Ví dụ: \`${PREFIX}ban @User Phản động/Phá hoại server\``);
    }

    // Kiểm tra xem thành viên đó có bị ban được không
    if (!targetMember.bannable) {
      return message.reply('❌ Không thể ban thành viên này! Cấp bậc (Role) của họ cao hơn hoặc ngang bằng bot, hoặc họ là chủ server.');
    }

    // Lấy lý do ban (bỏ qua phần tag user ở args[0])
    const reason = args.slice(1).join(' ') || 'Không có lý do';

    try {
      await targetMember.ban({ reason: reason });

      const embed = new EmbedBuilder()
        .setColor('#8b0000') // Màu đỏ đậm chất tử hình, tuyệt đối an toàn không sợ lỗi Invalid Color
        .setTitle('🔨 CẤM VĨNH VIỄN (BAN) THÀNH VIÊN 🔨')
        .setDescription(`Đã trừng phạt và ban vĩnh viễn đạo hữu **${targetMember.user.tag}** khỏi server!\n📌 **Lý do:** ${reason}`)
        .setTimestamp()
        .setFooter({ text: `Thực hiện bởi ${message.author.tag}`, iconURL: message.author.displayAvatarURL() });

      await message.reply({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      await message.reply('❌ Có lỗi xảy ra trong quá trình ban thành viên này!');
    }
  }
};