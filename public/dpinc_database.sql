-- =============================================================================
-- DATA PORT LIMITED (dpinc.top) — MASTER SQL DATABASE
-- Comprehensive Relational Schema & Seed Data for Services, Invoices,
-- Itemized Billing, Subscribers, Field Operations, and Financial Ledger.
-- Compatible with MySQL / MariaDB (XAMPP / phpMyAdmin) and PostgreSQL / SQLite.
-- =============================================================================

CREATE DATABASE IF NOT EXISTS `dpinc.top_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `dpinc.top_db`;

-- Drop existing tables in reverse dependency order
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS `ledger_entries`;
DROP TABLE IF EXISTS `job_card_materials`;
DROP TABLE IF EXISTS `job_cards`;
DROP TABLE IF EXISTS `invoice_items`;
DROP TABLE IF EXISTS `invoices`;
DROP TABLE IF EXISTS `quote_line_items`;
DROP TABLE IF EXISTS `quotes`;
DROP TABLE IF EXISTS `services`;
DROP TABLE IF EXISTS `catalog_items`;
DROP TABLE IF EXISTS `subscribers`;
DROP TABLE IF EXISTS `admins`;
SET FOREIGN_KEY_CHECKS = 1;

-- -----------------------------------------------------------------------------
-- 1. ADMINS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE `admins` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `username` VARCHAR(191) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `role` VARCHAR(50) NOT NULL DEFAULT 'admin',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `admins` (`id`, `username`, `password`, `role`, `created_at`, `updated_at`) VALUES
('adm-001', 'admin@dpinc.top', '$2a$10$w8.1fXg0v/j5f0Fw9028h.8340d8f0f0980df98a0980df98a0980', 'admin', NOW(), NOW());

-- -----------------------------------------------------------------------------
-- 2. SERVICES & COMMERCIAL TARIFFS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE `services` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `code` VARCHAR(50) NOT NULL UNIQUE,
  `name` VARCHAR(255) NOT NULL,
  `category` VARCHAR(100) NOT NULL,
  `description` TEXT NULL,
  `unit` VARCHAR(50) NOT NULL DEFAULT 'Per Project',
  `price` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `services` (`id`, `code`, `name`, `category`, `description`, `unit`, `price`, `active`) VALUES
('srv-001', 'PKG-SECURE-OFFICE', 'Secure Office Starter Package', 'Essentials Packages', 'Complete perimeter physical security and managed network baseline: 18-Camera CCTV remote view, Secure WiFi (Staff/Guest SSIDs), and Firewall perimeter defense.', 'One-Off Investment', 35000.00, 1),
('srv-002', 'PKG-DIGITAL-LAUNCHPAD', 'Digital Launchpad Package', 'Essentials Packages', 'Rapid customer acquisition bundle: 5-page dynamic responsive website, 1 year cloud hosting with SSL security, and 1 promotional motion graphic video (30s).', 'One-Off Investment', 30000.00, 1),
('srv-003', 'NET-FIREWALL-01', 'Small Business Firewall & Security Configuration', 'Network & Infrastructure', 'Enterprise security filtering rules, port protection, intrusion mitigation, and traffic policing.', 'Per Setup', 10000.00, 1),
('srv-004', 'NET-WIFI-AP', 'Long-Range High-Density WiFi Access Point Setup', 'Network & Infrastructure', 'Commercial high-density dual-band ceiling/wall AP deployment with installation, VLAN tagging & guest isolation.', 'Per Unit', 35000.00, 1),
('srv-005', 'FBR-SPLICING-01', 'Optical Fiber Drop Cable Splicing & NOC Termination', 'Network & Infrastructure', 'Fusion splicing, optical loss dBm testing, patch tray termination, and drop link activation.', 'Per Setup', 3500.00, 1),
('srv-006', 'FBR-ONT-ROUTER', 'Huawei / ZTE Dual-Band Gigabit ONT Optical WiFi Router', 'Network & Infrastructure', 'High-power GPON/EPON ONT terminal with dual-band 2.4/5GHz Wi-Fi 6 capabilities and Gigabit Ethernet ports.', 'Per Unit', 4500.00, 1),
('srv-007', 'NET-STATIC-IP', 'Dedicated Static Public IPv4 Address Allocation', 'Network & Infrastructure', 'Wholesale routed static IPv4 allocation for servers, CCTV NVR remote viewing, and VPN gateways.', 'Per Month', 1500.00, 1),
('srv-008', 'NET-LAN-CABLING', 'Structured LAN Cabling & 24-Port Patch Panel Dressing', 'Network & Infrastructure', 'Cat6 UTP cabling across industrial conduits, wall plate punch-downs, rack mount cabinet cable dressing & fluked testing.', 'Per Installation', 42500.00, 1),
('srv-009', 'SEC-CCTV-18CAM', '18-Camera IP CCTV Surveillance & 4K NVR Setup', 'Security & Surveillance', '4MP Hikvision/Dahua night-vision dome & bullet cameras, 32-channel 4K NVR with 8TB surveillance HDD, 24-Port PoE Switch, and mobile app sync.', 'Turnkey Setup', 165000.00, 1),
('srv-010', 'SEC-CCTV-STD', 'HD IP CCTV Surveillance Camera Installation & NVR Setup (Standard)', 'Security & Surveillance', 'Commercial IP camera installation, conduit routing, cloud P2P access configuration, and recording scheduling.', 'Per Setup', 15000.00, 1),
('srv-011', 'DEV-WEB-5PAGE', 'Dynamic Modern Website (5 Custom Responsive Pages)', 'Development & Creative', 'Tailored UI/UX design, mobile responsiveness, contact forms, interactive portfolio, and SEO performance optimization.', 'One-Off Project', 30000.00, 1),
('srv-012', 'DEV-WEB-CUSTOM', 'Web Creation & Design - Full Stacks Creation (JSON/CSS/React)', 'Development & Creative', 'Complete full-stack website creation, modern frameworks, interactive UI elements, and custom CSS styling.', 'Lifetime', 10000.00, 1),
('srv-013', 'DEV-APP-CUSTOM', 'Custom Web App / Business ERP Billing Automation System', 'Development & Creative', 'Bespoke internal management portal, billing engine, automated receipts, client CRM & database synchronization.', 'Starting Price', 40000.00, 1),
('srv-014', 'DEV-MOTION-AD', 'Motion Graphics Ad Video (30s High-Retention Reel)', 'Development & Creative', 'High-impact social media motion graphics reel, corporate audio mixing, 4K rendering, and format optimization for Instagram/TikTok/LinkedIn.', 'Per Video', 20000.00, 1),
('srv-015', 'DEV-DOMAIN-REG', 'Domain Name Registration (Company .co.ke / .com)', 'Development & Creative', 'Official DNS registration, registry verification, WHOIS protection, and nameserver delegation.', '1 Year', 2500.00, 1),
('srv-016', 'DEV-HOSTING-SILVER', 'Domain Cloud Hosting (TrueHost Silver High-Speed)', 'Development & Creative', 'SSD cloud storage, unlimited cPanel bandwidth, 99.9% uptime SLA, corporate mailboxes, and automated daily backups.', '1 Year', 4300.00, 1),
('srv-017', 'DEV-SSL-SECURITY', 'Web Security & Debugging & SSL Security Certificate (Ask SSL)', 'Development & Creative', '256-bit RSA encryption certificate, vulnerability audit, code sanitization, and HTTPS forcing.', '1 Year', 1800.00, 1),
('srv-018', 'SRV-WIN-AD', 'Windows Server Setup + Active Directory Domain Controller', 'Systems & Servers', 'Windows Server deployment, Active Directory user hierarchy, Group Policies (GPO), and file sharing permissions.', 'Service Only', 45000.00, 1),
('srv-019', 'AMC-STANDARD', 'Annual Maintenance Contract (AMC) - Standard Plan', 'Maintenance & AMC Retainers', 'Support Mon–Fri (8:30–18:00), 4-hour SLA response, 1 monthly preventive on-site inspection, Network & PC support.', 'Per Year', 70000.00, 1),
('srv-020', 'AMC-PREMIUM', 'Annual Maintenance Contract (AMC) - Corporate Premium Plan', 'Maintenance & AMC Retainers', '24/7 Remote NOC support, 1-hour priority SLA, unlimited remote helpdesk, 2 monthly on-site visits, Full Infrastructure & DevOps.', 'Per Year', 90000.00, 1),
('srv-021', 'AMC-HOURLY', 'On-Demand Technical Callout & Emergency Incident Support', 'Maintenance & AMC Retainers', 'Ad-hoc technical field assistance, diagnostics, fiber repairs, or emergency server recovery (Minimum 2 hours per callout).', 'Per Hour', 2500.00, 1),
('srv-022', 'ISP-FIBER-25M', 'DataPort NET Public IP (25 mbps Dedicated)', 'Internet Bandwidth', '25 Mbps symmetrical optical fiber link with dedicated public IPv4 address and unshaped peering.', 'Per Month', 3000.00, 1),
('srv-023', 'ISP-FIBER-15M', 'Home Fiber Fast 15 Mbps', 'Internet Bandwidth', '15 Mbps unlimited residential fiber internet with low-latency streaming and gaming optimization.', 'Per Month', 3500.00, 1),
('srv-024', 'ISP-FIBER-20M', 'Essential 20 Mbps Office Fiber', 'Internet Bandwidth', '20 Mbps low-jitter business connectivity engineered for cloud ERP, video conferencing, and POS terminals.', 'Per Month', 5500.00, 1),
('srv-025', 'ISP-FIBER-30M', 'Dedicated 30 Mbps Business Pro', 'Internet Bandwidth', '30 Mbps high-throughput commercial fiber connection with priority gateway routing and 99.5% uptime SLA.', 'Per Month', 8500.00, 1),
('srv-026', 'ISP-FIBER-40M', 'Creative High-Upload 40 Mbps', 'Internet Bandwidth', '40 Mbps high-upload fiber pipe designed for multimedia production, creative studios, and bulk asset uploads.', 'Per Month', 9500.00, 1),
('srv-027', 'ISP-FIBER-50M', 'Dedicated 50 Mbps Enterprise Fiber', 'Internet Bandwidth', '50 Mbps dedicated symmetrical enterprise optical trunk for hospitality, corporate centers, and high-density user facilities.', 'Per Month', 12500.00, 1);

-- -----------------------------------------------------------------------------
-- 3. SUBSCRIBERS / CLIENTS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE `subscribers` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `name` VARCHAR(191) NOT NULL,
  `company` VARCHAR(191) NULL,
  `phone` VARCHAR(50) NULL,
  `email` VARCHAR(191) NULL UNIQUE,
  `location` VARCHAR(255) DEFAULT 'Mombasa',
  `ip_address` VARCHAR(50) NULL,
  `package` VARCHAR(191) NULL,
  `speed` VARCHAR(50) NULL,
  `monthly_rate` DECIMAL(10,2) DEFAULT 0.00,
  `billing_day` INT DEFAULT 1,
  `source` VARCHAR(50) DEFAULT 'web',
  `status` VARCHAR(50) DEFAULT 'subscriber',
  `notes` TEXT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `subscribers` (`id`, `name`, `company`, `phone`, `email`, `location`, `ip_address`, `package`, `speed`, `monthly_rate`, `billing_day`, `status`) VALUES
('sub-101', 'Mombasa Ocean View Suites', 'Ocean View Hospitality Ltd', '+254 712 345 678', 'management@oceanview.co.ke', 'Nyali Beach Road, Mombasa', '197.232.44.12', 'Dedicated 50 Mbps Enterprise Fiber', '50 mbps', 12500.00, 1, 'subscriber'),
('sub-102', 'Crown Logistics Hub', 'Crown Global Forwarders', '+254 722 987 654', 'operations@crownlogistics.com', 'Mbaraki Port Area, Mombasa', '197.232.44.18', 'Dedicated 30 Mbps Business Pro', '30 mbps', 8500.00, 1, 'subscriber'),
('sub-103', 'Dr. Sarah Kimani Dental Clinic', 'Kimani Healthcare Group', '+254 733 112 233', 'reception@kimanidental.co.ke', 'Digo Road, CBD, Mombasa', '197.232.44.25', 'Essential 20 Mbps Office Fiber', '20 mbps', 5500.00, 5, 'subscriber'),
('sub-104', 'Apex Creative Studio', 'Apex Media House', '+254 701 445 566', 'accounts@apexcreative.co.ke', 'Bamburi Mtambo, Mombasa', '197.232.44.33', 'Creative High-Upload 40 Mbps', '40 mbps', 9500.00, 10, 'subscriber'),
('sub-105', 'Tudor Heights Apartment 4B', 'Residential Subscriber', '+254 790 964 002', 'resident4b@tudorheights.ke', 'Tudor, Mombasa', '197.232.44.41', 'Home Fiber Fast 15 Mbps', '15 mbps', 3500.00, 15, 'subscriber'),
('sub-106', 'Coast Marine Spares', 'Coast Marine Engineering', '+254 720 778 899', 'info@coastmarine.co.ke', 'Shimanzi Industrial Area, Mombasa', '197.232.44.52', 'Dedicated 30 Mbps Business Pro', '30 mbps', 8500.00, 20, 'subscriber'),
('sub-107', 'Shani Chai', 'Shani Chai Operations', '0795 917 066', 'shanichai@dpinc.co.ke', 'VOK Bombolulu', '197.232.44.60', 'DataPort NET Public IP (25 mbps)', '25 mbps', 3000.00, 9, 'subscriber'),
('sub-108', 'Tracy Wangari', 'General Client', '0722 000 111', 'tracy.wangari@domain.com', 'Mombasa', NULL, 'Web Dev & Cloud Hosting Bundle', NULL, 0.00, 1, 'client');

-- -----------------------------------------------------------------------------
-- 4. INVOICES TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE `invoices` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `invoice_no` VARCHAR(100) NOT NULL UNIQUE,
  `doc_type` VARCHAR(50) NOT NULL DEFAULT 'Invoice',
  `client_type` VARCHAR(50) NOT NULL DEFAULT 'general',
  `client_name` VARCHAR(191) NOT NULL,
  `phone` VARCHAR(50) NULL,
  `email` VARCHAR(191) NULL,
  `location` VARCHAR(255) DEFAULT 'Mombasa',
  `sub_id` VARCHAR(36) NULL,
  `status` VARCHAR(50) NOT NULL DEFAULT 'unpaid',
  `issue_date` DATE NOT NULL,
  `due_date` DATE NULL,
  `billing_period` VARCHAR(100) NULL,
  `subtotal` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `tax` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `labour_fee` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `total` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `total_paid` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `balance_due` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `has_payment_plan` TINYINT(1) NOT NULL DEFAULT 0,
  `deposit_amount` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `deposit_label` VARCHAR(100) DEFAULT '1 ST Installment',
  `notes` TEXT NULL,
  `validity_note` VARCHAR(255) DEFAULT 'Please Note: Valid for 14 days from date.',
  `paid_at` DATETIME NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX (`status`),
  INDEX (`client_name`),
  INDEX (`issue_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `invoices` (`id`, `invoice_no`, `doc_type`, `client_type`, `client_name`, `phone`, `email`, `location`, `sub_id`, `status`, `issue_date`, `due_date`, `billing_period`, `subtotal`, `total`, `total_paid`, `balance_due`, `has_payment_plan`, `deposit_amount`, `notes`, `validity_note`, `paid_at`) VALUES
