import { isValidElement, type ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import type { PluginClientContext, PluginTimelineItemProps } from "@getpaseo/plugin/client";
import contribute from "../index.client";
import { AssistantBody, MessageReplacement, UserBody, messageReplacementSchema, type MessageReplacementData } from "./timestamps";

vi.mock("react-native", () => ({ View: "view", Text: "text" }));
vi.mock("@getpaseo/plugin/client/ui", () => ({ Markdown: "host-markdown" }));
vi.mock("@getpaseo/plugin/client/react-native", () => ({ useRevealedText: (text: string, phase: string) => phase === "complete" ? text : text.slice(0, 8) }));

function expand(node: ReactNode): unknown {
  if (!isValidElement(node)) return node;
  const props = node.props as { children?: ReactNode };
  if (typeof node.type === "function") return expand((node.type as (props: unknown) => ReactNode)(props));
  return { type: node.type, props: Object.fromEntries(Object.entries(props).filter(([key]) => key !== "children")), children: expand(props.children) };
}
function props(role: "user" | "assistant", timestamp = new Date("2026-10-26T09:41:00Z")) {
  const data: MessageReplacementData = { role, text: "  Original **message**  ", phase: "complete" };
  return { item: { type: "plugin" as const, kind: "paseo-timestamps-message", version: 1, data }, timestamp, theme: { colors: { foreground: "#eeeeee", foregroundMuted: "#aaaaaa", surface2: "#333333" } }, host: { id: "host", label: "Host" }, layout: { compact: false, platform: "web" } } as PluginTimelineItemProps<MessageReplacementData>;
}

describe("replacement renderers", () => {
  it("keeps user text selectable in its distinct theme-colored, right-aligned bubble, never Markdown", () => {
    const tree = JSON.stringify(expand(<UserBody text="  raw **text**  " theme={props("user").theme} />));
    expect(tree).toContain('"type":"text"');
    expect(tree).toContain('"selectable":true');
    expect(tree).toContain("#333333");
    expect(tree).toContain('"justifyContent":"flex-end"');
    expect(tree).toContain("raw **text**");
    expect(tree).not.toContain("host-markdown");
  });

  it("passes assistant source Markdown through host renderer and reveals streaming text", () => {
    expect(expand(<AssistantBody text="unfinished **markdown" phase="complete" />)).toEqual({ type: "host-markdown", props: {}, children: "unfinished **markdown" });
    expect(expand(<AssistantBody text="unfinished **markdown" phase="streaming" />)).toEqual({ type: "host-markdown", props: {}, children: "unfinish" });
  });

  it("retains the same role body and style while an invalid timestamp omits only the label", () => {
    const source = props("user", new Date("invalid"));
    const tree = JSON.stringify(expand(<MessageReplacement {...source} />));
    expect(tree).toContain("Original **message**");
    expect(tree).toContain("#333333");
    expect(tree).not.toContain("accessibilityLabel");
  });

  it("registers both typed transformers and renderer with reverse cleanup", async () => {
    const removed = [vi.fn(), vi.fn(), vi.fn()];
    const addTimelineTransformer = vi.fn().mockReturnValueOnce(removed[0]).mockReturnValueOnce(removed[1]);
    const addTimelineRenderer = vi.fn().mockReturnValue(removed[2]);
    const cleanup = contribute({ addTimelineTransformer, addTimelineRenderer } as unknown as PluginClientContext);
    expect(addTimelineTransformer.mock.calls.map(([c]) => c.query.itemType)).toEqual(["user_message", "assistant_message"]);
    expect(addTimelineRenderer).toHaveBeenCalledWith(expect.objectContaining({ schema: messageReplacementSchema, Component: MessageReplacement }));
    cleanup();
    expect(removed[2]).toHaveBeenCalledBefore(removed[1]);
    expect(removed[1]).toHaveBeenCalledBefore(removed[0]);
  });
});
