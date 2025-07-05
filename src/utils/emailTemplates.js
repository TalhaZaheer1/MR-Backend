
const generatePurchaseOrderEmailTemplate = (purchaseOrder) => {
  const { supplierUsername, quotationId, totalAmount, expectedDeliveryDate, items } = purchaseOrder;
  console.log({purchaseOrder});
  const itemsList = items.map(item => {
    return `
      <tr>
        <td style="padding: 10px; text-align: left;">${item.material.description}</td>
        <td style="padding: 10px; text-align: left;">${item.quantity}</td>
        <td style="padding: 10px; text-align: left;">${item.pricePerUnit}</td>
        <td style="padding: 10px; text-align: left;">${item.totalPrice}</td>
      </tr>
    `;
  }).join('');

  return `
    <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f9f9f9;
            margin: 0;
            padding: 20px;
          }
          .container {
            width: 80%;
            margin: 0 auto;
            background-color: #ffffff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }
          .header {
            text-align: center;
            color: #333;
          }
          .header h1 {
            font-size: 24px;
            margin: 0;
            color: #007BFF;
          }
          .header p {
            font-size: 16px;
            color: #666;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }
          table, th, td {
            border: 1px solid #ddd;
          }
          th, td {
            padding: 12px;
            text-align: center;
          }
          th {
            background-color: #f2f2f2;
          }
          .footer {
            text-align: center;
            margin-top: 20px;
            font-size: 14px;
            color: #555;
          }
          .footer a {
            color: #007BFF;
            text-decoration: none;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Purchase Order Created</h1>
            <p>Dear ${supplierUsername},</p>
            <p>We are pleased to inform you that your quotation has been approved and a Purchase Order (PO) has been created.</p>
            <p><strong>PO ID:</strong> ${purchaseOrder._id}</p>
            <p><strong>Quotation ID:</strong> ${quotationId}</p>
            <p><strong>Total Amount:</strong> ${totalAmount}</p>
            <p><strong>Expected Delivery Date:</strong> ${expectedDeliveryDate}</p>
          </div>

          <h2>Items in the Purchase Order</h2>
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Quantity</th>
                <th>Price Per Unit</th>
                <th>Total Amount</th>
              </tr>
            </thead>
            <tbody>
              ${itemsList}
            </tbody>
          </table>

          <div class="footer">
            <p>If you have any questions, feel free to <a href="mailto:support@company.com">contact us</a>.</p>
            <p>Best regards, <br>Your Company</p>
          </div>
        </div>
      </body>
    </html>
  `;
};


module.exports = {
  generatePurchaseOrderEmailTemplate
}
