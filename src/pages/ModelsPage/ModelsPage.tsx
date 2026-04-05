import type {
  RuntimeInspection,
  RuntimeTaskRecord,
} from '../../services/runtime/runtime';
import '../../styles/models.css';

interface ModelsPageProps {
  inspection: RuntimeInspection | null;
  tasks: RuntimeTaskRecord[];
  onDownloadGenieBase: () => void;
  onOpenPath: (pathKey: string) => void;
}

export function ModelsPage({
  inspection,
  tasks,
  onDownloadGenieBase,
  onOpenPath,
}: ModelsPageProps) {
  const genieResource = inspection?.resources['genie-base'];

  return (
    <div className="models-page">
      <header className="models-header">
        <div>
          <h1>模型管理</h1>
          <p>当前阶段只管理 GenieData 基础资源，角色包后续独立加入。</p>
        </div>
        <button type="button" onClick={onDownloadGenieBase}>
          下载 GenieData
        </button>
      </header>

      <section className="models-card">
        <h2>GenieData 基础资源</h2>
        <p>状态 {genieResource?.status ?? 'missing'}</p>
        <p>路径 {genieResource?.path ?? '未初始化'}</p>
        <button type="button" onClick={() => onOpenPath('genieBase')}>
          打开 Genie 目录
        </button>
      </section>

      <section className="models-card">
        <h2>下载队列</h2>
        {tasks.length === 0 ? (
          <p>当前没有下载任务</p>
        ) : (
          <div className="models-task-list">
            {tasks.map((task) => (
              <article key={task.taskId} className="models-task">
                <div>{task.label}</div>
                <div>{task.status}</div>
                <div>{task.message}</div>
                <div>
                  {task.progressCurrent} / {task.progressTotal}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
