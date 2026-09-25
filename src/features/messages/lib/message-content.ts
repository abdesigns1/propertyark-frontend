const PROPERTY_CONTEXT_PATTERN =
  /^\[\[PROPERTY_CONTEXT:([^:\]]+):([^\]]+)\]\]\n?/;

export interface MessagePropertyContext {
  id: string;
  title: string;
}

export function encodeMessageContent(
  content: string,
  property?: MessagePropertyContext | null,
) {
  if (!property) return content;

  return `[[PROPERTY_CONTEXT:${encodeURIComponent(property.id)}:${encodeURIComponent(property.title)}]]\n${content}`;
}

export function decodeMessageContent(content: string) {
  const match = content.match(PROPERTY_CONTEXT_PATTERN);
  if (!match) return { text: content, property: null };

  try {
    return {
      text: content.replace(PROPERTY_CONTEXT_PATTERN, ""),
      property: {
        id: decodeURIComponent(match[1]),
        title: decodeURIComponent(match[2]),
      },
    };
  } catch {
    return { text: content, property: null };
  }
}
