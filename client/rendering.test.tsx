import { isValidElement, type ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import type { PluginClientContext, PluginTimelineItemProps } from "@getpaseo/plugin/client";
import contribute from "../index.client";
import { AssistantMessage, UserMessage } from "./timestamps";

vi.mock("react-native", () => ({ Text: "native-text", View: "native-view" }));
const { reveal } = vi.hoisted(() => ({ reveal: vi.fn((text: string, _phase: string) => text) }));
vi.mock("@getpaseo/plugin/client/react-native", () => ({ useRevealedText: reveal }));

type Data = { text: string; phase: "streaming" | "complete" };
function fixture(compact: boolean, dark: boolean): PluginTimelineItemProps<Data> {
  return {
    agentId: "fixture",
    timestamp: new Date("2026-10-26T09:41:00Z"),
    item: { type: "plugin", kind: "fixture", version: 1, data: { text: "First\n\nSecond **verbatim**", phase: "streaming" } },
    theme: { colors: dark
      ? { foreground: "#eeeeee", foregroundMuted: "#aaaaaa", surface0: "#111111", surface1: "#222222" }
      : { foreground: "#111111", foregroundMuted: "#555555", surface0: "#ffffff", surface1: "#eeeeee" } },
    layout: { compact },
  } as PluginTimelineItemProps<Data>;
}

// Expand the component tree with mocked native primitives; no browser or host connection.
function expand(node: ReactNode): unknown {
  if (Array.isArray(node)) return node.map(expand);
  if (!isValidElement(node)) return node;
  const props = node.props as { children?: ReactNode };
  if (typeof node.type === "function") {
    return expand((node.type as (props: unknown) => ReactNode)(props));
  }
  return { type: node.type, props: { ...props, children: undefined }, children: expand(props.children) };
}

for (const compact of [false, true]) {
  for (const dark of [false, true]) {
    it(`renders both roles with theme colors, compact=${compact}, dark=${dark}`, () => {
      const props = fixture(compact, dark);
      const user = JSON.stringify(expand(<UserMessage {...props} />));
      const assistant = JSON.stringify(expand(<AssistantMessage {...props} />));
      expect(user).toContain("You");
      expect(assistant).toContain("Assistant");
      expect(user).toContain("flex-end");
      expect(assistant).toContain("flex-start");
      for (const tree of [user, assistant]) {
        expect(tree).toContain(props.theme.colors.foreground);
        expect(tree).toContain(props.theme.colors.foregroundMuted);
        expect(tree).toContain("selectable");
        expect(tree).toContain("First\\n\\nSecond **verbatim**");
        expect(tree).toContain("accessibilityLabel");
        expect(tree).toContain("2026");
        expect(tree).toContain(`"paddingHorizontal":${compact ? 12 : 16}`);
      }
      expect(reveal).toHaveBeenLastCalledWith(props.item.data.text, "streaming");
    });
  }
}

it("forwards completion and removes invalid dates from accessible labels", () => {
  const props = fixture(false, false);
  props.timestamp = new Date("invalid");
  props.item.data.phase = "complete";
  const tree = JSON.stringify(expand(<AssistantMessage {...props} />));
  expect(tree).not.toContain("Invalid Date");
  expect(tree).not.toContain("2026");
  expect(reveal).toHaveBeenLastCalledWith(props.item.data.text, "complete");
});

it("registers both message types and removes all contributions on teardown", async () => {
  const remove = vi.fn();
  const addTimelineTransformer = vi.fn((_registration: { query: { itemType: string } }) => remove);
  const addTimelineRenderer = vi.fn(() => remove);
  const cleanup = contribute({ addTimelineTransformer, addTimelineRenderer } as unknown as PluginClientContext);
  expect(addTimelineTransformer.mock.calls.map(([registration]) => registration.query.itemType)).toEqual(["user_message", "assistant_message"]);
  expect(addTimelineRenderer).toHaveBeenCalledTimes(2);
  await cleanup();
  expect(remove).toHaveBeenCalledTimes(4);
});
