export function getDashboardHtml(): string {
  return `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>claude-schedule</title>
<link rel="icon" type="image/svg+xml" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M4.709 15.955l4.72-2.647.08-.23-.08-.128H9.2l-.79-.048-2.698-.073-2.339-.097-2.266-.122-.571-.121L0 11.784l.055-.352.48-.321.686.06 1.52.103 2.278.158 1.652.097 2.449.255h.389l.055-.157-.134-.098-.103-.097-2.358-1.596-2.552-1.688-1.336-.972-.724-.491-.364-.462-.158-1.008.656-.722.881.06.225.061.893.686 1.908 1.476 2.491 1.833.365.304.145-.103.019-.073-.164-.274-1.355-2.446-1.446-2.49-.644-1.032-.17-.619a2.97 2.97 0 01-.104-.729L6.283.134 6.696 0l.996.134.42.364.62 1.414 1.002 2.229 1.555 3.03.456.898.243.832.091.255h.158V9.01l.128-1.706.237-2.095.23-2.695.08-.76.376-.91.747-.492.584.28.48.685-.067.444-.286 1.851-.559 2.903-.364 1.942h.212l.243-.242.985-1.306 1.652-2.064.73-.82.85-.904.547-.431h1.033l.76 1.129-.34 1.166-1.064 1.347-.881 1.142-1.264 1.7-.79 1.36.073.11.188-.02 2.856-.606 1.543-.28 1.841-.315.833.388.091.395-.328.807-1.969.486-2.309.462-3.439.813-.042.03.049.061 1.549.146.662.036h1.622l3.02.225.79.522.474.638-.079.485-1.215.62-1.64-.389-3.829-.91-1.312-.329h-.182v.11l1.093 1.068 2.006 1.81 2.509 2.33.127.578-.322.455-.34-.049-2.205-1.657-.851-.747-1.926-1.62h-.128v.17l.444.649 2.345 3.521.122 1.08-.17.353-.608.213-.668-.122-1.374-1.925-1.415-2.167-1.143-1.943-.14.08-.674 7.254-.316.37-.729.28-.607-.461-.322-.747.322-1.476.389-1.924.315-1.53.286-1.9.17-.632-.012-.042-.14.018-1.434 1.967-2.18 2.945-1.726 1.845-.414.164-.717-.37.067-.662.401-.589 2.388-3.036 1.44-1.882.93-1.086-.006-.158h-.055L4.132 18.56l-1.13.146-.487-.456.061-.746.231-.243 1.908-1.312-.006.006z' fill='%23D97757' fill-rule='nonzero'/%3E%3C/svg%3E" />
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    background: #0a0a0a;
    color: #e5e5e5;
    min-height: 100vh;
  }

  header {
    border-bottom: 1px solid #262626;
    padding: 16px 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  header h1 {
    font-size: 18px;
    font-weight: 600;
    color: #fff;
  }

  header h1 span { color: #d4a574; }

  .btn {
    padding: 8px 16px;
    border: 1px solid #333;
    border-radius: 6px;
    background: #1a1a1a;
    color: #e5e5e5;
    cursor: pointer;
    font-size: 13px;
    transition: background 0.15s, border-color 0.15s;
  }

  .btn:hover { background: #262626; border-color: #444; }
  .btn-primary { background: #d4a574; color: #0a0a0a; border-color: #d4a574; font-weight: 600; }
  .btn-primary:hover { background: #c4956a; border-color: #c4956a; }
  .btn-danger { color: #ef4444; border-color: #7f1d1d; }
  .btn-danger:hover { background: #1c0a0a; border-color: #ef4444; }
  .btn-sm { padding: 4px 10px; font-size: 12px; }

  main { padding: 24px; max-width: 1200px; margin: 0 auto; }

  .empty-state {
    text-align: center;
    padding: 64px 24px;
    color: #737373;
  }

  .empty-state p { margin-bottom: 16px; font-size: 15px; }

  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
    gap: 16px;
  }

  .card {
    background: #141414;
    border: 1px solid #262626;
    border-radius: 10px;
    padding: 20px;
    transition: border-color 0.15s;
    display: flex;
    flex-direction: column;
  }

  .card:hover { border-color: #404040; }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }

  .card-name {
    font-size: 16px;
    font-weight: 600;
    color: #fff;
    word-break: break-all;
  }

  .btn-run {
    padding: 6px 14px;
    background: #d4a574;
    color: #0a0a0a;
    border: none;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    flex-shrink: 0;
    margin-left: 8px;
    transition: background 0.15s;
  }

  .btn-run:hover { background: #c4956a; }

  .card-footer {
    display: flex;
    justify-content: flex-end;
    gap: 6px;
    margin-top: auto;
    padding-top: 10px;
    border-top: 1px solid #262626;
  }

  .card-field {
    margin-bottom: 8px;
    font-size: 13px;
    line-height: 1.5;
  }

  .card-field .label {
    color: #737373;
    margin-right: 6px;
  }

  .card-prompt {
    background: #1a1a1a;
    border: 1px solid #262626;
    border-radius: 6px;
    padding: 10px 12px;
    font-size: 13px;
    line-height: 1.5;
    margin-top: 8px;
    white-space: pre-wrap;
    word-break: break-word;
    max-height: 60px;
    overflow: hidden;
    cursor: pointer;
    position: relative;
  }

  .card-prompt::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 24px;
    background: linear-gradient(transparent, #1a1a1a);
    pointer-events: none;
  }

  /* Build History */
  .build-history {
    margin-top: 12px;
    border-top: 1px solid #262626;
    padding-top: 10px;
  }

  .build-history-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
  }

  .build-history-header .section-label {
    font-size: 11px;
  }

  .build-history-header a {
    font-size: 11px;
    color: #737373;
    text-decoration: none;
    cursor: pointer;
  }

  .build-history-header a:hover { color: #d4a574; }

  .build-list {
    list-style: none;
    min-height: 130px;
  }

  .build-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 4px 0;
    font-size: 12px;
    cursor: pointer;
    border-radius: 4px;
    transition: background 0.1s;
  }

  .build-item:hover { background: #1a1a1a; }

  .build-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .build-dot.success { background: #22c55e; }
  .build-dot.failure { background: #ef4444; }
  .build-dot.running { background: transparent; }

  .spinner-sm {
    display: inline-block;
    width: 8px;
    height: 8px;
    border: 1.5px solid rgba(212, 165, 116, 0.3);
    border-top-color: #d4a574;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .running-text {
    color: #d4a574;
    font-weight: 500;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.4; }
  }

  .build-cancel {
    color: #525252;
    font-size: 11px;
    cursor: pointer;
    padding: 0 4px;
    border-radius: 3px;
    flex-shrink: 0;
  }

  .build-cancel:hover {
    color: #ef4444;
    background: rgba(239, 68, 68, 0.1);
  }

  .build-number {
    color: #a3a3a3;
    font-weight: 600;
    min-width: 28px;
  }

  .build-time {
    color: #737373;
    flex: 1;
  }

  .build-duration {
    color: #525252;
    font-size: 11px;
  }

  .build-trigger {
    font-size: 10px;
    padding: 1px 5px;
    border-radius: 3px;
    background: #1a1a1a;
    color: #737373;
    border: 1px solid #333;
  }

  .no-builds {
    font-size: 12px;
    color: #525252;
    padding: 4px 0;
    min-height: 130px;
    display: flex;
    align-items: center;
  }

  /* Modal */
  .modal-overlay {
    display: none;
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.6);
    z-index: 100;
    justify-content: center;
    align-items: center;
  }

  .modal-overlay.active { display: flex; }

  .modal {
    background: #141414;
    border: 1px solid #262626;
    border-radius: 12px;
    width: 90%;
    max-width: 560px;
    max-height: 85vh;
    overflow-y: auto;
    overflow-x: hidden;
    padding: 24px;
  }

  .modal-lg { max-width: 720px; }

  .modal h2 {
    font-size: 18px;
    margin-bottom: 20px;
    color: #fff;
  }

  .form-group {
    margin-bottom: 16px;
  }

  .form-group label {
    display: block;
    font-size: 13px;
    color: #a3a3a3;
    margin-bottom: 6px;
  }

  .form-group input,
  .form-group textarea {
    width: 100%;
    padding: 8px 12px;
    background: #1a1a1a;
    border: 1px solid #333;
    border-radius: 6px;
    color: #e5e5e5;
    font-size: 14px;
    font-family: inherit;
  }

  .form-group textarea { resize: vertical; min-height: 280px; }
  .form-group input:focus, .form-group textarea:focus {
    outline: none;
    border-color: #d4a574;
  }

  .cron-preview {
    margin-top: 6px;
    font-size: 13px;
    color: #737373;
    min-height: 20px;
  }

  .cron-preview.ok { color: #22c55e; }
  .cron-preview.err { color: #ef4444; }

  .modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    margin-top: 20px;
  }

  /* Run output */
  .run-output {
    background: #0a0a0a;
    border: 1px solid #262626;
    border-radius: 6px;
    padding: 12px;
    font-family: "SF Mono", "Fira Code", monospace;
    font-size: 12px;
    line-height: 1.6;
    white-space: pre-wrap;
    word-break: break-word;
    max-height: 400px;
    overflow-y: auto;
    color: #d4d4d4;
  }

  .log-line { margin: 0; }
  .log-ts { color: #525252; }
  .log-tag-thinking { color: #737373; font-style: italic; }
  .log-tag-tool_use { color: #d4a574; font-weight: 600; }
  .log-tag-tool_result { color: #8b8b8b; }
  .log-tag-text { color: #22c55e; }
  .log-tag-system { color: #60a5fa; }
  .log-tag-error { color: #ef4444; font-weight: 600; }
  .log-content-thinking { color: #8b8b8b; font-style: italic; }
  .log-content-tool_use { color: #d4a574; }
  .log-content-tool_result { color: #737373; }
  .log-content-text { color: #e0e0e0; }
  .log-content-system { color: #60a5fa; }
  .log-content-error { color: #ef4444; }

  .run-status {
    margin-bottom: 12px;
    font-size: 13px;
  }

  .run-status.running { color: #d4a574; }
  .run-status.done { color: #22c55e; }
  .run-status.failed { color: #ef4444; }

  /* Logs */
  .logs-content {
    background: #0a0a0a;
    border: 1px solid #262626;
    border-radius: 6px;
    padding: 12px;
    font-family: "SF Mono", "Fira Code", monospace;
    font-size: 12px;
    line-height: 1.6;
    white-space: pre-wrap;
    word-break: break-word;
    max-height: 500px;
    overflow-y: auto;
    color: #d4d4d4;
  }

  /* Run detail */
  .run-detail-meta {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 6px 16px;
    margin-bottom: 16px;
    font-size: 13px;
  }

  .run-detail-meta dt {
    color: #737373;
    font-weight: 500;
  }

  .run-detail-meta dd {
    color: #e5e5e5;
  }

  .status-badge {
    display: inline-block;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 600;
  }

  .status-badge.success { background: #052e16; color: #22c55e; }
  .status-badge.failure { background: #2a0a0a; color: #ef4444; }
  .status-badge.running { background: #1c1006; color: #d4a574; }

  /* Confirm dialog */
  .confirm-text {
    font-size: 15px;
    margin-bottom: 20px;
    line-height: 1.5;
  }

  .spinner {
    display: inline-block;
    width: 14px;
    height: 14px;
    border: 2px solid #333;
    border-top-color: #d4a574;
    border-radius: 50%;
    animation: spin 0.6s linear infinite;
    vertical-align: middle;
    margin-right: 6px;
  }

  .slack-badge {
    display: inline-block;
    font-size: 11px;
    font-weight: 600;
    padding: 2px 8px;
    border-radius: 4px;
    background: #1a1a2e;
    color: #e0a3ff;
    border: 1px solid #3a2a4a;
  }

  .slack-status {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    color: #a3a3a3;
  }

  .slack-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    display: inline-block;
  }

  .slack-dot.connected { background: #22c55e; }
  .slack-dot.disconnected { background: #ef4444; }

  .gmail-badge {
    display: inline-block;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 11px;
    font-weight: 600;
    background: #1a1206;
    color: #d4a574;
    border: 1px solid #3d2e10;
  }

  .header-actions { display: flex; gap: 8px; align-items: center; }

  .gmail-status {
    font-size: 12px;
    color: #737373;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .gmail-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    display: inline-block;
  }

  .gmail-dot.connected { background: #22c55e; }
  .gmail-dot.disconnected { background: #ef4444; }

  .autocomplete-wrap {
    position: relative;
  }

  .autocomplete-list {
    display: none;
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    max-height: 200px;
    overflow-y: auto;
    background: #1a1a1a;
    border: 1px solid #333;
    border-top: none;
    border-radius: 0 0 6px 6px;
    list-style: none;
    margin: 0;
    padding: 0;
    z-index: 100;
  }

  .autocomplete-list.open {
    display: block;
  }

  .autocomplete-list li {
    padding: 8px 12px;
    cursor: pointer;
    font-size: 13px;
    font-family: 'SF Mono', monospace;
    color: #e0e0e0;
  }

  .autocomplete-list li:hover,
  .autocomplete-list li.active {
    background: #2a2a2a;
    color: #d4a574;
  }

  .form-group-inline {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 16px;
  }

  .form-group-inline input[type="checkbox"] {
    width: 16px;
    height: 16px;
    accent-color: #d4a574;
  }

  .form-group-inline label {
    font-size: 13px;
    color: #a3a3a3;
    cursor: pointer;
  }

  .form-group-inline .hint {
    font-size: 11px;
    color: #525252;
    margin-left: auto;
  }

  .section-label {
    font-size: 12px;
    font-weight: 600;
    color: #a3a3a3;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  /* Prompt History */
  .prompt-history-link {
    font-size: 11px;
    color: #737373;
    text-decoration: none;
    cursor: pointer;
    margin-top: 4px;
    display: inline-block;
  }

  .prompt-history-link:hover { color: #d4a574; }

  .version-list {
    list-style: none;
    max-height: 500px;
    overflow-y: auto;
  }

  .version-item {
    padding: 12px;
    border: 1px solid #262626;
    border-radius: 6px;
    margin-bottom: 8px;
    background: #1a1a1a;
  }

  .version-item:hover { border-color: #404040; }

  .version-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
    font-size: 12px;
  }

  .version-meta .version-number {
    font-weight: 600;
    color: #a3a3a3;
  }

  .version-meta .version-time {
    color: #525252;
  }

  .version-prompt {
    font-size: 13px;
    line-height: 1.5;
    word-break: break-word;
    color: #d4d4d4;
  }

  .diff-line {
    font-family: 'SF Mono', 'Menlo', 'Monaco', 'Courier New', monospace;
    font-size: 12px;
    line-height: 1.6;
    padding: 1px 8px;
    white-space: pre-wrap;
    word-break: break-word;
  }

  .diff-add {
    background: #052e16;
    color: #4ade80;
  }

  .diff-del {
    background: #2a0a0a;
    color: #f87171;
  }

  .diff-ctx {
    color: #737373;
  }

  .diff-sep {
    color: #525252;
    font-size: 11px;
    padding: 2px 8px;
    user-select: none;
  }

  .version-actions {
    margin-top: 8px;
    display: flex;
    justify-content: flex-end;
  }

  @keyframes spin { to { transform: rotate(360deg); } }

  /* Tab Navigation */
  .tab-nav {
    display: flex;
    gap: 0;
    border-bottom: 1px solid #262626;
    padding: 0 24px;
    background: #0a0a0a;
  }

  .tab-btn {
    padding: 10px 20px;
    background: none;
    border: none;
    border-bottom: 2px solid transparent;
    color: #737373;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: color 0.15s, border-color 0.15s;
  }

  .tab-btn:hover { color: #e5e5e5; }
  .tab-btn.active { color: #d4a574; border-bottom-color: #d4a574; }

  .tab-btn .badge {
    display: inline-block;
    background: #22c55e;
    color: #0a0a0a;
    font-size: 10px;
    font-weight: 700;
    padding: 1px 6px;
    border-radius: 10px;
    margin-left: 6px;
    min-width: 18px;
    text-align: center;
  }

  .tab-btn .badge.zero { background: #404040; color: #737373; }

  /* Console */
  .console-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }

  .console-toolbar .section-label { font-size: 14px; }

  .status-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
    display: inline-block;
  }

  .status-dot.active { background: #22c55e; box-shadow: 0 0 6px #22c55e80; }
  .status-dot.idle { background: #eab308; }
  .status-dot.ended { background: #525252; }

  /* Session Group */
  .session-group {
    margin-bottom: 20px;
  }

  .session-group-header {
    font-size: 12px;
    font-weight: 600;
    color: #737373;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    padding: 0 0 8px 0;
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    user-select: none;
  }

  .session-group-header:hover { color: #a3a3a3; }

  .session-group-header .group-count {
    font-weight: 400;
    color: #525252;
  }

  .session-group-header .chevron {
    font-size: 10px;
    transition: transform 0.15s;
    color: #525252;
  }

  .session-group-header .chevron.collapsed {
    transform: rotate(-90deg);
  }

  /* Session Table */
  .session-table {
    width: 100%;
    table-layout: fixed;
    border-collapse: separate;
    border-spacing: 0;
    background: #141414;
    border: 1px solid #262626;
    border-radius: 10px;
    overflow: hidden;
  }

  .session-table th {
    text-align: left;
    font-size: 11px;
    font-weight: 500;
    color: #525252;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    padding: 10px 16px;
    border-bottom: 1px solid #262626;
    background: #0f0f0f;
  }

  .session-table td {
    padding: 12px 16px;
    font-size: 13px;
    border-bottom: 1px solid #1e1e1e;
    vertical-align: middle;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .session-table tr:last-child td {
    border-bottom: none;
  }

  .session-table tr {
    cursor: pointer;
    transition: background 0.1s;
  }

  .session-table tbody tr:hover {
    background: #1a1a1a;
  }

  /* Active row left accent */
  .session-row-active td:first-child {
    box-shadow: inset 3px 0 0 #22c55e;
  }

  .session-row-idle td:first-child {
    box-shadow: inset 3px 0 0 #eab308;
  }

  .session-title-cell {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .session-title-text {
    font-weight: 600;
    color: #fff;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 240px;
  }

  .session-model-badge {
    font-size: 10px;
    color: #737373;
    background: #1a1a1a;
    padding: 2px 6px;
    border-radius: 3px;
    white-space: nowrap;
    flex-shrink: 0;
  }

  .session-dir-cell {
    font-family: 'SF Mono', 'Menlo', monospace;
    font-size: 12px;
    color: #a3a3a3;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 260px;
  }

  .session-summary-cell {
    color: #737373;
    font-size: 12px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 300px;
  }

  .session-count-cell {
    text-align: center;
    color: #a3a3a3;
    font-size: 12px;
  }

  .session-time-cell {
    color: #525252;
    font-size: 12px;
    white-space: nowrap;
    text-align: right;
  }

  .btn-dismiss {
    background: none;
    border: none;
    color: #525252;
    font-size: 16px;
    cursor: pointer;
    padding: 2px 6px;
    border-radius: 4px;
    line-height: 1;
    transition: color 0.15s, background 0.15s;
  }

  .btn-dismiss:hover {
    color: #ef4444;
    background: #1c0a0a;
  }

  .session-detail-prompts {
    list-style: none;
    max-height: 340px;
    overflow-y: auto;
  }

  .session-detail-prompts li {
    padding: 10px 12px;
    border: 1px solid #262626;
    border-radius: 6px;
    margin-bottom: 6px;
    background: #1a1a1a;
  }

  .session-detail-prompts li .prompt-time {
    font-size: 11px;
    color: #525252;
    margin-bottom: 4px;
  }

  .session-detail-prompts li .prompt-text {
    font-size: 13px;
    color: #d4d4d4;
    line-height: 1.5;
    word-break: break-word;
    white-space: pre-wrap;
  }

  .session-last-response {
    background: #1a1a1a;
    border: 1px solid #262626;
    border-radius: 6px;
    padding: 10px 12px;
    font-size: 12px;
    line-height: 1.5;
    color: #a3a3a3;
    white-space: pre-wrap;
    word-break: break-word;
  }

  .console-empty {
    text-align: center;
    padding: 64px 24px;
    color: #525252;
  }

  .console-empty p { margin-bottom: 8px; }
</style>
</head>
<body>

<header>
  <h1>claude-<span>schedule</span></h1>
  <div class="header-actions">
    <div class="slack-status" id="slackStatus"></div>
    <button class="btn" id="slackBtn" onclick="openSlackModal()">Connect Slack</button>
    <div class="gmail-status" id="gmailStatus"></div>
    <button class="btn" id="gmailBtn" onclick="openGmailModal()">Connect Gmail</button>
    <button class="btn btn-primary" onclick="openAddModal()">+ Add Schedule</button>
  </div>
</header>

<nav class="tab-nav">
  <button class="tab-btn active" onclick="switchTab('schedules')">Schedules</button>
  <button class="tab-btn" onclick="switchTab('console')">Console <span class="badge zero" id="activeSessionBadge">0</span></button>
</nav>

<main>
  <div id="tab-schedules" class="tab-panel">
    <div id="content"></div>
  </div>
  <div id="tab-console" class="tab-panel" style="display:none;">
    <div id="console-content"></div>
  </div>
</main>

<!-- Add Schedule Modal -->
<div class="modal-overlay" id="addModal">
  <div class="modal modal-lg">
    <h2>Add Schedule</h2>
    <div class="form-group">
      <label for="addName">Name</label>
      <input id="addName" placeholder="daily-report" />
    </div>
    <div class="form-group">
      <label for="addAt">Schedule (natural language)</label>
      <input id="addAt" placeholder='매일 오후 6시 반' />
      <div class="cron-preview" id="cronPreview"></div>
    </div>
    <div class="form-group">
      <label for="addPrompt">Prompt</label>
      <textarea id="addPrompt" placeholder="What should Claude do?"></textarea>
    </div>
    <div class="form-group">
      <label for="addDir">Working Directory (optional)</label>
      <div class="autocomplete-wrap">
        <input id="addDir" placeholder="~/Projects/my-app" autocomplete="off" />
        <ul class="autocomplete-list" id="addDirList"></ul>
      </div>
    </div>
    <div class="form-group-inline">
      <input type="checkbox" id="addUseGmail" />
      <label for="addUseGmail">Enable Gmail</label>
      <span class="hint" id="addGmailHint"></span>
    </div>
    <div class="form-group-inline">
      <input type="checkbox" id="addUseSlack" />
      <label for="addUseSlack">Enable Slack</label>
      <span class="hint" id="addSlackHint"></span>
    </div>
    <div class="modal-footer">
      <button class="btn" onclick="previewCron()">Preview Cron</button>
      <button class="btn" onclick="closeModal('addModal')">Cancel</button>
      <button class="btn btn-primary" id="addSubmitBtn" onclick="submitAdd()">Add</button>
    </div>
  </div>
</div>

<!-- Edit Schedule Modal -->
<div class="modal-overlay" id="editModal">
  <div class="modal modal-lg">
    <h2>Edit Schedule</h2>
    <input type="hidden" id="editName" />
    <div class="form-group">
      <label>Name</label>
      <input id="editNameDisplay" disabled style="opacity:0.5" />
    </div>
    <div class="form-group">
      <label for="editAt">Schedule (natural language)</label>
      <input id="editAt" placeholder='매일 오후 6시 반' />
      <div class="cron-preview" id="editCronPreview"></div>
    </div>
    <div class="form-group">
      <label for="editPrompt">Prompt</label>
      <textarea id="editPrompt" placeholder="What should Claude do?"></textarea>
    </div>
    <div class="form-group">
      <label for="editDir">Working Directory</label>
      <div class="autocomplete-wrap">
        <input id="editDir" placeholder="~/Projects/my-app" autocomplete="off" />
        <ul class="autocomplete-list" id="editDirList"></ul>
      </div>
    </div>
    <div class="form-group-inline">
      <input type="checkbox" id="editUseGmail" />
      <label for="editUseGmail">Enable Gmail</label>
      <span class="hint" id="editGmailHint"></span>
    </div>
    <div class="form-group-inline">
      <input type="checkbox" id="editUseSlack" />
      <label for="editUseSlack">Enable Slack</label>
      <span class="hint" id="editSlackHint"></span>
    </div>
    <div class="modal-footer">
      <button class="btn" onclick="previewEditCron()">Preview Cron</button>
      <button class="btn" onclick="closeModal('editModal')">Cancel</button>
      <button class="btn btn-primary" id="editSubmitBtn" onclick="submitEdit()">Save</button>
    </div>
  </div>
</div>

<!-- Run Output Modal -->
<div class="modal-overlay" id="runModal">
  <div class="modal modal-lg">
    <h2 id="runTitle">Running...</h2>
    <div class="section-label" style="margin-bottom:8px;">Live Output</div>
    <div class="run-status running" id="runStatus"><span class="spinner"></span> Running...</div>
    <div class="run-output" id="runOutput"></div>
    <div class="modal-footer">
      <button class="btn btn-danger" id="cancelRunBtn" onclick="cancelCurrentRun()">Cancel Run</button>
      <button class="btn" onclick="closeModal('runModal')">Close</button>
    </div>
  </div>
</div>

<!-- Run Detail Modal -->
<div class="modal-overlay" id="runDetailModal">
  <div class="modal modal-lg">
    <h2 id="runDetailTitle">Run Detail</h2>
    <dl class="run-detail-meta" id="runDetailMeta"></dl>
    <div class="section-label" style="margin-bottom:8px;">Output</div>
    <div class="run-output" id="runDetailOutput">Loading...</div>
    <div class="modal-footer">
      <button class="btn" onclick="closeModal('runDetailModal')">Close</button>
    </div>
  </div>
</div>

<!-- Logs Modal -->
<div class="modal-overlay" id="logsModal">
  <div class="modal modal-lg">
    <h2 id="logsTitle">Logs</h2>
    <div class="logs-content" id="logsContent">Loading...</div>
    <div class="modal-footer">
      <button class="btn" onclick="closeModal('logsModal')">Close</button>
    </div>
  </div>
</div>

<!-- Prompt Edit Modal -->
<div class="modal-overlay" id="promptModal">
  <div class="modal modal-lg">
    <h2 id="promptTitle">Prompt</h2>
    <input type="hidden" id="promptEditName" />
    <div class="form-group">
      <textarea id="promptContent" style="min-height:40vh;"></textarea>
    </div>
    <div class="modal-footer">
      <button class="btn" onclick="viewPromptHistoryFromEdit()" style="margin-right:auto;">History</button>
      <button class="btn" onclick="closeModal('promptModal')">Cancel</button>
      <button class="btn btn-primary" id="promptSaveBtn" onclick="savePrompt()">Save</button>
    </div>
  </div>
</div>

<!-- Prompt History Modal -->
<div class="modal-overlay" id="promptHistoryModal">
  <div class="modal modal-lg">
    <h2 id="promptHistoryTitle">Prompt History</h2>
    <div id="promptHistoryContent"><div class="no-builds">Loading...</div></div>
    <div class="modal-footer">
      <button class="btn" onclick="closeModal('promptHistoryModal')">Close</button>
    </div>
  </div>
</div>

<!-- Confirm Delete Modal -->
<div class="modal-overlay" id="confirmModal">
  <div class="modal" style="max-width: 400px;">
    <h2>Delete Schedule</h2>
    <p class="confirm-text" id="confirmText"></p>
    <div class="modal-footer">
      <button class="btn" onclick="closeModal('confirmModal')">Cancel</button>
      <button class="btn btn-danger" id="confirmBtn" onclick="confirmDelete()">Delete</button>
    </div>
  </div>
</div>

<!-- Gmail Connect Modal -->
<div class="modal-overlay" id="gmailModal">
  <div class="modal" style="max-width: 460px;">
    <h2 id="gmailModalTitle">Connect Gmail</h2>
    <div id="gmailFormSection">
      <div class="form-group">
        <label for="gmailEmail">Gmail Address</label>
        <input id="gmailEmail" type="email" placeholder="you@gmail.com" />
      </div>
      <div class="form-group">
        <label for="gmailAppPassword">App Password</label>
        <input id="gmailAppPassword" type="password" placeholder="xxxx xxxx xxxx xxxx" />
      </div>
      <div style="font-size:12px;color:#525252;margin-bottom:16px;">
        Generate an App Password at Google Account &gt; Security &gt; 2-Step Verification &gt; App passwords.
      </div>
      <div class="modal-footer">
        <button class="btn" onclick="closeModal('gmailModal')">Cancel</button>
        <button class="btn btn-primary" id="gmailConnectBtn" onclick="connectGmail()">Test &amp; Connect</button>
      </div>
    </div>
    <div id="gmailConnectedSection" style="display:none;">
      <p style="font-size:14px;margin-bottom:8px;">Connected as:</p>
      <p style="font-size:16px;font-weight:600;color:#fff;margin-bottom:20px;" id="gmailConnectedEmail"></p>
      <div class="modal-footer">
        <button class="btn" onclick="closeModal('gmailModal')">Close</button>
        <button class="btn btn-danger" id="gmailDisconnectBtn" onclick="disconnectGmail()">Disconnect</button>
      </div>
    </div>
  </div>
</div>

<!-- Slack Connect Modal -->
<div class="modal-overlay" id="slackModal">
  <div class="modal" style="max-width: 460px;">
    <h2 id="slackModalTitle">Connect Slack</h2>
    <div id="slackFormSection">
      <div class="form-group">
        <label for="slackWebhookUrl">Incoming Webhook URL</label>
        <input id="slackWebhookUrl" type="text" placeholder="https://hooks.slack.com/services/T.../B.../..." />
      </div>
      <div class="form-group">
        <label for="slackChannelName">Channel Name (for display)</label>
        <input id="slackChannelName" type="text" placeholder="#general" />
      </div>
      <div style="font-size:12px;color:#525252;margin-bottom:16px;">
        Slack App &gt; Incoming Webhooks &gt; Activate &gt; Add New Webhook to Workspace &gt; select channel &gt; copy URL.
      </div>
      <div class="modal-footer">
        <button class="btn" onclick="closeModal('slackModal')">Cancel</button>
        <button class="btn btn-primary" id="slackConnectBtn" onclick="connectSlack()">Test &amp; Connect</button>
      </div>
    </div>
    <div id="slackConnectedSection" style="display:none;">
      <p style="font-size:14px;margin-bottom:8px;">Connected to:</p>
      <p style="font-size:16px;font-weight:600;color:#fff;margin-bottom:20px;" id="slackConnectedChannel"></p>
      <div class="modal-footer">
        <button class="btn" onclick="closeModal('slackModal')">Close</button>
        <button class="btn btn-danger" id="slackDisconnectBtn" onclick="disconnectSlack()">Disconnect</button>
      </div>
    </div>
  </div>
</div>

<!-- Session Detail Modal -->
<div class="modal-overlay" id="sessionDetailModal">
  <div class="modal modal-lg">
    <h2 id="sessionDetailTitle">Session Detail</h2>
    <div id="sessionDetailMeta"></div>
    <div id="sessionDetailBody"></div>
    <div id="resumeCmdWrap" style="background:#0f0f0f;border:1px solid #262626;border-radius:6px;padding:8px 12px;margin-top:16px;">
      <div style="display:flex;align-items:center;gap:10px;">
        <div style="min-width:0;flex:1;overflow:hidden;">
          <code style="font-size:12px;color:#a3a3a3;display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" id="resumeCmdText"></code>
        </div>
        <button class="btn btn-sm" onclick="copyResumeCmd()" id="copyResumeBtn" style="flex-shrink:0;">복사</button>
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-primary" id="resumeBtn" onclick="resumeSession()" style="margin-right:auto;">Resume in Terminal</button>
      <button class="btn" onclick="closeModal('sessionDetailModal')">Close</button>
    </div>
  </div>
</div>

<script>
let schedules = [];
let deleteTarget = null;
let buildHistoryCache = {};
let gmailConnected = false;
let gmailEmail = null;
let slackConnected = false;
let slackChannel = null;

async function api(path, opts = {}) {
  const res = await fetch(path, {
    headers: { 'Content-Type': 'application/json' },
    ...opts,
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || res.statusText);
  }
  if (res.headers.get('content-type')?.includes('json')) {
    return res.json();
  }
  return res;
}

async function loadSchedules() {
  try {
    schedules = await api('/api/schedules');
    render();
    loadAllBuildHistories();
  } catch (err) {
    document.getElementById('content').innerHTML =
      '<div class="empty-state"><p>Failed to load schedules: ' + escapeHtml(err.message) + '</p></div>';
  }
}

async function loadAllBuildHistories() {
  for (const s of schedules) {
    loadBuildHistory(s.name);
  }
}

async function loadBuildHistory(name) {
  try {
    const data = await api('/api/schedules/' + encodeURIComponent(name) + '/runs?limit=5');
    buildHistoryCache[name] = data;
    renderBuildHistory(name, data);
  } catch {
    renderBuildHistory(name, { runs: [], total: 0 });
  }
}

function renderBuildHistory(name, data) {
  const el = document.getElementById('history-' + CSS.escape(name));
  if (!el) return;

  if (data.runs.length === 0) {
    el.innerHTML = '<div class="no-builds">No build history yet.</div>';
    return;
  }

  let html = '<ul class="build-list">';
  for (const run of data.runs) {
    const time = formatTime(run.startedAt);
    const isRunning = run.status === 'running';
    const dur = isRunning
      ? formatDuration(Date.now() - new Date(run.startedAt).getTime())
      : (run.durationMs !== null ? formatDuration(run.durationMs) : '...');
    const clickFn = isRunning ? 'openLiveOutput' : 'viewRunDetail';
    const cancelBtn = isRunning
      ? '<span class="build-cancel" onclick="event.stopPropagation();cancelRunByKey(\\'' + escapeAttr(name) + '\\',' + run.number + ')" title="Cancel">✕</span>'
      : '';
    html += '<li class="build-item" onclick="' + clickFn + '(\\'' + escapeAttr(name) + '\\',' + run.number + ')">' +
      (isRunning ? '<span class="build-dot running"><span class="spinner-sm"></span></span>' : '<span class="build-dot ' + run.status + '"></span>') +
      '<span class="build-number">#' + run.number + '</span>' +
      '<span class="build-trigger">' + run.trigger + '</span>' +
      '<span class="build-time">' + escapeHtml(time) + '</span>' +
      '<span class="build-duration">' + (isRunning ? '<span class="running-text">' + escapeHtml(dur) + '</span>' : escapeHtml(dur)) + '</span>' +
      cancelBtn +
    '</li>';
  }
  html += '</ul>';

  if (data.total > 5) {
    html += '<div style="margin-top:4px;"><a class="build-history-header" style="font-size:11px;color:#737373;cursor:pointer;" onclick="viewAllRuns(\\'' + escapeAttr(name) + '\\')">' +
      'View all ' + data.total + ' runs</a></div>';
  }

  el.innerHTML = html;
}

function formatTime(iso) {
  const d = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - d.getTime();

  if (diff < 60000) return 'just now';
  if (diff < 3600000) return Math.floor(diff / 60000) + 'm ago';
  if (diff < 86400000) return Math.floor(diff / 3600000) + 'h ago';

  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const day = d.getDate().toString().padStart(2, '0');
  const hours = d.getHours().toString().padStart(2, '0');
  const mins = d.getMinutes().toString().padStart(2, '0');
  return month + '/' + day + ' ' + hours + ':' + mins;
}

function formatDuration(ms) {
  if (ms < 1000) return ms + 'ms';
  const secs = Math.floor(ms / 1000);
  if (secs < 60) return secs + 's';
  const mins = Math.floor(secs / 60);
  const remSecs = secs % 60;
  if (mins < 60) return mins + 'm ' + remSecs + 's';
  const hours = Math.floor(mins / 60);
  const remMins = mins % 60;
  return hours + 'h ' + remMins + 'm';
}

function escapeHtml(s) {
  const div = document.createElement('div');
  div.textContent = s;
  return div.innerHTML;
}

function simpleDiff(oldText, newText) {
  const oldLines = oldText.split('\\n');
  const newLines = newText.split('\\n');
  const m = oldLines.length;
  const n = newLines.length;

  // LCS DP
  const dp = Array.from({length: m + 1}, () => new Array(n + 1).fill(0));
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = oldLines[i-1] === newLines[j-1] ? dp[i-1][j-1] + 1 : Math.max(dp[i-1][j], dp[i][j-1]);
    }
  }

  // Backtrack
  const result = [];
  let i = m, j = n;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && oldLines[i-1] === newLines[j-1]) {
      result.push({type: 'ctx', line: oldLines[i-1]});
      i--; j--;
    } else if (j > 0 && (i === 0 || dp[i][j-1] >= dp[i-1][j])) {
      result.push({type: 'add', line: newLines[j-1]});
      j--;
    } else {
      result.push({type: 'del', line: oldLines[i-1]});
      i--;
    }
  }
  result.reverse();
  return result;
}

function renderDiff(oldPrompt, newPrompt) {
  const diff = simpleDiff(oldPrompt, newPrompt);
  if (diff.length === 0) return '<div class="diff-line diff-ctx">(empty)</div>';

  // Check if there are any changes
  const hasChanges = diff.some(d => d.type !== 'ctx');
  if (!hasChanges) return '<div class="diff-line diff-ctx">(no changes)</div>';

  // Collect indices of changed lines
  const changed = new Set();
  diff.forEach((d, idx) => { if (d.type !== 'ctx') changed.add(idx); });

  // Mark context lines within 2 lines of a change
  const visible = new Set();
  diff.forEach((_, idx) => {
    if (changed.has(idx)) {
      for (let k = Math.max(0, idx - 2); k <= Math.min(diff.length - 1, idx + 2); k++) {
        visible.add(k);
      }
    }
  });

  let html = '';
  let skipping = false;
  diff.forEach((d, idx) => {
    if (!visible.has(idx)) {
      if (!skipping) {
        html += '<div class="diff-sep">...</div>';
        skipping = true;
      }
      return;
    }
    skipping = false;
    const prefix = d.type === 'add' ? '+ ' : d.type === 'del' ? '- ' : '  ';
    html += '<div class="diff-line diff-' + d.type + '">' + prefix + escapeHtml(d.line) + '</div>';
  });

  return html;
}

function render() {
  const el = document.getElementById('content');
  if (schedules.length === 0) {
    el.innerHTML = '<div class="empty-state"><p>No schedules yet.</p><p>Click "+ Add Schedule" to create one.</p></div>';
    return;
  }

  el.innerHTML = '<div class="grid">' + schedules.map(s => {
    const dir = s.workDir.replace(/^\\/Users\\/[^/]+/, '~');
    return '<div class="card">' +
      '<div class="card-header">' +
        '<div class="card-name">' + escapeHtml(s.name) + '</div>' +
        '<button class="btn-run" onclick="runSchedule(\\'' + escapeAttr(s.name) + '\\')">Run</button>' +
      '</div>' +
      '<div class="card-field"><span class="label">Schedule:</span>' + escapeHtml(s.at) + '</div>' +
      '<div class="card-field"><span class="label">Cron:</span><code>' + escapeHtml(s.cron) + '</code></div>' +
      '<div class="card-field"><span class="label">Dir:</span>' + escapeHtml(dir) + '</div>' +
      ((s.useGmail || s.useSlack) ? '<div class="card-field">' + (s.useGmail ? '<span class="gmail-badge">Gmail</span> ' : '') + (s.useSlack ? '<span class="slack-badge">Slack</span>' : '') + '</div>' : '') +
      '<div class="card-prompt" onclick="viewPrompt(\\'' + escapeAttr(s.name) + '\\')">' + escapeHtml(s.prompt) + '</div>' +
      '<a class="prompt-history-link" onclick="viewPromptHistory(\\'' + escapeAttr(s.name) + '\\')">Prompt History</a>' +
      '<div class="build-history">' +
        '<div class="build-history-header">' +
          '<span class="section-label">Build History</span>' +
        '</div>' +
        '<div id="history-' + escapeHtml(s.name) + '"><div class="no-builds">Loading...</div></div>' +
      '</div>' +
      '<div class="card-footer">' +
        '<button class="btn btn-sm" onclick="openEditModal(\\'' + escapeAttr(s.name) + '\\')">Edit</button>' +
        '<button class="btn btn-sm" onclick="viewLogs(\\'' + escapeAttr(s.name) + '\\')">Logs</button>' +
        '<button class="btn btn-sm btn-danger" onclick="askDelete(\\'' + escapeAttr(s.name) + '\\')">Delete</button>' +
      '</div>' +
    '</div>';
  }).join('') + '</div>';
}

function escapeAttr(s) {
  return s.replace(/\\\\/g, '\\\\\\\\').replace(/'/g, "\\\\'");
}

// Run Detail
function colorizeLog(raw) {
  if (!raw) return '';
  const lines = raw.split('\\n');
  return lines.map(line => {
    // Match: HH:MM:SS [type]         (optional tool) content
    const m = line.match(/^(\\d{2}:\\d{2}:\\d{2})\\s+\\[(\\w+)\\]\\s+(.*)/);
    if (!m) return '<div class="log-line">' + escapeHtml(line) + '</div>';

    const ts = m[1];
    const type = m[2];
    const rest = m[3];

    return '<div class="log-line">' +
      '<span class="log-ts">' + ts + '</span> ' +
      '<span class="log-tag-' + type + '">[' + type + ']</span> ' +
      '<span class="log-content-' + type + '">' + escapeHtml(rest) + '</span>' +
    '</div>';
  }).join('');
}

async function viewRunDetail(name, number) {
  // If this is an active run, show live output instead
  const key = name + ':' + number;
  if (activeRuns[key]) { openLiveOutput(name, number); return; }

  document.getElementById('runDetailTitle').textContent = name + ' #' + number;
  document.getElementById('runDetailMeta').innerHTML = '<dt>Loading...</dt><dd></dd>';
  document.getElementById('runDetailOutput').textContent = 'Loading...';
  openModal('runDetailModal');

  try {
    const [meta, outputData] = await Promise.all([
      api('/api/schedules/' + encodeURIComponent(name) + '/runs/' + number),
      api('/api/schedules/' + encodeURIComponent(name) + '/runs/' + number + '/output'),
    ]);

    const statusClass = meta.status;
    const startTime = new Date(meta.startedAt).toLocaleString();
    const endTime = meta.finishedAt ? new Date(meta.finishedAt).toLocaleString() : '-';
    const dur = meta.durationMs !== null ? formatDuration(meta.durationMs) : '-';

    document.getElementById('runDetailMeta').innerHTML =
      '<dt>Status</dt><dd><span class="status-badge ' + statusClass + '">' + meta.status.toUpperCase() + '</span></dd>' +
      '<dt>Trigger</dt><dd>' + escapeHtml(meta.trigger) + '</dd>' +
      '<dt>Started</dt><dd>' + escapeHtml(startTime) + '</dd>' +
      '<dt>Finished</dt><dd>' + escapeHtml(endTime) + '</dd>' +
      '<dt>Duration</dt><dd>' + escapeHtml(dur) + '</dd>' +
      '<dt>Exit Code</dt><dd>' + (meta.exitCode !== null ? meta.exitCode : '-') + '</dd>';

    const outputEl = document.getElementById('runDetailOutput');
    outputEl.innerHTML = colorizeLog(outputData.output || '(no output)');
    outputEl.scrollTop = outputEl.scrollHeight;
  } catch (err) {
    document.getElementById('runDetailMeta').innerHTML = '';
    document.getElementById('runDetailOutput').textContent = 'Error: ' + err.message;
  }
}

async function viewAllRuns(name) {
  document.getElementById('runDetailTitle').textContent = 'All Runs: ' + name;
  document.getElementById('runDetailMeta').innerHTML = '';
  document.getElementById('runDetailOutput').textContent = 'Loading...';
  openModal('runDetailModal');

  try {
    const data = await api('/api/schedules/' + encodeURIComponent(name) + '/runs?limit=100');
    if (data.runs.length === 0) {
      document.getElementById('runDetailOutput').textContent = 'No runs yet.';
      return;
    }

    let html = '<ul class="build-list" style="max-height:500px;overflow-y:auto;">';
    for (const run of data.runs) {
      const time = new Date(run.startedAt).toLocaleString();
      const dur = run.durationMs !== null ? formatDuration(run.durationMs) : '...';
      html += '<li class="build-item" onclick="closeModal(\\'runDetailModal\\');viewRunDetail(\\'' + escapeAttr(name) + '\\',' + run.number + ')">' +
        '<span class="build-dot ' + run.status + '"></span>' +
        '<span class="build-number">#' + run.number + '</span>' +
        '<span class="build-trigger">' + run.trigger + '</span>' +
        '<span class="build-time">' + escapeHtml(time) + '</span>' +
        '<span class="build-duration">' + escapeHtml(dur) + '</span>' +
      '</li>';
    }
    html += '</ul>';
    document.getElementById('runDetailOutput').innerHTML = html;
  } catch (err) {
    document.getElementById('runDetailOutput').textContent = 'Error: ' + err.message;
  }
}

// Add Modal
function openAddModal() {
  document.getElementById('addName').value = '';
  document.getElementById('addAt').value = '';
  document.getElementById('addPrompt').value = '';
  document.getElementById('addDir').value = '';
  document.getElementById('cronPreview').textContent = '';
  document.getElementById('cronPreview').className = 'cron-preview';
  const cb = document.getElementById('addUseGmail');
  cb.checked = false;
  cb.disabled = !gmailConnected;
  document.getElementById('addGmailHint').textContent = gmailConnected ? '' : '(Connect Gmail first)';
  const scb = document.getElementById('addUseSlack');
  scb.checked = false;
  scb.disabled = !slackConnected;
  document.getElementById('addSlackHint').textContent = slackConnected ? '' : '(Connect Slack first)';
  openModal('addModal');
}

async function previewCron() {
  const at = document.getElementById('addAt').value.trim();
  const preview = document.getElementById('cronPreview');
  if (!at) { preview.textContent = 'Enter a schedule first.'; preview.className = 'cron-preview err'; return; }
  preview.textContent = 'Converting...';
  preview.className = 'cron-preview';
  try {
    const data = await api('/api/parse-cron', { method: 'POST', body: JSON.stringify({ at }) });
    preview.textContent = 'Cron: ' + data.cron;
    preview.className = 'cron-preview ok';
  } catch (err) {
    preview.textContent = err.message;
    preview.className = 'cron-preview err';
  }
}

async function submitAdd() {
  const name = document.getElementById('addName').value.trim();
  const at = document.getElementById('addAt').value.trim();
  const prompt = document.getElementById('addPrompt').value.trim();
  const dir = document.getElementById('addDir').value.trim();
  const useGmail = document.getElementById('addUseGmail').checked;
  const useSlack = document.getElementById('addUseSlack').checked;

  if (!name || !at || !prompt) { alert('Name, schedule, and prompt are required.'); return; }

  const btn = document.getElementById('addSubmitBtn');
  btn.disabled = true;
  btn.textContent = 'Adding...';

  try {
    await api('/api/schedules', {
      method: 'POST',
      body: JSON.stringify({ name, at, prompt, dir: dir || undefined, useGmail, useSlack }),
    });
    closeModal('addModal');
    await loadSchedules();
  } catch (err) {
    alert('Error: ' + err.message);
  } finally {
    btn.disabled = false;
    btn.textContent = 'Add';
  }
}

// Edit Modal
function openEditModal(name) {
  const s = schedules.find(x => x.name === name);
  if (!s) return;
  document.getElementById('editName').value = s.name;
  document.getElementById('editNameDisplay').value = s.name;
  document.getElementById('editAt').value = s.at;
  document.getElementById('editPrompt').value = s.prompt;
  document.getElementById('editDir').value = s.workDir.replace(/^\\/Users\\/[^/]+/, '~');
  document.getElementById('editCronPreview').textContent = 'Current: ' + s.cron;
  document.getElementById('editCronPreview').className = 'cron-preview ok';
  const cb = document.getElementById('editUseGmail');
  cb.checked = !!s.useGmail;
  cb.disabled = !gmailConnected;
  document.getElementById('editGmailHint').textContent = gmailConnected ? '' : '(Connect Gmail first)';
  const scb = document.getElementById('editUseSlack');
  scb.checked = !!s.useSlack;
  scb.disabled = !slackConnected;
  document.getElementById('editSlackHint').textContent = slackConnected ? '' : '(Connect Slack first)';
  openModal('editModal');
}

async function previewEditCron() {
  const at = document.getElementById('editAt').value.trim();
  const preview = document.getElementById('editCronPreview');
  if (!at) { preview.textContent = 'Enter a schedule first.'; preview.className = 'cron-preview err'; return; }
  preview.textContent = 'Converting...';
  preview.className = 'cron-preview';
  try {
    const data = await api('/api/parse-cron', { method: 'POST', body: JSON.stringify({ at }) });
    preview.textContent = 'Cron: ' + data.cron;
    preview.className = 'cron-preview ok';
  } catch (err) {
    preview.textContent = err.message;
    preview.className = 'cron-preview err';
  }
}

async function submitEdit() {
  const name = document.getElementById('editName').value;
  const at = document.getElementById('editAt').value.trim();
  const prompt = document.getElementById('editPrompt').value.trim();
  const dir = document.getElementById('editDir').value.trim();
  const useGmail = document.getElementById('editUseGmail').checked;
  const useSlack = document.getElementById('editUseSlack').checked;

  if (!at || !prompt) { alert('Schedule and prompt are required.'); return; }

  const btn = document.getElementById('editSubmitBtn');
  btn.disabled = true;
  btn.textContent = 'Saving...';

  try {
    await api('/api/schedules/' + encodeURIComponent(name), {
      method: 'PUT',
      body: JSON.stringify({ at, prompt, dir: dir || undefined, useGmail, useSlack }),
    });
    closeModal('editModal');
    await loadSchedules();
  } catch (err) {
    alert('Error: ' + err.message);
  } finally {
    btn.disabled = false;
    btn.textContent = 'Save';
  }
}

// Run — Jenkins-style: no modal, update build history inline
let activeRuns = {}; // 'name:number' -> { runId }
let liveEs = null;   // EventSource for live output modal
let pollTimer = null; // polling timer for active runs
let currentLiveRunKey = null; // 'name:number' of the run shown in live modal

async function runSchedule(name) {
  try {
    const data = await api('/api/schedules/' + encodeURIComponent(name) + '/run', { method: 'POST' });
    const key = name + ':' + data.runNumber;
    activeRuns[key] = { runId: data.runId };

    // Refresh build history to show running state immediately
    loadBuildHistory(name);
    startPolling();

    // Background SSE to detect completion
    const es = new EventSource('/api/runs/' + encodeURIComponent(data.runId) + '/stream');
    es.addEventListener('done', () => {
      es.close();
      delete activeRuns[key];
      loadBuildHistory(name);
      stopPollingIfIdle();
    });
    es.onerror = () => {
      es.close();
      delete activeRuns[key];
      setTimeout(() => loadBuildHistory(name), 500);
      stopPollingIfIdle();
    };
  } catch (err) {
    alert('Failed to start: ' + err.message);
  }
}

function startPolling() {
  if (pollTimer) return;
  pollTimer = setInterval(() => {
    const names = new Set();
    for (const key of Object.keys(activeRuns)) {
      names.add(key.split(':')[0]);
    }
    for (const name of names) {
      loadBuildHistory(name);
    }
  }, 3000);
}

function stopPollingIfIdle() {
  if (Object.keys(activeRuns).length === 0 && pollTimer) {
    clearInterval(pollTimer);
    pollTimer = null;
  }
}

function openLiveOutput(name, number) {
  const key = name + ':' + number;
  const active = activeRuns[key];
  if (!active) { viewRunDetail(name, number); return; }

  currentLiveRunKey = key;
  document.getElementById('runTitle').textContent = name + ' #' + number;
  document.getElementById('runStatus').innerHTML = '<span class="spinner"></span> Running...';
  document.getElementById('runStatus').className = 'run-status running';
  document.getElementById('runOutput').innerHTML = '';
  document.getElementById('cancelRunBtn').style.display = '';
  openModal('runModal');

  if (liveEs) { liveEs.close(); liveEs = null; }

  const es = new EventSource('/api/runs/' + encodeURIComponent(active.runId) + '/stream');
  liveEs = es;
  const output = document.getElementById('runOutput');

  es.onmessage = (e) => {
    const text = JSON.parse(e.data);
    output.innerHTML += colorizeLog(text);
    output.scrollTop = output.scrollHeight;
  };

  es.addEventListener('done', (e) => {
    es.close();
    if (liveEs === es) liveEs = null;
    currentLiveRunKey = null;
    document.getElementById('cancelRunBtn').style.display = 'none';
    const info = JSON.parse(e.data);
    const code = info.code ?? 0;
    if (code === 0) {
      document.getElementById('runStatus').textContent = 'Completed successfully.';
      document.getElementById('runStatus').className = 'run-status done';
    } else {
      document.getElementById('runStatus').textContent = 'Exited with code ' + code;
      document.getElementById('runStatus').className = 'run-status failed';
    }
  });

  es.onerror = () => {
    es.close();
    if (liveEs === es) liveEs = null;
    currentLiveRunKey = null;
    document.getElementById('cancelRunBtn').style.display = 'none';
    document.getElementById('runStatus').textContent = 'Connection lost.';
    document.getElementById('runStatus').className = 'run-status failed';
  };
}

async function cancelCurrentRun() {
  if (!currentLiveRunKey || !activeRuns[currentLiveRunKey]) return;
  const runId = activeRuns[currentLiveRunKey].runId;
  try {
    await api('/api/runs/' + encodeURIComponent(runId) + '/cancel', { method: 'POST' });
    document.getElementById('cancelRunBtn').style.display = 'none';
    document.getElementById('runStatus').textContent = 'Cancelling...';
    document.getElementById('runStatus').className = 'run-status failed';
  } catch (err) {
    alert('Failed to cancel: ' + err.message);
  }
}

async function cancelRunByKey(name, number) {
  const key = name + ':' + number;
  const active = activeRuns[key];
  try {
    if (active) {
      await api('/api/runs/' + encodeURIComponent(active.runId) + '/cancel', { method: 'POST' });
    } else {
      await api('/api/schedules/' + encodeURIComponent(name) + '/runs/' + number + '/cancel', { method: 'POST' });
    }
    loadBuildHistory(name);
  } catch (err) {
    alert('Failed to cancel: ' + err.message);
  }
}

// Prompt Edit
function viewPrompt(name) {
  const s = schedules.find(x => x.name === name);
  if (!s) return;
  document.getElementById('promptEditName').value = s.name;
  document.getElementById('promptTitle').textContent = s.name;
  document.getElementById('promptContent').value = s.prompt;
  openModal('promptModal');
}

async function savePrompt() {
  const name = document.getElementById('promptEditName').value;
  const prompt = document.getElementById('promptContent').value.trim();
  if (!prompt) { alert('Prompt cannot be empty.'); return; }

  const btn = document.getElementById('promptSaveBtn');
  btn.disabled = true;
  btn.textContent = 'Saving...';

  try {
    await api('/api/schedules/' + encodeURIComponent(name), {
      method: 'PUT',
      body: JSON.stringify({ prompt }),
    });
    closeModal('promptModal');
    await loadSchedules();
  } catch (err) {
    alert('Error: ' + err.message);
  } finally {
    btn.disabled = false;
    btn.textContent = 'Save';
  }
}

// Logs
async function viewLogs(name) {
  document.getElementById('logsTitle').textContent = 'Logs: ' + name;
  document.getElementById('logsContent').textContent = 'Loading...';
  openModal('logsModal');

  try {
    const data = await api('/api/schedules/' + encodeURIComponent(name) + '/logs');
    document.getElementById('logsContent').textContent = data.logs || 'No logs yet.';
    const el = document.getElementById('logsContent');
    el.scrollTop = el.scrollHeight;
  } catch (err) {
    document.getElementById('logsContent').textContent = 'Error: ' + err.message;
  }
}

// Delete
function askDelete(name) {
  deleteTarget = name;
  document.getElementById('confirmText').textContent = 'Are you sure you want to delete "' + name + '"? This will unload it from launchd and remove the schedule.';
  openModal('confirmModal');
}

async function confirmDelete() {
  if (!deleteTarget) return;
  const btn = document.getElementById('confirmBtn');
  btn.disabled = true;
  btn.textContent = 'Deleting...';

  try {
    await api('/api/schedules/' + encodeURIComponent(deleteTarget), { method: 'DELETE' });
    closeModal('confirmModal');
    await loadSchedules();
  } catch (err) {
    alert('Error: ' + err.message);
  } finally {
    btn.disabled = false;
    btn.textContent = 'Delete';
    deleteTarget = null;
  }
}

// Modal helpers
function openModal(id) {
  document.getElementById(id).classList.add('active');
}

function closeModal(id) {
  document.getElementById(id).classList.remove('active');
  if (id === 'runModal' && liveEs) { liveEs.close(); liveEs = null; }
}

// Close modal on overlay click (except form modals)
const formModals = new Set(['addModal', 'editModal', 'gmailModal', 'slackModal']);
document.querySelectorAll('.modal-overlay').forEach(overlay => {
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay && !formModals.has(overlay.id)) {
      if (overlay.id === 'runModal' && liveEs) { liveEs.close(); liveEs = null; }
      overlay.classList.remove('active');
    }
  });
});

// Close modal on Escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (document.getElementById('runModal').classList.contains('active') && liveEs) { liveEs.close(); liveEs = null; }
    document.querySelectorAll('.modal-overlay.active').forEach(m => m.classList.remove('active'));
  }
});

// Gmail
async function loadGmailStatus() {
  try {
    const data = await api('/api/gmail/status');
    gmailConnected = data.connected;
    gmailEmail = data.email;
    updateGmailUI();
  } catch {
    gmailConnected = false;
    gmailEmail = null;
    updateGmailUI();
  }
}

function updateGmailUI() {
  const statusEl = document.getElementById('gmailStatus');
  const btnEl = document.getElementById('gmailBtn');
  if (gmailConnected) {
    statusEl.innerHTML = '<span class="gmail-dot connected"></span>' + escapeHtml(gmailEmail || '');
    btnEl.textContent = 'Gmail Settings';
  } else {
    statusEl.innerHTML = '';
    btnEl.textContent = 'Connect Gmail';
  }
}

function openGmailModal() {
  if (gmailConnected) {
    document.getElementById('gmailModalTitle').textContent = 'Gmail Connected';
    document.getElementById('gmailFormSection').style.display = 'none';
    document.getElementById('gmailConnectedSection').style.display = 'block';
    document.getElementById('gmailConnectedEmail').textContent = gmailEmail || '';
  } else {
    document.getElementById('gmailModalTitle').textContent = 'Connect Gmail';
    document.getElementById('gmailFormSection').style.display = 'block';
    document.getElementById('gmailConnectedSection').style.display = 'none';
    document.getElementById('gmailEmail').value = '';
    document.getElementById('gmailAppPassword').value = '';
  }
  openModal('gmailModal');
}

async function connectGmail() {
  const email = document.getElementById('gmailEmail').value.trim();
  const appPassword = document.getElementById('gmailAppPassword').value.trim();
  if (!email || !appPassword) { alert('Email and App Password are required.'); return; }

  const btn = document.getElementById('gmailConnectBtn');
  btn.disabled = true;
  btn.textContent = 'Testing...';

  try {
    await api('/api/gmail/connect', {
      method: 'POST',
      body: JSON.stringify({ email, appPassword }),
    });
    closeModal('gmailModal');
    await loadGmailStatus();
  } catch (err) {
    alert('Error: ' + err.message);
  } finally {
    btn.disabled = false;
    btn.textContent = 'Test & Connect';
  }
}

async function disconnectGmail() {
  const btn = document.getElementById('gmailDisconnectBtn');
  btn.disabled = true;
  btn.textContent = 'Disconnecting...';

  try {
    await api('/api/gmail/disconnect', { method: 'DELETE' });
    closeModal('gmailModal');
    await loadGmailStatus();
  } catch (err) {
    alert('Error: ' + err.message);
  } finally {
    btn.disabled = false;
    btn.textContent = 'Disconnect';
  }
}

// Slack
async function loadSlackStatus() {
  try {
    const data = await api('/api/slack/status');
    slackConnected = data.connected;
    slackChannel = data.channelName;
    updateSlackUI();
  } catch {
    slackConnected = false;
    slackChannel = null;
    updateSlackUI();
  }
}

function updateSlackUI() {
  const statusEl = document.getElementById('slackStatus');
  const btnEl = document.getElementById('slackBtn');
  if (slackConnected) {
    statusEl.innerHTML = '<span class="slack-dot connected"></span>' + escapeHtml(slackChannel || '');
    btnEl.textContent = 'Slack Settings';
  } else {
    statusEl.innerHTML = '';
    btnEl.textContent = 'Connect Slack';
  }
}

function openSlackModal() {
  if (slackConnected) {
    document.getElementById('slackModalTitle').textContent = 'Slack Connected';
    document.getElementById('slackFormSection').style.display = 'none';
    document.getElementById('slackConnectedSection').style.display = 'block';
    document.getElementById('slackConnectedChannel').textContent = slackChannel || '';
  } else {
    document.getElementById('slackModalTitle').textContent = 'Connect Slack';
    document.getElementById('slackFormSection').style.display = 'block';
    document.getElementById('slackConnectedSection').style.display = 'none';
    document.getElementById('slackWebhookUrl').value = '';
    document.getElementById('slackChannelName').value = '';
  }
  openModal('slackModal');
}

async function connectSlack() {
  const webhookUrl = document.getElementById('slackWebhookUrl').value.trim();
  const channelName = document.getElementById('slackChannelName').value.trim();
  if (!webhookUrl) { alert('Webhook URL is required.'); return; }

  const btn = document.getElementById('slackConnectBtn');
  btn.disabled = true;
  btn.textContent = 'Testing...';

  try {
    await api('/api/slack/connect', {
      method: 'POST',
      body: JSON.stringify({ webhookUrl, channelName: channelName || 'Slack' }),
    });
    closeModal('slackModal');
    await loadSlackStatus();
  } catch (err) {
    alert('Error: ' + err.message);
  } finally {
    btn.disabled = false;
    btn.textContent = 'Test & Connect';
  }
}

async function disconnectSlack() {
  const btn = document.getElementById('slackDisconnectBtn');
  btn.disabled = true;
  btn.textContent = 'Disconnecting...';

  try {
    await api('/api/slack/disconnect', { method: 'DELETE' });
    closeModal('slackModal');
    await loadSlackStatus();
  } catch (err) {
    alert('Error: ' + err.message);
  } finally {
    btn.disabled = false;
    btn.textContent = 'Disconnect';
  }
}

// Directory autocomplete
function setupDirAutocomplete(inputId, listId) {
  const input = document.getElementById(inputId);
  const list = document.getElementById(listId);
  let debounceTimer = null;
  let activeIndex = -1;

  input.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => fetchDirs(input, list), 200);
  });

  input.addEventListener('keydown', (e) => {
    const items = list.querySelectorAll('li');
    if (!list.classList.contains('open') || items.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      activeIndex = Math.min(activeIndex + 1, items.length - 1);
      updateActive(items);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      activeIndex = Math.max(activeIndex - 1, 0);
      updateActive(items);
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault();
      selectItem(input, list, items[activeIndex].textContent);
    } else if (e.key === 'Tab' && activeIndex >= 0) {
      e.preventDefault();
      selectItem(input, list, items[activeIndex].textContent);
    } else if (e.key === 'Escape') {
      list.classList.remove('open');
      activeIndex = -1;
    }
  });

  document.addEventListener('click', (e) => {
    if (!input.contains(e.target) && !list.contains(e.target)) {
      list.classList.remove('open');
      activeIndex = -1;
    }
  });

  function updateActive(items) {
    items.forEach((li, i) => li.classList.toggle('active', i === activeIndex));
    if (items[activeIndex]) items[activeIndex].scrollIntoView({ block: 'nearest' });
  }

  function selectItem(input, list, value) {
    input.value = value;
    list.classList.remove('open');
    activeIndex = -1;
    // Trigger another fetch to show subdirectories
    setTimeout(() => fetchDirs(input, list), 50);
  }
}

async function fetchDirs(input, list) {
  const val = input.value.trim();
  if (!val) { list.classList.remove('open'); return; }

  try {
    const dirs = await api('/api/dirs?prefix=' + encodeURIComponent(val));
    if (dirs.length === 0) { list.classList.remove('open'); return; }

    list.innerHTML = dirs.map(d => '<li>' + escapeHtml(d) + '</li>').join('');
    list.classList.add('open');

    list.querySelectorAll('li').forEach(li => {
      li.addEventListener('click', () => {
        input.value = li.textContent;
        list.classList.remove('open');
        input.focus();
        setTimeout(() => fetchDirs(input, list), 50);
      });
    });
  } catch {
    list.classList.remove('open');
  }
}

setupDirAutocomplete('addDir', 'addDirList');
setupDirAutocomplete('editDir', 'editDirList');

// Prompt History
async function viewPromptHistory(name) {
  document.getElementById('promptHistoryTitle').textContent = 'Prompt History: ' + name;
  document.getElementById('promptHistoryContent').innerHTML = '<div class="no-builds">Loading...</div>';
  openModal('promptHistoryModal');

  try {
    const data = await api('/api/schedules/' + encodeURIComponent(name) + '/prompts?limit=50');
    if (data.versions.length === 0) {
      document.getElementById('promptHistoryContent').innerHTML = '<div class="no-builds">No prompt history yet.</div>';
      return;
    }

    // Get current prompt from schedules array
    const currentSchedule = schedules.find(s => s.name === name);
    const currentPrompt = currentSchedule ? currentSchedule.prompt : '';

    // versions are newest-first
    const versions = data.versions;

    let html = '<ul class="version-list">';
    for (let i = 0; i < versions.length; i++) {
      const v = versions[i];
      const time = new Date(v.savedAt).toLocaleString();
      // Compare this version to the next version (or current prompt if most recent)
      const nextPrompt = i === 0 ? currentPrompt : versions[i - 1].prompt;
      const diffHtml = renderDiff(v.prompt, nextPrompt);
      const label = i === 0 ? '#' + v.number + ' → current' : '#' + v.number + ' → #' + versions[i - 1].number;

      html += '<li class="version-item">' +
        '<div class="version-meta">' +
          '<span class="version-number">' + label + '</span>' +
          '<span class="version-time">' + escapeHtml(time) + '</span>' +
        '</div>' +
        '<div class="version-prompt">' + diffHtml + '</div>' +
        '<div class="version-actions">' +
          '<button class="btn btn-sm" onclick="restorePromptVersion(\\'' + escapeAttr(name) + '\\',' + v.number + ')">Restore</button>' +
        '</div>' +
      '</li>';
    }
    html += '</ul>';
    document.getElementById('promptHistoryContent').innerHTML = html;
  } catch (err) {
    document.getElementById('promptHistoryContent').innerHTML = '<div class="no-builds">Error: ' + escapeHtml(err.message) + '</div>';
  }
}

function viewPromptHistoryFromEdit() {
  const name = document.getElementById('promptEditName').value;
  if (!name) return;
  closeModal('promptModal');
  viewPromptHistory(name);
}

async function restorePromptVersion(name, number) {
  if (!confirm('Restore prompt version #' + number + '? The current prompt will be saved to history.')) return;

  try {
    await api('/api/schedules/' + encodeURIComponent(name) + '/prompts/' + number + '/restore', { method: 'POST' });
    closeModal('promptHistoryModal');
    await loadSchedules();
  } catch (err) {
    alert('Error: ' + err.message);
  }
}

// ── Tab Navigation ──
function switchTab(tab) {
  document.querySelectorAll('.tab-panel').forEach(p => p.style.display = 'none');
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('tab-' + tab).style.display = '';
  event.target.closest ? document.querySelector('.tab-btn[onclick*="' + tab + '"]').classList.add('active') : null;
  if (tab === 'console') initConsole();
}

// ── Console ──
let consoleSessions = [];
const hiddenSessions = new Set();
const collapsedGroups = new Set(['ended']);
let consoleEs = null;
let consoleInitialized = false;

function initConsole() {
  if (!consoleInitialized) {
    consoleInitialized = true;
    connectConsoleStream();
  }
}

function connectConsoleStream() {
  if (consoleEs) consoleEs.close();
  consoleEs = new EventSource('/api/console/stream');

  consoleEs.onmessage = (e) => {
    const msg = JSON.parse(e.data);
    if (msg.type === 'init') {
      consoleSessions = msg.sessions;
    } else if (msg.type === 'update') {
      const idx = consoleSessions.findIndex(s => s.sessionId === msg.session.sessionId);
      if (idx >= 0) consoleSessions[idx] = msg.session;
      else consoleSessions.unshift(msg.session);
      // 최근 활동 순 정렬
      consoleSessions.sort((a, b) => new Date(b.lastActivityAt) - new Date(a.lastActivityAt));
    }
    renderConsole();
    updateSessionBadge();
  };

  consoleEs.onerror = () => {
    // 재연결은 EventSource가 자동으로 처리
  };
}

function updateSessionBadge() {
  const active = consoleSessions.filter(s => !hiddenSessions.has(s.sessionId) && (s.status === 'active' || s.status === 'idle')).length;
  const badge = document.getElementById('activeSessionBadge');
  badge.textContent = active;
  badge.className = 'badge' + (active === 0 ? ' zero' : '');
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return sec + '초 전';
  const min = Math.floor(sec / 60);
  if (min < 60) return min + '분 전';
  const hr = Math.floor(min / 60);
  if (hr < 24) return hr + '시간 전';
  const d = Math.floor(hr / 24);
  return d + '일 전';
}

function shortSessionId(id) {
  if (!id) return '—';
  return id.length > 12 ? id.slice(0, 8) + '...' : id;
}

function shortenPath(p) {
  if (!p) return '—';
  const home = '~';
  // 서버에서 이미 full path로 올 수 있으므로 표시용으로 축약
  return p.replace(/^\\/Users\\/[^/]+/, home);
}

function renderConsole() {
  const el = document.getElementById('console-content');
  if (consoleSessions.length === 0) {
    el.innerHTML = '<div class="console-empty"><p>활성 세션 없음</p><p style="font-size:13px;">Claude Code를 실행하면 여기에 표시됩니다.<br><code style="color:#d4a574;">claude-schedule setup-hooks</code>로 hook을 먼저 설정하세요.</p></div>';
    return;
  }

  // 그룹 분류 (숨긴 세션 제외)
  const visible = consoleSessions.filter(s => !hiddenSessions.has(s.sessionId));
  if (visible.length === 0) {
    el.innerHTML = '<div class="console-empty"><p>활성 세션 없음</p><p style="font-size:13px;">Claude Code를 실행하면 여기에 표시됩니다.<br><code style="color:#d4a574;">claude-schedule setup-hooks</code>로 hook을 먼저 설정하세요.</p></div>';
    return;
  }
  const groups = { active: [], idle: [], ended: [] };
  for (const s of visible) {
    (groups[s.status] || groups.ended).push(s);
  }

  const groupLabels = {
    active: '활성',
    idle: '대기',
    ended: '종료',
  };

  let html = '<div class="console-toolbar">' +
    '<span class="section-label">Sessions (' + consoleSessions.length + ')</span>' +
    '<button class="btn btn-sm btn-danger" onclick="clearConsoleSessions()">Clear All</button>' +
    '</div>';

  for (const key of ['active', 'idle', 'ended']) {
    const list = groups[key];
    if (list.length === 0) continue;

    const isCollapsed = collapsedGroups.has(key);

    html += '<div class="session-group">' +
      '<div class="session-group-header" onclick="toggleGroup(\\'' + key + '\\')">' +
        '<span class="chevron' + (isCollapsed ? ' collapsed' : '') + '">&#9660;</span>' +
        '<span class="status-dot ' + key + '"></span> ' +
        groupLabels[key] +
        ' <span class="group-count">(' + list.length + ')</span>' +
      '</div>';

    if (isCollapsed) {
      html += '</div>';
      continue;
    }

    html += '<table class="session-table">' +
      '<colgroup><col style="width:22%"><col style="width:22%"><col style="width:32%"><col style="width:8%"><col style="width:12%"><col style="width:4%"></colgroup>' +
      '<thead><tr>' +
        '<th>제목</th>' +
        '<th>디렉토리</th>' +
        '<th>요약</th>' +
        '<th style="text-align:center">프롬프트</th>' +
        '<th style="text-align:right">활동</th>' +
        '<th></th>' +
      '</tr></thead><tbody>';

    for (const s of list) {
      const displayName = s.title || shortSessionId(s.sessionId);
      const desc = s.summary || (s.prompts && s.prompts.length > 0 ? s.prompts[s.prompts.length - 1].prompt : '');

      html += '<tr class="session-row-' + s.status + '">' +
        '<td onclick="openSessionDetail(\\'' + escapeAttr(s.sessionId) + '\\')"><div class="session-title-cell">' +
          '<span class="session-title-text" title="' + escapeAttr(displayName) + '">' + escapeHtml(displayName) + '</span>' +
        '</div></td>' +
        '<td onclick="openSessionDetail(\\'' + escapeAttr(s.sessionId) + '\\')"><span class="session-dir-cell" title="' + escapeAttr(s.cwd) + '">' + escapeHtml(shortenPath(s.cwd)) + '</span></td>' +
        '<td onclick="openSessionDetail(\\'' + escapeAttr(s.sessionId) + '\\')"><span class="session-summary-cell" title="' + escapeAttr(desc) + '">' + escapeHtml(desc) + '</span></td>' +
        '<td class="session-count-cell" onclick="openSessionDetail(\\'' + escapeAttr(s.sessionId) + '\\')">' + (s.prompts ? s.prompts.length : 0) + '</td>' +
        '<td class="session-time-cell" onclick="openSessionDetail(\\'' + escapeAttr(s.sessionId) + '\\')">' + timeAgo(s.lastActivityAt) + '</td>' +
        '<td style="text-align:center;padding:8px 4px;"><button class="btn-dismiss" onclick="dismissSession(\\'' + escapeAttr(s.sessionId) + '\\')" title="숨기기">&times;</button></td>' +
      '</tr>';
    }

    html += '</tbody></table></div>';
  }

  el.innerHTML = html;
}

async function openSessionDetail(sessionId) {
  let session;
  try {
    session = await api('/api/console/sessions/' + encodeURIComponent(sessionId));
  } catch {
    alert('세션을 불러올 수 없습니다.');
    return;
  }

  const modal = document.getElementById('sessionDetailModal');
  const displayTitle = session.title || shortSessionId(session.sessionId);
  document.getElementById('sessionDetailTitle').innerHTML =
    '<span class="status-dot ' + session.status + '" style="display:inline-block;vertical-align:middle;margin-right:8px;"></span>' +
    escapeHtml(displayTitle) +
    '<span style="font-size:13px;color:#737373;margin-left:12px;">' + session.status + '</span>';

  // 세션 ID를 모달에 저장 (재요약용)
  modal.dataset.sessionId = session.sessionId;

  let meta = '<div style="font-size:13px;color:#a3a3a3;margin-bottom:16px;">' +
    '<div><span style="color:#525252;">세션:</span> <span style="font-family:monospace;font-size:11px;">' + escapeHtml(session.sessionId) + '</span></div>' +
    '<div><span style="color:#525252;">디렉토리:</span> ' + escapeHtml(shortenPath(session.cwd)) + '</div>' +
    (session.model ? '<div><span style="color:#525252;">모델:</span> ' + escapeHtml(session.model) + '</div>' : '') +
    '<div><span style="color:#525252;">시작:</span> ' + new Date(session.startedAt).toLocaleString('ko-KR') + '</div>' +
    '<div><span style="color:#525252;">마지막 활동:</span> ' + timeAgo(session.lastActivityAt) + '</div>' +
    (session.endReason ? '<div><span style="color:#525252;">종료 사유:</span> ' + escapeHtml(session.endReason) + '</div>' : '') +
    '</div>';

  document.getElementById('sessionDetailMeta').innerHTML = meta;

  // resume 커맨드 텍스트 업데이트
  const resumeCmd = 'cd ' + session.cwd + ' && claude --resume ' + session.sessionId;
  document.getElementById('resumeCmdText').textContent = resumeCmd;

  // 요약 영역
  let summaryHtml = '<div style="margin-bottom:16px;">' +
    '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">' +
      '<span class="section-label">요약</span>' +
      '<button class="btn btn-sm" id="summarizeBtn" data-old-title="' + escapeAttr(session.title || '') + '" onclick="requestSummarize()">' + (session.title ? '재요약' : '요약 생성') + '</button>' +
    '</div>';
  if (session.summary) {
    summaryHtml += '<div style="background:#1a1a1a;border:1px solid #262626;border-radius:6px;padding:10px 12px;font-size:13px;line-height:1.8;color:#d4d4d4;white-space:pre-wrap;word-break:break-word;">' +
      escapeHtml(session.summary) + '</div>';
  } else {
    summaryHtml += '<div style="color:#525252;font-size:13px;">아직 요약이 생성되지 않았습니다.</div>';
  }
  summaryHtml += '</div>';

  // 프롬프트 목록
  let promptsHtml = '';
  if (session.prompts && session.prompts.length > 0) {
    promptsHtml = '<div class="section-label" style="margin-bottom:8px;">프롬프트 히스토리 (' + session.prompts.length + ')</div>' +
      '<ul class="session-detail-prompts">';
    for (const p of session.prompts) {
      promptsHtml += '<li>' +
        '<div class="prompt-time">' + new Date(p.submittedAt).toLocaleString('ko-KR') + '</div>' +
        '<div class="prompt-text">' + escapeHtml(p.prompt) + '</div>' +
        '</li>';
    }
    promptsHtml += '</ul>';
  }

  // 마지막 응답
  let responseHtml = '';
  if (session.lastAssistantMessage) {
    const msg = session.lastAssistantMessage.length > 2000
      ? session.lastAssistantMessage.slice(0, 2000) + '...'
      : session.lastAssistantMessage;
    responseHtml = '<div class="section-label" style="margin:16px 0 8px;">마지막 응답</div>' +
      '<div class="session-last-response">' + escapeHtml(msg) + '</div>';
  }

  document.getElementById('sessionDetailBody').innerHTML = summaryHtml + promptsHtml + responseHtml;

  // ended 세션은 Resume 숨김
  const resumeBtn = document.getElementById('resumeBtn');
  const isEnded = session.status === 'ended';
  resumeBtn.style.display = isEnded ? 'none' : '';
  document.getElementById('resumeCmdWrap').style.display = isEnded ? 'none' : '';

  modal.classList.add('active');
}

async function resumeSession() {
  const modal = document.getElementById('sessionDetailModal');
  const sessionId = modal.dataset.sessionId;
  if (!sessionId) return;

  const btn = document.getElementById('resumeBtn');
  btn.textContent = '터미널 열는 중...';
  btn.disabled = true;

  try {
    await api('/api/console/sessions/' + encodeURIComponent(sessionId) + '/resume', { method: 'POST' });
    btn.textContent = 'Resume in Terminal';
    btn.disabled = false;
    closeModal('sessionDetailModal');
  } catch (err) {
    btn.textContent = 'Resume in Terminal';
    btn.disabled = false;
    alert('Error: ' + err.message);
  }
}

function copyResumeCmd() {
  const text = document.getElementById('resumeCmdText').textContent;
  navigator.clipboard.writeText(text).then(() => {
    const btn = document.getElementById('copyResumeBtn');
    btn.textContent = '복사됨';
    setTimeout(() => { btn.textContent = '복사'; }, 1500);
  });
}

async function requestSummarize() {
  const modal = document.getElementById('sessionDetailModal');
  const sessionId = modal.dataset.sessionId;
  if (!sessionId) return;

  const btn = document.getElementById('summarizeBtn');
  const oldTitle = btn.getAttribute('data-old-title') || '';
  btn.textContent = '생성 중...';
  btn.disabled = true;

  try {
    await api('/api/console/sessions/' + encodeURIComponent(sessionId) + '/summarize', { method: 'POST' });
    // 요약은 백그라운드에서 실행됨. 폴링으로 결과 확인
    let attempts = 0;
    const poll = setInterval(async () => {
      attempts++;
      try {
        const updated = await api('/api/console/sessions/' + encodeURIComponent(sessionId));
        // 새 title이 생겼거나(기존과 다르면) 타임아웃이면 종료
        if ((updated.title && updated.title !== oldTitle) || attempts >= 15) {
          clearInterval(poll);
          openSessionDetail(sessionId);
        }
      } catch {
        clearInterval(poll);
        btn.textContent = '요약 실패';
        btn.disabled = false;
      }
    }, 2000);
  } catch (err) {
    btn.textContent = '요약 실패';
    btn.disabled = false;
    alert('Error: ' + err.message);
  }
}

function toggleGroup(key) {
  if (collapsedGroups.has(key)) {
    collapsedGroups.delete(key);
  } else {
    collapsedGroups.add(key);
  }
  renderConsole();
}

function dismissSession(sessionId) {
  hiddenSessions.add(sessionId);
  renderConsole();
  updateSessionBadge();
}

async function clearConsoleSessions() {
  if (!confirm('모든 세션 데이터를 삭제하시겠습니까?')) return;
  try {
    await api('/api/console/sessions', { method: 'DELETE' });
    consoleSessions = [];
    renderConsole();
    updateSessionBadge();
  } catch (err) {
    alert('Error: ' + err.message);
  }
}

// Init
loadGmailStatus();
loadSlackStatus();
loadSchedules();
</script>
</body>
</html>`;
}
