import { FolderGrid } from '../../components/home/FolderGrid/FolderGrid';
import { HeroBanner } from '../../components/home/HeroBanner/HeroBanner';
import { NoticePanel } from '../../components/home/NoticePanel/NoticePanel';
import { notices, versionMeta } from '../../data/home';
import type {
  ManagedFolderItem,
  RuntimeInspection,
  RuntimeTaskRecord,
} from '../../services/runtime/runtime';
import { getQueueSummary } from '../../services/runtime/runtime';
import '../../styles/home.css';

interface HomePageProps {
  inspection: RuntimeInspection | null;
  tasks: RuntimeTaskRecord[];
  folders: ManagedFolderItem[];
  onOpenPath: (pathKey: string) => void;
  onOpenModels: () => void;
}

export function HomePage({
  inspection,
  tasks,
  folders,
  onOpenPath,
  onOpenModels,
}: HomePageProps) {
  const queueSummary = getQueueSummary(tasks);
  const genieStatus = inspection?.resources['genie-base']?.status ?? 'missing';
  const runtimeMode = inspection?.environment.mode ?? 'cpu';

  return (
    <div className="home-page">
      <HeroBanner />

      <div className="main-grid">
        <div>
          <h2 className="section-title">文件夹</h2>
          <FolderGrid items={folders} onOpen={onOpenPath} />

          <div className="meta">
            {versionMeta.map((line) => (
              <div key={line}>{line}</div>
            ))}
          </div>
        </div>

        <NoticePanel
          notices={notices}
          runtimeMode={runtimeMode}
          genieStatus={genieStatus}
          queueLength={queueSummary.queueLength}
          latestMessage={inspection?.latestMessage ?? '正在读取运行时信息'}
          onOpenModels={onOpenModels}
        />
      </div>
    </div>
  );
}
