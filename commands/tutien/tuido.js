const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

// --- BẢNG ĐỒNG BỘ TÊN VÀ EMOJI VẬT PHẨM (Khớp hoàn toàn với Chợ NPC và các vật phẩm khác) ---
const ITEM_DICTIONARY = {
  // Nguyên liệu & cơ bản
  'thaoduoc': { name: '🌿 Thảo Dược Sơ Cấp' },
  'da': { name: '🪨 Thạch Đầu (Đá)' },
  'giay': { name: '📜 Tuyên Thành Giấy' },
  'manh_linhthach': { name: '💎 Mảnh Linh Thạch' },
  'linhthach_thuongpham': { name: '🌟 Linh Thạch Thượng Phẩm' },
  'go': { name: '🪵 Gỗ Thường' },
  'bogo': { name: '🌲 Bó Gỗ Lớn' },
  'rom': { name: '🌾 Rơm Khô' },
  // Nông sản & Thực phẩm
  'trung': { name: '🥚 Trứng Gà Linh Thú' },
  'botmi': { name: '🥟 Bột Mì Tinh' },
  'suabo': { name: '🥛 Sữa Bò Thượng Hạng' },
  'muoi': { name: '🧂 Muối Biển Tinh Luyện' },
  'mat_ong': { name: '🍯 Mật ong hũ nhỏ' },
  // Linh đan
  'dan_ha': { name: '💊 Linh Đan Hạ Phẩm' },
  'dan_trung': { name: '💊 Linh Đan Trung Phẩm' },
  'dan_thuong': { name: '🔮 Linh Đan Thượng Phẩm' }
};

module.exports = {
  name: 'tuido',
  aliases: ['inv', 'inventory', 'kho', 'tui'],
  description: 'Kiểm tra kho báu, linh thạch và vật phẩm cá nhân của đạo hữu',

  async execute(message, args, db, client, PREFIX) {
    const targetUser = message.mentions.users.first() || message.author;
    const userId = targetUser.id;

    // Lấy số lượng Linh Thạch (tiền)
    const userMoney = parseInt(await db.get(`money_${userId}`)) || 0;

    // Quét toàn bộ kho vật phẩm
    let inventoryList = [];
    
    for (const [key, info] of Object.entries(ITEM_DICTIONARY)) {
      const quantity = parseInt(await db.get(`inv_${userId}_${key}`)) || 0;
      if (quantity > 0) {
        inventoryList.push({
          name: info.name,
          quantity: quantity
        });
      }
    }

    // Tạo nội dung hiển thị cho danh sách vật phẩm
    let itemDescription = '';
    if (inventoryList.length === 0) {
      itemDescription = '*(Kho báu đang trống rỗng, đạo hữu hãy ghé Chợ NPC hoặc đi thám hiểm để thu thập bảo vật!)*';
    } else {
      itemDescription = inventoryList
        .map(item => `• **${item.name}**: \`x${item.quantity.toLocaleString('vi-VN')}\``)
        .join('\n');
    }

    // Tạo Embed hiển thị kho đồ
    const invEmbed = new EmbedBuilder()
      .setColor(0x9b59b6)
      .setTitle(`🎒 TÚI ĐỒ / KHO BÁU - ${targetUser.username.toUpperCase()} 🎒`)
      .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
      .setDescription(
        `💰 **Linh Thạch đang giữ**: \`${userMoney.toLocaleString('vi-VN')} Linh Thạch\`\n\n` +
        `📦 **Danh sách bảo vật & nguyên liệu trong kho**:\n${itemDescription}`
      )
      .setFooter({ text: `Gõ ${PREFIX}cho để ghé thăm Thương Hội mua sắm vật phẩm` })
      .setTimestamp();

    return message.reply({ embeds: [invEmbed] });
  }
};