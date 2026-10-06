const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('thongbao')
    .setDescription('Gửi thông báo trang trọng từ Thiên Cung')
    .addStringOption(option =>
      option.setName('noidung')
        .setDescription('Nội dung thông báo cần gửi')
        .setRequired(true)
    )
    .addRoleOption(option =>
      option.setName('role')
        .setDescription('Chọn role muốn ping kèm')
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction, db) {
    const noiDung = interaction.options.getString('noidung');
    const targetRole = interaction.options.getRole('role');

    // 1. Phản hồi riêng (Ephemeral): Chỉ một mình đạo hữu nhìn thấy chữ này
    await interaction.reply({
      content: '✅ Đã gửi thông báo thành công đến Thiên Cung!',
      ephemeral: true
    });

    // Tạo khung Embed thông báo chung
    const embed = new EmbedBuilder()
      .setColor('#FFD700')
      .setTitle('📢 THÔNG BÁO')
      .setDescription(noiDung)
      .setTimestamp()
      .setFooter({ text: `Được ban hành bởi: ${interaction.user.tag}` });

    // Định dạng ping role thực tế ra ngoài
    const contentToPing = targetRole ? `<@&${targetRole.id}>` : '';

    // 2. Gửi nội dung chính thức ra kênh chung cho mọi người cùng thấy
    await interaction.channel.send({
      content: contentToPing,
      embeds: [embed],
      allowedMentions: { roles: targetRole ? [targetRole.id] : [] }
    });
  }
};