import { useState } from 'react';
import { SettingCard } from '../../components/settings/SettingCard/SettingCard';
import { SettingRow } from '../../components/settings/SettingRow/SettingRow';
import { SettingsTabs } from '../../components/settings/SettingsTabs/SettingsTabs';
import { ToggleSwitch } from '../../components/settings/ToggleSwitch/ToggleSwitch';
import {
  aboutInfo,
  mirrorSettings,
  preferenceSettings,
  proxyDefaults,
  settingsTabs,
  type SettingsTabId,
} from '../../data/settings';
import type {
  EnvironmentProbe,
} from '../../services/runtime/runtime';
import '../../styles/settings.css';

interface SettingsPageProps {
  workspaceRoot: string;
  workspaceLocked: boolean;
  environmentProbe: EnvironmentProbe | null;
  onChooseWorkspaceRoot: () => void;
  onUseRepoWorkspaceRoot: () => void;
  pythonPath: string;
}

export function SettingsPage({
  workspaceRoot,
  workspaceLocked,
  environmentProbe,
  onChooseWorkspaceRoot,
  onUseRepoWorkspaceRoot,
  pythonPath,
}: SettingsPageProps) {
  const [activeTab, setActiveTab] = useState<SettingsTabId>('general');
  const [proxyAddress, setProxyAddress] = useState(proxyDefaults.address);
  const [proxyToggles, setProxyToggles] = useState({
    git: proxyDefaults.git,
    pip: proxyDefaults.pip,
    env: proxyDefaults.env,
    modelDownload: proxyDefaults.modelDownload,
  });
  const [mirrorToggles, setMirrorToggles] = useState(
    Object.fromEntries(
      mirrorSettings.map((item) => [item.id, item.defaultValue]),
    ) as Record<string, boolean>,
  );
  const [preferenceToggles, setPreferenceToggles] = useState(
    Object.fromEntries(
      preferenceSettings.map((item) => [item.id, item.defaultValue]),
    ) as Record<string, boolean>,
  );

  const environmentLabel = environmentProbe
    ? formatEnvironmentStatus(environmentProbe.status)
    : '正在检测';

  const envReady =
    environmentProbe?.status === 'torch-cpu-ready' ||
    environmentProbe?.status === 'torch-gpu-ready';

  const driverLabel = environmentProbe?.status === 'uv-unavailable'
    ? 'uv 不可用'
    : 'uv';

  return (
    <div className="settings-shell">
      <SettingsTabs
        items={settingsTabs}
        activeTab={activeTab}
        onSelect={setActiveTab}
      />

      <div className="settings-wrap">
        {activeTab === 'general' ? (
          <div
            id="settings-panel-general"
            role="tabpanel"
            aria-labelledby="settings-tab-general"
          >
            <div className="group-title group-title--standalone">工作目录</div>

            <SettingCard>
              <SettingRow
                name="工作目录"
                description={
                  workspaceLocked
                    ? '有任务进行中，暂时锁定'
                    : '切换后立即重新检测运行环境'
                }
                icon="📂"
              >
                <div className="workspace-actions">
                  <input
                    className="proxy-input workspace-input"
                    aria-label="工作目录路径"
                    value={workspaceRoot}
                    disabled
                    readOnly
                  />
                  <button
                    type="button"
                    className="workspace-button"
                    onClick={onChooseWorkspaceRoot}
                    disabled={workspaceLocked}
                  >
                    更改目录
                  </button>
                  <button
                    type="button"
                    className="workspace-button workspace-button--secondary"
                    onClick={onUseRepoWorkspaceRoot}
                    disabled={workspaceLocked}
                  >
                    重置为项目目录
                  </button>
                </div>
              </SettingRow>
            </SettingCard>

            <div className="group-title">运行环境</div>

            <div className="env-info-card">
              <div className="env-info-row">
                <span className="env-info-label">环境状态</span>
                <span className={`env-info-badge ${envReady ? 'env-info-badge--ready' : 'env-info-badge--warn'}`}>
                  {environmentLabel}
                </span>
              </div>
              {environmentProbe?.message ? (
                <div className="env-info-row">
                  <span className="env-info-label">详情</span>
                  <span className="env-info-value">{environmentProbe.message}</span>
                </div>
              ) : null}
              <div className="env-info-row">
                <span className="env-info-label">运行驱动</span>
                <span className="env-info-value env-info-mono">{driverLabel}</span>
              </div>
              {pythonPath ? (
                <div className="env-info-row">
                  <span className="env-info-label">Python 路径</span>
                  <span className="env-info-value env-info-mono env-info-path">{pythonPath}</span>
                </div>
              ) : null}
            </div>

            <div className="group-title">网络设置</div>

            <SettingCard>
              <SettingRow
                name="代理设置"
                description="代理服务器设置"
                icon="🛩"
                trailing={
                  <span className="setting-chevron" aria-hidden="true">
                    ⌃
                  </span>
                }
              />

              <SettingRow name="代理服务器地址" inset>
                <input
                  className="proxy-input"
                  aria-label="代理服务器地址"
                  value={proxyAddress}
                  onChange={(event) => setProxyAddress(event.target.value)}
                />
              </SettingRow>

              <SettingRow name="将代理应用到 Git" inset>
                <ToggleSwitch
                  label="将代理应用到 Git"
                  checked={proxyToggles.git}
                  onChange={(next) =>
                    setProxyToggles((current) => ({ ...current, git: next }))
                  }
                />
              </SettingRow>

              <SettingRow name="将代理应用到 Pip" inset>
                <ToggleSwitch
                  label="将代理应用到 Pip"
                  checked={proxyToggles.pip}
                  onChange={(next) =>
                    setProxyToggles((current) => ({ ...current, pip: next }))
                  }
                />
              </SettingRow>

              <SettingRow name="将代理应用到环境变量" inset>
                <ToggleSwitch
                  label="将代理应用到环境变量"
                  checked={proxyToggles.env}
                  onChange={(next) =>
                    setProxyToggles((current) => ({ ...current, env: next }))
                  }
                />
              </SettingRow>

              <SettingRow name="将代理应用到模型下载" inset>
                <ToggleSwitch
                  label="将代理应用到模型下载"
                  checked={proxyToggles.modelDownload}
                  onChange={(next) =>
                    setProxyToggles((current) => ({
                      ...current,
                      modelDownload: next,
                    }))
                  }
                />
              </SettingRow>
            </SettingCard>

            <SettingCard>
              {mirrorSettings.map((item) => (
                <SettingRow
                  key={item.id}
                  name={item.label}
                  description={item.description}
                  icon={item.icon}
                >
                  <ToggleSwitch
                    label={item.label}
                    checked={mirrorToggles[item.id]}
                    onChange={(next) =>
                      setMirrorToggles((current) => ({
                        ...current,
                        [item.id]: next,
                      }))
                    }
                  />
                </SettingRow>
              ))}
            </SettingCard>

            <div className="group-title">偏好设置</div>

            <SettingCard>
              {preferenceSettings.map((item) => (
                <SettingRow
                  key={item.id}
                  name={item.label}
                  description={item.description}
                  icon={item.icon}
                >
                  <ToggleSwitch
                    label={item.label}
                    checked={preferenceToggles[item.id]}
                    onChange={(next) =>
                      setPreferenceToggles((current) => ({
                        ...current,
                        [item.id]: next,
                      }))
                    }
                  />
                </SettingRow>
              ))}
            </SettingCard>

            <div className="footer-space" />
          </div>
        ) : (
          <div
            id="settings-panel-about"
            role="tabpanel"
            aria-labelledby="settings-tab-about"
          >
            <div className="about-card">
              {aboutInfo.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function formatEnvironmentStatus(status: EnvironmentProbe['status']) {
  switch (status) {
    case 'workspace-invalid':
      return '工作目录无效';
    case 'uv-unavailable':
      return 'uv 不可用';
    case 'python-unavailable':
      return 'Python 不可用';
    case 'torch-unavailable':
      return 'torch 不可用';
    case 'torch-cpu-ready':
      return 'CPU 就绪';
    case 'torch-gpu-ready':
      return 'GPU 就绪';
    default:
      return status;
  }
}
