-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Sep 17, 2026 at 10:37 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `pharmahub_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `batches`
--

CREATE TABLE `batches` (
  `batch_id` varchar(20) NOT NULL,
  `medicine_id` varchar(20) DEFAULT NULL,
  `batch_number` varchar(50) DEFAULT NULL,
  `inbound_date` date DEFAULT NULL,
  `expiry_date` date DEFAULT NULL,
  `quantity` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `batches`
--

INSERT INTO `batches` (`batch_id`, `medicine_id`, `batch_number`, `inbound_date`, `expiry_date`, `quantity`) VALUES
('BTH-1001', 'MED-1001', 'BN-20260914-01', '2026-09-14', '2028-02-28', 100),
('BTH-1002', 'MED-1003', 'BN-20260914-02', '2026-09-14', '2027-12-30', 80),
('BTH-1003', 'MED-1002', 'BN-20260914-03', '2026-09-14', '2028-01-15', 100),
('BTH-1004', 'MED-1005', 'BN-20260914-04', '2026-09-14', '2027-10-20', 40),
('BTH-1005', 'MED-1007', 'BN-20260914-05', '2026-09-14', '2028-02-28', 100),
('BTH-1006', 'MED-1006', 'BN-20260914-06', '2026-09-14', '2029-01-31', 100),
('BTH-1007', 'MED-1008', 'BN-20260914-07', '2026-09-14', '2028-03-20', 200),
('BTH-1008', 'MED-1009', 'BN-20260914-08', '2026-09-14', '2027-09-06', 0),
('BTH-1009', 'MED-1009', 'BN-20260914-09', '2026-09-14', '2026-10-31', 20),
('BTH-1010', 'MED-1009', 'BN-20260914-10', '2026-09-14', '2027-09-14', 60),
('BTH-1012', 'MED-1001', 'BN-20260915-02', '2026-09-15', '2025-10-28', 0),
('BTH-1013', 'MED-1014', 'BN-20260917-01', '2026-09-17', '2028-05-17', 5);

-- --------------------------------------------------------

--
-- Table structure for table `medicines`
--

CREATE TABLE `medicines` (
  `medicine_id` varchar(20) NOT NULL,
  `category` varchar(30) DEFAULT NULL,
  `medicine_type` varchar(100) DEFAULT NULL,
  `medicine_name` varchar(50) DEFAULT NULL,
  `dosage_form` varchar(20) DEFAULT NULL,
  `cost_price` decimal(10,2) DEFAULT NULL,
  `selling_price` decimal(10,2) DEFAULT NULL,
  `minStock` int(11) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `image_url` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `medicines`
--

INSERT INTO `medicines` (`medicine_id`, `category`, `medicine_type`, `medicine_name`, `dosage_form`, `cost_price`, `selling_price`, `minStock`, `is_active`, `image_url`) VALUES
('MED-1001', 'Group C', 'Mild Sleep Aids & Allergy', 'Amoxicillin 500mg', 'Tablet', 10.00, 15.00, 10, 1, '/uploads/med_1789632611326.png'),
('MED-1002', 'Group B', 'Prescription Pain Relief', 'Vobrax 400mg', 'Capsule', 3.50, 5.00, 50, 1, '/uploads/med_1789383293148.png'),
('MED-1003', 'Group B', 'Blood Thinners (Oral Anticoagulants)', 'Eliquis 5mg', 'Tablet', 140.80, 160.00, 50, 1, '/uploads/med_1789384232155.png'),
('MED-1005', 'Group C', 'Decongestants', 'Telfast D', 'Tablet', 5.00, 8.00, 50, 1, '/uploads/med_1789383563550.png'),
('MED-1006', 'Group C', 'Cough & Respiratory Remedies', 'Copastin 10mg', 'Tablet', 1.00, 2.50, 50, 1, '/uploads/med_1789383695435.png'),
('MED-1007', 'Group C', 'Mild Sleep Aids & Allergy', 'Aerius 5mg', 'Tablet', 8.00, 12.00, 50, 1, '/uploads/med_1789384413804.png'),
('MED-1008', 'Group OTC', 'Pain & Fever Relief', 'Panadol ActiFast', 'Tablet', 6.50, 8.55, 50, 1, '/uploads/med_1789383853177.png'),
('MED-1009', 'Group OTC', 'Antacids (Gastrointestinal)', 'Maalox Plus', 'Tablet', 5.00, 8.50, 50, 1, '/uploads/med_1789384013060.png'),
('MED-1014', 'Group B', 'Blood Pressure (Antihypertensives)', 'Amlibon 10mg', 'Tablet', 10.00, 20.00, 100, 1, '/uploads/med_1789632703584.png');

-- --------------------------------------------------------

--
-- Table structure for table `staffs`
--

CREATE TABLE `staffs` (
  `user_id` varchar(20) NOT NULL,
  `username` varchar(50) NOT NULL,
  `user_password` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `staffs`
--

INSERT INTO `staffs` (`user_id`, `username`, `user_password`) VALUES
('U001', 'admin', 'pharma@Hub'),
('U002', 'staff', 'staff@123');

-- --------------------------------------------------------

--
-- Table structure for table `stock_transaction`
--

CREATE TABLE `stock_transaction` (
  `txn_id` varchar(20) NOT NULL,
  `txn_code` varchar(50) DEFAULT NULL,
  `txn_time` datetime DEFAULT current_timestamp(),
  `batch_id` varchar(20) DEFAULT NULL,
  `medicine_id` varchar(20) DEFAULT NULL,
  `txn_type` varchar(20) DEFAULT NULL,
  `qty_change` int(11) DEFAULT NULL,
  `reason` varchar(200) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `stock_transaction`
--

INSERT INTO `stock_transaction` (`txn_id`, `txn_code`, `txn_time`, `batch_id`, `medicine_id`, `txn_type`, `qty_change`, `reason`) VALUES
('TSC-1001', 'TXN-20260914-001', '2026-09-14 19:14:04', 'BTH-1001', 'MED-1001', 'Stock In', 100, 'Add Stock'),
('TSC-1002', 'TXN-20260914-002', '2026-09-14 19:14:26', 'BTH-1002', 'MED-1003', 'Stock In', 80, 'Add Stock'),
('TSC-1003', 'TXN-20260914-003', '2026-09-14 19:14:41', 'BTH-1003', 'MED-1002', 'Stock In', 100, 'Add Stock'),
('TSC-1004', 'TXN-20260914-004', '2026-09-14 19:14:57', 'BTH-1004', 'MED-1005', 'Stock In', 60, 'Add Stock'),
('TSC-1005', 'TXN-20260914-005', '2026-09-14 19:15:10', 'BTH-1005', 'MED-1007', 'Stock In', 100, 'Add Stock'),
('TSC-1006', 'TXN-20260914-006', '2026-09-14 19:15:25', 'BTH-1006', 'MED-1006', 'Stock In', 100, 'Add Stock'),
('TSC-1007', 'TXN-20260914-007', '2026-09-14 19:15:41', 'BTH-1007', 'MED-1008', 'Stock In', 200, 'Add Stock'),
('TSC-1008', 'TXN-20260914-008', '2026-09-14 19:15:59', 'BTH-1008', 'MED-1009', 'Stock In', 100, 'Add Stock'),
('TSC-1009', 'TXN-20260914-009', '2026-09-14 19:16:44', 'BTH-1008', 'MED-1009', 'Stock Out', -100, 'Prescription Dispense (Selling)'),
('TSC-1010', 'TXN-20260914-010', '2026-09-14 19:17:28', 'BTH-1009', 'MED-1009', 'Stock In', 20, 'Add Stock'),
('TSC-1011', 'TXN-20260914-011', '2026-09-14 19:17:45', 'BTH-1010', 'MED-1009', 'Stock In', 60, 'Add Stock'),
('TSC-1014', 'TXN-20260915-003', '2026-09-15 13:10:32', 'BTH-1012', 'MED-1001', 'Stock In', 20, 'Add Stock'),
('TSC-1015', 'TXN-20260916-001', '2026-09-16 20:41:05', 'BTH-1004', 'MED-1005', 'Stock Out', -20, 'Prescription'),
('TSC-1016', 'TXN-20260917-001', '2026-09-17 16:13:39', 'BTH-1013', 'MED-1014', 'Stock In', 10, 'Add Stock'),
('TSC-1017', 'TXN-20260917-002', '2026-09-17 16:15:27', 'BTH-1013', 'MED-1014', 'Stock Out', -5, 'OTC Retail Sale (Selling)'),
('TSC-1018', 'TXN-20260917-003', '2026-09-17 16:16:40', 'BTH-1012', 'MED-1001', 'Stock Out', -20, 'Expired Write-off (Loss)');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `batches`
--
ALTER TABLE `batches`
  ADD PRIMARY KEY (`batch_id`),
  ADD KEY `batches_ibfk_1` (`medicine_id`);

--
-- Indexes for table `medicines`
--
ALTER TABLE `medicines`
  ADD PRIMARY KEY (`medicine_id`);

--
-- Indexes for table `staffs`
--
ALTER TABLE `staffs`
  ADD PRIMARY KEY (`user_id`);

--
-- Indexes for table `stock_transaction`
--
ALTER TABLE `stock_transaction`
  ADD PRIMARY KEY (`txn_id`),
  ADD KEY `batch_id` (`batch_id`),
  ADD KEY `stock_transaction_ibfk_1` (`medicine_id`);

--
-- Constraints for dumped tables
--

--
-- Constraints for table `batches`
--
ALTER TABLE `batches`
  ADD CONSTRAINT `batches_ibfk_1` FOREIGN KEY (`medicine_id`) REFERENCES `medicines` (`medicine_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `stock_transaction`
--
ALTER TABLE `stock_transaction`
  ADD CONSTRAINT `stock_transaction_ibfk_1` FOREIGN KEY (`medicine_id`) REFERENCES `medicines` (`medicine_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `stock_transaction_ibfk_2` FOREIGN KEY (`batch_id`) REFERENCES `batches` (`batch_id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
