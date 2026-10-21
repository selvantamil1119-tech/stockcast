import React, { useState, useEffect } from 'react';
import {
  Key,
  Upload,
  Copy,
  Check,
  RefreshCw,
  Building2,
  Download,
  Terminal,
  AlertCircle,
  CheckCircle2,
  FileSpreadsheet
} from 'lucide-react';
import { fetchProfile, updateProfile, regenerateApiKey } from '../services/api';

const getApiBase = () => {
  const envUrl = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_API_URL : null;
  if (envUrl) {
    const clean = envUrl.trim().replace(/\/+$/, '');
    return clean.endsWith('/api') ? clean : `${clean}/api`;
  }
  return (typeof window !== 'undefined' && window.location.hostname === 'localhost' && window.location.port === '3000')
    ? 'http://localhost:5001/api'
    : '/api';
};

const API_BASE = getApiBase();

export default function Settings({ onUploadSuccess }) {
  const [profile, setProfile] = useState({
    businessName: '',
    businessAddress: '',
    businessPhone: '',
    gstNumber: '',
    businessType: 'Retail Store'
  });
  const [apiKey, setApiKey] = useState('');
  const [copied, setCopied] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');

  // CSV Upload State
  const [uploadFile, setUploadFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [uploadError, setUploadError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const res = await fetchProfile();
        if (res.user) {
          setProfile({
            businessName: res.user.businessName || '',
            businessAddress: res.user.businessAddress || '',
            businessPhone: res.user.businessPhone || '',
            gstNumber: res.user.gstNumber || '',
            businessType: res.user.businessType || 'Retail Store'
          });
          setApiKey(res.user.apiKey || '');
        }
      } catch (err) {
        console.error('Failed to load profile:', err);
      }
    }
    load();
  }, []);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileSuccess('');
    setProfileError('');

    try {
      const res = await updateProfile(profile);
      setProfileSuccess('Business profile updated successfully');
      if (res.user) {
        localStorage.setItem('user', JSON.stringify(res.user));
      }
    } catch (err) {
      setProfileError(err.message || 'Failed to update profile');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleCopyKey = () => {
    if (!apiKey) return;
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRegenerateKey = async () => {
    if (!window.confirm('Are you sure you want to regenerate your POS API Key? Any POS machines using the old key will need to be updated.')) {
      return;
    }

    try {
      const res = await regenerateApiKey();
      if (res.apiKey) {
        setApiKey(res.apiKey);
        alert('New API Key generated successfully!');
      }
    } catch (err) {
      alert('Failed to regenerate key: ' + err.message);
    }
  };

  const handleCsvUpload = async (e) => {
    e.preventDefault();
    if (!uploadFile) {
      setUploadError('Please select a .csv file first');
      return;
    }

    setUploading(true);
    setUploadResult(null);
    setUploadError('');

    try {
      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('replaceAll', 'true');

      const token = localStorage.getItem('token');
      const headers = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${API_BASE}/upload/products`, {
        method: 'POST',
        headers,
        body: formData
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Upload failed');
      }

      setUploadResult(data);
      setUploadFile(null);
      if (onUploadSuccess) onUploadSuccess();
    } catch (err) {
      setUploadError(err.message || 'Failed to upload CSV');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-xl font-bold text-white">Store Settings &amp; Real-World Integration</h2>
        <p className="text-xs text-slate-400 mt-1">
          Configure business details, upload product catalog via CSV, and integrate with billing/POS machines
        </p>
      </div>

      {/* SECTION 1: Business Profile */}
      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <Building2 className="w-4 h-4 text-sky-400" />
          <h3 className="text-sm font-semibold text-white">Business Profile</h3>
        </div>

        {profileSuccess && (
          <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{profileSuccess}</span>
          </div>
        )}
        {profileError && (
          <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{profileError}</span>
          </div>
        )}

        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Business / Shop Name *</label>
              <input
                type="text"
                value={profile.businessName}
                onChange={(e) => setProfile({ ...profile, businessName: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-sky-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Business Type</label>
              <select
                value={profile.businessType}
                onChange={(e) => setProfile({ ...profile, businessType: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-sky-500"
              >
                <option value="Retail Store">Retail Store</option>
                <option value="Wholesale">Wholesale</option>
                <option value="E-Commerce">E-Commerce</option>
                <option value="Supermarket">Supermarket</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Phone Number</label>
              <input
                type="text"
                value={profile.businessPhone}
                onChange={(e) => setProfile({ ...profile, businessPhone: e.target.value })}
                placeholder="+91 98765 43210"
                className="w-full px-3 py-2 text-sm bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">GST / Tax ID</label>
              <input
                type="text"
                value={profile.gstNumber}
                onChange={(e) => setProfile({ ...profile, gstNumber: e.target.value })}
                placeholder="22AAAAA0000A1Z5"
                className="w-full px-3 py-2 text-sm bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Store Address</label>
            <input
              type="text"
              value={profile.businessAddress}
              onChange={(e) => setProfile({ ...profile, businessAddress: e.target.value })}
              placeholder="Shop #12, Market Complex, MG Road"
              className="w-full px-3 py-2 text-sm bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-sky-500"
            />
          </div>

          <button
            type="submit"
            disabled={profileLoading}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-sky-600 hover:bg-sky-500 text-white transition disabled:opacity-50"
          >
            {profileLoading ? 'Saving...' : 'Save Profile Changes'}
          </button>
        </form>
      </div>

      {/* SECTION 2: POS Integration & API Key */}
      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-amber-400" />
            <div>
              <h3 className="text-sm font-semibold text-white">Point-of-Sale (POS) API Integration</h3>
              <p className="text-[11px] text-slate-400">Connect billing machines or barcode scanners to send real-time sales</p>
            </div>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            Real-Time Push Active
          </span>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">Shop API Key (Header: X-API-Key)</label>
          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value={apiKey || 'Generate key after login'}
              className="flex-1 px-3 py-2 text-xs font-mono bg-slate-950 border border-slate-800 rounded-lg text-amber-300 focus:outline-none select-all"
            />
            <button
              onClick={handleCopyKey}
              className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition flex items-center gap-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>
            <button
              onClick={handleRegenerateKey}
              className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-xs transition"
              title="Regenerate API Key"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Integration Instructions */}
        <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono space-y-2">
          <div className="flex items-center gap-2 text-slate-400 text-[11px]">
            <Terminal className="w-3.5 h-3.5 text-sky-400" />
            <span>POS Webhook / Billing Integration Endpoint:</span>
          </div>
          <p className="text-slate-300">
            <span className="text-emerald-400 font-bold">POST</span> {API_BASE}/pos/sale
          </p>
          <div className="text-slate-400 text-[11px] pt-1">
            Headers: <span className="text-amber-400">X-API-Key: {apiKey || 'YOUR_KEY'}</span>, <span className="text-slate-300">Content-Type: application/json</span>
          </div>
          <div className="text-slate-400 text-[11px]">
            Body: <span className="text-sky-300">&#123; "sku": "ELEC-101", "quantity": 1 &#125;</span>
          </div>
        </div>
      </div>

      {/* SECTION 3: CSV Bulk Upload */}
      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Upload className="w-4 h-4 text-sky-400" />
            <div>
              <h3 className="text-sm font-semibold text-white">Bulk Product Import (CSV)</h3>
              <p className="text-[11px] text-slate-400">Upload your entire shop catalog at once from an Excel or CSV file</p>
            </div>
          </div>
          <a
            href={`${API_BASE}/upload/template`}
            download="stockcast_template.csv"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-sky-400 border border-slate-700 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download CSV Template</span>
          </a>
        </div>

        {uploadResult && (
          <div className="p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs space-y-1">
            <div className="flex items-center gap-2 font-semibold">
              <CheckCircle2 className="w-4 h-4" />
              <span>{uploadResult.message}</span>
            </div>
            <p className="text-emerald-400/80 pl-6">
              Created: {uploadResult.createdCount} SKUs, Updated: {uploadResult.updatedCount} SKUs
            </p>
          </div>
        )}

        {uploadError && (
          <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{uploadError}</span>
          </div>
        )}

        <form onSubmit={handleCsvUpload} className="space-y-3">
          <div className="border-2 border-dashed border-slate-700 hover:border-slate-600 rounded-xl p-6 text-center transition">
            <FileSpreadsheet className="w-8 h-8 text-slate-500 mx-auto mb-2" />
            <input
              type="file"
              accept=".csv"
              onChange={(e) => setUploadFile(e.target.files[0] || null)}
              className="text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-sky-600 file:text-white hover:file:bg-sky-500 cursor-pointer"
            />
            {uploadFile && (
              <p className="text-xs text-sky-400 mt-2 font-mono">Selected: {uploadFile.name}</p>
            )}
            <p className="text-[11px] text-slate-500 mt-1">
              Supported columns: sku, name, category, unitCost, unitPrice, currentStock, minStockLevel, maxStockLevel, safetyStock, leadTimeDays
            </p>
          </div>

          <button
            type="submit"
            disabled={uploading || !uploadFile}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-sky-600 hover:bg-sky-500 text-white transition disabled:opacity-50"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>{uploading ? 'Processing File...' : 'Upload & Import Catalog'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
