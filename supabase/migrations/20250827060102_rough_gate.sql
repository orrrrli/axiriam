/*
  # Order Status Automation and Raw Materials Inventory Management

  1. New Functions
    - `update_order_status_on_tracking()` - Auto-update status when tracking number is added
    - `process_received_order()` - Handle raw materials inventory when order is received
    - `check_shipment_delivery_status()` - Check if shipment is delivered (placeholder for API integration)

  2. New Tables
    - `automation_logs` - Track all automated changes for audit purposes

  3. Triggers
    - Auto-update order status based on tracking number changes
    - Process raw materials inventory when order status becomes 'received'

  4. Features
    - Automatic status management with manual override capability
    - Raw materials inventory automation
    - Comprehensive audit logging
    - Error handling and data integrity
*/

-- Create automation logs table for audit purposes
CREATE TABLE IF NOT EXISTS automation_logs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  table_name text NOT NULL,
  record_id uuid NOT NULL,
  action text NOT NULL,
  old_values jsonb,
  new_values jsonb,
  automated boolean DEFAULT true,
  error_message text,
  created_at timestamptz DEFAULT now()
);

-- Create index for automation logs
CREATE INDEX IF NOT EXISTS idx_automation_logs_table_record ON automation_logs(table_name, record_id);
CREATE INDEX IF NOT EXISTS idx_automation_logs_created_at ON automation_logs(created_at);

-- Enable RLS on automation logs
ALTER TABLE automation_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for automation logs
CREATE POLICY "Users can read automation logs"
  ON automation_logs
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "System can insert automation logs"
  ON automation_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Function to log automation actions
