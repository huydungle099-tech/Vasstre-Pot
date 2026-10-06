const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

// --- DANH MỤC VẬT PHẨM CHỢ NPC (VÔ HẠN, MUA BẰNG LINH THẠCH) ---
const NPC_ITEMS = {
  // Nguyên liệu & cơ bản
  'thaoduoc': { name: '🌿 Thảo Dược Sơ Cấp', price: 30 },
  'da': { name: '🪨 Thạch Đầu (Đá)', price: 10 },
  'giay': { name: '📜 Tuyên Thành Giấy', price: 20 },
  'manh_linhthach': { name: '💎 Mảnh Linh Thạch', price: 80 },
  'linhthach_thuongpham': { name: '🌟 Linh Thạch Thượng Phẩm', price: 500 },
  'go': { name: '🪵 Gỗ Thường', price: 15 },
  'bogo': { name: '🌲 Bó Gỗ Lớn', price: 70 },
  'rom': { name: '🌾 Rơm Khô', price: 5 },
  // Nông sản & Thực phẩm
  'trung': { name: '🥚 Trứng Gà Linh Thú', price: 25 },
  'botmi': { name: '🥟 Bột Mì Tinh', price: 20 },
  'suabo': { name: '🥛 Sữa Bò Thượng Hạng', price: 40 },
  'muoi': { name: '🧂 Muối Biển Tinh Luyện', price: 15 },
  'duong': { name: '🍯 Đường Phèn', price: 18 },
  // Linh đan
  'dan_ha': { name: '💊 Linh Đan Hạ Phẩm', price: 150 },
  'dan_trung': { name: '💊 Linh Đan Trung Phẩm', price: 400 },
  'dan_thuong': { name: '🔮 Linh Đan Thượng Phẩm', price: 1000 }
};

