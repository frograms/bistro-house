// @vitest-environment happy-dom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import type { HttpOverrideRecord } from "../core";
import { JsonViewer } from "./json-viewer";

const record = (responseBody: string | null): HttpOverrideRecord => ({
  durationMs: 10,
  method: "GET",
  mocked: false,
  ok: true,
  responseBody,
  seq: 1,
  startedAt: 0,
  status: 200,
  url: "https://api.test/users",
});

describe("JsonViewer", () => {
  afterEach(() => {
    cleanup();
  });

  it("잘린 body는 원문과 함께 maxBodyBytes 안내를 띄운다", () => {
    render(<JsonViewer record={record('{"items":[1,2…(truncated)')} />);
    expect(screen.getByText(/maxBodyBytes/)).toBeTruthy();
    expect(screen.getByText(/…\(truncated\)/)).toBeTruthy();
  });

  it("잘리지 않은 비JSON body는 안내 없이 원문만 보여준다", () => {
    render(<JsonViewer record={record("plain text body")} />);
    expect(screen.queryByText(/maxBodyBytes/)).toBeNull();
    expect(screen.getByText("plain text body")).toBeTruthy();
  });
});
