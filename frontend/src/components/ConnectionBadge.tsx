import type { ConnectionStatus } from "@/lib/socket";

const labels: Record<ConnectionStatus, string> = {
  connecting: "Connecting…",
  connected: "Live",
  disconnected: "Offline",
  reconnecting: "Reconnecting…",
};

const classes: Record<ConnectionStatus, string> = {
  connecting: "status-connecting",
  connected: "status-connected",
  disconnected: "status-disconnected",
  reconnecting: "status-reconnecting",
};

export function ConnectionBadge({ status }: { status: ConnectionStatus }) {
  return (
    <span className={`connection-badge ${classes[status]}`}>
      <span className="status-dot" />
      {labels[status]}
    </span>
  );
}
