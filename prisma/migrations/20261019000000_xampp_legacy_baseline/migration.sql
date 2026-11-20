-- CreateTable
CREATE TABLE `admins` (
    `id` VARCHAR(36) NOT NULL,
    `username` VARCHAR(191) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `role` VARCHAR(50) NOT NULL DEFAULT 'admin',
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `username`(`username` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `invoice_items` (
    `id` VARCHAR(36) NOT NULL,
    `invoice_id` VARCHAR(36) NOT NULL,
    `service_id` VARCHAR(36) NULL,
    `title` VARCHAR(255) NOT NULL,
    `qty` VARCHAR(50) NOT NULL DEFAULT '1',
    `rate` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `total` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `invoice_id`(`invoice_id` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `invoices` (
    `id` VARCHAR(36) NOT NULL,
    `invoice_no` VARCHAR(100) NOT NULL,
    `doc_type` VARCHAR(50) NOT NULL DEFAULT 'Invoice',
    `client_type` VARCHAR(50) NOT NULL DEFAULT 'general',
    `client_name` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(50) NULL,
    `email` VARCHAR(191) NULL,
    `location` VARCHAR(255) NULL DEFAULT 'Mombasa',
    `sub_id` VARCHAR(36) NULL,
    `status` VARCHAR(50) NOT NULL DEFAULT 'unpaid',
    `issue_date` DATE NOT NULL,
    `due_date` DATE NULL,
    `billing_period` VARCHAR(100) NULL,
    `subtotal` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `tax` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `labour_fee` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `total` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `total_paid` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `balance_due` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `has_payment_plan` BOOLEAN NOT NULL DEFAULT false,
    `deposit_amount` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `deposit_label` VARCHAR(100) NULL DEFAULT '1 ST Installment',
    `notes` TEXT NULL,
    `validity_note` VARCHAR(255) NULL DEFAULT 'Please Note: Valid for 14 days from date.',
    `paid_at` DATETIME(0) NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `client_name`(`client_name` ASC),
    UNIQUE INDEX `invoice_no`(`invoice_no` ASC),
    INDEX `issue_date`(`issue_date` ASC),
    INDEX `status`(`status` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `job_cards` (
    `id` VARCHAR(36) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `client_name` VARCHAR(191) NOT NULL,
    `technician` VARCHAR(191) NOT NULL,
    `date` DATE NOT NULL,
    `status` VARCHAR(50) NOT NULL DEFAULT 'in_progress',
    `category` VARCHAR(100) NOT NULL DEFAULT 'Field Operations',
    `labor_cost` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `total_cost` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `notes` TEXT NULL,
    `invoice_generated` BOOLEAN NOT NULL DEFAULT false,
    `invoice_ref` VARCHAR(100) NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ledger_entries` (
    `id` VARCHAR(36) NOT NULL,
    `date` DATE NOT NULL,
    `description` VARCHAR(255) NOT NULL,
    `category` VARCHAR(100) NOT NULL,
    `type` ENUM('income', 'expense') NOT NULL,
    `amount` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `payment_method` VARCHAR(100) NULL,
    `reference` VARCHAR(100) NULL,
    `entity` VARCHAR(100) NULL DEFAULT 'DATA PORT Core',
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `date`(`date` ASC),
    INDEX `type`(`type` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `services` (
    `id` VARCHAR(36) NOT NULL,
    `code` VARCHAR(50) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `category` VARCHAR(100) NOT NULL,
    `description` TEXT NULL,
    `unit` VARCHAR(50) NOT NULL DEFAULT 'Per Project',
    `price` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `code`(`code` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `subscribers` (
    `id` VARCHAR(36) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `company` VARCHAR(191) NULL,
    `phone` VARCHAR(50) NULL,
    `email` VARCHAR(191) NULL,
    `location` VARCHAR(255) NULL DEFAULT 'Mombasa',
    `ip_address` VARCHAR(50) NULL,
    `package` VARCHAR(191) NULL,
    `speed` VARCHAR(50) NULL,
    `monthly_rate` DECIMAL(10, 2) NULL DEFAULT 0.00,
    `billing_day` INTEGER NULL DEFAULT 1,
    `source` VARCHAR(50) NULL DEFAULT 'web',
    `status` VARCHAR(50) NULL DEFAULT 'subscriber',
    `notes` TEXT NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `email`(`email` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `invoice_items` ADD CONSTRAINT `invoice_items_ibfk_1` FOREIGN KEY (`invoice_id`) REFERENCES `invoices`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;
