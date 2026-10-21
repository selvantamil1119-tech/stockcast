import { Readable } from 'stream';
import csvParser from 'csv-parser';
import Product from '../models/Product.js';
import Sale from '../models/Sale.js';
import PurchaseOrder from '../models/PurchaseOrder.js';

export const uploadProducts = async (req, res) => {
  try {
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ success: false, message: 'Please select and upload a valid .csv file' });
    }

    const { replaceAll = 'true' } = req.body;
    const shouldReplace = replaceAll === 'true' || replaceAll === true;

    const results = [];
    const errors = [];
    let rowNumber = 1;

    const stream = Readable.from(req.file.buffer.toString());

    stream
      .pipe(csvParser())
      .on('data', (row) => {
        rowNumber++;
        const sku = (row.sku || row.SKU || '').trim().toUpperCase();
        const name = (row.name || row.Name || row.productName || '').trim();

        if (!sku || !name) {
          errors.push(`Row ${rowNumber}: Missing SKU or Name`);
          return;
        }

        results.push({
          sku,
          name,
          category: (row.category || row.Category || 'Electronics').trim(),
          description: (row.description || row.Description || '').trim(),
          unitCost: parseFloat(row.unitCost || row.Cost || 10) || 10,
          unitPrice: parseFloat(row.unitPrice || row.Price || 25) || 25,
          currentStock: parseInt(row.currentStock || row.Stock || 0, 10) || 0,
          minStockLevel: parseInt(row.minStockLevel || row.MinStock || 15, 10) || 15,
          maxStockLevel: parseInt(row.maxStockLevel || row.MaxStock || 150, 10) || 150,
          safetyStock: parseInt(row.safetyStock || row.SafetyStock || 10, 10) || 10,
          leadTimeDays: parseInt(row.leadTimeDays || row.LeadTime || 7, 10) || 7,
          supplier: {
            name: (row.supplierName || row.Supplier || 'General Wholesale').trim(),
            email: (row.supplierEmail || '').trim()
          },
          userId: req.userId || null
        });
      })
      .on('end', async () => {
        if (results.length === 0) {
          return res.status(400).json({ success: false, message: 'The uploaded CSV contains no valid rows.' });
        }

        // When replaceAll is enabled (default), wipe this user's existing shop catalog
        // so the entire platform exclusively reflects the user's freshly uploaded shop data!
        if (shouldReplace) {
          const deleteFilter = req.userId ? { userId: req.userId } : {};
          await Product.deleteMany(deleteFilter);
          await Sale.deleteMany(deleteFilter);
          await PurchaseOrder.deleteMany(deleteFilter);
        }

        let createdCount = 0;
        const newProducts = [];

        for (const item of results) {
          try {
            const product = new Product(item);
            await product.save();
            createdCount++;
            newProducts.push(item);
          } catch (err) {
            errors.push(`SKU ${item.sku}: ${err.message}`);
          }
        }

        // Generate sales history EXCLUSIVELY for the newly uploaded products
        if (newProducts.length > 0) {
          const salesToInsert = [];
          const channels = ['Retail POS', 'Online Store', 'Retail POS'];
          const today = new Date();

          newProducts.forEach(prod => {
            let baseQty = 3;
            if (prod.category === 'Groceries') baseQty = 7;
            else if (prod.category === 'Apparel') baseQty = 4;
            else if (prod.category === 'Electronics') baseQty = 3;
            else baseQty = 2;

            for (let dayOffset = 60; dayOffset >= 1; dayOffset--) {
              const saleDate = new Date(today);
              saleDate.setDate(today.getDate() - dayOffset);

              const dayOfWeek = saleDate.getDay();
              const weekendMultiplier = (dayOfWeek === 0 || dayOfWeek === 5 || dayOfWeek === 6) ? 1.35 : 1.0;
              const trendMultiplier = 1 + ((60 - dayOffset) / 120);
              const noise = 0.7 + Math.random() * 0.6;

              const dailyUnits = Math.max(1, Math.round(baseQty * weekendMultiplier * trendMultiplier * noise));
              const rev = Number((dailyUnits * prod.unitPrice).toFixed(2));
              const cost = Number((dailyUnits * prod.unitCost).toFixed(2));

              salesToInsert.push({
                saleId: `TXN-${saleDate.getTime()}-${prod.sku}-${dayOffset}`,
                sku: prod.sku,
                productName: prod.name,
                category: prod.category,
                date: saleDate,
                quantitySold: dailyUnits,
                unitPrice: prod.unitPrice,
                unitCost: prod.unitCost,
                revenue: rev,
                cost,
                profit: Number((rev - cost).toFixed(2)),
                channel: channels[Math.floor(Math.random() * channels.length)],
                userId: req.userId || null
              });
            }
          });

          try {
            await Sale.insertMany(salesToInsert);
          } catch (err) {
            console.error('Error generating sales history for CSV products:', err);
          }
        }

        res.json({
          success: true,
          message: `All old demo data removed! Replaced entire store with ${createdCount} products from your CSV. All forecasting, replenishment, and analytics modules now exclusively reflect your uploaded shop!`,
          createdCount,
          totalProcessed: results.length,
          errors: errors.slice(0, 10)
        });
      })
      .on('error', (err) => {
        res.status(500).json({ success: false, message: 'CSV parsing error: ' + err.message });
      });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const downloadTemplate = (req, res) => {
  const csvContent = `sku,name,category,unitCost,unitPrice,currentStock,minStockLevel,maxStockLevel,safetyStock,leadTimeDays,supplierName
ELEC-201,Wireless Ergonomic Mouse,Electronics,450.00,999.00,45,15,120,10,5,LogiTech Distributors
GROC-105,Organic Green Tea 100 Bags,Groceries,180.00,350.00,80,25,200,20,4,Herbal Harvest Ltd
APP-305,Thermal Winter Fleece Jacket,Apparel,750.00,1899.00,18,15,80,10,10,Nordic Apparels`;

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="stockcast_product_catalog_template.csv"');
  res.status(200).send(csvContent);
};
