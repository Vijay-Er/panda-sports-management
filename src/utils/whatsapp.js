/**
 * Formats an official WhatsApp digital booking confirmation slip
 */
export function formatWhatsAppMessage(booking) {
  const rentalLines = [];
  if (booking.rentals) {
    if (booking.rentals.paddles > 0) {
      rentalLines.push(`   • 🏓 ${booking.rentals.paddles}x Pro Paddle (${booking.rentals.paddles * 50} INR)`);
    }
    if (booking.rentals.shoes > 0) {
      const sizeStr = booking.rentals.shoeSizes ? ` [Size: ${booking.rentals.shoeSizes}]` : '';
      rentalLines.push(`   • 👟 ${booking.rentals.shoes}x Shoe Rental${sizeStr} (${booking.rentals.shoes * 50} INR)`);
    }
    if (booking.rentals.balls > 0) {
      rentalLines.push(`   • 🎾 ${booking.rentals.balls}x Ball Can (${booking.rentals.balls * 250} INR)`);
    }
  }

  const hasRentals = rentalLines.length > 0;
  const isPending = (booking.pendingBalance || 0) > 0;

  const lines = [
    `🔴 *PANDA SPORTS ACADEMY — OFFICIAL BOOKING PASS* 🎾`,
    `━━━━━━━━━━━━━━━━━━━━━━`,
    `👤 *Player / Team:* ${booking.customerName}`,
    ...(booking.customerPhone ? [`📱 *Mobile:* +91 ${booking.customerPhone}`] : []),
    `🏟️ *Court:* ${booking.resourceName}`,
    `📅 *Date:* ${booking.date}`,
    `⏰ *Time Slot:* ${booking.startTime} – ${booking.endTime} (${booking.duration} mins)`,
    ...(hasRentals ? [
      `🏓 *Equipment & Shoe Rentals:*`,
      ...rentalLines
    ] : []),
    ...(booking.gstEnabled ? [
      `━━━━━━━━━━━━━━━━━━━━━━`,
      `🧾 *TAX INVOICE (18% GST)*`,
      `🏢 *Academy GSTIN:* 33AAECP4589K1Z4`,
      ...(booking.companyName ? [`🏢 *Billed To:* ${booking.companyName}`] : []),
      ...(booking.companyGstin ? [`🏛️ *Client GSTIN:* ${booking.companyGstin}`] : []),
      `   • Base Amount: ₹${Number(booking.basePrice || booking.courtPrice || 0).toLocaleString()}`,
      `   • CGST (9%): ₹${Number(booking.cgst || 0).toLocaleString()}`,
      `   • SGST (9%): ₹${Number(booking.sgst || 0).toLocaleString()}`,
      `   • Total GST (18%): ₹${Number(booking.gstAmount || 0).toLocaleString()}`,
    ] : []),
    `━━━━━━━━━━━━━━━━━━━━━━`,
    `💰 *Total Amount:* ₹${Number(booking.totalPrice || booking.price || 0).toLocaleString()}`,
    `💳 *Paid Right Now:* ₹${Number(booking.paidAmount || booking.price || 0).toLocaleString()} (${(booking.paymentMode || 'cash').toUpperCase()})`,
    ...(isPending ? [
      `⚠️ *Pending Balance Due:* ₹${Number(booking.pendingBalance).toLocaleString()} (Pay at desk)`
    ] : [
      `✅ *Payment Status:* Full Paid`
    ]),
    ...(booking.comments ? [`📝 *Notes:* ${booking.comments}`] : []),
    `━━━━━━━━━━━━━━━━━━━━━━`,
    `📍 *Location:* Panda Sports Academy, Coimbatore`,
    `Please arrive 10 minutes prior to your slot. Non-marking shoes mandatory on court. Have a great game! 🎾🔥`
  ];

  return lines.join('\n');
}

/**
 * Open WhatsApp with pre-filled message
 */
export function openWhatsAppShare(booking) {
  const message = formatWhatsAppMessage(booking);
  const encoded = encodeURIComponent(message);
  
  // Clean phone number (remove all non-digits)
  const phone = (booking.customerPhone || '').replace(/\D/g, '');
  
  let url = '';
  if (phone.length === 10) {
    url = `https://api.whatsapp.com/send?phone=91${phone}&text=${encoded}`;
  } else if (phone.length > 10) {
    url = `https://api.whatsapp.com/send?phone=${phone}&text=${encoded}`;
  } else {
    // Open generic share if no valid phone
    url = `https://api.whatsapp.com/send?text=${encoded}`;
  }

  window.open(url, '_blank', 'noopener,noreferrer');
}
