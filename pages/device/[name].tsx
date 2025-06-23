import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Head from 'next/head';
import { useRouter } from 'next/router';
import {
  Save,
  Loader2,
  Pencil,
  Download,
  X,
  Menu,
  Home,
  HardDrive,
  Settings
} from 'lucide-react';
import Link from 'next/link';

const API_BASE = 'http://127.0.0.1:8000';

export default function DevicePage() {
  const router = useRouter();
  const { name } = router.query;

  const [device, setDevice] = useState(null);
  const [form, setForm] = useState({});
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (name) fetchDevice();
  }, [name]);

  const fetchDevice = async () => {
    try {
      const res = await axios.get(`${API_BASE}/devices/${name}`);
      if (res.data.success) {
        const fullData = { ...res.data.data.device, ...res.data.data.ssh };
        setDevice(fullData);
        setForm(fullData);
      }
    } catch (e) {
      setToast({ type: 'error', msg: 'Failed to fetch device data' });
    }
  };

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/devices/${name}/config`);
      if (res.data.success) {
        setConfig(res.data.data.config);
        setToast({ type: 'success', msg: 'Configuration fetched successfully' });
      } else {
        const msg = res.data.description || 'Error fetching config';
        setToast({ type: 'error', msg });
      }
    } catch (e) {
      const msg = e?.response?.data?.description || 'Failed to fetch configuration';
      setToast({ type: 'error', msg });
    } finally {
      setLoading(false);
    }
  };

  const saveChanges = async () => {
    try {
      await axios.post(`${API_BASE}/devices/modify/${name}`, null, { params: form });
      setToast({ type: 'success', msg: 'Device updated successfully' });
      setEditing(false);
      fetchDevice();
    } catch (e) {
      setToast({ type: 'error', msg: 'Failed to save changes' });
    }
  };

  if (!device) return null;

  return (
    <div className="flex min-h-screen bg-white text-gray-800">
      <Head>
        <title>Device: {name}</title>
      </Head>

      <button onClick={() => setSidebarOpen(!sidebarOpen)} className="fixed top-4 left-4 z-50 bg-gray-800 text-white p-2 rounded-md shadow-md">
        <Menu size={20} />
      </button>

      {sidebarOpen && (
        <aside className="w-64 fixed top-0 left-0 h-full bg-gray-900 text-white p-4 shadow-lg z-40">
          <h1 className="text-2xl font-bold mb-6">Chronicle</h1>
          <nav className="space-y-2">
            <Link href="/" className="w-full block text-left px-4 py-2 rounded hover:bg-gray-800"><Home size={16} className="inline mr-2" /> Home</Link>
            <Link href="/" className="w-full block text-left px-4 py-2 rounded hover:bg-gray-800"><HardDrive size={16} className="inline mr-2" /> Devices</Link>
            <Link href="/" className="w-full block text-left px-4 py-2 rounded hover:bg-gray-800"><Settings size={16} className="inline mr-2" /> Settings</Link>
          </nav>
        </aside>
      )}

      <main className="flex-1 ml-64 p-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold">Device: {name}</h1>
            {!editing && (
              <button onClick={() => setEditing(true)} className="flex items-center px-4 py-2 bg-blue-600 text-white rounded">
                <Pencil size={16} className="mr-2" /> Edit
              </button>
            )}
          </div>

          {toast && (
            <div className={`mb-4 px-4 py-2 rounded ${toast.type === 'success' ? 'bg-green-100 text-green-800 border border-green-400' : 'bg-red-100 text-red-800 border border-red-400'}`}>
              {toast.msg}
            </div>
          )}

          {editing && (
            <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded shadow max-w-2xl w-full">
                <h3 className="text-lg font-semibold mb-4">Edit Device</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  {Object.entries(form).map(([k, v]) => (
                    <div key={k} className="flex flex-col">
                      <label htmlFor={`field-${k}`} className="text-sm font-medium text-gray-700 mb-1 capitalize">{k}</label>
                      <input
                        id={`field-${k}`}
                        name={k}
                        title={k}
                        placeholder={k}
                        value={v || ''}
                        onChange={(e) => setForm({ ...form, [k]: e.target.value })}
                        className="border px-3 py-2 rounded"
                      />
                    </div>
                  ))}
                </div>
                <div className="flex justify-end gap-2">
                  <button onClick={() => setEditing(false)} className="px-4 py-2 bg-gray-200 rounded"><X className="inline mr-1" size={16} />Cancel</button>
                  <button onClick={saveChanges} className="px-4 py-2 bg-blue-600 text-white rounded">
                    <Save className="inline mr-2" size={16} /> Save Changes
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            {['deviceName', 'vendorName', 'host'].map((k) => (
              <div key={k} className="border rounded p-4 bg-white shadow-sm">
                <label className="text-sm font-semibold text-gray-600 block mb-2 capitalize">{k}</label>
                <div className="text-gray-900 text-sm break-all">{device[k]}</div>
              </div>
            ))}
          </div>

          <button onClick={fetchConfig} className="flex items-center px-4 py-2 bg-gray-700 text-white rounded">
            <Download size={16} className="mr-2" /> Fetch Configuration
          </button>

          {loading && (
            <div className="mt-4 text-gray-500"><Loader2 className="inline mr-2 animate-spin" size={16} /> Loading configuration...</div>
          )}

          {config && (
            <div className="mt-6 bg-gray-100 rounded p-4 overflow-auto max-h-[500px] border">
              <pre className="text-sm font-mono whitespace-pre-wrap text-gray-800">
                {Array.isArray(config) ? config.join('\n') : config}
              </pre>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}