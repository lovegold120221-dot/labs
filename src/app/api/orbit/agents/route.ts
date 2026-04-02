import { NextResponse } from 'next/server';
import {
  createAgent,
  createAssistantFromScratch,
  updateAssistant,
  buildAssistantModelConfig,
  buildAssistantTranscriberConfig,
  buildAssistantVoiceConfig,
  createQueryTool,
  createFunctionTool,
  fetchAssistantById,
} from '@/lib/services/orbit';

const KNOWLEDGE_TOOL_NAME = 'knowledge-search';
const EMAIL_TOOL_NAME = 'send_email';
const WHATSAPP_TOOL_NAME = 'send_whatsapp';

function buildSystemPrompt(base: string, hasKnowledgeBase: boolean): string {
  if (!hasKnowledgeBase) return base;
  const instruction = `\n\nYou have a knowledge base with uploaded documents. You MUST use the '${KNOWLEDGE_TOOL_NAME}' tool to search your knowledge base before answering any question that could be answered from those documents. Treat the knowledge base as your primary source of truth—always call '${KNOWLEDGE_TOOL_NAME}' first when users ask about products, services, policies, procedures, or any topic that may be covered in your uploaded files. Do not rely on general knowledge when the answer might be in your documents.`;
  return base.trim() + instruction;
}

function getBaseUrl(request: Request): string {
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host');
  const proto = request.headers.get('x-forwarded-proto') || 'https';
  return host ? `${proto}://${host}` : new URL(request.url).origin;
}

async function createEmailTool(baseUrl: string): Promise<string | null> {
  try {
    const { id: toolId } = await createFunctionTool({
      name: EMAIL_TOOL_NAME,
      description: 'Send an email to a client. Use this when you need to send follow-up information, property details, meeting notes, or any written communication. Requires recipient email address (to), subject line, and message body. Only use after confirming the client\'s email address or having it from context.',
      endpoint: `${baseUrl}/api/tools/email`,
      method: 'POST',
    });
    console.log('[orbit/agents] Created email tool:', toolId);
    return toolId;
  } catch (error) {
    console.error('[orbit/agents] Failed to create email tool:', error);
    return null;
  }
}

async function createWhatsAppTool(baseUrl: string): Promise<string | null> {
  try {
    const { id: toolId } = await createFunctionTool({
      name: WHATSAPP_TOOL_NAME,
      description: 'Send a WhatsApp message to a client. Use this for quick updates, appointment reminders, property alerts, or when the client prefers WhatsApp communication. Requires recipient phone number (to) and message body. Supports optional image attachments via mediaUrl.',
      endpoint: `${baseUrl}/api/tools/whatsapp`,
      method: 'POST',
    });
    console.log('[orbit/agents] Created WhatsApp tool:', toolId);
    return toolId;
  } catch (error) {
    console.error('[orbit/agents] Failed to create WhatsApp tool:', error);
    return null;
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const baseUrl = getBaseUrl(req);
    
    console.log('[orbit/agents] Request body:', {
      assistantId: body.assistantId,
      name: body.name,
      hasSystemPrompt: !!body.systemPrompt,
      hasFirstMessage: !!body.firstMessage,
      language: body.language,
      voice: body.voice
    });

    const fileIds = Array.isArray(body.fileIds) ? body.fileIds.filter((id: unknown) => typeof id === 'string') : [];
    console.log('[orbit/agents] fileIds received:', fileIds);
    let toolIds: string[] = [];

    // Create email tool for all assistants
    const emailToolId = await createEmailTool(baseUrl);
    if (emailToolId) {
      toolIds.push(emailToolId);
    }

    // Create WhatsApp tool for all assistants
    const whatsappToolId = await createWhatsAppTool(baseUrl);
    if (whatsappToolId) {
      toolIds.push(whatsappToolId);
    }

    if (fileIds.length > 0) {
      console.log('[orbit/agents] Creating query tool with fileIds:', fileIds);
      const { id: toolId } = await createQueryTool({
        name: KNOWLEDGE_TOOL_NAME,
        description: 'Contains custom knowledge base documents for answering user questions accurately.',
        fileIds,
      });
      console.log('[orbit/agents] Created tool with ID:', toolId);
      toolIds.push(toolId);
    }

    const systemPrompt = buildSystemPrompt(
      body.systemPrompt || 'You are a helpful AI assistant.',
      toolIds.length > 0
    );

    // Update existing assistant when assistantId is provided
    if (body.assistantId && body.name) {
      const voice = body.voice
        ? { provider: body.voice.provider || '11labs', voiceId: body.voice.voiceId }
        : undefined;
      const existing = await fetchAssistantById(body.assistantId);
      const currentModel = existing?.model as { toolIds?: string[] } | undefined;
      // Merge existing tools with new tools (email tool + knowledge tools)
      const existingToolIds = currentModel?.toolIds || [];
      const mergedToolIds = [...new Set([...existingToolIds, ...toolIds])];
      const result = await updateAssistant(body.assistantId, {
        name: body.name,
        firstMessage: body.firstMessage || undefined,
        firstMessageMode: body.firstMessageMode || undefined,
        model: buildAssistantModelConfig(systemPrompt, mergedToolIds),
        ...(voice && { voice: buildAssistantVoiceConfig(voice) }),
        ...(body.language !== undefined && {
          transcriber: buildAssistantTranscriberConfig(body.language),
        }),
      });
      return NextResponse.json(result);
    }
    // Create from scratch when assistantId is not provided
    if (!body.assistantId && body.name) {
      const result = await createAssistantFromScratch({
        name: body.name,
        firstMessage: body.firstMessage || '',
        firstMessageMode: body.firstMessageMode,
        systemPrompt,
        language: body.language,
        voice: body.voice,
        toolIds: toolIds.length > 0 ? toolIds : undefined,
        ...(body.phoneNumberId && { phoneNumberId: body.phoneNumberId }),
      });
      return NextResponse.json(result);
    }
    // Clone from existing assistant
    console.log('[orbit/agents] Falling through to createAgent clone');
    const result = await createAgent(body);
    return NextResponse.json(result);
  } catch (error: unknown) {
    const raw = error instanceof Error ? error.message : 'Unknown error';
    console.error('[orbit/agents] Error:', raw, error);
    const { toEburonError, eburonJsonResponse } = await import('@/lib/eburon');
    const eburonErr = toEburonError(error);
    const isValidationError = typeof raw === 'string' && (
      raw.includes('must be one of the following values') ||
      raw.includes('Bad Request') ||
      raw.includes('transcriber.provider') ||
      raw.includes('model.provider')
    );
    if (isValidationError) {
      return NextResponse.json(
        { error: 'Invalid agent configuration. Please try again or contact support.', code: eburonErr.code },
        { status: 400 },
      );
    }
    console.error('[orbit/agents]', { code: eburonErr.code, detail: eburonErr.detail });
    return NextResponse.json(...eburonJsonResponse(eburonErr));
  }
}
