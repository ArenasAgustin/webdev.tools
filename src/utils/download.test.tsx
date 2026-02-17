import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { downloadFile } from "./download";

describe("downloadFile", () => {
  let mockLink: HTMLAnchorElement;
  let clickSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    clickSpy = vi.fn();
    mockLink = {
      href: "",
      download: "",
      click: clickSpy as unknown as () => void,
    } as HTMLAnchorElement;

    vi.spyOn(document, "createElement").mockReturnValue(mockLink as HTMLElement);
    vi.spyOn(document.body, "appendChild").mockReturnValue(mockLink as HTMLElement);
    vi.spyOn(document.body, "removeChild").mockReturnValue(mockLink as HTMLElement);
    vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:mock-url");
    vi.spyOn(URL, "revokeObjectURL");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should download a file with default mime type", () => {
    downloadFile("test content", "test.txt");

    expect(mockLink.download).toBe("test.txt");
    expect(mockLink.href).toBe("blob:mock-url");
    expect(clickSpy).toHaveBeenCalled();
  });

  it("should download a JSON file", () => {
    const json = '{"test": true}';
    downloadFile(json, "data.json", "application/json");

    expect(mockLink.download).toBe("data.json");
    expect(clickSpy).toHaveBeenCalled();
  });

  it("should not download empty content", () => {
    downloadFile("", "empty.txt");
    expect(clickSpy).not.toHaveBeenCalled();
  });

  it("should handle large content", () => {
    const largeContent = "x".repeat(10000000);
    downloadFile(largeContent, "large.txt");

    expect(clickSpy).toHaveBeenCalled();
  });

  it("should append and remove link from DOM", () => {
    const appendSpy = vi.spyOn(document.body, "appendChild");
    const removeSpy = vi.spyOn(document.body, "removeChild");

    downloadFile("content", "test.txt");

    expect(appendSpy).toHaveBeenCalled();
    expect(removeSpy).toHaveBeenCalled();
  });

  it("should revoke object URL after  download", () => {
    const revokeSpy = vi.spyOn(URL, "revokeObjectURL");
    downloadFile("content", "test.txt");

    expect(revokeSpy).toHaveBeenCalledWith("blob:mock-url");
  });

  it("should handle filenames with special characters", () => {
    downloadFile("content", "file-2025.json");
    expect(mockLink.download).toBe("file-2025.json");
  });
});