module.exports = {
  name: 'cho',
  aliases: ['market', 'thuonghoi', 'chodem'],
  description: 'Hệ thống Thương Hội Thiên Hạ: Chợ NPC & Chợ Người Chơi',
  async execute(message, args, db, client, PREFIX) {
    const userId = message.author.id;

    // Giao diện chính của Chợ
    const mainEmbed = new EmbedBuilder()
      .setColor(0xe67e22)
      .setTitle('🏛️ THƯƠNG HỘI THIÊN HẠ - GIAO DƯƠNG TRẤN')
      .setDescription('Mời đạo hữu lựa chọn khu vực giao thương:\n\n' +
        '🏪 **1. Chợ NPC Hệ Thống**: Nơi cung cấp vạn vật thế gian (mua vô hạn bằng Linh Thạch).\n' +
        '👥 **2. Chợ Người Chơi**: Nơi rao bán, mua lại bảo vật giữa các đạo hữu (hỗ trợ liên kết kho riêng và kho chung đạo lữ).');

    const mainRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('menu_npc').setLabel('🏪 Chợ NPC').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId('menu_player').setLabel('👥 Chợ Người Chơi').setStyle(ButtonStyle.Success)
    );

    const msg = await message.reply({ embeds: [mainEmbed], components: [mainRow] });

    const collector = msg.createMessageComponentCollector({
      filter: i => i.user.id === userId,
      time: 300000 // 5 phút
    });

    collector.on('collect', async i => {
      try {
        // --- CHUYỂN ĐẾN CHỢ NPC ---
        if (i.customId === 'menu_npc') {
          const npcEmbed = new EmbedBuilder()
            .setColor(0x3498db)
            .setTitle('🏪 TIỆM TẠP HÓA THƯƠNG HỘI (NPC)')
            .setDescription('Chọn vật phẩm đạo hữu muốn mua từ danh sách bên dưới:');

          const options = Object.entries(NPC_ITEMS).map(([key, item]) => ({
            label: item.name,
            description: `Giá: ${item.price} Linh Thạch / cái`,
            value: `npc_buy_${key}`
          }));

          const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('npc_select_item')
            .setPlaceholder('🔍 Chọn vật phẩm cần mua...')
            .addOptions(options);

          const rowSelect = new ActionRowBuilder().addComponents(selectMenu);
          const rowBack = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('menu_main').setLabel('⬅️️ Quay Lại').setStyle(ButtonStyle.Secondary)
          );

          await i.update({ embeds: [npcEmbed], components: [rowSelect, rowBack] });
          return;
        }

        // --- XỬ LÝ KHI CHỌN VẬT PHẨM -> HIỆN MODAL NHẬP SỐ LƯỢNG ---
        if (i.isStringSelectMenu() && i.customId === 'npc_select_item') {
          const itemKey = i.values[0].replace('npc_buy_', '');
          const targetItem = NPC_ITEMS[itemKey];

          // Tạo Modal yêu cầu nhập số lượng (tối đa 100)
          const modal = new ModalBuilder()
            .setCustomId(`npc_modal_${itemKey}`)
            .setTitle(`Mua: ${targetItem.name.slice(0, 20)}`);

          const quantityInput = new TextInputBuilder()
            .setCustomId('buy_quantity')
            .setLabel('Nhập số lượng muốn mua (Từ 1 đến 100):')
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('Ví dụ: 10')
            .setMinLength(1)
            .setMaxLength(3)
            .setRequired(true);

          modal.addComponents(new ActionRowBuilder().addComponents(quantityInput));

          // Hiển thị modal cho người dùng ngay lập tức
          await i.showModal(modal);

          // Đợi người dùng submit modal (tối đa 60 giây)
          const modalInteraction = await i.awaitModalSubmit({
            filter: mi => mi.customId === `npc_modal_${itemKey}` && mi.user.id === userId,
            time: 60000
          }).catch(() => null);

          if (!modalInteraction) return; // Hết giờ hoặc tắt modal

          const rawQuantity = modalInteraction.fields.getTextInputValue('buy_quantity');
          const quantity = parseInt(rawQuantity);

          // Kiểm tra tính hợp lệ của số lượng
          if (isNaN(quantity) || quantity <= 0 || quantity > 100) {
            return await modalInteraction.reply({ 
              content: '❌ Số lượng không hợp lệ! Đạo hữu vui lòng nhập một số nguyên dương từ **1 đến 100**.', 
              ephemeral: true 
            });
          }

          const totalPrice = targetItem.price * quantity;
          let userMoney = parseInt(await db.get(`money_${userId}`)) || 0;

          if (userMoney < totalPrice) {
            return await modalInteraction.reply({ 
              content: `❌ Không đủ Linh Thạch! Đạo hữu cần **${totalPrice.toLocaleString('vi-VN')} Linh Thạch** cho ${quantity}x ${targetItem.name} (Hiện có: ${userMoney.toLocaleString('vi-VN')}).`, 
              ephemeral: true 
            });
          }

          // Trừ tiền và cộng số lượng vào kho cá nhân
          userMoney -= totalPrice;
          await db.set(`money_${userId}`, userMoney);

          let currentInv = parseInt(await db.get(`inv_${userId}_${itemKey}`)) || 0;
          await db.set(`inv_${userId}_${itemKey}`, currentInv + quantity);

          return await modalInteraction.reply({ 
            content: `✨ Mua thành công **${quantity}x ${targetItem.name}** với tổng giá **${totalPrice.toLocaleString('vi-VN')} Linh Thạch**! Đã cất toàn bộ vào kho riêng.`, 
            ephemeral: true 
          });
        }

        // --- CHUYỂN ĐẾN CHỢ NGƯỜI CHƠI ---
        if (i.customId === 'menu_player') {
          const playerEmbed = new EmbedBuilder()
            .setColor(0x2ecc71)
            .setTitle('👥 CHỢ GIAO DƯƠNG - GIAO THƯƠNG TỰ DO')
            .setDescription('Tại đây đạo hữu có thể kiểm tra các mặt hàng đang rao bán hoặc tiến hành đăng bán từ **Kho Riêng** hoặc **Kho Chung Đạo Lữ**.');

          const playerRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('pm_view').setLabel('📜 Xem Danh Sách Rao Bán').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId('pm_sell_guide').setLabel('📦 Hướng Dẫn Đăng Bán').setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId('menu_main').setLabel('⬅️ Quay Lại').setStyle(ButtonStyle.Secondary)
          );

          await i.update({ embeds: [playerEmbed], components: [playerRow] });
          return;
        }

        // --- HƯỚNG DẪN ĐĂNG BÁN KHO RIÊNG & KHO CHUNG ---
        if (i.customId === 'pm_sell_guide') {
          let coupleId = await db.get(`couple_${userId}`) || null;
          let khoChungStatus = coupleId ? `Đã liên kết (Mã đạo lữ: \`${coupleId}\`)` : `Chưa kết đôi (Chỉ dùng được Kho Riêng)`;

          const guideEmbed = new EmbedBuilder()
            .setColor(0xf1c40f)
            .setTitle('📦 ĐĂNG BÁN VẬT PHẨM (KHO RIÊNG & KHO CHUNG)')
            .setDescription(`Hệ thống tự động quét cả **Kho Riêng** (` + "`inv_${userId}`" + `) lẫn **Kho Chung Đạo Lữ** (` + "`shared_inv_${coupleId}`" + `).\n\n` +
              `🔗 **Trạng thái liên kết đạo lữ**: ${khoChungStatus}\n\n` +
              `✍️ Để đăng bán vật phẩm, đạo hữu gõ lệnh theo cấu trúc:\n` +
              `\`${PREFIX}rao <tên_vật_phẩm> <số_lượng> <giá_linh_thạch> [kho/chung]\`\n\n` +
              `🛒 Để xem danh sách và mua hàng người chơi khác, dùng lệnh: \`${PREFIX}chogv\` hoặc nút xem bên dưới.`);

          const backRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('menu_player').setLabel('Quay lại Chợ Người Chơi').setStyle(ButtonStyle.Secondary)
          );

          await i.update({ embeds: [guideEmbed], components: [backRow] });
          return;
        }

        // --- QUAY LẠI MENU CHÍNH ---
        if (i.customId === 'menu_main') {
          await i.update({ embeds: [mainEmbed], components: [mainRow] });
          return;
        }
      } catch (err) {
        console.error(err);
      }
    });
  }
};