('inv-001', '#007/26', 'Invoice', 'subscriber', 'Shani Chai', '0795 917 066', 'shanichai@dpinc.co.ke', 'VOK Bombolulu', 'sub-107', 'paid', '2026-02-09', '2026-02-14', 'February 2026', 3000.00, 3000.00, 3000.00, 0.00, 0, 0.00, 'Thank you for prompt payment via M-Pesa.', 'Thank you!', '2026-02-09 10:00:00'),
('inv-002', '10.23/26', 'Proforma Invoice', 'general', 'Tracy Wangari', '0722 000 111', 'tracy.wangari@domain.com', 'Mombasa', NULL, 'partial', '2025-01-16', '2025-01-30', 'January 2025', 18600.00, 18600.00, 5000.00, 13600.00, 1, 5000.00, 'Deposit received. Final balance due upon web delivery.', 'Please Note: Valid for 14 days from date.', NULL),
('inv-003', 'PROF-2026-0089', 'Proforma Invoice', 'subscriber', 'Mombasa Ocean View Suites', '+254 712 345 678', 'management@oceanview.co.ke', 'Nyali Beach Road, Mombasa', 'sub-101', 'paid', '2026-09-01', '2026-09-05', 'September 2026', 12500.00, 12500.00, 12500.00, 0.00, 0, 0.00, 'Dedicated 50 Mbps Enterprise Fiber subscription.', 'Valid for 14 days.', '2026-09-01 08:30:00'),
('inv-004', 'PROF-2026-0090', 'Proforma Invoice', 'subscriber', 'Crown Logistics Hub', '+254 722 987 654', 'operations@crownlogistics.com', 'Mbaraki Port Area, Mombasa', 'sub-102', 'paid', '2026-09-01', '2026-09-05', 'September 2026', 8500.00, 8500.00, 8500.00, 0.00, 0, 0.00, 'Dedicated 30 Mbps Business Pro subscription.', 'Valid for 14 days.', '2026-09-01 10:15:00'),
('inv-005', 'PROF-2026-0091', 'Proforma Invoice', 'subscriber', 'Dr. Sarah Kimani Dental Clinic', '+254 733 112 233', 'reception@kimanidental.co.ke', 'Digo Road, CBD, Mombasa', 'sub-103', 'paid', '2026-09-05', '2026-09-10', 'September 2026', 5500.00, 5500.00, 5500.00, 0.00, 0, 0.00, 'Essential 20 Mbps Office Fiber subscription.', 'Valid for 14 days.', '2026-09-05 14:20:00'),
('inv-006', 'PROF-2026-0092', 'Proforma Invoice', 'subscriber', 'Apex Creative Studio', '+254 701 445 566', 'accounts@apexcreative.co.ke', 'Bamburi Mtambo, Mombasa', 'sub-104', 'paid', '2026-09-10', '2026-09-15', 'September 2026', 9500.00, 9500.00, 9500.00, 0.00, 0, 0.00, 'Creative High-Upload 40 Mbps subscription.', 'Valid for 14 days.', '2026-09-10 11:00:00'),
('inv-007', 'PROF-2026-0093', 'Proforma Invoice', 'subscriber', 'Tudor Heights Apartment 4B', '+254 790 964 002', 'resident4b@tudorheights.ke', 'Tudor, Mombasa', 'sub-105', 'unpaid', '2026-09-15', '2026-09-20', 'September 2026', 3500.00, 3500.00, 0.00, 3500.00, 0, 0.00, 'Home Fiber Fast 15 Mbps residential subscription.', 'Valid for 14 days.', NULL),
('inv-008', 'PROF-2026-0094', 'Proforma Invoice', 'subscriber', 'Coast Marine Spares', '+254 720 778 899', 'info@coastmarine.co.ke', 'Shimanzi Industrial Area, Mombasa', 'sub-106', 'unpaid', '2026-09-20', '2026-09-25', 'September 2026', 8500.00, 8500.00, 0.00, 8500.00, 0, 0.00, 'Dedicated 30 Mbps Business Pro subscription.', 'Valid for 14 days.', NULL),
('inv-009', 'INV-2026-0089', 'Invoice', 'general', 'Mombasa Ocean View Suites', '+254 712 345 678', 'management@oceanview.co.ke', 'Nyali Beach Road, Mombasa', 'sub-101', 'paid', '2026-09-15', '2026-09-15', 'September 2026', 165000.00, 165000.00, 165000.00, 0.00, 0, 0.00, 'Settlement for 18-Camera IP CCTV & 4K NVR Installation Project.', 'Official Tax Invoice', '2026-09-15 15:00:00');

