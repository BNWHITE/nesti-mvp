import { supabase } from '../lib/supabaseClient';

/**
 * Event Service - Handles calendar events
 * Adapted for existing database schema
 */

/**
 * Create a new event
 */
export const createEvent = async ({ title, description, event_date, event_time, location, category, family_id, created_by, participants = [] }) => {
  try {
    // For now, we'll store events in family_messages with type 'event'
    // This is a workaround until we add an events table
    const eventData = {
      title,
      description,
      event_date,
      event_time,
      location,
      category,
      participants
    };

    const { data, error } = await supabase
      .from('family_messages')
      .insert([{
        family_id,
        sender_id: created_by,
        message_text: JSON.stringify(eventData),
        message_type: 'event'
      }])
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error creating event:', error);
    return { data: null, error };
  }
};

/**
 * Get all events for a family
 */
export const getFamilyEvents = async (family_id) => {
  try {
    const { data, error } = await supabase
      .from('family_messages')
      .select(`
        id,
        message_text,
        created_at,
        sender_id,
        users!family_messages_sender_id_fkey (
          id,
          first_name,
          email,
          role
        )
      `)
      .eq('family_id', family_id)
      .eq('message_type', 'event')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Parse event data from message_text
    const events = data.map(msg => {
      const eventData = JSON.parse(msg.message_text);
      return {
        id: msg.id,
        ...eventData,
        created_by: msg.users,
        created_at: msg.created_at
      };
    });

    return { data: events, error: null };
  } catch (error) {
    console.error('Error fetching family events:', error);
    return { data: [], error };
  }
};

/**
 * Get events for today
 */
export const getTodayEvents = async (family_id) => {
  const today = new Date().toISOString().split('T')[0];
  
  try {
    const { data: allEvents } = await getFamilyEvents(family_id);
    const todayEvents = allEvents.filter(event => event.event_date === today);
    return { data: todayEvents, error: null };
  } catch (error) {
    console.error('Error fetching today events:', error);
    return { data: [], error };
  }
};

/**
 * Get upcoming events
 */
export const getUpcomingEvents = async (family_id, days = 7) => {
  const today = new Date();
  const futureDate = new Date();
  futureDate.setDate(today.getDate() + days);

  try {
    const { data: allEvents } = await getFamilyEvents(family_id);
    const upcomingEvents = allEvents.filter(event => {
      const eventDate = new Date(event.event_date);
      return eventDate >= today && eventDate <= futureDate;
    });
    return { data: upcomingEvents, error: null };
  } catch (error) {
    console.error('Error fetching upcoming events:', error);
    return { data: [], error };
  }
};

/**
 * Update event
 */
export const updateEvent = async (eventId, updates) => {
  try {
    // Get current event data
    const { data: currentEvent } = await supabase
      .from('family_messages')
      .select('message_text')
      .eq('id', eventId)
      .single();

    if (!currentEvent) throw new Error('Event not found');

    const eventData = JSON.parse(currentEvent.message_text);
    const updatedEventData = { ...eventData, ...updates };

    const { data, error } = await supabase
      .from('family_messages')
      .update({ message_text: JSON.stringify(updatedEventData) })
      .eq('id', eventId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error updating event:', error);
    return { data: null, error };
  }
};

/**
 * Delete event
 */
export const deleteEvent = async (eventId) => {
  try {
    const { error } = await supabase
      .from('family_messages')
      .delete()
      .eq('id', eventId);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Error deleting event:', error);
    return { error };
  }
};

/**
 * Add participant to event
 */
export const addEventParticipant = async (eventId, userId) => {
  try {
    const { data: currentEvent } = await supabase
      .from('family_messages')
      .select('message_text')
      .eq('id', eventId)
      .single();

    if (!currentEvent) throw new Error('Event not found');

    const eventData = JSON.parse(currentEvent.message_text);
    const participants = eventData.participants || [];
    
    if (!participants.includes(userId)) {
      participants.push(userId);
      eventData.participants = participants;

      const { error } = await supabase
        .from('family_messages')
        .update({ message_text: JSON.stringify(eventData) })
        .eq('id', eventId);

      if (error) throw error;
    }

    return { error: null };
  } catch (error) {
    console.error('Error adding participant:', error);
    return { error };
  }
};

/**
 * Remove participant from event
 */
export const removeEventParticipant = async (eventId, userId) => {
  try {
    const { data: currentEvent } = await supabase
      .from('family_messages')
      .select('message_text')
      .eq('id', eventId)
      .single();

    if (!currentEvent) throw new Error('Event not found');

    const eventData = JSON.parse(currentEvent.message_text);
    eventData.participants = (eventData.participants || []).filter(id => id !== userId);

    const { error } = await supabase
      .from('family_messages')
      .update({ message_text: JSON.stringify(eventData) })
      .eq('id', eventId);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Error removing participant:', error);
    return { error };
  }
};

export default {
  createEvent,
  getFamilyEvents,
  getTodayEvents,
  getUpcomingEvents,
  updateEvent,
  deleteEvent,
  addEventParticipant,
  removeEventParticipant
};
