import { supabase } from './supabase';

// ========== CONVERSATIONS ==========

/**
 * Create a new conversation for a user
 */
export const createConversation = async (userId, title = "New Chat") => {
  try {
    const { data, error } = await supabase
      .from('conversations')
      .insert([{ 
        user_id: userId, 
        title: title,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;
    
    return {
      id: data.id,
      title: data.title,
      messages: [],
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  } catch (error) {
    console.error("Error creating conversation:", error);
    throw error;
  }
};

/**
 * Get all conversations for a specific user with their messages
 */
export const getUserConversations = async (userId) => {
  try {
    // Get user's conversations
    const { data: conversations, error: convError } = await supabase
      .from('conversations')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (convError) throw convError;

    // Get messages for each conversation
    const conversationsWithMessages = await Promise.all(
      conversations.map(async (conv) => {
        const { data: messages, error: msgError } = await supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', conv.id)
          .order('created_at', { ascending: true });

        if (msgError) throw msgError;

        return {
          id: conv.id,
          title: conv.title,
          messages: messages.map(msg => ({
            id: msg.id,
            role: msg.role,
            content: msg.content,
            createdAt: new Date(msg.created_at),
            loading: msg.loading || false,
            error: msg.error || false
          })),
          createdAt: new Date(conv.created_at),
          updatedAt: new Date(conv.updated_at)
        };
      })
    );

    return conversationsWithMessages;
  } catch (error) {
    console.error("Error getting conversations:", error);
    throw error;
  }
};

/**
 * Update conversation title
 */
export const updateConversationTitle = async (conversationId, newTitle) => {
  try {
    const { error } = await supabase
      .from('conversations')
      .update({ 
        title: newTitle,
        updated_at: new Date().toISOString()
      })
      .eq('id', conversationId);

    if (error) throw error;
  } catch (error) {
    console.error("Error updating conversation:", error);
    throw error;
  }
};

/**
 * Delete a conversation
 */
export const deleteConversation = async (conversationId) => {
  try {
    // Messages will be auto-deleted due to CASCADE in database
    const { error } = await supabase
      .from('conversations')
      .delete()
      .eq('id', conversationId);

    if (error) throw error;
  } catch (error) {
    console.error("Error deleting conversation:", error);
    throw error;
  }
};

// ========== MESSAGES ==========

/**
 * Add a message to a conversation
 */
export const addMessage = async (conversationId, message) => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .insert([
        {
          conversation_id: conversationId,
          role: message.role, // 'user' or 'bot'
          content: message.content,
          loading: message.loading || false,
          error: message.error || false,
          created_at: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (error) throw error;

    // Update conversation's updated_at timestamp
    await supabase
      .from('conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', conversationId);

    return {
      id: data.id,
      role: data.role,
      content: data.content,
      createdAt: new Date(data.created_at),
      loading: data.loading || false,
      error: data.error || false
    };
  } catch (error) {
    console.error("Error adding message:", error);
    throw error;
  }
};

/**
 * Update a message (e.g., change loading state or edit content)
 */
export const updateMessage = async (messageId, updates) => {
  try {
    const { error } = await supabase
      .from('messages')
      .update(updates)
      .eq('id', messageId);

    if (error) throw error;
  } catch (error) {
    console.error("Error updating message:", error);
    throw error;
  }
};