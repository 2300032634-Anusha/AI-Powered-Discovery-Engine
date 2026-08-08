-- ================================================================
-- Discovery Engine AI — MySQL Database Schema & Seed Data
-- ================================================================

CREATE DATABASE IF NOT EXISTS discovery_engine_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE discovery_engine_db;

-- ────────────────────────────────────────────────────────────────
-- TABLE: products
-- ────────────────────────────────────────────────────────────────
DROP TABLE IF EXISTS `products`;
CREATE TABLE `products` (
  `id` VARCHAR(20) PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `category` VARCHAR(100) NOT NULL,
  `sub_category` VARCHAR(100),
  `brand` VARCHAR(100),
  `price` DECIMAL(10,2) NOT NULL,
  `original_price` DECIMAL(10,2),
  `rating` DECIMAL(2,1),
  `review_count` INT DEFAULT 0,
  `image_url` TEXT,
  `color_palette` JSON,
  `shipping_days` INT DEFAULT 2,
  `in_stock` BOOLEAN DEFAULT TRUE,
  `tags` JSON,
  `description` TEXT,
  `text_embedding` JSON,
  `visual_embedding` JSON,
  `frequently_bought_together` JSON,
  `complete_the_look` JSON,
  `xai_weights` JSON,
  `explanation` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ────────────────────────────────────────────────────────────────
-- TABLE: user_personas
-- ────────────────────────────────────────────────────────────────
DROP TABLE IF EXISTS `user_personas`;
CREATE TABLE `user_personas` (
  `id` VARCHAR(50) PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `description` TEXT,
  `preferred_categories` JSON,
  `avg_spend` VARCHAR(50),
  `vector` JSON,
  `color` VARCHAR(20),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ────────────────────────────────────────────────────────────────
-- TABLE: users
-- ────────────────────────────────────────────────────────────────
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(150) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `persona_id` VARCHAR(50) DEFAULT 'techie',
  `avatar_url` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ────────────────────────────────────────────────────────────────
-- TABLE: orders
-- ────────────────────────────────────────────────────────────────
DROP TABLE IF EXISTS `order_items`;
DROP TABLE IF EXISTS `orders`;
CREATE TABLE `orders` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT,
  `persona_id` VARCHAR(50),
  `total_amount` DECIMAL(10,2) NOT NULL,
  `total_items` INT NOT NULL,
  `shipping_name` VARCHAR(150) NOT NULL,
  `shipping_address` TEXT NOT NULL,
  `shipping_city` VARCHAR(100) NOT NULL,
  `shipping_postal_code` VARCHAR(50) NOT NULL,
  `shipping_phone` VARCHAR(50) NOT NULL,
  `payment_method` VARCHAR(50) DEFAULT 'Credit Card',
  `status` ENUM('Processing', 'Shipped', 'Out for Delivery', 'Delivered') DEFAULT 'Processing',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_user` (`user_id`),
  INDEX `idx_created` (`created_at`)
) ENGINE=InnoDB;

-- ────────────────────────────────────────────────────────────────
-- TABLE: order_items
-- ────────────────────────────────────────────────────────────────
CREATE TABLE `order_items` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `order_id` INT NOT NULL,
  `product_id` VARCHAR(20) NOT NULL,
  `product_title` VARCHAR(255) NOT NULL,
  `price` DECIMAL(10,2) NOT NULL,
  `quantity` INT NOT NULL,
  `image_url` TEXT,
  FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ────────────────────────────────────────────────────────────────
-- TABLE: rag_knowledge_base
-- ────────────────────────────────────────────────────────────────
DROP TABLE IF EXISTS `rag_knowledge_base`;
CREATE TABLE `rag_knowledge_base` (
  `id` VARCHAR(20) PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `content` TEXT NOT NULL,
  `category` VARCHAR(100),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ────────────────────────────────────────────────────────────────
-- TABLE: user_interactions
-- ────────────────────────────────────────────────────────────────
DROP TABLE IF EXISTS `user_interactions`;
CREATE TABLE `user_interactions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `persona_id` VARCHAR(50),
  `product_id` VARCHAR(20),
  `interaction_type` ENUM('click', 'like', 'unlike', 'cart_add', 'cart_remove', 'view') NOT NULL,
  `metadata` JSON,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_persona` (`persona_id`),
  INDEX `idx_product` (`product_id`),
  INDEX `idx_type` (`interaction_type`),
  INDEX `idx_created` (`created_at`)
) ENGINE=InnoDB;

-- ────────────────────────────────────────────────────────────────
-- TABLE: search_logs
-- ────────────────────────────────────────────────────────────────
DROP TABLE IF EXISTS `search_logs`;
CREATE TABLE `search_logs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `persona_id` VARCHAR(50),
  `query` TEXT NOT NULL,
  `category_filter` VARCHAR(100),
  `vector_weight` DECIMAL(3,2),
  `primary_intent` VARCHAR(100),
  `max_price` DECIMAL(10,2),
  `logistics_intent` VARCHAR(100),
  `results_count` INT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_persona` (`persona_id`),
  INDEX `idx_created` (`created_at`)
) ENGINE=InnoDB;

-- ────────────────────────────────────────────────────────────────
-- TABLE: faiss_index_specs
-- ────────────────────────────────────────────────────────────────
DROP TABLE IF EXISTS `faiss_index_specs`;
CREATE TABLE `faiss_index_specs` (
  `id` VARCHAR(50) PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `description` TEXT,
  `build_time_ms` DECIMAL(10,2),
  `search_latency_ms` DECIMAL(10,2),
  `qps` INT,
  `recall_at_10` DECIMAL(5,3),
  `memory_overhead_mb` INT,
  `complexity` VARCHAR(50),
  `best_for` TEXT
) ENGINE=InnoDB;

-- ================================================================
-- SEED DATA
-- ================================================================

-- ── User Personas ────────────────────────────────────────────
INSERT INTO `user_personas` (`id`, `name`, `description`, `preferred_categories`, `avg_spend`, `vector`, `color`) VALUES
('techie', 'Tech Enthusiast', 'Loves high-end gadgets, noise-canceling headphones, smart devices & mechanical keyboards.', '["Electronics"]', '$250 - $1,500', '[0.85, 0.90, 0.15, 0.40, 0.80, 0.92, 0.30, 0.65]', '#3b82f6'),
('fashionista', 'Urban Fashionista', 'Focuses on trendsetting street apparel, designer denim, sleek footwear & accessories.', '["Fashion"]', '$80 - $400', '[0.15, 0.22, 0.94, 0.88, 0.15, 0.20, 0.90, 0.74]', '#ec4899'),
('home_chef', 'Gourmet Home Chef', 'Searches for artisanal coffee makers, cast iron cookware, spice racks & smart kitchen gadgets.', '["Home & Kitchen"]', '$100 - $600', '[0.45, 0.18, 0.25, 0.30, 0.92, 0.88, 0.18, 0.78]', '#f59e0b'),
('minimalist', 'Minimalist Explorer', 'Prefers clean aesthetics, eco-friendly materials, compact ergonomics & versatile utility.', '["Fashion", "Home & Kitchen", "Fitness"]', '$50 - $200', '[0.30, 0.40, 0.75, 0.70, 0.40, 0.50, 0.75, 0.60]', '#10b981'),
('bargain_hunter', 'Bargain Hunter', 'Prioritizes discount percentage, bundle deals, highest value-for-money & high customer ratings.', '["Electronics", "Fashion", "Home & Kitchen", "Fitness"]', '$20 - $100', '[0.50, 0.50, 0.50, 0.50, 0.50, 0.50, 0.50, 0.50]', '#8b5cf6'),
('new_visitor', 'Cold-Start Visitor (Guest)', 'Zero historic interaction data. Requires multi-armed bandit exploration & onboarding quiz.', '[]', 'Unknown', '[0.10, 0.10, 0.10, 0.10, 0.10, 0.10, 0.10, 0.10]', '#6b7280');

-- ── Products — Electronics ───────────────────────────────────
INSERT INTO `products` (`id`, `title`, `category`, `sub_category`, `brand`, `price`, `original_price`, `rating`, `review_count`, `image_url`, `color_palette`, `shipping_days`, `in_stock`, `tags`, `description`, `text_embedding`, `visual_embedding`, `frequently_bought_together`, `complete_the_look`, `xai_weights`, `explanation`) VALUES
('prod-001', 'AuraSound Pro Wireless ANC Headphones', 'Electronics', 'Audio', 'AuraSound', 249.99, 299.99, 4.8, 1240, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop', '["#1e293b", "#334155", "#94a3b8"]', 1, TRUE, '["wireless", "noise cancelling", "bluetooth", "audiophile", "over-ear"]', 'Flagship active noise-canceling headphones with custom 40mm titanium drivers, 35-hour battery life, and spatial audio head tracking.', '[0.85, 0.92, 0.12, 0.44, 0.78, 0.95, 0.31, 0.62]', '[0.88, 0.90, 0.15, 0.40, 0.81, 0.92, 0.28, 0.65]', '["prod-002", "prod-005"]', '["prod-003", "prod-012"]', '{"userHistory": 45, "vectorSim": 35, "categoryTrend": 15, "priceFit": 5}', 'Recommended because you frequently browse high-performance audio gear and premium electronics.'),

('prod-002', 'AuraSound Desktop Headphone Stand & Wireless Charger', 'Electronics', 'Accessories', 'AuraSound', 49.99, 59.99, 4.6, 380, 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=500&auto=format&fit=crop', '["#0f172a", "#475569"]', 2, TRUE, '["charger", "stand", "desk setup", "aluminum"]', 'Solid anodized aluminum headset stand featuring integrated 15W Qi fast wireless charging base.', '[0.75, 0.80, 0.18, 0.50, 0.65, 0.82, 0.35, 0.55]', '[0.78, 0.82, 0.20, 0.48, 0.68, 0.85, 0.32, 0.58]', '["prod-001"]', '["prod-004"]', '{"userHistory": 30, "vectorSim": 50, "categoryTrend": 10, "priceFit": 10}', 'Frequently bought together with wireless ANC headphones to complete your desktop workspace.'),

('prod-003', 'NovaBook Ultra Slim M3 Laptop 14"', 'Electronics', 'Computers', 'NovaTech', 1199.00, 1299.00, 4.9, 890, 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&auto=format&fit=crop', '["#cbd5e1", "#64748b", "#0f172a"]', 1, TRUE, '["laptop", "ultrabook", "m3 processor", "retina display", "lightweight"]', 'Featherlight aerospace aluminum laptop with 18-hour battery, Liquid Retina XDR display, and 16GB unified memory.', '[0.91, 0.95, 0.10, 0.35, 0.88, 0.90, 0.25, 0.70]', '[0.93, 0.94, 0.08, 0.32, 0.90, 0.88, 0.22, 0.73]', '["prod-004", "prod-005"]', '["prod-001", "prod-005"]', '{"userHistory": 50, "vectorSim": 30, "categoryTrend": 15, "priceFit": 5}', 'Top matches for developers and power users looking for portable computing power.'),

('prod-004', 'KeyCraft Wireless Ergonomic Mechanical Keyboard', 'Electronics', 'Peripherals', 'KeyCraft', 139.99, 159.99, 4.7, 620, 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500&auto=format&fit=crop', '["#334155", "#475569", "#f8fafc"]', 2, TRUE, '["mechanical keyboard", "wireless", "rgb", "hot-swappable", "gateron"]', 'Custom hot-swappable wireless mechanical keyboard with Gateron Oil Yellow switches and PBT keycaps.', '[0.82, 0.88, 0.15, 0.40, 0.75, 0.89, 0.30, 0.60]', '[0.80, 0.85, 0.18, 0.42, 0.72, 0.87, 0.33, 0.63]', '["prod-003", "prod-005"]', '["prod-002", "prod-003"]', '{"userHistory": 40, "vectorSim": 40, "categoryTrend": 10, "priceFit": 10}', 'Matches your interest in desk productivity and high-tactile typing accessories.'),

('prod-005', 'Precision Track Master Ergonomic Wireless Mouse', 'Electronics', 'Peripherals', 'KeyCraft', 89.99, 99.99, 4.6, 450, 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=500&auto=format&fit=crop', '["#1e293b", "#0f172a"]', 1, TRUE, '["mouse", "ergonomic", "wireless", "logistics", "fast scroll"]', 'Precision laser sensor mouse with 8K DPI tracking, customizable thumb wheel, and quiet click technology.', '[0.80, 0.84, 0.20, 0.45, 0.70, 0.85, 0.35, 0.58]', '[0.82, 0.83, 0.22, 0.43, 0.73, 0.83, 0.37, 0.55]', '["prod-004", "prod-003"]', '["prod-001"]', '{"userHistory": 35, "vectorSim": 45, "categoryTrend": 10, "priceFit": 10}', 'Perfect companion device for NovaBook Ultra laptop buyers.'),

-- ── Products — Fashion ───────────────────────────────────────
('prod-010', 'Urban Minimalist Japanese Denim Jacket', 'Fashion', 'Outerwear', 'KuroStudio', 110.00, 135.00, 4.8, 310, 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=500&auto=format&fit=crop', '["#1e3a8a", "#1d4ed8", "#60a5fa"]', 2, TRUE, '["denim", "jacket", "streetwear", "japanese cotton", "blue"]', 'Raw 14oz selvedge denim trucker jacket cut with modern oversized silhouette and copper rivet detailing.', '[0.12, 0.25, 0.95, 0.88, 0.15, 0.20, 0.89, 0.75]', '[0.10, 0.22, 0.98, 0.91, 0.12, 0.18, 0.92, 0.78]', '["prod-011", "prod-012"]', '["prod-011", "prod-012", "prod-013"]', '{"userHistory": 60, "vectorSim": 25, "categoryTrend": 10, "priceFit": 5}', 'Recommended because of your affinity for Japanese raw denim and structured streetwear.'),

('prod-011', 'Organic Cotton Heavyweight Oversized Tee', 'Fashion', 'Tops', 'KuroStudio', 42.00, 50.00, 4.7, 520, 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&auto=format&fit=crop', '["#f8fafc", "#e2e8f0"]', 1, TRUE, '["white tee", "organic cotton", "oversized", "basic", "summer"]', '280gsm combed organic cotton t-shirt with drop shoulders and ribbed neck band for long-lasting drape.', '[0.15, 0.20, 0.90, 0.82, 0.18, 0.22, 0.85, 0.70]', '[0.14, 0.18, 0.92, 0.85, 0.15, 0.20, 0.88, 0.72]', '["prod-010", "prod-012"]', '["prod-010", "prod-012", "prod-014"]', '{"userHistory": 40, "vectorSim": 40, "categoryTrend": 10, "priceFit": 10}', 'Essential layering item that pairs visually with denim jackets and tailored trousers.'),

('prod-012', 'Slim Tapered Chino Trousers - Olive', 'Fashion', 'Bottoms', 'KuroStudio', 78.00, 89.99, 4.6, 290, 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=500&auto=format&fit=crop', '["#365314", "#4d7c0f"]', 2, TRUE, '["chinos", "trousers", "olive green", "stretch cotton", "tapered"]', 'Versatile stretch-twill chinos engineered with comfort flex waistband and clean tapered cuff finish.', '[0.18, 0.22, 0.88, 0.80, 0.20, 0.25, 0.82, 0.68]', '[0.16, 0.20, 0.90, 0.83, 0.18, 0.22, 0.84, 0.70]', '["prod-010", "prod-011"]', '["prod-010", "prod-011", "prod-013"]', '{"userHistory": 35, "vectorSim": 45, "categoryTrend": 10, "priceFit": 10}', 'High visual style similarity with your saved wardrobe boards.'),

('prod-013', 'Retro Court Low-Top Leather Sneakers', 'Fashion', 'Footwear', 'Veloce Footwear', 125.00, 145.00, 4.9, 810, 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500&auto=format&fit=crop', '["#ffffff", "#cbd5e1", "#e2e8f0"]', 1, TRUE, '["sneakers", "leather", "white shoes", "minimalist", "court style"]', 'Full-grain Italian leather sneakers with natural rubber cupsole and cushioned memory foam footbed.', '[0.20, 0.28, 0.92, 0.85, 0.22, 0.30, 0.90, 0.72]', '[0.22, 0.30, 0.94, 0.88, 0.20, 0.28, 0.93, 0.75]', '["prod-010", "prod-011"]', '["prod-010", "prod-011", "prod-012"]', '{"userHistory": 55, "vectorSim": 30, "categoryTrend": 10, "priceFit": 5}', 'Top trending minimalist footwear matching classic denim aesthetics.'),

('prod-014', 'Handcrafted Italian Leather Commuter Backpack', 'Fashion', 'Accessories', 'Artigiano', 195.00, 220.00, 4.8, 190, 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=500&auto=format&fit=crop', '["#78350f", "#92400e", "#b45309"]', 2, TRUE, '["backpack", "leather", "laptop bag", "tan brown", "craftsmanship"]', 'Vegetable-tanned full-grain leather backpack with dedicated 16-inch laptop compartment and water-resistant lining.', '[0.30, 0.40, 0.85, 0.78, 0.35, 0.45, 0.80, 0.65]', '[0.32, 0.42, 0.87, 0.80, 0.33, 0.43, 0.82, 0.68]', '["prod-003", "prod-010"]', '["prod-010", "prod-013"]', '{"userHistory": 30, "vectorSim": 50, "categoryTrend": 10, "priceFit": 10}', 'High visual color harmony match for vintage tan and indigo denim outfits.'),

-- ── Products — Home & Kitchen ────────────────────────────────
('prod-020', 'Barista Edition Precision Espresso Machine', 'Home & Kitchen', 'Appliances', 'AromaCrafter', 549.00, 649.00, 4.9, 940, 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=500&auto=format&fit=crop', '["#475569", "#0f172a", "#e2e8f0"]', 1, TRUE, '["espresso machine", "coffee maker", "barista", "stainless steel", "pid temperature"]', 'Commercial 19-bar Italian pump espresso machine with dual PID temperature control and micro-foam steam wand.', '[0.45, 0.15, 0.25, 0.30, 0.95, 0.90, 0.18, 0.80]', '[0.48, 0.18, 0.22, 0.28, 0.97, 0.92, 0.15, 0.83]', '["prod-021", "prod-022"]', '["prod-021", "prod-022"]', '{"userHistory": 50, "vectorSim": 35, "categoryTrend": 10, "priceFit": 5}', 'Recommended because you are a Gourmet Home Chef looking for barista-grade appliances.'),

('prod-021', 'Burr Coffee Grinder with 30 Precise Settings', 'Home & Kitchen', 'Appliances', 'AromaCrafter', 119.00, 139.00, 4.7, 430, 'https://images.unsplash.com/photo-1589396575653-c09c794ff6a6?w=500&auto=format&fit=crop', '["#1e293b", "#334155"]', 2, TRUE, '["coffee grinder", "burr grinder", "espresso grind", "conical burr"]', 'Stainless steel conical burr coffee grinder delivering uniform particle sizing from French Press to Fine Espresso.', '[0.42, 0.18, 0.28, 0.35, 0.90, 0.85, 0.20, 0.75]', '[0.44, 0.20, 0.25, 0.32, 0.92, 0.88, 0.18, 0.78]', '["prod-020"]', '["prod-020", "prod-022"]', '{"userHistory": 40, "vectorSim": 40, "categoryTrend": 10, "priceFit": 10}', 'Number 1 essential pairing item bought alongside the Barista Espresso Machine.'),

('prod-022', 'Double-Walled Borosilicate Glass Coffee Cups (Set of 4)', 'Home & Kitchen', 'Drinkware', 'Vitreous', 34.99, 42.00, 4.8, 710, 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500&auto=format&fit=crop', '["#ffffff", "#e2e8f0"]', 1, TRUE, '["glass cups", "double wall", "espresso cups", "latte glass", "heat resistant"]', 'Thermal insulated double-wall glasses keeping drinks hot without burning hands, dishwasher safe.', '[0.38, 0.20, 0.30, 0.38, 0.85, 0.80, 0.22, 0.70]', '[0.40, 0.22, 0.28, 0.35, 0.88, 0.82, 0.20, 0.72]', '["prod-020", "prod-021"]', '["prod-020"]', '{"userHistory": 30, "vectorSim": 50, "categoryTrend": 10, "priceFit": 10}', 'Top rated accessory set for artisanal coffee setups.'),

-- ── Products — Fitness ───────────────────────────────────────
('prod-030', 'ProPulse Carbon Plate Marathon Running Shoes', 'Fitness', 'Footwear', 'ProPulse', 179.99, 210.00, 4.9, 680, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop', '["#ef4444", "#dc2626", "#000000"]', 1, TRUE, '["running shoes", "marathon", "carbon plate", "breathable mesh", "lightweight"]', 'Elite marathon racing shoe featuring full-length carbon fiber propulsion plate and ultra-responsive PEBA foam midsole.', '[0.25, 0.88, 0.70, 0.92, 0.30, 0.40, 0.88, 0.60]', '[0.28, 0.90, 0.72, 0.95, 0.28, 0.38, 0.90, 0.62]', '["prod-031", "prod-032"]', '["prod-031", "prod-032"]', '{"userHistory": 50, "vectorSim": 35, "categoryTrend": 10, "priceFit": 5}', 'High vector similarity match for queries seeking breathable carbon plate running shoes.'),

('prod-031', 'Smart GPS Fitness Tracker Watch & Heart Monitor', 'Fitness', 'Wearables', 'PulseTech', 149.99, 179.99, 4.6, 510, 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop', '["#0f172a", "#1e293b"]', 1, TRUE, '["smartwatch", "gps", "fitness tracker", "heart rate", "waterproof"]', 'Rugged multi-sport smartwatch with built-in GPS, VO2 max tracking, sleep score analysis, and 14-day battery life.', '[0.55, 0.85, 0.60, 0.80, 0.45, 0.50, 0.75, 0.65]', '[0.58, 0.88, 0.62, 0.82, 0.43, 0.48, 0.78, 0.68]', '["prod-030"]', '["prod-030", "prod-032"]', '{"userHistory": 40, "vectorSim": 45, "categoryTrend": 10, "priceFit": 5}', 'Essential training gadget for endurance athletes and runners.'),

('prod-032', 'Insulated Stainless Steel Sport Water Bottle 32oz', 'Fitness', 'Accessories', 'HydroPeak', 29.99, 35.00, 4.8, 1120, 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500&auto=format&fit=crop', '["#0284c7", "#0369a1"]', 1, TRUE, '["water bottle", "insulated", "stainless steel", "bpa free", "cold water"]', 'Vacuum insulated flask keeping beverages ice-cold for 24 hours with leakproof straw lid design.', '[0.20, 0.70, 0.50, 0.75, 0.25, 0.35, 0.70, 0.50]', '[0.22, 0.72, 0.52, 0.78, 0.23, 0.33, 0.72, 0.52]', '["prod-030", "prod-031"]', '["prod-030"]', '{"userHistory": 25, "vectorSim": 55, "categoryTrend": 10, "priceFit": 10}', 'Top value accessory purchased with sports running gear.'),

-- ── NEW Products — Electronics Additions ─────────────────────
('prod-006', 'SmartNest Hub Pro 10" Smart Display & Speaker', 'Electronics', 'Smart Home', 'SmartNest', 199.99, 229.99, 4.7, 920, 'https://images.unsplash.com/photo-1558089687-f282ffcbc126?w=500&auto=format&fit=crop', '["#1e293b", "#6366f1", "#e2e8f0"]', 1, TRUE, '["smart display", "voice assistant", "smart home", "speaker", "matter protocol"]', 'Premium smart home hub with 10-inch HD display, adaptive audio, built-in Zigbee/Matter bridge, and privacy shutter camera.', '[0.88, 0.86, 0.18, 0.50, 0.82, 0.90, 0.28, 0.68]', '[0.86, 0.84, 0.20, 0.48, 0.80, 0.88, 0.30, 0.66]', '["prod-001", "prod-004"]', '["prod-001", "prod-003"]', '{"userHistory": 42, "vectorSim": 38, "categoryTrend": 12, "priceFit": 8}', 'Perfect addition to your smart home ecosystem based on your tech browsing history.'),

('prod-007', 'CrystalView 4K Ultra HD Pro Webcam', 'Electronics', 'Peripherals', 'CrystalView', 159.99, 189.99, 4.8, 340, 'https://images.unsplash.com/photo-1587826080692-f439cd0b70da?w=500&auto=format&fit=crop', '["#0f172a", "#334155", "#f8fafc"]', 1, TRUE, '["webcam", "4k", "hdr", "auto-framing", "streaming"]', 'Professional 4K webcam with HDR, AI auto-framing, dual noise-canceling microphones, and studio-grade low-light correction.', '[0.83, 0.87, 0.16, 0.42, 0.76, 0.88, 0.32, 0.61]', '[0.81, 0.85, 0.19, 0.44, 0.74, 0.86, 0.34, 0.59]', '["prod-003", "prod-004"]', '["prod-003", "prod-002"]', '{"userHistory": 38, "vectorSim": 42, "categoryTrend": 12, "priceFit": 8}', 'Ideal for remote professionals upgrading their video conferencing setup.'),

('prod-008', 'ThunderDock Pro USB-C 12-in-1 Docking Station', 'Electronics', 'Accessories', 'NovaTech', 129.99, 149.99, 4.5, 280, 'https://images.unsplash.com/photo-1625842268584-8f3296236761?w=500&auto=format&fit=crop', '["#334155", "#64748b", "#0f172a"]', 2, TRUE, '["usb-c hub", "docking station", "thunderbolt", "hdmi", "ethernet"]', '12-in-1 Thunderbolt 4 docking station with triple 4K display output, 100W PD charging, and 10Gbps data transfer.', '[0.79, 0.82, 0.22, 0.48, 0.68, 0.84, 0.36, 0.56]', '[0.77, 0.80, 0.24, 0.46, 0.66, 0.82, 0.38, 0.54]', '["prod-003", "prod-007"]', '["prod-003", "prod-004"]', '{"userHistory": 32, "vectorSim": 48, "categoryTrend": 10, "priceFit": 10}', 'Must-have productivity accessory for laptop users seeking multi-display desk setups.'),

-- ── NEW Products — Fashion Additions ─────────────────────────
('prod-015', 'Merino Wool Structured Overcoat - Charcoal', 'Fashion', 'Outerwear', 'KuroStudio', 285.00, 340.00, 4.9, 175, 'https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=500&auto=format&fit=crop', '["#374151", "#1f2937", "#6b7280"]', 2, TRUE, '["overcoat", "wool", "charcoal", "tailored", "winter"]', 'Structured Italian merino wool overcoat with peak lapels, dual-vent back, and satin-lined interior for a premium drape.', '[0.14, 0.20, 0.93, 0.86, 0.16, 0.24, 0.88, 0.73]', '[0.12, 0.18, 0.95, 0.88, 0.14, 0.22, 0.90, 0.75]', '["prod-010", "prod-013"]', '["prod-011", "prod-012", "prod-013"]', '{"userHistory": 52, "vectorSim": 32, "categoryTrend": 10, "priceFit": 6}', 'Elevated outerwear matching your preference for structured, layered silhouettes.'),

('prod-016', 'Waxed Canvas Heritage Tote Bag', 'Fashion', 'Accessories', 'Artigiano', 89.00, 110.00, 4.7, 260, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&auto=format&fit=crop', '["#78350f", "#a16207", "#f5f5dc"]', 1, TRUE, '["tote bag", "canvas", "waxed", "heritage", "everyday carry"]', 'Heavy-duty waxed canvas tote with vegetable-tanned leather handles, brass rivets, and interior laptop sleeve.', '[0.25, 0.35, 0.87, 0.80, 0.28, 0.38, 0.82, 0.66]', '[0.27, 0.37, 0.89, 0.82, 0.26, 0.36, 0.84, 0.68]', '["prod-014", "prod-010"]', '["prod-010", "prod-011"]', '{"userHistory": 28, "vectorSim": 52, "categoryTrend": 12, "priceFit": 8}', 'Complements your taste for heritage craftsmanship and natural material accessories.'),

('prod-017', 'Full-Grain Leather Minimalist Belt - Cognac', 'Fashion', 'Accessories', 'Artigiano', 65.00, 79.99, 4.8, 420, 'https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=500&auto=format&fit=crop', '["#92400e", "#b45309", "#d97706"]', 1, TRUE, '["belt", "leather", "cognac", "minimalist", "brass buckle"]', 'Hand-finished full-grain cowhide leather belt with solid brass roller buckle and beveled edge stitching.', '[0.22, 0.30, 0.89, 0.82, 0.24, 0.32, 0.85, 0.70]', '[0.24, 0.32, 0.91, 0.84, 0.22, 0.30, 0.87, 0.72]', '["prod-012", "prod-013"]', '["prod-010", "prod-012"]', '{"userHistory": 34, "vectorSim": 46, "categoryTrend": 10, "priceFit": 10}', 'Essential wardrobe staple that matches your saved outfits featuring earth-tone accessories.'),

-- ── NEW Products — Home & Kitchen Additions ──────────────────
('prod-023', 'Heritage Cast Iron Skillet 12" - Pre-Seasoned', 'Home & Kitchen', 'Cookware', 'IronForge', 79.99, 99.99, 4.9, 1350, 'https://images.unsplash.com/photo-1585515320310-259814833e62?w=500&auto=format&fit=crop', '["#1c1917", "#44403c", "#78716c"]', 2, TRUE, '["cast iron", "skillet", "pre-seasoned", "oven safe", "induction"]', 'Triple-seasoned 12-inch cast iron skillet with helper handle, pour spouts, and lifetime heirloom guarantee.', '[0.40, 0.16, 0.28, 0.34, 0.88, 0.84, 0.22, 0.74]', '[0.42, 0.18, 0.26, 0.32, 0.90, 0.86, 0.20, 0.76]', '["prod-020", "prod-024"]', '["prod-020", "prod-022"]', '{"userHistory": 36, "vectorSim": 44, "categoryTrend": 10, "priceFit": 10}', 'Essential cookware for home chefs who value heirloom-quality kitchen tools.'),

('prod-024', 'Magnetic Bamboo Spice Rack with 18 Glass Jars', 'Home & Kitchen', 'Storage', 'AromaCrafter', 54.99, 69.99, 4.6, 390, 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=500&auto=format&fit=crop', '["#d4a574", "#a3752a", "#f5f5dc"]', 2, TRUE, '["spice rack", "bamboo", "magnetic", "glass jars", "organization"]', 'Wall-mounted magnetic bamboo spice rack with 18 airtight borosilicate glass jars and chalkboard labels.', '[0.36, 0.19, 0.32, 0.36, 0.82, 0.78, 0.24, 0.68]', '[0.38, 0.21, 0.30, 0.34, 0.84, 0.80, 0.22, 0.70]', '["prod-023", "prod-020"]', '["prod-020", "prod-023"]', '{"userHistory": 28, "vectorSim": 52, "categoryTrend": 10, "priceFit": 10}', 'Popular kitchen organization add-on for gourmet cooking enthusiasts.'),

('prod-025', 'Artisan French Press Coffee Maker - Copper & Glass', 'Home & Kitchen', 'Appliances', 'AromaCrafter', 44.99, 54.99, 4.7, 580, 'https://images.unsplash.com/photo-1572119865084-43c285814d63?w=500&auto=format&fit=crop', '["#b45309", "#d97706", "#ffffff"]', 1, TRUE, '["french press", "coffee maker", "copper", "borosilicate glass", "manual brew"]', 'Handcrafted copper-frame French press with double-filtered stainless mesh plunger and heat-resistant borosilicate carafe.', '[0.40, 0.17, 0.27, 0.33, 0.87, 0.82, 0.21, 0.73]', '[0.42, 0.19, 0.25, 0.31, 0.89, 0.84, 0.19, 0.75]', '["prod-021", "prod-022"]', '["prod-020", "prod-022"]', '{"userHistory": 32, "vectorSim": 48, "categoryTrend": 10, "priceFit": 10}', 'Alternative brewing method popular among pour-over and manual coffee enthusiasts.'),

-- ── NEW Products — Fitness Additions ─────────────────────────
('prod-033', 'EcoZen Premium Natural Rubber Yoga Mat 6mm', 'Fitness', 'Accessories', 'EcoZen', 68.00, 85.00, 4.8, 740, 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=500&auto=format&fit=crop', '["#059669", "#047857", "#d1fae5"]', 1, TRUE, '["yoga mat", "natural rubber", "non-slip", "eco-friendly", "6mm thick"]', 'Professional-grade natural tree rubber yoga mat with laser-etched alignment lines and antimicrobial surface.', '[0.22, 0.75, 0.55, 0.78, 0.28, 0.38, 0.72, 0.55]', '[0.24, 0.77, 0.57, 0.80, 0.26, 0.36, 0.74, 0.57]', '["prod-034", "prod-032"]', '["prod-030", "prod-034"]', '{"userHistory": 30, "vectorSim": 50, "categoryTrend": 10, "priceFit": 10}', 'Top-rated mat for yoga practitioners seeking eco-conscious, high-grip workout surfaces.'),

('prod-034', 'ElastiForce Pro Resistance Bands Set (5 Levels)', 'Fitness', 'Equipment', 'ElastiForce', 39.99, 49.99, 4.7, 890, 'https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=500&auto=format&fit=crop', '["#f59e0b", "#ef4444", "#3b82f6", "#10b981", "#8b5cf6"]', 1, TRUE, '["resistance bands", "strength training", "portable", "latex-free", "home workout"]', 'Five-level natural latex resistance band set with padded handles, door anchor, ankle straps, and carry bag.', '[0.24, 0.78, 0.52, 0.76, 0.26, 0.36, 0.74, 0.53]', '[0.26, 0.80, 0.54, 0.78, 0.24, 0.34, 0.76, 0.55]', '["prod-033", "prod-030"]', '["prod-030", "prod-033"]', '{"userHistory": 26, "vectorSim": 54, "categoryTrend": 10, "priceFit": 10}', 'Versatile home training equipment trending among fitness-at-home enthusiasts.');

-- ── RAG Knowledge Base ───────────────────────────────────────
INSERT INTO `rag_knowledge_base` (`id`, `title`, `content`, `category`) VALUES
('rag-01', 'Return & Exchange Policy', 'We offer a 30-day hassle-free return window for all unused products in original packaging. Express refund processing via original payment method within 48 hours.', 'Policy'),
('rag-02', 'Headphone Battery & Warranty Details', 'AuraSound Pro wireless headphones feature 35-hour battery life with fast charging (10 min charge = 5 hours playback). Includes 2-year manufacturer international warranty.', 'Product Support'),
('rag-03', 'Denim Sizing & Care Instructions', 'KuroStudio Japanese selvedge denim is raw and untreated. We recommend washing inside out in cold water after 6 months of wear to preserve indigo fade character.', 'Product Care'),
('rag-04', 'Espresso Machine Maintenance', 'AromaCrafter Barista Espresso machine includes built-in descale warning light. Use filtered water and run automated clean cycle every 200 brew shots.', 'Product Support'),
('rag-05', 'Shipping & Delivery Information', 'Standard shipping: 3-5 business days. Express shipping: 1-2 business days. Free shipping on orders over $75. International shipping available to 40+ countries with duties calculated at checkout.', 'Policy'),
('rag-06', 'Warranty & Repair Services', 'All electronics carry a minimum 1-year manufacturer warranty. Extended 3-year protection plans available at checkout. Authorized repair centers in 25 cities nationwide.', 'Policy');

-- ── FAISS Index Specs ────────────────────────────────────────
INSERT INTO `faiss_index_specs` (`id`, `name`, `description`, `build_time_ms`, `search_latency_ms`, `qps`, `recall_at_10`, `memory_overhead_mb`, `complexity`, `best_for`) VALUES
('IndexFlatIP', 'IndexFlatIP', 'Exact Brute-Force Inner Product Index', 12.00, 42.50, 1850, 1.000, 64, 'O(N * d)', 'Small to mid-size catalogs (< 100K items) requiring 100% exact precision.'),
('IndexIVFFlat', 'IndexIVFFlat', 'Inverted File Voronoi Partitioning Index (nlist=100, nprobe=10)', 180.00, 8.20, 12400, 0.954, 82, 'O((N/nlist) * d)', 'Large scale catalogs (1M+ items) balancing memory and ultra-fast lookup.'),
('IndexHNSW', 'IndexHNSW32', 'Hierarchical Navigable Small World Graph (M=32, efSearch=64)', 950.00, 1.80, 45000, 0.988, 240, 'O(log N)', 'Ultra-low latency real-time recommendation engines with sub-2ms SLA.');
