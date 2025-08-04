-- Fix RLS policy for events table to allow INSERT operations
-- This policy allows authenticated users to create events

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Authenticated users can create events" ON public.events;

-- Policy for inserting events (only admin/super_admin)
CREATE POLICY "Only admins can create events" ON public.events
FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL 
    AND created_by = auth.uid()
    AND EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = auth.uid() 
        AND role IN ('admin', 'super_admin')
        AND is_active = true
    )
);

-- Policy for updating events (only creator or admin can update)
CREATE POLICY "Users can update their own events" ON public.events
FOR UPDATE USING (
    created_by = auth.uid() OR
    EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = auth.uid() 
        AND role IN ('admin', 'super_admin')
        AND is_active = true
    )
) WITH CHECK (
    created_by = auth.uid() OR
    EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = auth.uid() 
        AND role IN ('admin', 'super_admin')
        AND is_active = true
    )
);