-- DropTable
DROP INDEX "Category_name_key";

DROP INDEX "Customer_email_key";

DROP INDEX "Devolution_invoice_key";

DROP INDEX "Product_sku_key";

DROP INDEX "Purchase_invoice_key";

DROP INDEX "Sale_invoice_key";

-- CreateIndex
CREATE UNIQUE INDEX "Category_storeId_name_key" ON "Category"("storeId", "name");

CREATE UNIQUE INDEX "Customer_storeId_email_key" ON "Customer"("storeId", "email");

CREATE UNIQUE INDEX "Devolution_storeId_invoice_key" ON "Devolution"("storeId", "invoice");

CREATE UNIQUE INDEX "Product_storeId_sku_key" ON "Product"("storeId", "sku");

CREATE UNIQUE INDEX "Purchase_storeId_invoice_key" ON "Purchase"("storeId", "invoice");

CREATE UNIQUE INDEX "Sale_storeId_invoice_key" ON "Sale"("storeId", "invoice");