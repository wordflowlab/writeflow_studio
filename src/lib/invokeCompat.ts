import { invoke as tauriInvoke } from '@tauri-apps/api/core';

type AnyRecord = Record<string, any> | undefined | null;

const KEY_PAIRS: Array<[string, string]> = [
  ['project_id', 'projectId'],
  ['workspace_id', 'workspaceId'],
  ['document_id', 'documentId'],
  ['project_data', 'projectData'],
  ['workspace_data', 'workspaceData'],
  ['document_data', 'documentData'],
  ['content_type', 'contentType'],
];

function processKeys(obj: Record<string, any> | null | undefined): Record<string, any> | null | undefined {
    if (!obj) return obj;
    const out = { ...obj };
    for (const [snake, camel] of KEY_PAIRS) {
        if (snake in out && !(camel in out)) out[camel] = out[snake];
        if (camel in out && !(snake in out)) out[snake] = out[camel];
    }
    return out;
}

// Recursively expand keys to ensure compatibility
function expand(args: any): any {
    if (Array.isArray(args)) {
        return args.map(item => expand(item));
    }
    if (args && typeof args === 'object' && !(args instanceof Date)) {
        const processed = processKeys(args);
        if (processed) {
            Object.keys(processed).forEach(key => {
                // Avoid recursing into special objects that shouldn't be transformed
                if (key !== 'env' && key !== 'pdf_options' && key !== 'html_options' && key !== 'markdown_options') {
                    processed![key] = expand(processed![key]);
                }
            });
        }
        return processed;
    }
    return args;
}

export async function invoke<T = any>(command:string, args?: AnyRecord): Promise<T> {
  // Special handling for create_document which might not have the root `documentData` key
  if (command === 'create_document') {
    const hasRootKey = args && ('documentData' in args || 'document_data' in args);
    // If the payload looks like document data but isn't wrapped, wrap it.
    if (!hasRootKey && args && ('title' in args || 'content' in args)) {
      const expanded = expand({ documentData: args });
      return await tauriInvoke<T>(command, expanded as any);
    }
  }

  const expanded = expand(args) || undefined;
  return await tauriInvoke<T>(command, expanded as any);
}