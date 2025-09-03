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

  // Company info (you can customize this)
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('AXIRIAM', margin, yPosition);
  yPosition += 5;
  doc.setFont('helvetica', 'normal');
  doc.text('Tu empresa de confianza', margin, yPosition);
  yPosition += 5;
  doc.text('contacto@axiriam.com', margin, yPosition);
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
  yPosition += 15;

  // Items table header
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('PRODUCTOS Y SERVICIOS:', margin, yPosition);
  yPosition += 10;

  // Table headers
  doc.setFontSize(9);
  const colWidths = {
    description: 80,
    quantity: 25,
    unitPrice: 30,
    total: 30
  };

  const tableStartX = margin;
  doc.rect(tableStartX, yPosition - 5, pageWidth - 2 * margin, 8);
  doc.setFont('helvetica', 'bold');
  doc.text('DESCRIPCIÓN', tableStartX + 2, yPosition);
  doc.text('CANT.', tableStartX + colWidths.description + 2, yPosition);
  doc.text('PRECIO UNIT.', tableStartX + colWidths.description + colWidths.quantity + 2, yPosition);
  doc.text('TOTAL', tableStartX + colWidths.description + colWidths.quantity + colWidths.unitPrice + 2, yPosition);
  yPosition += 10;

  // Items
  doc.setFont('helvetica', 'normal');
  quoteData.items.forEach((quoteItem, index) => {
    const item = items.find(i => i.id === quoteItem.itemId);
    const itemName = item?.name || 'Producto no encontrado';
    const description = quoteItem.description || itemName;
    const total = quoteItem.quantity * quoteItem.unitPrice;

    // Check if we need a new page
    if (yPosition > pageHeight - 40) {
      doc.addPage();
      yPosition = margin;
    }

    // Row background (alternating)
    if (index % 2 === 0) {
      doc.setFillColor(245, 245, 245);
      doc.rect(tableStartX, yPosition - 5, pageWidth - 2 * margin, 8, 'F');
    }

    doc.text(description, tableStartX + 2, yPosition, { maxWidth: colWidths.description - 4 });
    doc.text(quoteItem.quantity.toString(), tableStartX + colWidths.description + 2, yPosition);
    doc.text(`$${quoteItem.unitPrice.toFixed(2)}`, tableStartX + colWidths.description + colWidths.quantity + 2, yPosition);
    doc.text(`$${total.toFixed(2)}`, tableStartX + colWidths.description + colWidths.quantity + colWidths.unitPrice + 2, yPosition);
    
    yPosition += 8;
  });

  // Extras
  if (quoteData.extras && quoteData.extras.length > 0) {
    yPosition += 5;
    doc.setFont('helvetica', 'bold');
    doc.text('EXTRAS:', margin, yPosition);
    yPosition += 8;

    doc.setFont('helvetica', 'normal');
    quoteData.extras.forEach((extra, index) => {
      if (yPosition > pageHeight - 40) {
        doc.addPage();
        yPosition = margin;
      }

      if ((quoteData.items.length + index) % 2 === 0) {
        doc.setFillColor(245, 245, 245);
        doc.rect(tableStartX, yPosition - 5, pageWidth - 2 * margin, 8, 'F');
      }

      doc.text(extra.description, tableStartX + 2, yPosition, { maxWidth: colWidths.description - 4 });
      doc.text('1', tableStartX + colWidths.description + 2, yPosition);
      doc.text(`$${extra.price.toFixed(2)}`, tableStartX + colWidths.description + colWidths.quantity + 2, yPosition);
      doc.text(`$${extra.price.toFixed(2)}`, tableStartX + colWidths.description + colWidths.quantity + colWidths.unitPrice + 2, yPosition);
      
      yPosition += 8;
    });
  }

  yPosition += 10;

  // Totals
  const totalsStartX = pageWidth - margin - 80;
  
  // Calculate totals
  const itemsTotal = quoteData.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  const extrasTotal = quoteData.extras ? quoteData.extras.reduce((sum, extra) => sum + extra.price, 0) : 0;
  const subtotal = itemsTotal + extrasTotal;
  const total = Math.max(0, subtotal - quoteData.discount);

  doc.setFont('helvetica', 'normal');
  doc.text('Subtotal:', totalsStartX, yPosition);
  doc.text(`$${subtotal.toFixed(2)}`, totalsStartX + 40, yPosition);
  yPosition += 6;

  if (quoteData.discount > 0) {
    doc.text('Descuento:', totalsStartX, yPosition);
    doc.text(`-$${quoteData.discount.toFixed(2)}`, totalsStartX + 40, yPosition);
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
    yPosition += 20;
    if (yPosition > pageHeight - 60) {
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

  // Footer
  const footerY = pageHeight - 20;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.text('Esta cotización es válida hasta la fecha indicada. Los precios pueden estar sujetos a cambios.', 
    pageWidth / 2, footerY, { align: 'center' });

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
