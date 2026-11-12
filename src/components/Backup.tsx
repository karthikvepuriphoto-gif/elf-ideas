import { useRef, useState } from "react";
import { useTracker } from "../context/Tracker";
import { exportPayload } from "../lib/storage";

export function BackupControls() {
  const { store, importText } = useTracker();
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  function exportList() {
    const blob = new Blob([JSON.stringify(exportPayload(store), null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `elf-ideas-${store.planYear}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setMessage("Downloaded. Keep that file somewhere safe.");
  }

  function onFile(file: File | undefined) {
    if (!file) return;
    void file.text().then(
      (text) => setPending(text),
      () => setMessage("Couldn’t read that file."),
    );
  }

  function commit() {
    if (pending == null) return;
    try {
      importText(pending);
      setMessage("Imported. This phone now has that list.");
    } catch {
      setMessage("That file isn’t an Elf Ideas list.");
    }
    setPending(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="backup">
      <button type="button" className="secondary" onClick={exportList}>
        Export my list
      </button>
      <button type="button" className="secondary" onClick={() => inputRef.current?.click()}>
        Import my list
      </button>
      <input
        ref={inputRef}
        className="file-input"
        type="file"
        accept="application/json,.json"
        aria-label="Import JSON file"
        onChange={(event) => onFile(event.target.files?.[0])}
      />
      {pending != null && (
        <div className="confirm">
          <p>Replace the list on this phone with this file?</p>
          <div className="row">
            <button type="button" className="primary" onClick={commit}>
              Replace
            </button>
            <button
              type="button"
              className="secondary"
              onClick={() => {
                setPending(null);
                if (inputRef.current) inputRef.current.value = "";
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      {message && <p className="hint">{message}</p>}
    </div>
  );
}
