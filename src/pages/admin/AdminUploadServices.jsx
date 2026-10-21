import React, { useState } from 'react';
import { Link, useNavigate, useOutletContext } from 'react-router-dom';
import { useSite } from '../../context/SiteContext';
import { bulkInsertListings } from '../../services/dataService';
import { downloadListingsTemplate, parseListingsExcel } from '../../lib/excelTemplate';

export default function AdminUploadServices() {
  const { showToast } = useSite();
  const navigate = useNavigate();
  const outletCtx = useOutletContext();

  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [parsing, setParsing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [parseResult, setParseResult] = useState(null);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'success' | 'error'

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelected(e.target.files[0]);
    }
  };

  const handleFileSelected = (file) => {
    const name = file.name.toLowerCase();
    if (!name.endsWith('.xlsx') && !name.endsWith('.xls')) {
      showToast('Please upload an Excel spreadsheet (.xlsx or .xls)', 'error');
      return;
    }
    setSelectedFile(file);
    setParseResult(null);
  };

  const handleProcessFile = async () => {
    if (!selectedFile) {
      showToast('Please choose an Excel file first', 'warning');
      return;
    }

    setParsing(true);
    try {
      const buffer = await selectedFile.arrayBuffer();
      const result = await parseListingsExcel(buffer);
      setParseResult(result);
      setParsing(false);

      if (result.validRows.length > 0) {
        setUploading(true);
        const insertRes = await bulkInsertListings(result.validRows);
        setUploading(false);

        if (insertRes.success) {
          showToast(`Successfully inserted ${result.validRows.length} listings into Supabase/database!`, 'success');
          if (outletCtx?.refreshCounts) {
            outletCtx.refreshCounts();
          }
        } else {
          showToast(`Bulk insert warning: ${insertRes.error || 'Check database connection'}`, 'warning');
        }
      } else {
        showToast('No valid rows found in file. Please correct the validation errors below.', 'error');
      }
    } catch (err) {
      setParsing(false);
      setUploading(false);
      console.error('Error processing Excel file:', err);
      showToast(err.message || 'Failed to parse Excel file', 'error');
    }
  };

  const handleDownloadTemplate = () => {
    downloadListingsTemplate();
    showToast('Excel template downloaded! Fill and upload.', 'info');
  };

  const displayedRows = () => {
    if (!parseResult) return [];
    if (activeTab === 'success') return parseResult.rows.filter(r => r.isValid);
    if (activeTab === 'error') return parseResult.rows.filter(r => !r.isValid);
    return parseResult.rows;
  };

  return (
    <div className="space-y-6">
      {/* Top Action Header Card */}
      <div className="bg-[#071343]/80 backdrop-blur border border-white/10 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 text-xs font-bold px-3 py-1 rounded-full mb-2">
            <i className="fa-solid fa-file-excel"></i> BULK LISTINGS IMPORTER
          </div>
          <h2 className="text-xl sm:text-2xl font-grotesk font-bold text-white">
            Upload Services & Listings (.xlsx)
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-2xl">
            Upload an Excel spreadsheet to bulk-insert advertising inventories into Supabase.
            Required fields: <strong className="text-slate-200">category, subcategory, title, price</strong>.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleDownloadTemplate}
            className="inline-flex items-center gap-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold px-4 py-2.5 rounded-xl transition shadow"
            title="Download formatted .xlsx sample template"
          >
            <i className="fa-solid fa-download"></i> Download Excel Template
          </button>
          <Link
            to="/admin/listings"
            className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/10 text-xs font-bold px-4 py-2.5 rounded-xl transition"
          >
            <i className="fa-solid fa-list-check"></i> Manage Listings
          </Link>
        </div>
      </div>

      {/* Upload Drop Zone Card */}
      <div className="bg-[#071343]/50 border border-white/10 rounded-3xl p-6 sm:p-8">
        <form
          onDragEnter={handleDrag}
          onSubmit={(e) => e.preventDefault()}
          className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center transition-all ${
            dragActive
              ? 'border-laxBlue-400 bg-laxBlue-500/10 scale-[1.01]'
              : 'border-white/15 hover:border-white/30 bg-[#040A29]/40'
          }`}
        >
          <input
            type="file"
            id="excelFileInput"
            accept=".xlsx, .xls"
            onChange={handleFileChange}
            className="hidden"
          />

          <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 border border-emerald-400/30 text-emerald-400 flex items-center justify-center mx-auto text-2xl mb-4 shadow-lg shadow-emerald-950/40">
            <i className="fa-solid fa-file-excel"></i>
          </div>

          <h3 className="text-base sm:text-lg font-grotesk font-bold text-white">
            {selectedFile ? selectedFile.name : 'Select or drop your Excel file here'}
          </h3>

          <p className="text-slate-400 text-xs mt-1.5 max-w-md mx-auto">
            {selectedFile
              ? `${(selectedFile.size / 1024).toFixed(1)} KB • Ready for validation and Supabase bulk insert`
              : 'Supports Microsoft Excel .xlsx and .xls formats with standard column headers'}
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <label
              htmlFor="excelFileInput"
              className="cursor-pointer bg-white/10 hover:bg-white/20 text-white font-bold text-xs px-5 py-2.5 rounded-xl border border-white/15 transition inline-flex items-center gap-2"
            >
              <i className="fa-solid fa-folder-open"></i> {selectedFile ? 'Change File' : 'Browse File'}
            </label>

            {selectedFile && (
              <button
                type="button"
                onClick={handleProcessFile}
                disabled={parsing || uploading}
                className="grad-btn text-white font-extrabold text-xs px-6 py-2.5 rounded-xl shadow-lg transition inline-flex items-center gap-2 disabled:opacity-50"
              >
                {parsing ? (
                  <>
                    <i className="fa-solid fa-circle-notch fa-spin"></i> Parsing Excel...
                  </>
                ) : uploading ? (
                  <>
                    <i className="fa-solid fa-circle-notch fa-spin"></i> Bulk Inserting to Supabase...
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-cloud-arrow-up"></i> Parse & Upload to Supabase
                  </>
                )}
              </button>
            )}
          </div>
        </form>

        {/* Expected Schema Pill Bar */}
        <div className="mt-6 pt-5 border-t border-white/10">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">
            Expected Excel Columns & Types:
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-mono font-bold">
              category <span className="text-[10px] text-emerald-400/70 font-sans">*req</span>
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-mono font-bold">
              subcategory <span className="text-[10px] text-emerald-400/70 font-sans">*req</span>
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-mono font-bold">
              title <span className="text-[10px] text-emerald-400/70 font-sans">*req</span>
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-blue-500/15 text-blue-300 border border-blue-500/30 font-mono font-bold">
              location
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-mono font-bold">
              price <span className="text-[10px] text-emerald-400/70 font-sans">*numeric</span>
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-blue-500/15 text-blue-300 border border-blue-500/30 font-mono font-bold">
              media_type
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-purple-500/15 text-purple-300 border border-purple-500/30 font-mono">
              reach (optional)
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-purple-500/15 text-purple-300 border border-purple-500/30 font-mono">
              description (optional)
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-purple-500/15 text-purple-300 border border-purple-500/30 font-mono">
              image_url (optional)
            </span>
          </div>
        </div>
      </div>

      {/* Parse & Upload Summary Report */}
      {parseResult && (
        <div className="bg-[#071343]/80 border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6">
          {/* KPI Header Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-[#040A29]/70 border border-white/10 rounded-2xl p-4 flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center text-xl shrink-0">
                <i className="fa-solid fa-table-list"></i>
              </div>
              <div>
                <div className="text-2xl font-grotesk font-bold text-white">
                  {parseResult.totalCount}
                </div>
                <div className="text-xs text-slate-400 font-semibold">Total Rows Parsed</div>
              </div>
            </div>

            <div className="bg-[#040A29]/70 border border-emerald-500/30 rounded-2xl p-4 flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xl shrink-0">
                <i className="fa-solid fa-circle-check"></i>
              </div>
              <div>
                <div className="text-2xl font-grotesk font-bold text-emerald-400">
                  {parseResult.successCount}
                </div>
                <div className="text-xs text-slate-400 font-semibold">Valid & Inserted</div>
              </div>
            </div>

            <div className={`bg-[#040A29]/70 rounded-2xl p-4 flex items-center gap-3 border ${
              parseResult.errorCount > 0 ? 'border-red-500/40' : 'border-white/10'
            }`}>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0 ${
                parseResult.errorCount > 0 ? 'bg-red-500/20 text-red-400' : 'bg-slate-500/20 text-slate-400'
              }`}>
                <i className="fa-solid fa-triangle-exclamation"></i>
              </div>
              <div>
                <div className={`text-2xl font-grotesk font-bold ${
                  parseResult.errorCount > 0 ? 'text-red-400' : 'text-slate-400'
                }`}>
                  {parseResult.errorCount}
                </div>
                <div className="text-xs text-slate-400 font-semibold">Failed Validation</div>
              </div>
            </div>
          </div>

          {/* Filter Bar & Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
            <div>
              <h3 className="font-grotesk font-bold text-base sm:text-lg text-white">
                Per-Row Verification Summary
              </h3>
              <p className="text-xs text-slate-400">
                Detailed validation breakdown for each row mapped to the listings schema
              </p>
            </div>

            <div className="flex items-center gap-1.5 bg-[#040A29]/60 p-1 rounded-xl border border-white/10 text-xs font-bold self-start">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  activeTab === 'all' ? 'bg-white/20 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                All ({parseResult.totalCount})
              </button>
              <button
                onClick={() => setActiveTab('success')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  activeTab === 'success' ? 'bg-emerald-500/30 text-emerald-300' : 'text-slate-400 hover:text-white'
                }`}
              >
                Valid ({parseResult.successCount})
              </button>
              <button
                onClick={() => setActiveTab('error')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  activeTab === 'error' ? 'bg-red-500/30 text-red-300' : 'text-slate-400 hover:text-white'
                }`}
              >
                Errors ({parseResult.errorCount})
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-2xl border border-white/10 bg-[#040A29]/40">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-white/10 text-slate-400 font-bold bg-[#040A29]/80 uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4 w-14">Row</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Title</th>
                  <th className="py-3 px-4">Category / Subcategory</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Media Type</th>
                  <th className="py-3 px-4">Validation Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-medium">
                {displayedRows().map((row) => (
                  <tr
                    key={row.rowNumber}
                    className={`hover:bg-white/[0.03] transition ${
                      !row.isValid ? 'bg-red-500/[0.06]' : ''
                    }`}
                  >
                    <td className="py-3 px-4 font-mono text-slate-400">
                      #{row.rowNumber}
                    </td>
                    <td className="py-3 px-4">
                      {row.isValid ? (
                        <span className="inline-flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-bold text-[10px]">
                          <i className="fa-solid fa-check"></i> Success
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 bg-red-500/20 text-red-300 border border-red-500/30 px-2.5 py-0.5 rounded-full font-bold text-[10px]">
                          <i className="fa-solid fa-xmark"></i> Failed
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-white font-bold max-w-[200px] truncate">
                      {row.title}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded text-[10px] font-bold">
                          {row.category || '—'}
                        </span>
                        <span className="text-slate-500">/</span>
                        <span className="bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded text-[10px] font-bold">
                          {row.subcategory || '—'}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-300 max-w-[140px] truncate">
                      {row.location}
                    </td>
                    <td className="py-3 px-4 text-emerald-400 font-bold font-grotesk">
                      ₹{row.price ? Number(row.price).toLocaleString('en-IN') : '0'}
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      <span className="bg-white/10 px-2 py-0.5 rounded text-[10px]">
                        {row.media_type}
                      </span>
                    </td>
                    <td className="py-3 px-4 max-w-[240px]">
                      {row.isValid ? (
                        <span className="text-slate-400 text-[11px]">
                          Ready & verified for schema
                        </span>
                      ) : (
                        <ul className="text-red-300 text-[11px] list-disc list-inside space-y-0.5 font-bold">
                          {row.errors.map((err, i) => (
                            <li key={i}>{err}</li>
                          ))}
                        </ul>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Bottom Actions */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-white/10">
            <div className="text-xs text-slate-400">
              Showing {displayedRows().length} of {parseResult.totalCount} rows
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setSelectedFile(null);
                  setParseResult(null);
                }}
                className="bg-white/10 hover:bg-white/20 text-white font-bold text-xs px-4 py-2 rounded-xl transition"
              >
                Upload Another File
              </button>
              <button
                onClick={() => navigate('/admin/listings')}
                className="grad-btn text-white font-extrabold text-xs px-5 py-2 rounded-xl shadow transition flex items-center gap-1.5"
              >
                View in Manage Listings <i className="fa-solid fa-arrow-right text-[11px]"></i>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
