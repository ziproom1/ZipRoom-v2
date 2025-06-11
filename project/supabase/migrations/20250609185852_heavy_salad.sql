/*
  # Add Message Reactions

  1. New Tables
    - `message_reactions`
      - `id` (uuid, primary key)
      - `message_id` (uuid, foreign key to messages.id)
      - `user_id` (text, user identifier)
      - `emoji_id` (text, emoji identifier)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on message_reactions table
    - Add policies for public access
    - Add unique constraint to prevent duplicate reactions

  3. Indexes
    - Add indexes for performance on message_id and user_id
*/

-- Create message_reactions table
CREATE TABLE IF NOT EXISTS message_reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id uuid NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  user_id text NOT NULL,
  emoji_id text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(message_id, user_id, emoji_id)
);

-- Enable Row Level Security
ALTER TABLE message_reactions ENABLE ROW LEVEL SECURITY;

-- Create policies for public access
CREATE POLICY "Anyone can read message reactions"
  ON message_reactions
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can add reactions"
  ON message_reactions
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can remove their own reactions"
  ON message_reactions
  FOR DELETE
  USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_message_reactions_message_id ON message_reactions(message_id);
CREATE INDEX IF NOT EXISTS idx_message_reactions_user_id ON message_reactions(user_id);
CREATE INDEX IF NOT EXISTS idx_message_reactions_emoji_id ON message_reactions(emoji_id);