CREATE OR REPLACE FUNCTION log_automation_action(
  p_table_name text,
  p_record_id uuid,
  p_action text,
  p_old_values jsonb DEFAULT NULL,
  p_new_values jsonb DEFAULT NULL,
  p_automated boolean DEFAULT true,
  p_error_message text DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  INSERT INTO automation_logs (
    table_name,
    record_id,
    action,
    old_values,
    new_values,
    automated,
    error_message
  ) VALUES (
    p_table_name,
    p_record_id,
    p_action,
    p_old_values,
    p_new_values,
    p_automated,
    p_error_message
  );
END;
$$ LANGUAGE plpgsql;

-- Function to automatically update order status based on tracking number
CREATE OR REPLACE FUNCTION update_order_status_on_tracking()
RETURNS TRIGGER AS $$
BEGIN
  -- Only proceed if this is an update operation
  IF TG_OP = 'UPDATE' THEN
    -- Check if tracking number was added (was null/empty, now has value)
    IF (OLD.tracking_number IS NULL OR OLD.tracking_number = '') 
       AND (NEW.tracking_number IS NOT NULL AND NEW.tracking_number != '') 
       AND OLD.status = 'pending' THEN
      
      -- Automatically update status to 'ordered'
      NEW.status := 'ordered';
      
      -- Log the automation action
      PERFORM log_automation_action(
        'order_materials',
        NEW.id,
        'status_auto_update_tracking',
        jsonb_build_object('status', OLD.status, 'tracking_number', OLD.tracking_number),
        jsonb_build_object('status', NEW.status, 'tracking_number', NEW.tracking_number),
        true
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to process raw materials inventory when order is received
CREATE OR REPLACE FUNCTION process_received_order()
RETURNS TRIGGER AS $$
DECLARE
  design_record RECORD;
  material_record RECORD;
  group_record RECORD;
  existing_material_id uuid;
  new_material_id uuid;
BEGIN
  -- Only process if status changed to 'received'
  IF TG_OP = 'UPDATE' AND OLD.status != 'received' AND NEW.status = 'received' THEN
    
    -- Process each material group in the order
    FOR group_record IN 
      SELECT * FROM order_material_groups 
      WHERE order_material_id = NEW.id
    LOOP
      -- Process each design in the group
      FOR design_record IN 
        SELECT od.*, rm.name, rm.description, rm.width, rm.height, rm.unit, rm.price, rm.supplier, rm.image_url
        FROM order_designs od
        JOIN raw_materials rm ON od.raw_material_id = rm.id
        WHERE od.order_material_group_id = group_record.id
      LOOP
        
        -- Check if raw material already exists with same design and supplier
        SELECT id INTO existing_material_id
        FROM raw_materials 
        WHERE name = design_record.name 
          AND supplier = NEW.distributor
        LIMIT 1;
        
        IF existing_material_id IS NOT NULL THEN
          -- Update existing raw material quantity
          UPDATE raw_materials 
          SET 
            quantity = quantity + (design_record.width * design_record.height * group_record.quantity),
            updated_at = now()
          WHERE id = existing_material_id;
          
          -- Log the update
          PERFORM log_automation_action(
            'raw_materials',
            existing_material_id,
            'inventory_auto_update',
            jsonb_build_object('order_id', NEW.id),
            jsonb_build_object(
              'quantity_added', design_record.width * design_record.height * group_record.quantity,
              'supplier', NEW.distributor
            ),
            true
          );
          
        ELSE
          -- Create new raw material record
          INSERT INTO raw_materials (
            name,
            description,
            width,
            height,
            quantity,
            unit,
            price,
            supplier,
            image_url
          ) VALUES (
            design_record.name,
            design_record.description || ' (Auto-created from order)',
            design_record.width,
            design_record.height,
            design_record.width * design_record.height * group_record.quantity,
            design_record.unit,
            design_record.price,
            NEW.distributor,
            design_record.image_url
          ) RETURNING id INTO new_material_id;
          
          -- Log the creation
          PERFORM log_automation_action(
            'raw_materials',
            new_material_id,
            'inventory_auto_create',
            NULL,
            jsonb_build_object(
              'order_id', NEW.id,
              'quantity', design_record.width * design_record.height * group_record.quantity,
              'supplier', NEW.distributor,
              'source', 'order_received'
            ),
            true
          );
        END IF;
        
      END LOOP;
    END LOOP;
    
    -- Log the order processing
    PERFORM log_automation_action(
      'order_materials',
      NEW.id,
      'order_processed_received',
      jsonb_build_object('status', OLD.status),
      jsonb_build_object('status', NEW.status, 'processed_at', now()),
      true
    );
    
  END IF;
  
  RETURN NEW;
  
EXCEPTION
  WHEN OTHERS THEN
    -- Log any errors
    PERFORM log_automation_action(
      'order_materials',
      NEW.id,
      'order_processing_error',
      jsonb_build_object('status', OLD.status),
      jsonb_build_object('status', NEW.status),
      true,
      SQLERRM
    );
    
    -- Don't prevent the status update, just log the error
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for order automation
CREATE TRIGGER trigger_update_order_status_on_tracking
  BEFORE UPDATE ON order_materials
  FOR EACH ROW
  EXECUTE FUNCTION update_order_status_on_tracking();

CREATE TRIGGER trigger_process_received_order
  AFTER UPDATE ON order_materials
  FOR EACH ROW
  EXECUTE FUNCTION process_received_order();

-- Function to check and update order status based on shipment delivery (for API integration)
CREATE OR REPLACE FUNCTION update_order_status_if_delivered(
  p_order_id uuid,
  p_is_delivered boolean
)
RETURNS boolean AS $$
DECLARE
  current_status text;
  updated boolean := false;
BEGIN
  -- Get current order status
  SELECT status INTO current_status
  FROM order_materials
  WHERE id = p_order_id;
  
  -- Only update if currently 'ordered' and shipment is delivered
  IF current_status = 'ordered' AND p_is_delivered = true THEN
    UPDATE order_materials
    SET status = 'received', updated_at = now()
    WHERE id = p_order_id;
    
    -- Log the automation action
    PERFORM log_automation_action(
      'order_materials',
      p_order_id,
      'status_auto_update_delivered',
      jsonb_build_object('status', current_status),
      jsonb_build_object('status', 'received', 'delivery_confirmed', true),
      true
    );
    
    updated := true;
  END IF;
  
  RETURN updated;
  
EXCEPTION
  WHEN OTHERS THEN
    -- Log any errors
    PERFORM log_automation_action(
      'order_materials',
      p_order_id,
      'delivery_status_check_error',
      jsonb_build_object('current_status', current_status),
      jsonb_build_object('is_delivered', p_is_delivered),
      true,
      SQLERRM
    );
    
    RETURN false;
END;
$$ LANGUAGE plpgsql;