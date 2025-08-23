-- Script de correction des politiques RLS pour la table messages
-- Date: 2025-01-XX
-- Description: Corrige la politique d'insertion pour les messages

-- Supprimer l'ancienne politique défectueuse
DROP POLICY IF EXISTS "Users can send messages to connections" ON public.messages;

-- Créer la nouvelle politique corrigée
CREATE POLICY "Users can send messages to connections" ON public.messages
    FOR INSERT WITH CHECK (
        sender_id = auth.uid() 
        AND EXISTS (
            SELECT 1 FROM public.connections 
            WHERE ((requester_id = auth.uid() AND recipient_id = messages.recipient_id) 
            OR (recipient_id = auth.uid() AND requester_id = messages.recipient_id))
            AND status = 'accepted'
        )
        AND NOT EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND (is_blocked = TRUE OR is_suspended = TRUE)
        )
        AND NOT EXISTS (
            SELECT 1 FROM public.user_blocks 
            WHERE (blocker_id = auth.uid() AND blocked_id = messages.recipient_id)
            OR (blocker_id = messages.recipient_id AND blocked_id = auth.uid())
        )
    );

-- Ajouter les politiques manquantes pour UPDATE et DELETE si nécessaire
CREATE POLICY "Users can update their own messages" ON public.messages
    FOR UPDATE USING (sender_id = auth.uid());

CREATE POLICY "Users can delete their own messages" ON public.messages
    FOR DELETE USING (sender_id = auth.uid());