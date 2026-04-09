import { jsPDF } from 'jspdf';
import logoSrc from '../assets/Logo.png';

const loadImageNode = (src) => new Promise((resolve, reject) => {
  const img = new Image();
  img.crossOrigin = "Anonymous";
  img.onload = () => resolve(img);
  img.onerror = (e) => reject(e);
  img.src = src;
});

/**
 * Generates an expanded, professional PDF receipt for Lustrax Jewelries.
 */
export const generateReceipt = async (data) => {
  const { order, transaction, user } = data;
  const doc = new jsPDF({
    unit: 'mm',
    format: 'a5' 
  });
  
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Load Logo
  let logoHeight = 20;
  try {
    const img = await loadImageNode(logoSrc);
    const aspect = img.height / img.width;
    const logoWidth = 30;
    logoHeight = logoWidth * aspect;
    doc.addImage(img, 'PNG', pageWidth/2 - logoWidth/2, 12, logoWidth, logoHeight);
  } catch (e) {
    console.warn("Could not load logo into PDF", e);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(30, 30, 30);
    doc.text('LUSTRAX', pageWidth/2, 20, { align: 'center' });
    logoHeight = 10;
  }

  const startYBase = 15 + logoHeight;

  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(30, 30, 30);
  doc.text('OFFICIAL RECEIPT', pageWidth/2, startYBase + 5, { align: 'center' });
  
  doc.setDrawColor(220);
  doc.line(15, startYBase + 10, pageWidth - 15, startYBase + 10);

  // Metadata Section
  const boxY = startYBase + 18;
  
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(120);
  doc.text('REFERENCE', 15, boxY);
  doc.text('RECIPIENT', pageWidth/2 + 5, boxY);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(40);
  doc.text(String(transaction.payment_reference || 'N/A').toUpperCase(), 15, boxY + 5);
  doc.text((user.full_name || 'VALUED CURATOR').toUpperCase(), pageWidth/2 + 5, boxY + 5);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(120);
  doc.text('DATE', 15, boxY + 12);
  doc.text('IDENTIFICATION', pageWidth/2 + 5, boxY + 12);
  
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(40);
  doc.text(new Date(transaction.created_at || Date.now()).toLocaleDateString().toUpperCase(), 15, boxY + 17);
  doc.text((user.email || '').toUpperCase(), pageWidth/2 + 5, boxY + 17);

  // Table Headers
  let tableY = boxY + 28;
  doc.setFillColor(248, 248, 248);
  doc.setDrawColor(240);
  doc.rect(15, tableY, pageWidth - 30, 8, 'F');
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6);
  doc.setTextColor(80);
  doc.text('ITEM DESCRIPTION', 18, tableY + 5);
  doc.text('QTY', pageWidth - 55, tableY + 5, { align: 'center' });
  doc.text('PRICE', pageWidth - 35, tableY + 5, { align: 'center' });
  doc.text('AMOUNT', pageWidth - 18, tableY + 5, { align: 'right' });

  // Table Items
  let currentY = tableY + 14;

  if (order.items && order.items.length > 0) {
    order.items.forEach(item => {
      const name = (item.product_name || item.name || 'ITEM').toUpperCase();
      const variantDisplay = item.selected_attributes ? Object.values(item.selected_attributes).join(' / ') : '';
      
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(40);
      doc.text(name, 18, currentY);
      
      if (variantDisplay) {
         doc.setFontSize(5);
         doc.setFont('helvetica', 'italic');
         doc.setTextColor(120);
         doc.text(variantDisplay.toUpperCase(), 18, currentY + 4);
         doc.setFontSize(6);
      }
      
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(40);
      doc.text(String(item.quantity || 1), pageWidth - 55, currentY, { align: 'center' });
      doc.text(`N${(parseFloat(item.price) || 0).toLocaleString()}`, pageWidth - 35, currentY, { align: 'center' });
      doc.text(`N${((parseFloat(item.price) || 0) * (parseInt(item.quantity) || 1)).toLocaleString()}`, pageWidth - 18, currentY, { align: 'right' });
      
      currentY += variantDisplay ? 10 : 8;
    });
  } else {
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(40);
    doc.text('BOUTIQUE PURCHASE', 18, currentY);
    doc.setFont('helvetica', 'normal');
    doc.text('1', pageWidth - 55, currentY, { align: 'center' });
    doc.text(`N${(parseFloat(order.total_amount) || 0).toLocaleString()}`, pageWidth - 35, currentY, { align: 'center' });
    doc.text(`N${(parseFloat(order.total_amount) || 0).toLocaleString()}`, pageWidth - 18, currentY, { align: 'right' });
    currentY += 8;
  }

  // Details Divider
  doc.setDrawColor(220);
  doc.line(15, currentY, pageWidth - 15, currentY);
  
  // Total Section
  currentY += 8;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(20);
  doc.text('GRAND TOTAL', pageWidth - 45, currentY, { align: 'right' });
  doc.text(`N${(parseFloat(order.total_amount) || 0).toLocaleString()}`, pageWidth - 18, currentY, { align: 'right' });

  // Paid Stamp
  doc.setTextColor(200, 160, 50); // Gold-ish
  doc.setFontSize(10);
  doc.setFont('helvetica', 'italic');
  doc.text('LUSTRAX VERIFIED PROTOCOL', pageWidth/2, currentY + 20, { align: 'center' });

  // Footer
  const footerY = pageHeight - 15;
  doc.setTextColor(150);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(5);
  doc.text('THANK YOU FOR SHOPPING WITH LUSTRAX JEWELRIES.', pageWidth / 2, footerY, { align: 'center' });
  doc.text('LUSTRAX-JEWELRIES.COM', pageWidth / 2, footerY + 4, { align: 'center' });

  // Save
  doc.save(`Lustrax-Receipt-${transaction.payment_reference}.pdf`);
};
