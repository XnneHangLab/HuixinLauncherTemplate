import { FolderGrid } from '../../components/home/FolderGrid/FolderGrid';
import { HeroBanner } from '../../components/home/HeroBanner/HeroBanner';
import { NoticePanel } from '../../components/home/NoticePanel/NoticePanel';
import { folders, notices, runButtonLabel, versionMeta } from '../../data/home';
import '../../styles/home.css';

export function HomePage() {
  return (
    <div className="home-page">
      <HeroBanner />

      <div className="main-grid">
        <div>
          <div className="section-title">文件夹</div>
          <FolderGrid items={folders} />

          <div className="meta">
            {versionMeta.map((line) => (
              <div key={line}>{line}</div>
            ))}
          </div>
        </div>

        <NoticePanel notices={notices} buttonLabel={runButtonLabel} />
      </div>
    </div>
  );
}
