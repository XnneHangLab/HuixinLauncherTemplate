export function WindowControls() {
  return (
    <div className="window-btns" aria-label="窗口控制">
      <button type="button" className="window-btn" aria-label="最小化窗口">
        —
      </button>
      <button type="button" className="window-btn" aria-label="切换最大化窗口">
        □
      </button>
      <button type="button" className="window-btn" aria-label="关闭窗口">
        ×
      </button>
    </div>
  );
}
