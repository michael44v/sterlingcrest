-- Specialized table for international transfers capturing all user input
CREATE TABLE IF NOT EXISTS international_transfers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    transaction_id INT NOT NULL,
    user_id INT NOT NULL,
    bank_name VARCHAR(255) NOT NULL,
    country VARCHAR(100) NOT NULL,
    swift_code VARCHAR(100) NOT NULL,
    account_name VARCHAR(255) NOT NULL,
    account_number VARCHAR(20) NOT NULL,
    iban VARCHAR(100) NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    narration VARCHAR(255),
    transaction_type VARCHAR(100) NOT NULL DEFAULT 'WIRE-TRANSFER',
    purpose VARCHAR(255),
    status ENUM('pending', 'completed', 'failed', 'reversed') DEFAULT 'completed',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;
