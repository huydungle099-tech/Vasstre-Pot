const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  name: 'mute',
  aliases: ['dmute', 'timeout'],
  description: 'Cấm ngôn (timeout) thành viên trong thời gian nhất định',
  async execute(message, args, db, client, PREFIX) {
    // Kiểm tra quyền Moderate Members hoặc Administrator
    if (!message.member.permissions.has(PermissionFlagsBits.ModerateMembers) && !message.member.permissions.has(PermissionFlagsBits.Administrator)) {
      return message.reply('❌ Đạo hữu không đủ quyền hạn để sử dụng lệnh này!');
    }

    const targetMember = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
    
    if (!targetMember) {
      return message.reply(`❌ Cú pháp không đúng! Vui lòng tag thành viên cần mute. Ví dụ: \`${PREFIX}mute @User 10m Lý do\``);
    }

    // Lấy thời gian (mặc định là phút nếu không ghi ký hiệu, hỗ trợ m: phút, h: giờ, d: ngày)
    const timeArg = args[1];
    let durationMs = 10 * 60 * 1000; // Mặc định 10 phút nếu không truyền thời gian

    if (timeArg) {
      const match = timeArg.match(/^(\d+)([mhd])$/);
      if (match) {
        const value = parseInt(match[1]);
        const unit = match[2];
        if (unit === 'm') durationMs = value * 60 * 1000;
        else if (unit === 'h') durationMs = value * 60 * 60 * 1000;
        else if (unit === 'd') durationMs = value * 24 * 60 * 60 * 1000;
      } else if (!isNaN(timeArg)) {
        // Nếu chỉ nhập số thuần túy thì tính là phút
        durationMs = parseInt(timeArg) * 60 * 1000;
      }
    }

    // Lấy lý do (bỏ qua phần mention và thời gian)
    const reason = args.slice(timeArg ? 2 : 1).join(' ') || 'Không có lý do';

    try {
      await targetMember.timeout(durationMs, reason);

      const embed = new EmbedBuilder()
        .setColor('#e74c3c') // Màu đỏ cảnh báo an toàn, tuyệt đối không bao giờ lỗi Invalid Color
        .setTitle('🔇 CẤM NGÔN (MUTE) THÀNH CÔNG 🔇')
        .setDescription(`Đã mute đạo hữu **${targetMember}** thành công!\n⏱️ **Thời gian:** \`${timeArg || '10 phút (mặc định)'}\`\n📌 **Lý do:** ${reason}`)
        .setTimestamp()
        .setFooter({ text: `Thực hiện bởi ${message.author.tag}`, iconURL: message.author.displayAvatarURL() });

      await message.reply({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      await message.reply('❌ Không thể mute thành viên này! Hãy kiểm tra lại cấp bậc (Role) của bot phải cao hơn người bị mute.');
    }
  }
};