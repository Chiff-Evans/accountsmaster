-- Run this against the salesmaster database to add the shareholders table
USE salesmaster;

CREATE TABLE IF NOT EXISTS business_shareholders (
  id              INT PRIMARY KEY AUTO_INCREMENT,
  business_id     INT NOT NULL,
  shareholder_name VARCHAR(150) NOT NULL,
  role            VARCHAR(100) NULL,
  id_number       VARCHAR(50)  NULL,
  phone           VARCHAR(30)  NULL,
  email           VARCHAR(100) NULL,
  shares_percent  DECIMAL(5,2)  NOT NULL DEFAULT 0.00,
  shares_amount   DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_sh_business FOREIGN KEY (business_id)
    REFERENCES business(id) ON DELETE CASCADE
);
