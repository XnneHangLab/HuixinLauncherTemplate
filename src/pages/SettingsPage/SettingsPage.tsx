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
import '../../styles/settings.css';

export function SettingsPage() {
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
            <div className="group-title group-title--standalone">网络设置</div>

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

            <div className="group-title group-title--standalone">偏好设置</div>

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
