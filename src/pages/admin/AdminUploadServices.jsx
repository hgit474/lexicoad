import React, { useState, useRef } from 'react';
import { Link, useNavigate, useOutletContext } from 'react-router-dom';
import { useSite } from '../../context/SiteContext';
import { bulkInsertListings, clearAllListings, rollbackToExampleListings } from '../../services/dataService';
import { downloadListingsTemplate, parseListingsExcel } from '../../lib/excelTemplate';

export default function AdminUploadServices() {
  const { showToast } = useSite();
  const navigate = useNavigate();
  const outletCtx = useOutletContext();

  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [parsing, setParsing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isInserted, setIsInserted] = useState(false);
  const [parseResult, setParseResult] = useState(null);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'success' | 'error'

  // Double Warning Wipe State & Rollback State
  const [wipeModalOpen, setWipeModalOpen] = useState(false);
  const [wipeStep, setWipeStep] = useState(1);
  const [wipeConfirmText, setWipeConfirmText] = useState('');
  const [wiping, setWiping] = useState(false);
  const [rollingBack, setRollingBack] = useState(false);

  const dragCounter = useRef(0);
  const fileInputRef = useRef(null);

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current += 1;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setDragActive(true);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      e.dataTransfer.dropEffect = 'copy';
    } catch {}
    if (!dragActive) {
      setDragActive(true);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current -= 1;
    if (dragCounter.current <= 0) {
      setDragActive(false);
      dragCounter.current = 0;
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    dragCounter.current = 0;
    const dt = e.dataTransfer;
    if (dt && dt.files && dt.files.length > 0) {
      handleFileSelected(dt.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelected(e.target.files[0]);
    }
  };

  const handleFileSelected = (file) => {
    if (!file) return;
    const name = file.name.toLowerCase();
    if (!name.endsWith('.xlsx') && !name.endsWith('.xls')) {
      showToast('Please upload an Excel spreadsheet (.xlsx or .xls)', 'error');
      return;
    }
    setSelectedFile(file);
    setIsInserted(false);
    setParseResult(null);
    parseFile(file);
  };

  const parseFile = async (file) => {
    setParsing(true);
    try {
      const buffer = await file.arrayBuffer();
      const result = await parseListingsExcel(buffer);
      setParseResult(result);
      setParsing(false);
      if (result.validRows.length > 0) {
        showToast(`Parsed ${result.totalCount} rows: ${result.successCount} valid, ${result.errorCount} errors. Ready to insert!`, 'info');
      } else {
        showToast('No valid rows found in file. Please correct the validation errors below.', 'error');
      }
    } catch (err) {
      setParsing(false);
      console.error('Error parsing Excel file:', err);
      showToast(err.message || 'Failed to parse Excel file', 'error');
    }
  };

  const handleBulkInsert = async () => {
    if (!parseResult || parseResult.validRows.length === 0) {
      showToast('No valid rows to insert', 'warning');
      return;
    }

    setUploading(true);
    try {
      const insertRes = await bulkInsertListings(parseResult.validRows);
      setUploading(false);

      if (insertRes.success) {
        setIsInserted(true);
        showToast(`Successfully inserted ${parseResult.validRows.length} listings into Supabase & MySQL!`, 'success');
        if (outletCtx?.refreshCounts) {
          outletCtx.refreshCounts();
        }
      } else {
        showToast(`Bulk insert warning: ${insertRes.error || 'Check database connection'}`, 'warning');
      }
    } catch (err) {
      setUploading(false);
      console.error('Error inserting listings:', err);
      showToast(err.message || 'Failed to insert listings', 'error');
    }
  };

  const handleDownloadTemplate = () => {
    downloadListingsTemplate();
    showToast('Excel template downloaded! Fill and upload.', 'info');
  };

  const handleClearFile = () => {
    setSelectedFile(null);
    setParseResult(null);
    setIsInserted(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    showToast('File and parsed preview cleared', 'info');
  };

  const handleRemoveRow = (rowNumber) => {
    if (!parseResult) return;
    const newRows = parseResult.rows.filter(r => r.rowNumber !== rowNumber);
    const valid = newRows.filter(r => r.isValid).map(r => r.data);
    const successCount = newRows.filter(r => r.isValid).length;
    const errorCount = newRows.filter(r => !r.isValid).length;
    setParseResult({
      ...parseResult,
      totalCount: newRows.length,
      successCount,
      errorCount,
      rows: newRows,
      validRows: valid
    });
    showToast(`Removed row #${rowNumber} from batch preview`, 'info');
  };

  const displayedRows = () => {
    if (!parseResult) return [];
    if (activeTab === 'success') return parseResult.rows.filter(r => r.isValid);
    if (activeTab === 'error') return parseResult.rows.filter(r => !r.isValid);
    return parseResult.rows;
  };

  const handleConfirmWipe = async () => {
    if (wipeConfirmText.trim() !== 'DELETE') return;
    setWiping(true);
    try {
      await clearAllListings();
      setSelectedFile(null);
      setParseResult(null);
      setIsInserted(false);
      setWipeModalOpen(false);
      setWipeStep(1);
      setWipeConfirmText('');
      showToast('All listings and mock data permanently wiped from database!', 'success');
      if (outletCtx?.refreshCounts) {
        outletCtx.refreshCounts();
      }
    } catch (err) {
      console.error('Failed to wipe listings:', err);
      showToast('Failed to wipe listings from database', 'error');
    } finally {
      setWiping(false);
    }
  };

  const handleRollback = async () => {
    if (!window.confirm('Restore official curated example listings? This will seed the database with the official demo properties.')) {
      return;
    }
    setRollingBack(true);
    try {
      const restored = await rollbackToExampleListings();
      setSelectedFile(null);
      setParseResult(null);
      setIsInserted(false);
      showToast(`Restored ${restored.length} official example listings!`, 'success');
      if (outletCtx?.refreshCounts) {
        outletCtx.refreshCounts();
      }
    } catch (err) {
      console.error('Failed to rollback listings:', err);
      showToast('Failed to rollback listings', 'error');
    } finally {
      setRollingBack(false);
    }
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

        <div className="flex flex-wrap items-center gap-2">
          {/* Rollback to Example Listings */}
          <button
            onClick={handleRollback}
            disabled={rollingBack}
            className="inline-flex items-center gap-1.5 bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-xs font-bold px-3 py-2 rounded-xl transition shadow"
            title="Restore default example listings & templates"
          >
            <i className={`fa-solid ${rollingBack ? 'fa-circle-notch fa-spin' : 'fa-rotate-left'}`}></i>
            <span>{rollingBack ? 'Restoring...' : 'Rollback Examples'}</span>
          </button>

          {/* Wipe All Listings (Double Warning) */}
          <button
            onClick={() => {
              setWipeStep(1);
              setWipeConfirmText('');
              setWipeModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 bg-red-500/15 hover:bg-red-500/25 text-red-300 border border-red-500/30 text-xs font-bold px-3 py-2 rounded-xl transition shadow"
            title="Wipe all listings with double confirmation warning"
          >
            <i className="fa-solid fa-trash-can"></i>
            <span>Wipe All</span>
          </button>

          <button
            onClick={handleDownloadTemplate}
            className="inline-flex items-center gap-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold px-3 py-2 rounded-xl transition shadow"
            title="Download formatted .xlsx sample template"
          >
            <i className="fa-solid fa-download"></i> Template (.xlsx)
          </button>

          <Link
            to="/admin/listings"
            className="inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white border border-white/10 text-xs font-bold px-3 py-2 rounded-xl transition"
          >
            <i className="fa-solid fa-list-check"></i> Manage Listings
          </Link>
        </div>
      </div>

      {/* Upload Drop Zone Card */}
      <div className="bg-[#071343]/50 border border-white/10 rounded-3xl p-6 sm:p-8">
        <div
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center transition-all cursor-pointer relative select-none ${
            dragActive
              ? 'border-emerald-400 bg-emerald-500/20 ring-4 ring-emerald-500/30 scale-[1.01] shadow-2xl'
              : 'border-white/20 hover:border-white/40 bg-[#040A29]/50 hover:bg-[#040A29]/70'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            id="excelFileInput"
            accept=".xlsx, .xls"
            onChange={handleFileChange}
            className="hidden"
          />

          <div className={dragActive ? 'pointer-events-none' : ''}>
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto text-2xl mb-4 shadow-lg transition-transform duration-300 ${
              dragActive
                ? 'bg-emerald-500 text-white scale-110 animate-bounce shadow-emerald-500/50'
                : 'bg-emerald-500/15 border border-emerald-400/30 text-emerald-400'
            }`}>
              <i className="fa-solid fa-file-excel"></i>
            </div>

            <h3 className="text-base sm:text-lg font-grotesk font-bold text-white">
              {dragActive
                ? 'Drop your Excel file here now!'
                : selectedFile
                  ? selectedFile.name
                  : 'Select or drop your Excel file here'}
            </h3>

            <p className="text-slate-400 text-xs mt-1.5 max-w-md mx-auto">
              {selectedFile
                ? `${(selectedFile.size / 1024).toFixed(1)} KB • ${parsing ? 'Analyzing spreadsheet...' : 'File analyzed & ready'}`
                : 'Drag and drop .xlsx or .xls here, or click anywhere to browse'}
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                className="bg-white/10 hover:bg-white/20 text-white font-bold text-xs px-5 py-2.5 rounded-xl border border-white/15 transition inline-flex items-center gap-2"
              >
                <i className="fa-solid fa-folder-open"></i> {selectedFile ? 'Change File' : 'Browse File'}
              </button>

              {selectedFile && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClearFile();
                  }}
                  className="bg-red-500/15 hover:bg-red-500/30 text-red-300 font-bold text-xs px-4 py-2.5 rounded-xl border border-red-500/30 transition inline-flex items-center gap-1.5"
                  title="Remove uploaded file and reset preview"
                >
                  <i className="fa-solid fa-trash-can"></i> Remove File
                </button>
              )}

              {parseResult && parseResult.validRows.length > 0 && !isInserted && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleBulkInsert();
                  }}
                  disabled={uploading}
                  className="grad-btn text-white font-extrabold text-xs px-6 py-2.5 rounded-xl shadow-lg transition inline-flex items-center gap-2 disabled:opacity-50"
                >
                  {uploading ? (
                    <>
                      <i className="fa-solid fa-circle-notch fa-spin"></i> Bulk Inserting...
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-cloud-arrow-up"></i> Insert {parseResult.validRows.length} Valid Listings
                    </>
                  )}
                </button>
              )}

              {isInserted && (
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-2">
                  <i className="fa-solid fa-circle-check"></i> Inserted into Database!
                </span>
              )}
            </div>
          </div>
        </div>

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
                  <th className="py-3 px-4 text-right">Action</th>
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
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleRemoveRow(row.rowNumber)}
                        className="w-7 h-7 rounded-lg bg-red-500/15 hover:bg-red-500/30 text-red-300 inline-flex items-center justify-center transition"
                        title={`Remove row #${row.rowNumber} from batch`}
                      >
                        <i className="fa-solid fa-trash-can text-[11px]"></i>
                      </button>
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

      {/* DOUBLE WARNING WIPE MODAL */}
      {wipeModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#071343] border border-red-500/40 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative">
            <button
              onClick={() => {
                setWipeModalOpen(false);
                setWipeStep(1);
                setWipeConfirmText('');
              }}
              className="absolute top-5 right-5 text-slate-400 hover:text-white text-lg"
            >
              <i className="fa-solid fa-xmark"></i>
            </button>

            {wipeStep === 1 ? (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-red-500/20 text-red-400 border border-red-500/30 flex items-center justify-center mx-auto text-3xl">
                  <i className="fa-solid fa-triangle-exclamation"></i>
                </div>
                <div>
                  <div className="inline-block px-3 py-1 rounded-full bg-red-500/20 text-red-300 text-[11px] font-extrabold tracking-wider uppercase mb-2">
                    Warning Step 1 of 2
                  </div>
                  <h3 className="font-grotesk font-bold text-xl sm:text-2xl text-white">
                    Clear All Listings & Fake Data?
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
                    This will permanently delete all listings from both your Supabase / PostgreSQL database and local storage. Public service category pages will be emptied.
                  </p>
                </div>

                <div className="bg-red-950/40 border border-red-500/30 rounded-xl p-3 text-left text-xs text-red-200/90 flex items-start gap-2.5">
                  <i className="fa-solid fa-circle-info text-red-400 mt-0.5 shrink-0"></i>
                  <span>
                    You can always use <strong>"Rollback Examples"</strong> to restore the official sample listings anytime.
                  </span>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setWipeModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-300 hover:bg-white/10 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => setWipeStep(2)}
                    className="px-5 py-2.5 rounded-xl text-xs font-extrabold bg-red-600 hover:bg-red-500 text-white shadow-lg transition flex items-center gap-1.5"
                  >
                    <span>Proceed to Final Warning</span>
                    <i className="fa-solid fa-arrow-right text-[10px]"></i>
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-red-600 text-white flex items-center justify-center mx-auto text-3xl animate-pulse shadow-lg shadow-red-900/60">
                  <i className="fa-solid fa-skull-crossbones"></i>
                </div>
                <div>
                  <div className="inline-block px-3 py-1 rounded-full bg-red-600/30 text-red-200 border border-red-500/50 text-[11px] font-extrabold tracking-wider uppercase mb-2">
                    Final Confirmation Step 2 of 2
                  </div>
                  <h3 className="font-grotesk font-bold text-xl sm:text-2xl text-white">
                    Are you absolutely sure?
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
                    This action is <strong className="text-red-400">IRREVERSIBLE</strong>. Type <span className="font-mono bg-black/40 px-2 py-0.5 rounded text-red-300 font-bold border border-red-500/30">DELETE</span> below to confirm permanent deletion.
                  </p>
                </div>

                <div className="pt-2">
                  <input
                    type="text"
                    value={wipeConfirmText}
                    onChange={(e) => setWipeConfirmText(e.target.value)}
                    placeholder="Type DELETE to confirm"
                    autoFocus
                    className="w-full bg-[#040A29] border-2 border-red-500/50 focus:border-red-400 rounded-xl py-3 px-4 text-center font-mono text-sm text-white placeholder-slate-500 outline-none"
                  />
                </div>

                <div className="flex items-center justify-between gap-3 pt-3 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => {
                      setWipeStep(1);
                      setWipeConfirmText('');
                    }}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-300 hover:bg-white/10 transition"
                  >
                    ← Back
                  </button>
                  <button
                    type="button"
                    disabled={wipeConfirmText.trim() !== 'DELETE' || wiping}
                    onClick={handleConfirmWipe}
                    className="px-6 py-2.5 rounded-xl text-xs font-extrabold bg-red-600 hover:bg-red-500 disabled:opacity-40 disabled:cursor-not-allowed text-white shadow-xl transition flex items-center gap-2"
                  >
                    {wiping ? (
                      <>
                        <i className="fa-solid fa-circle-notch fa-spin"></i> Wiping Database...
                      </>
                    ) : (
                      <>
                        <i className="fa-solid fa-trash-can"></i> Permanently Wipe All Listings
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
