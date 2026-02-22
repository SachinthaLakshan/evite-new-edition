# How to Apply the Invitation System Migration

## Option 1: Via Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Create a new query
4. Copy and paste the following SQL:

```sql
-- Add invitation configuration fields to events table
ALTER TABLE public.events
ADD COLUMN IF NOT EXISTS invitation_config JSONB DEFAULT NULL;

-- Add guest name position to attendees table
ALTER TABLE public.attendees
ADD COLUMN IF NOT EXISTS guest_name_position TEXT DEFAULT 'top',
ADD COLUMN IF NOT EXISTS custom_greeting TEXT DEFAULT NULL;

-- Add comments for documentation
COMMENT ON COLUMN public.events.invitation_config IS 'Stores invitation customization: template_id, couple_names, custom_text, text_positions, styling, guest_name_position';
COMMENT ON COLUMN public.attendees.guest_name_position IS 'Position where guest name appears on invitation: top, bottom, header, center';
COMMENT ON COLUMN public.attendees.custom_greeting IS 'Personalized greeting message for this guest';
```

5. Click **Run** to execute the migration

## Option 2: Via Supabase CLI

If you have Supabase CLI configured and working:

```bash
cd /Users/tharindudamith/Documents/evite-dashboard
npx supabase db push
```

## Option 3: Manual Migration File

The migration file is already created at:
`supabase/migrations/20260221150000_add_invitation_config.sql`

If your Supabase CLI is properly configured, it will be applied automatically when you run:
```bash
npx supabase db reset
```

## Verify Migration

After applying, verify the columns exist:

```sql
-- Check events table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'events' 
AND column_name = 'invitation_config';

-- Check attendees table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'attendees' 
AND column_name IN ('guest_name_position', 'custom_greeting');
```

## Troubleshooting

If you encounter errors:

1. **Column already exists**: Safe to ignore, migration is idempotent
2. **Permission denied**: Ensure you're using the service role key or have proper permissions
3. **Table not found**: Run the initial migration first (`20260221140000_init.sql`)

## After Migration

Once the migration is applied:
1. Start your development server: `npm run dev`
2. Create a new event to test the invitation designer
3. Customize an invitation and save
4. Share a personalized link to see guest names appear

## Need Help?

If you encounter issues:
- Check Supabase logs in the dashboard
- Verify your database connection
- Ensure all previous migrations have been applied
- Contact support with error messages
