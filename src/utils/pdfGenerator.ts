import jsPDF from 'jspdf';
import { Quote, QuoteFormData, Item } from '../types';

export const generateQuotePDF = (
  quoteData: QuoteFormData | Quote,
  items: Item[],
  quoteNumber?: string
): void => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 20;
  let yPosition = margin;


  // Header
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('COTIZACIÓN', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 15;

  // Quote number and date
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  const displayQuoteNumber = quoteNumber || ('quoteNumber' in quoteData ? quoteData.quoteNumber : 'DRAFT');
  doc.text(`Número: ${displayQuoteNumber}`, margin, yPosition);
  doc.text(`Fecha: ${new Date().toLocaleDateString('es-MX')}`, pageWidth - margin - 60, yPosition);
  yPosition += 20;

  // Company info
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('AXIRIAM', margin, yPosition);
  yPosition += 5;
  doc.setFont('helvetica', 'normal');
  doc.text('Gorros quirurgicos. Ensenada, Baja California.', margin, yPosition);
  yPosition += 5;
  doc.text('Instagram: axiriam', margin, yPosition);
  yPosition += 15;

  // Client information
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('CLIENTE:', margin, yPosition);
  yPosition += 8;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Nombre: ${quoteData.clientName}`, margin, yPosition);
  yPosition += 5;

  if (quoteData.clientCompany) {
    doc.text(`Empresa: ${quoteData.clientCompany}`, margin, yPosition);
    yPosition += 5;
  }

  if (quoteData.clientEmail) {
    doc.text(`Email: ${quoteData.clientEmail}`, margin, yPosition);
    yPosition += 5;
  }

  if (quoteData.clientPhone) {
    doc.text(`Teléfono: ${quoteData.clientPhone}`, margin, yPosition);
    yPosition += 5;
  }

  yPosition += 10;

  // Valid until
  doc.text(`Válida hasta: ${new Date(quoteData.validUntil).toLocaleDateString('es-MX')}`, margin, yPosition);
  yPosition += 6;

  // Payment method
  const paymentMethod = (quoteData as any).paymentMethod;
  if (paymentMethod) {
    doc.text(`Forma de pago: ${paymentMethod}`, margin, yPosition);
    yPosition += 5;
  }
  yPosition += 5;

  // Items table header
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('PRODUCTOS Y SERVICIOS:', margin, yPosition);
  yPosition += 10;

  // Table headers
  doc.setFontSize(9);
  const colWidths = {
    description: 70,
    quantity: 20,
    unitPrice: 28,
    discount: 28,
    total: 28
  };

  const tableStartX = margin;
  doc.rect(tableStartX, yPosition - 5, pageWidth - 2 * margin, 8);
  doc.setFont('helvetica', 'bold');
  doc.text('DESCRIPCIÓN', tableStartX + 2, yPosition);
  doc.text('CANT.', tableStartX + colWidths.description + 2, yPosition);
  doc.text('PRECIO UNIT.', tableStartX + colWidths.description + colWidths.quantity + 2, yPosition);
  doc.text('DESC.', tableStartX + colWidths.description + colWidths.quantity + colWidths.unitPrice + 2, yPosition);
  doc.text('TOTAL', tableStartX + colWidths.description + colWidths.quantity + colWidths.unitPrice + colWidths.discount + 2, yPosition);
  yPosition += 10;

  // Items
  doc.setFont('helvetica', 'normal');
  quoteData.items.forEach((quoteItem, index) => {
    let itemName: string;
    let itemDetails: string = '';
    
    // Check if it's a manual item or inventory item
    if (quoteItem.manualName) {
      // Manual item
      itemName = quoteItem.manualName;
      itemDetails = `${quoteItem.manualCategory || ''} - ${quoteItem.manualType || ''}`.replace(/^- | -$/, '');
    } else {
      // Inventory item
      const item = items.find(i => i.id === quoteItem.itemId);
      itemName = item?.name || 'Producto no encontrado';
      itemDetails = item ? `${item.category} - ${item.type}` : '';
    }
    
    const description = quoteItem.description || `${itemName}${itemDetails ? ` (${itemDetails})` : ''}`;
    const lineSubtotal = (quoteItem.quantity * quoteItem.unitPrice);
    const lineDiscount = Math.max(0, (quoteItem as any).discount || 0);
    const total = Math.max(0, lineSubtotal - lineDiscount);

    // Handle multi-line description
    const descriptionLines = doc.splitTextToSize(description, colWidths.description - 4);
    const lineHeight = 5;
    const descriptionHeight = descriptionLines.length * lineHeight;
    
    // Check if we need a new page for the entire row
    if (yPosition + descriptionHeight > pageHeight - 25) { // Reduced from 35 to 25
      doc.addPage();
      yPosition = margin;
    }

    // Row background (alternating)
    if (index % 2 === 0) {
      doc.setFillColor(245, 245, 245);
      doc.rect(tableStartX, yPosition - 5, pageWidth - 2 * margin, descriptionHeight + 3, 'F');
    }

    // Draw description text (multi-line)
    doc.text(descriptionLines, tableStartX + 2, yPosition);
    
    // Draw other columns aligned with first line of description
    doc.text(quoteItem.quantity.toString(), tableStartX + colWidths.description + 2, yPosition);
    doc.text(`$${quoteItem.unitPrice.toFixed(2)}`, tableStartX + colWidths.description + colWidths.quantity + 2, yPosition);
    // Discount column
    doc.text(`$${lineDiscount.toFixed(2)}`, tableStartX + colWidths.description + colWidths.quantity + colWidths.unitPrice + 2, yPosition);
    // Total column
    doc.text(`$${total.toFixed(2)}`, tableStartX + colWidths.description + colWidths.quantity + colWidths.unitPrice + colWidths.discount + 2, yPosition);
    
    yPosition += descriptionHeight + 2; // Reduced from 3 to 2
  });

  // Extras
  if (quoteData.extras && quoteData.extras.length > 0) {
    yPosition += 5;
    doc.setFont('helvetica', 'bold');
    doc.text('EXTRAS:', margin, yPosition);
    yPosition += 8;

    doc.setFont('helvetica', 'normal');
    quoteData.extras.forEach((extra, index) => {
      const qty = (extra.quantity != null && extra.quantity > 0) ? extra.quantity : 1;
      const extraLineSubtotal = extra.price * qty;
      const extraLineDiscount = Math.max(0, (extra as any).discount || 0);
      const extraTotal = Math.max(0, extraLineSubtotal - extraLineDiscount);

      // Handle multi-line description for extras
      const extraDescriptionLines = doc.splitTextToSize(extra.description, colWidths.description - 4);
      const extraLineHeight = 5;
      const extraDescriptionHeight = extraDescriptionLines.length * extraLineHeight;
      
      // Check if we need a new page for the entire extra row
      if (yPosition + extraDescriptionHeight > pageHeight - 25) { // Reduced from 35 to 25
        doc.addPage();
        yPosition = margin;
      }

      if ((quoteData.items.length + index) % 2 === 0) {
        doc.setFillColor(245, 245, 245);
        doc.rect(tableStartX, yPosition - 5, pageWidth - 2 * margin, extraDescriptionHeight + 3, 'F');
      }

      // Draw extra description text (multi-line)
      doc.text(extraDescriptionLines, tableStartX + 2, yPosition);
      
      // Draw other columns aligned with first line of description
      doc.text(String(qty), tableStartX + colWidths.description + 2, yPosition);
      doc.text(`$${extra.price.toFixed(2)}`, tableStartX + colWidths.description + colWidths.quantity + 2, yPosition);
      // Discount column
      doc.text(`$${extraLineDiscount.toFixed(2)}`, tableStartX + colWidths.description + colWidths.quantity + colWidths.unitPrice + 2, yPosition);
      // Total column
      doc.text(`$${extraTotal.toFixed(2)}`, tableStartX + colWidths.description + colWidths.quantity + colWidths.unitPrice + colWidths.discount + 2, yPosition);
      
      yPosition += extraDescriptionHeight + 2; // Reduced from 3 to 2
    });
  }

  yPosition += 6; // Reduced from 8 to 6

  // Totals
  const totalsStartX = pageWidth - margin - 80;
  
  // Calculate totals aligned with UI
  const itemsTotal = quoteData.items.reduce((sum, item) => {
    const lineSubtotal = item.quantity * item.unitPrice;
    const lineDiscount = Math.max(0, (item as any).discount || 0);
    return sum + Math.max(0, lineSubtotal - lineDiscount);
  }, 0);
  const extrasTotal = (quoteData.extras || []).reduce((sum, extra: any) => {
    const qty = (extra.quantity != null && extra.quantity > 0) ? extra.quantity : 1;
    const lineSubtotal = extra.price * qty;
    const lineDiscount = Math.max(0, extra.discount || 0);
    return sum + Math.max(0, lineSubtotal - lineDiscount);
  }, 0);
  const baseSubtotal = itemsTotal + extrasTotal;
  const hasGeneralDiscount = (quoteData as any).hasGeneralDiscount;
  const generalDiscount = (hasGeneralDiscount === false) ? 0 : Math.max(0, (quoteData as any).discount || 0);
  const discountedSubtotal = Math.max(0, baseSubtotal - generalDiscount);
  const ivaRate = ((quoteData as any).iva || 0) / 100;
  const includingIva = (quoteData as any).includingIva ?? (quoteData as any).including_iva ?? true;
  const ivaAmount = includingIva ? 0 : (discountedSubtotal * ivaRate);
  const total = includingIva ? discountedSubtotal : (discountedSubtotal + ivaAmount);

  doc.setFont('helvetica', 'normal');
  doc.text('Subtotal:', totalsStartX, yPosition);
  doc.text(`$${baseSubtotal.toFixed(2)}`, totalsStartX + 40, yPosition);
  yPosition += 6;

  if (generalDiscount > 0) {
    doc.text('Descuento:', totalsStartX, yPosition);
    doc.text(`-$${generalDiscount.toFixed(2)}`, totalsStartX + 40, yPosition);
    yPosition += 6;
  }

  // IVA line
  const ivaPercentage = Math.round((quoteData as any).iva || 0);
  if (includingIva) {
    doc.text(`IVA (${ivaPercentage}%) incluido`, totalsStartX, yPosition);
    yPosition += 6;
  } else {
    doc.text(`IVA (${ivaPercentage}%):`, totalsStartX, yPosition);
    doc.text(`$${ivaAmount.toFixed(2)}`, totalsStartX + 40, yPosition);
    yPosition += 6;
  }


  // Total line
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.line(totalsStartX, yPosition, totalsStartX + 70, yPosition);
  yPosition += 8;
  doc.text('TOTAL:', totalsStartX, yPosition);
  doc.text(`$${total.toFixed(2)}`, totalsStartX + 40, yPosition);

  // Notes
  if (quoteData.notes && quoteData.notes.trim()) {
    yPosition += 12; // Reduced from 15 to 12
    if (yPosition > pageHeight - 30) { // Reduced from 40 to 30
      doc.addPage();
      yPosition = margin;
    }

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('NOTAS:', margin, yPosition);
    yPosition += 8;

    doc.setFont('helvetica', 'normal');
    const noteLines = doc.splitTextToSize(quoteData.notes, pageWidth - 2 * margin);
    doc.text(noteLines, margin, yPosition);
  }

  // Footer - Dynamic positioning to avoid overlap
  const minFooterSpace = 6; // Reduced from 8 to 6
  const footerText = 'Esta cotización es válida hasta la fecha indicada. Los precios pueden estar sujetos a cambios.';
  const footerY = Math.max(yPosition + minFooterSpace, pageHeight - 12); // Reduced from 15 to 12
  
  // Ensure footer doesn't go beyond page bottom
  if (footerY > pageHeight - 6) { // Reduced from 8 to 6
    doc.addPage();
    // Recalculate footer position for new page
    const newFooterY = pageHeight - 12; // Reduced from 15 to 12
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.text(footerText, pageWidth / 2, newFooterY, { align: 'center' });
  } else {
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.text(footerText, pageWidth / 2, footerY, { align: 'center' });
  }

  // Save the PDF
  const fileName = `Cotizacion_${displayQuoteNumber}_${quoteData.clientName.replace(/\s+/g, '_')}.pdf`;
  doc.save(fileName);
};

export const generateQuotePDFFromFormData = (
  formData: QuoteFormData,
  items: Item[],
  quoteNumber: string
): void => {
  generateQuotePDF(formData, items, quoteNumber);
};

export const generateQuotePDFFromQuote = (
  quote: Quote,
  items: Item[]
): void => {
  generateQuotePDF(quote, items);
};
