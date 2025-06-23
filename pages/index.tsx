import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Head from 'next/head';
import Link from 'next/link';
import {
  Loader2, Home, Settings, HardDrive, PlusCircle, Edit3, Trash2, Save, CheckCircle, Menu
} from 'lucide-react';

const API_BASE = 'http://127.0.0.1:8000';

export default function ChronicleDashboard() {
  const [tab, setTab] = useState('home');
  const [devices, setDevices] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [settings, setSettings] = useState(null);
  const [settingsChanged, setSettingsChanged] = useState({});
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    fetchDevices();
    fetchSettings();
  }, []);

  const fetchDevices = async () => {
    try {
      const res = await axios.get(`${API_BASE}/devices/`);
      if (res.data.success) {
        setDevices(res.data.data.devices || []);
        setFeatured(res.data.data.devices.slice(0, 2));
      }
    } catch (e) {
      toastError(e);
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await axios.get(`${API_BASE}/settings/`);
      if (res.data.success) {
        setSettings(res.data.data);
      }
    } catch (e) {
      toastError(e);
    }
  };  

  const toastSuccess = (msg) => {
    setToast({ type: 'success', msg });
    setTimeout(() => setToast(null), 3000);
  };

  const toastError = (e) => {
    const msg = e?.response?.data?.message || 'Unknown error';
    setToast({ type: 'error', msg });
    setTimeout(() => setToast(null), 5000);
  };

  const saveSettings = async () => {
    try {
      await axios.post(`${API_BASE}/settings/`, null, { params: settingsChanged });
      toastSuccess('Settings updated');
      setSettingsChanged({});
      fetchSettings();
    } catch (e) {
      toastError(e);
    }
  };

  const deleteDevice = async (name) => {
    try {
      await axios.delete(`${API_BASE}/devices/${name}`);
      toastSuccess('Device deleted');
      fetchDevices();
    } catch (e) {
      toastError(e);
    }
  };

  const submitDevice = async () => {
    const { type, data } = modal;
    try {
      if (type === 'modify') {
        const res = await axios.get(`${API_BASE}/devices/${data.name}`);
        if (res.data.success) {
          const fullData = { ...res.data.data.device, ...res.data.data.ssh };
          const updatedData = { ...fullData, ...data };
          if (updatedData.port) updatedData.port = Number(updatedData.port);
          if (updatedData.sshVerbosity) updatedData.sshVerbosity = Number(updatedData.sshVerbosity);
          await axios.post(`${API_BASE}/devices/modify/${data.name}`, null, {
            params: updatedData,
          });
          toastSuccess('Device updated');
        }
      } else {
        const {
          name: deviceNickname,
          deviceName,
          vendor,
          password,
          host,
          port,
          sshVerbosity,
          kexMethods,
          hostkeyAlgorithms,
          user
        } = data;

        if (!deviceNickname || !deviceName || !vendor || !password || !host) {
          toastError({ response: { data: { message: 'Missing required fields' } } });
          return;
        }

        const params = {
          deviceName,
          vendor,
          password,
          host,
          ...(port && { port: Number(port) }),
          ...(sshVerbosity && { sshVerbosity: Number(sshVerbosity) }),
          ...(kexMethods && { kexMethods }),
          ...(hostkeyAlgorithms && { hostkeyAlgorithms }),
          ...(user && { user })
        };

        await axios.post(`${API_BASE}/devices/create/${deviceNickname}`, null, { params });
        toastSuccess('Device added');
      }
      fetchDevices();
      setModal(null);
    } catch (e) {
      toastError(e);
    }
  };

  return (
    <div className="flex min-h-screen bg-white text-gray-800">
      <Head>
        <title>Chronicle UI</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <button onClick={() => setSidebarOpen(!sidebarOpen)} className="fixed top-4 left-4 z-50 bg-gray-800 text-white p-2 rounded-md shadow-md">
        <Menu size={20} />
      </button>

      {sidebarOpen && (
        <aside className="w-64 fixed top-0 left-0 h-full bg-gray-900 text-white p-4 shadow-lg z-40">
          <h1 className="text-2xl font-bold mb-6">Chronicle</h1>
          <nav className="space-y-2">
            <button onClick={() => setTab('home')} className={`w-full text-left px-4 py-2 rounded ${tab === 'home' ? 'bg-blue-700' : 'hover:bg-gray-800'}`}><Home size={16} className="inline mr-2" /> Home</button>
            <button onClick={() => setTab('devices')} className={`w-full text-left px-4 py-2 rounded ${tab === 'devices' ? 'bg-blue-700' : 'hover:bg-gray-800'}`}><HardDrive size={16} className="inline mr-2" /> Devices</button>
            <button onClick={() => setTab('settings')} className={`w-full text-left px-4 py-2 rounded ${tab === 'settings' ? 'bg-blue-700' : 'hover:bg-gray-800'}`}><Settings size={16} className="inline mr-2" /> Settings</button>
          </nav>
        </aside>
      )}

      <main className="flex-1 ml-64 p-6">
        {toast && (
          <div className={`mb-4 px-4 py-2 rounded ${toast.type === 'success' ? 'bg-green-100 text-green-800 border border-green-400' : 'bg-red-100 text-red-800 border border-red-400'}`}>{toast.msg}</div>
        )}

        {tab === 'home' && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Featured Devices</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {featured.map((dev, i) => (
                <Link key={i} href={`/device/${dev.device.name}`} className="border p-4 rounded bg-white shadow block">
                  <h3 className="font-semibold">{dev.device.name}</h3>
                  <p className="text-sm text-gray-600">{dev.device.vendorName} • {dev.device.deviceName}</p>
                </Link>
              ))}
            </div>
          </div>
        )}

        {tab === 'devices' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Devices</h2>
              <button onClick={() => setModal({ type: 'create', data: { name: '', deviceName: '', vendor: '', user: '', password: '', host: '', port: '', sshVerbosity: '', kexMethods: '', hostkeyAlgorithms: '' } })} className="bg-blue-600 text-white px-4 py-2 rounded inline-flex items-center">
                <PlusCircle className="mr-2" size={16} /> Add Device
              </button>
            </div>
            <table className="w-full bg-white shadow rounded overflow-hidden">
              <thead className="bg-gray-100 text-left text-sm">
                <tr>
                  <th className="p-3">Name</th>
                  <th className="p-3">Vendor</th>
                  <th className="p-3">Model</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {devices.map((d, i) => (
                  <tr key={i} className="border-t text-sm">
                    <td className="p-3">
                      <Link href={`/device/${d.device.name}`} className="text-blue-600 hover:underline">{d.device.name}</Link>
                    </td>
                    <td className="p-3">{d.device.vendorName}</td>
                    <td className="p-3">{d.device.deviceName}</td>
                    <td className="p-3 space-x-2">
                      <button onClick={async () => {
                        try {
                          const res = await axios.get(`${API_BASE}/devices/${d.device.name}`);
                          if (res.data.success) {
                            const fullData = { ...res.data.data.device, ...res.data.data.ssh };
                            setModal({ type: 'modify', data: fullData });
                          }
                        } catch (e) {
                          toastError(e);
                        }
                      }} className="text-blue-600"><Edit3 size={16} /></button>
                      <button onClick={() => deleteDevice(d.device.name)} className="text-red-600"><Trash2 size={16} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'settings' && settings && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Settings</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Object.entries(settings.ssh).map(([k, v]) => (
                <div key={k} className="flex flex-col">
                  <label htmlFor={`setting-${k}`} className="text-sm font-medium text-gray-700 mb-1 capitalize">{k}</label>
                  <input
                    id={`setting-${k}`}
                    name={k}
                    title={k}
                    defaultValue={String(v ?? '')}
                    placeholder={k}
                    onChange={(e) => setSettingsChanged({ ...settingsChanged, [k]: e.target.value })}
                    className="border px-3 py-2 rounded"
                  />
                </div>
              ))}
            </div>
            <button
              disabled={Object.keys(settingsChanged).length === 0}
              onClick={saveSettings}
              className={`mt-4 px-4 py-2 rounded ${Object.keys(settingsChanged).length ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
            >
              <Save className="inline mr-2" size={16} /> Save Changes
            </button>
          </div>
        )}

        {modal && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded shadow max-w-md w-full">
              <h3 className="text-lg font-semibold mb-4">{modal.type === 'create' ? 'Add Device' : 'Modify Device'}</h3>
              <div className="grid gap-2 mb-4">
                {Object.entries(modal.data).map(([k, v]) => (
                  <div key={k} className="flex flex-col">
                    <label htmlFor={`field-${k}`} className="text-sm font-medium text-gray-700 mb-1 capitalize">{k}</label>
                    <input id={`field-${k}`} name={k} title={k} placeholder={k} value={v || ''} type={(k === 'port' || k === 'sshVerbosity') ? 'number' : 'text'} onChange={(e) => setModal({ ...modal, data: { ...modal.data, [k]: e.target.value } })} className="border px-3 py-1 rounded" />
                  </div>
                ))}
              </div>
              <div className="flex justify-end gap-2">
                <button onClick={() => setModal(null)} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
                <button onClick={submitDevice} className="px-4 py-2 bg-blue-600 text-white rounded">
                  <Save className="inline mr-2" size={16} /> Save
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}