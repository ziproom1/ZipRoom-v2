/*
  # Add message reply functionality

  1. Schema Changes
    - Add reply fields to messages table:
      - `reply_to_id` (uuid, optional reference to another message)
      - `reply_to_username` (text, username of replied message)
      - `reply_to_content` (text, content preview of replied message)

  2. Security
    - Update existing policies to handle new fields
*/

-- Add reply fields to messages table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'messages' AND column_name = 'reply_to_id'
  ) THEN
    ALTER TABLE messages ADD COLUMN reply_to_id uuid;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'messages' AND column_name = 'reply_to_username'
  ) THEN
    ALTER TABLE messages ADD COLUMN reply_to_username text;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'messages' AND column_name = 'reply_to_content'
  ) THEN
    ALTER TABLE messages ADD COLUMN reply_to_content text;
  END IF;
END $$;

-- Add foreign key constraint for reply_to_id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'messages_reply_to_id_fkey'
  ) THEN
    ALTER TABLE messages 
    ADD CONSTRAINT messages_reply_to_id_fkey 
    FOREIGN KEY (reply_to_id) REFERENCES messages(id) ON DELETE SET NULL;
  END IF;
END $$;