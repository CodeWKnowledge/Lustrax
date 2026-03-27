import { jsPDF } from 'jspdf';

/**
 * Generates an expanded, professional PDF receipt for Lustrax Jewelries.
 */
export const generateReceipt = (data) => {
  const { order, transaction, user } = data;
  const doc = new jsPDF({
    unit: 'mm',
    format: 'a5' 
  });
  
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // 1. REPEATED WATERMARK
  doc.setTextColor(245, 245, 245);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  
  const stepX = 40;
  const stepY = 30;
  for (let x = 0; x < pageWidth; x += stepX) {
    for (let y = 0; y < pageHeight; y += stepY) {
      doc.text('LUSTRAX', x, y, { 
        angle: 45 
      });
    }
  }

  // 2. PAID STAMP (Subtle)
  doc.setDrawColor(34, 197, 94);
  doc.setTextColor(34, 197, 94);
  doc.setGState(new doc.GState({ opacity: 0.1 }));
  doc.rect(pageWidth - 40, 10, 30, 12);
  doc.setFontSize(7);
  doc.text('PAID', pageWidth - 25, 16, { align: 'center' });
  doc.setFontSize(3);
  doc.text('OFFICIAL RECORD', pageWidth - 25, 19, { align: 'center' });
  doc.setGState(new doc.GState({ opacity: 1 }));

  // 3. HEADER
  doc.setTextColor(30, 30, 30);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('LUSTRAX', 15, 15);
  doc.setFontSize(5);
  doc.text('PREMIUM JEWELRY ACQUISITION', 15, 18);

  // 4. METADATA SECTION
  doc.setDrawColor(240);
  doc.line(15, 25, pageWidth - 15, 25);
  
  doc.setFontSize(6);
  doc.setTextColor(150);
  doc.text('REFERENCE', 15, 30);
  doc.text('RECIPIENT', pageWidth / 2 + 5, 30);
  
  doc.setTextColor(30, 30, 30);
  doc.setFont('helvetica', 'bold');
  doc.text(transaction.payment_reference, 15, 33);
  doc.text((user.full_name || 'VALUED CURATOR').toUpperCase(), pageWidth / 2 + 5, 33);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(150);
  doc.text('DATE', 15, 38);
  doc.text('IDENTIFICATION', pageWidth / 2 + 5, 38);
  
  doc.setTextColor(30, 30, 30);
  doc.text(new Date(transaction.created_at).toLocaleDateString().toUpperCase(), 15, 41);
  doc.text((user.email || '').toUpperCase(), pageWidth / 2 + 5, 41);

  // 5. ITEM TABLE (Compact)
  const startY = 55;
  doc.setDrawColor(245);
  doc.setFillColor(252, 252, 252);
  doc.rect(15, startY, pageWidth - 30, 6, 'F');
  
  doc.setFontSize(5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(150);
  doc.text('ITEM DESCRIPTION', 18, startY + 4);
  doc.text('QTY', pageWidth - 50, startY + 4, { align: 'right' });
  doc.text('PRICE', pageWidth - 35, startY + 4, { align: 'right' });
  doc.text('AMOUNT', pageWidth - 18, startY + 4, { align: 'right' });
  
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 30, 30);
  let currentY = startY + 12;

  if (order.items?.length > 0) {
    order.items.forEach(item => {
      const name = (item.product_name || item.name || 'ITEM').toUpperCase();
      doc.setFont('helvetica', 'bold');
      doc.text(name, 18, currentY);
      doc.setFont('helvetica', 'normal');
      doc.text(item.quantity?.toString() || '1', pageWidth - 50, currentY, { align: 'right' });
      doc.text(`₦${(item.price || 0).toLocaleString()}`, pageWidth - 35, currentY, { align: 'right' });
      doc.text(`₦${((item.price || 0) * (item.quantity || 1)).toLocaleString()}`, pageWidth - 18, currentY, { align: 'right' });
      currentY += 6;
    });
  } else {
    doc.text('BOUTIQUE ORDER', 18, currentY);
    doc.text('1', pageWidth - 50, currentY, { align: 'right' });
    doc.text(`₦${order.total_amount.toLocaleString()}`, pageWidth - 18, currentY, { align: 'right' });
    currentY += 6;
  }

  // 6. TOTAL
  doc.line(15, currentY + 4, pageWidth - 15, currentY + 4);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text(`TOTAL PAID: ₦${order.total_amount.toLocaleString()}`, pageWidth - 18, currentY + 12, { align: 'right' });

  // 7. FOOTER
  const footerY = pageHeight - 15;
  doc.setTextColor(180);
  doc.setFontSize(4);
  doc.setFont('helvetica', 'italic');
  doc.text('LUSTRAX VERIFIED PROTOCOL • CERTIFIED ACQUISITION RECORD', pageWidth / 2, footerY, { align: 'center' });

  // 8. SAVE
  doc.save(`Lustrax-Receipt-${transaction.payment_reference}.pdf`);
};
