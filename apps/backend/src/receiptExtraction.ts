import fs from 'fs';
import Anthropic from '@anthropic-ai/sdk';
import type { ExtractedReceipt } from '@splitcheck/core';
import { env } from './env';

const client = env.ANTHROPIC_API_KEY ? new Anthropic({ apiKey: env.ANTHROPIC_API_KEY }) : null;

const RECEIPT_TOOL = {
  name: 'record_receipt',
  description: 'Record the merchant name, line items, and total extracted from a receipt photo.',
  input_schema: {
    type: 'object' as const,
    properties: {
      merchant: {
        type: ['string', 'null'],
        description: 'Merchant/store name, or null if not legible',
      },
      items: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            priceCents: { type: 'integer', description: 'Price of this line item in cents' },
          },
          required: ['name', 'priceCents'],
        },
      },
      totalCents: {
        type: ['integer', 'null'],
        description: 'Receipt total in cents, or null if not legible',
      },
    },
    required: ['merchant', 'items', 'totalCents'],
  },
};

export async function extractReceiptItems(filePath: string, mimeType: string): Promise<ExtractedReceipt | null> {
  if (!client) return null;

  const base64 = fs.readFileSync(filePath).toString('base64');

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    tools: [RECEIPT_TOOL],
    tool_choice: { type: 'tool', name: 'record_receipt' },
    messages: [
      {
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: mimeType as 'image/jpeg', data: base64 } },
          {
            type: 'text',
            text:
              'Extract the merchant name, every line item with its price, and the total from this receipt photo. ' +
              'All prices must be integer cents (e.g. $4.50 -> 450).',
          },
        ],
      },
    ],
  });

  const toolUse = response.content.find((block) => block.type === 'tool_use');
  if (!toolUse || toolUse.type !== 'tool_use') return null;

  return toolUse.input as ExtractedReceipt;
}
