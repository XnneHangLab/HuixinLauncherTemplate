import { FolderGrid } from '../../components/home/FolderGrid/FolderGrid';
import { HeroBanner } from '../../components/home/HeroBanner/HeroBanner';
import { NoticePanel } from '../../components/home/NoticePanel/NoticePanel';
import { folders, notices, versionMeta } from '../../data/home';
import {
  launchButtonLabels,
  type LaunchState,
} from '../../services/launcher/launcher';
import '../../styles/home.css';

interface HomePageProps {
  launchState: LaunchState;
  onToggleLaunchState: () => void;
}

export function HomePage({
  launchState,
  onToggleLaunchState,
}: HomePageProps) {

  return (
    <div className="home-page">
      <HeroBanner />

      <div className="main-grid">
        <div>
          <h2 className="section-title">文件夹</h2>
          <FolderGrid items={folders} />

          <div className="meta">
            {versionMeta.map((line) => (
              <div key={line}>{line}</div>
            ))}
          </div>
        </div>

        <NoticePanel
          notices={notices}
          buttonLabel={launchButtonLabels[launchState]}
          launchState={launchState}
          onLaunch={onToggleLaunchState}
        />
      </div>
    </div>
  );
}
