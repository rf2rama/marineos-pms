-- =========================================================================
-- MARINEOS PMS MASTER SEED DATA SCRIPT
-- Populates initial fleet vessels, machinery, spare parts, crew, and logs
-- =========================================================================

-- 1. SEED VESSELS
INSERT INTO public.vessels (id, name, imo_number, flag, vessel_type, built_year, class_society, status, current_location, total_running_hours, dimensions)
VALUES
(
  'vessel-1', 'MV Pacific Star', '9482019', 'Panama (PA)', 'Bulk Carrier (58k DWT)', 2018, 'DNV', 'At Sea', 'Malacca Strait (En route to Singapore)', 24650,
  '{"loaMeters": 199.9, "beamMeters": 32.2, "draftMeters": 12.8, "dwtTons": 57800, "enginePowerKW": 8800, "cargoCapacityM3": 71500}'::jsonb
),
(
  'vessel-2', 'MV Atlantic Pioneer', '9671120', 'Liberia (LR)', 'Container Vessel (4,200 TEU)', 2020, 'Lloyd''s Register', 'In Port', 'Port of Rotterdam (Berth 402)', 19200,
  '{"loaMeters": 260.0, "beamMeters": 32.3, "draftMeters": 12.5, "dwtTons": 50800, "enginePowerKW": 24200, "cargoCapacityM3": 98000}'::jsonb
),
(
  'vessel-3', 'MV Northern Glory', '9310884', 'Marshall Islands (MH)', 'Chemical Tanker (32k DWT)', 2016, 'Bureau Veritas', 'In Drydock', 'Damen Shiprepair Rotterdam', 32400,
  '{"loaMeters": 182.5, "beamMeters": 27.4, "draftMeters": 11.2, "dwtTons": 32500, "enginePowerKW": 7400, "cargoCapacityM3": 38200}'::jsonb
)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- 2. SEED EQUIPMENT
INSERT INTO public.equipment (id, vessel_id, name, category, maker, model, serial_number, location, initial_running_hours, running_hours, criticality, last_overhaul_date, status)
VALUES
('eq-101', 'vessel-1', 'Main Engine (MAN B&W 6S50ME-C)', 'Main Propulsion', 'MAN Energy Solutions', '6S50ME-C9.5', 'ME-849201', 'Engine Room - Bottom Platform', 24000, 24650, 'High', '2025-11-10', 'Operational'),
('eq-102', 'vessel-1', 'Auxiliary Engine No. 1 (Daihatsu)', 'Auxiliary Power', 'Daihatsu Diesel', '6DK-20e', 'AE1-39201', 'Engine Room - 2nd Deck Port Side', 12000, 12400, 'High', '2025-08-15', 'Requires Service'),
('eq-103', 'vessel-1', 'Fuel Oil Purifier No. 1 (Alfa Laval)', 'Purifiers & Separators', 'Alfa Laval', 'S 937', 'AL-99201', 'Purifier Room', 8000, 8450, 'Medium', '2026-01-20', 'Operational'),
('eq-201', 'vessel-2', 'Main Engine (MAN B&W 8K90ME-C)', 'Main Propulsion', 'MAN Energy Solutions', '8K90ME-C10.5', 'ME-967112', 'Engine Room - Main Deck', 18500, 19200, 'High', '2025-10-05', 'Operational'),
('eq-301', 'vessel-3', 'Main Propulsion (Wärtsilä 6L46F)', 'Main Propulsion', 'Wärtsilä Marine', '6L46F', 'WAR-46011', 'Engine Room - Lower Flat', 31500, 32400, 'High', '2025-06-20', 'Requires Service')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- 3. SEED SPARE PARTS
INSERT INTO public.spare_parts (id, vessel_id, equipment_id, part_name, part_number, item_category, stock_qty, min_stock_qty, unit_cost_usd, location_type, location_name, condition_status, installed_at_running_hours, installed_date, is_currently_installed)
VALUES
('sp-1', 'vessel-1', 'eq-101', 'Fuel Injector Nozzle Assembly', 'MAN-FIN-50ME', 'Spare Part (Non-Consumable)', 4, 2, 1450, 'Ship Storage', 'Engine Store - Rack A2', 'Good / Ready', 24000, '2026-01-10', TRUE),
('sp-1-land', NULL, 'eq-101', 'Fuel Injector Nozzle Assembly (Land Backup)', 'MAN-FIN-50ME', 'Spare Part (Non-Consumable)', 12, 5, 1380, 'Land Storage', 'Singapore Central Marine Depot (Rack L4)', 'Good / Ready', NULL, NULL, FALSE)
ON CONFLICT (id) DO UPDATE SET part_name = EXCLUDED.part_name;

-- 4. SEED SUPPLIERS
INSERT INTO public.suppliers (id, name, category, rating, contact_email, phone, country, address, status, performance_notes)
VALUES
('sup-1', 'MAN Energy Solutions Singapore Hub', 'Main Propulsion Spares & Service', 4.9, 'service-sg@man-es.com', '+65 6890 1200', 'Singapore', 'Techno Park, Jurong, Singapore', 'Approved Supplier', 'OEM Certified vendor.'),
('sup-2', 'Alfa Laval Marine Rotterdam Central Depot', 'Separators, Purifiers & Heat Exchangers', 4.8, 'marine.rotterdam@alfalaval.com', '+31 10 400 2000', 'Netherlands', 'Harbor Port 400, Rotterdam', 'Approved Supplier', 'Fast delivery in European ports.')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- 5. SEED CREW MEMBERS
INSERT INTO public.crew_members (id, full_name, rank, nationality, seaman_book_no, status, current_vessel_id, current_vessel_name, sign_on_date, sign_off_date_planned, certificates, assignment_history, medical_records, accident_records, personal_notes)
VALUES
(
  'crew-1', 'Marek Kowalski', '2nd Engineer', 'Poland (PL)', 'SB-PL-992019', 'Onboard', 'vessel-1', 'MV Pacific Star', '2026-02-10', '2026-08-10',
  '[{"id": "cert-1", "certName": "STCW Operational Watch Engineer", "certNumber": "PL-ENG-84920", "issueDate": "2024-01-15", "expiryDate": "2029-01-15", "issuingAuthority": "Polish Maritime Office", "status": "Valid"}]'::jsonb,
  '[{"id": "h-1", "vesselId": "vessel-2", "vesselName": "MV Atlantic Pioneer", "rank": "3rd Engineer", "signOnDate": "2025-03-01", "signOffDate": "2025-09-01", "performanceRating": "Excellent", "remarks": "High diligence during main engine overhaul."}]'::jsonb,
  '[]'::jsonb, '[]'::jsonb, 'Promoted to 2nd Engineer in 2025.'
)
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name;
