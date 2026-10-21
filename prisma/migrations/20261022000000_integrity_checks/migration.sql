-- Additional integrity checks after the original phpMyAdmin import.
ALTER TABLE `CatalogItem` ADD CONSTRAINT `CatalogItem_amounts_check` CHECK (`priceMinor` >= 0);
ALTER TABLE `Quote` ADD CONSTRAINT `Quote_amounts_check` CHECK (`subtotalMinor` >= 0 AND `taxMinor` >= 0 AND `labourFeeMinor` >= 0 AND `totalMinor` = `subtotalMinor` + `taxMinor` + `labourFeeMinor`);
ALTER TABLE `QuoteLineItem` ADD CONSTRAINT `QuoteLineItem_amounts_check` CHECK (`quantity` > 0 AND `unitPriceMinor` >= 0 AND `totalMinor` = `quantity` * `unitPriceMinor`);
ALTER TABLE `Invoice` ADD CONSTRAINT `Invoice_amounts_check` CHECK (`subtotalMinor` >= 0 AND `taxMinor` >= 0 AND `labourFeeMinor` >= 0 AND `totalMinor` = `subtotalMinor` + `taxMinor` + `labourFeeMinor`);
ALTER TABLE `Subscription` ADD CONSTRAINT `Subscription_amounts_check` CHECK (`priceMinor` >= 0 AND `billingDay` BETWEEN 1 AND 31);
ALTER TABLE `Payment` ADD CONSTRAINT `Payment_amounts_check` CHECK (`amountMinor` > 0);
ALTER TABLE `DocumentSequence` ADD CONSTRAINT `DocumentSequence_amounts_check` CHECK (`value` >= 0);
ALTER TABLE `ErpState` ADD CONSTRAINT `ErpState_amounts_check` CHECK (`revision` >= 0);
ALTER TABLE `JobCard` ADD CONSTRAINT `JobCard_amounts_check` CHECK (`totalMinor` >= 0);
ALTER TABLE `LedgerEntry` ADD CONSTRAINT `LedgerEntry_amounts_check` CHECK (`amountMinor` >= 0);
ALTER TABLE `RequestLimit` ADD CONSTRAINT `RequestLimit_amounts_check` CHECK (`count` > 0);