-- -----------------------------------------------------------------------------
-- 5. INVOICE LINE ITEMS TABLE (CASCADE ON INVOICE DELETE)
-- -----------------------------------------------------------------------------
CREATE TABLE `invoice_items` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `invoice_id` VARCHAR(36) NOT NULL,
  `service_id` VARCHAR(36) NULL,
  `title` VARCHAR(255) NOT NULL,
  `qty` VARCHAR(50) NOT NULL DEFAULT '1',
  `rate` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `total` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`invoice_id`) REFERENCES `invoices`(`id`) ON DELETE CASCADE,
  INDEX (`invoice_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `invoice_items` (`id`, `invoice_id`, `service_id`, `title`, `qty`, `rate`, `total`) VALUES
('item-001', 'inv-001', 'srv-022', 'DataPort NET Public IP', '25 mbps', 3000.00, 3000.00),
('item-002', 'inv-002', 'srv-015', 'Domain Name Registaration. (Company).', '1 Year', 2500.00, 2500.00),
('item-003', 'inv-002', 'srv-016', 'Domain Hosting (TrueHost Silver).', '1 Year', 4300.00, 4300.00),
('item-004', 'inv-002', 'srv-017', 'Web Security & Debugging & SSL Security (Ask SSL)', '1 Year', 1800.00, 1800.00),
('item-005', 'inv-002', 'srv-012', 'Web Creation & Design - Full Stacks Creation (JSON/CSS)', 'Lifetime', 10000.00, 10000.00),
('item-006', 'inv-003', 'srv-027', 'Dedicated 50 Mbps Enterprise Fiber', '50 mbps', 12500.00, 12500.00),
('item-007', 'inv-004', 'srv-025', 'Dedicated 30 Mbps Business Pro', '30 mbps', 8500.00, 8500.00),
('item-008', 'inv-005', 'srv-024', 'Essential 20 Mbps Office Fiber', '20 mbps', 5500.00, 5500.00),
('item-009', 'inv-006', 'srv-026', 'Creative High-Upload 40 Mbps', '40 mbps', 9500.00, 9500.00),
('item-010', 'inv-007', 'srv-023', 'Home Fiber Fast 15 Mbps', '15 mbps', 3500.00, 3500.00),
('item-011', 'inv-008', 'srv-025', 'Dedicated 30 Mbps Business Pro', '30 mbps', 8500.00, 8500.00),
('item-012', 'inv-009', 'srv-009', '4MP Hikvision Dome Cameras', '18', 3500.00, 63000.00),
('item-013', 'inv-009', 'srv-009', '32-Channel 4K NVR + 8TB SkyHawk HDD', '1', 42000.00, 42000.00),
('item-014', 'inv-009', 'srv-008', 'Cat6 Outdoor UTP Cable Roll (305m)', '2', 8500.00, 17000.00),
('item-015', 'inv-009', 'srv-003', '24-Port Gigabit PoE Switch', '1', 18000.00, 18000.00),
('item-016', 'inv-009', 'srv-010', 'Turnkey Technician Labor & Cloud Config', '1 Setup', 25000.00, 25000.00);

-- -----------------------------------------------------------------------------
-- 6. FIELD OPERATIONS & JOB CARDS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE `job_cards` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `client_name` VARCHAR(191) NOT NULL,
  `technician` VARCHAR(191) NOT NULL,
  `date` DATE NOT NULL,
  `status` VARCHAR(50) NOT NULL DEFAULT 'in_progress',
  `category` VARCHAR(100) NOT NULL DEFAULT 'Field Operations',
  `labor_cost` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `total_cost` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `notes` TEXT NULL,
  `invoice_generated` TINYINT(1) NOT NULL DEFAULT 0,
  `invoice_ref` VARCHAR(100) NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `job_cards` (`id`, `title`, `client_name`, `technician`, `date`, `status`, `category`, `labor_cost`, `total_cost`, `notes`, `invoice_generated`, `invoice_ref`) VALUES
('job-101', '18-Camera IP CCTV & NVR Setup', 'Mombasa Ocean View Suites', 'Emmanuel Nyakundi (Lead Tech)', '2026-09-15', 'completed', 'CCTV Security', 25000.00, 165000.00, 'All cameras focused, cloud remote view app configured on manager iPhone & tablet.', 1, 'INV-2026-0089'),
('job-102', 'Drop Fiber Splicing & Dual-Band Router Install', 'Apex Creative Studio', 'Ali Hassan (Field Tech)', '2026-09-17', 'completed', 'Fiber Deployment', 3500.00, 13800.00, 'Optical power reading -18.4 dBm (Optimum range). Latency to IXP 3ms.', 1, 'INV-2026-0091'),
('job-103', 'Structured LAN Cabling & Rack Dressing', 'Crown Logistics Hub', 'Ali Hassan & Kevin O.', '2026-09-18', 'in_progress', 'Structured Cabling', 15000.00, 42500.00, 'Cabling running across warehouse conduit. Termination scheduled for completion.', 0, NULL);

-- -----------------------------------------------------------------------------
-- 7. FINANCIAL LEDGER TRANSACTIONS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE `ledger_entries` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `date` DATE NOT NULL,
  `description` VARCHAR(255) NOT NULL,
  `category` VARCHAR(100) NOT NULL,
  `type` ENUM('income', 'expense') NOT NULL,
  `amount` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `payment_method` VARCHAR(100) NULL,
  `reference` VARCHAR(100) NULL,
  `entity` VARCHAR(100) DEFAULT 'DATA PORT Core',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX (`date`),
  INDEX (`type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `ledger_entries` (`id`, `date`, `description`, `category`, `type`, `amount`, `payment_method`, `reference`, `entity`) VALUES
('tx-101', '2026-09-01', 'Monthly Fiber Subscription - Mombasa Ocean View Suites', 'ISP Subscription Income', 'income', 12500.00, 'M-Pesa Paybill', 'QKD8923KL9', 'DATA PORT Core'),
('tx-102', '2026-09-01', 'Monthly Fiber Subscription - Crown Logistics Hub', 'ISP Subscription Income', 'income', 8500.00, 'Bank Transfer', 'FT26245892', 'DATA PORT Core'),
('tx-103', '2026-09-03', 'Upstream Wholesale IP Transit & STM Bandwidth (Liquid/IXP)', 'Wholesale Bandwidth Transit', 'expense', 14000.00, 'Bank Wire', 'LQD-TR-992', 'NOC Operations'),
('tx-104', '2026-09-15', 'Project Settlement: Ocean View Suites CCTV Installation', 'Projects & Installations', 'income', 165000.00, 'Bank Transfer', 'FT26258901', 'DATA PORT Projects'),
('tx-105', '2026-09-16', 'Technician Field Allowances & Transport Logistics', 'Field Ops & Logistics', 'expense', 6500.00, 'M-Pesa Send Money', 'QKM3321VV7', 'Operations');

-- =============================================================================
-- END OF DATABASE DUMP
-- =============================================================================
