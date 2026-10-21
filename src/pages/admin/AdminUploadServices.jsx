import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useOutletContext, useLocation, useSearchParams } from 'react-router-dom';
import { useSite } from '../../context/SiteContext';
import {
  bulkUpsertListingsByCategory,
  clearAllListings,
  rollbackToExampleListings,
  getUploadLogs,
  getListings,
  getLocations
} from '../../services/dataService';
import {
  CATEGORY_SCHEMAS,
  downloadCategoryTemplate,
  downloadErrorReport,
  parseCategoryExcel
} from '../../lib/excelTemplate';

const INVENTORY_CATEGORIES = [
  { key: 'Transit', label: 'Transit', icon: 'fa-train-subway', desc: 'Metro trains, railway concourses, coaches & station branding' },
  { key: 'Bus', label: 'Bus Fleet', icon: 'fa-bus', desc: 'City bus fleets, electric AC buses, back panels & depot kiosks' },
  { key: 'Cinema', label: 'Cinema', icon: 'fa-film', desc: 'Multiplex screens, on-screen video ads, lobby video walls & audis' },
  { key: 'Outdoor', label: 'Outdoor', icon: 'fa-signs-post', desc: 'Highway unipoles, arterial hoardings, gantries & bridge displays' },
  { key: 'Airport', label: 'Airport', icon: 'fa-plane-departure', desc: 'Terminal lightboxes, digital concourse totems & aerobridge wraps' },
  { key: 'Digital', label: 'Digital DOOH', icon: 'fa-tv', desc: 'Iconic curved LED screens, mall digital totems & video walls' }
];

export default function AdminUploadServices() {
  const { showToast } = useSite();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const outletCtx = useOutletContext();

  // Active Category Selection (from URL ?category= or state or default Transit)
  const initialCat = searchParams.get('category') || location.state?.category || 'Transit';
  const initialValid = INVENTORY_CATEGORIES.find(c => c.key.toLowerCase() === initialCat.toLowerCase())?.key || 'Transit';
  const [selectedCategory, setSelectedCategory] = useState(initialValid);

  useEffect(() => {
    const catParam = searchParams.get('category') || location.state?.category;
    if (catParam) {
      const match = INVENTORY_CATEGORIES.find(c => c.key.toLowerCase() === catParam.toLowerCase());
      if (match && match.key !== selectedCategory) {
        setSelectedCategory(match.key);
      }
    }
  }, [searchParams, location.state]);

  // File & Upload States
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [parsing, setParsing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [parseResult, setParseResult] = useState(null);
  const [activeTab, setActiveTab] = useState('preview'); // 'preview' | 'all' | 'success' | 'error'
  const [abortOnError, setAbortOnError] = useState(false);

  // Batch Progress Tracking (Batches of 500)
  const [progressState, setProgressState] = useState(null); // { percent, currentBatch, totalBatches, processed, total }
  const [importSummary, setImportSummary] = useState(null); // { added, updated, skipped, failed, total }

  // Upload Audit History Logs
  const [uploadLogs, setUploadLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  // Double Warning Wipe State & Rollback State
  const [wipeModalOpen, setWipeModalOpen] = useState(false);
  const [wipeStep, setWipeStep] = useState(1);
  const [wipeConfirmText, setWipeConfirmText] = useState('');
  const [wiping, setWiping] = useState(false);
  const [rollingBack, setRollingBack] = useState(false);

  const dragCounter = useRef(0);
  const fileInputRef = useRef(null);

  // Fetch upload logs on mount
  const fetchLogs = async () => {
    setLoadingLogs(true);
    try {
      const logs = await getUploadLogs();
      setUploadLogs(logs || []);
    } catch (err) {
      console.warn('Failed to fetch upload logs:', err);
    } finally {
      setLoadingLogs(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  // Drag & Drop Handlers
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
    if (!name.endsWith('.xlsx') && !name.endsWith('.xls') && !name.endsWith('.csv')) {
      showToast('Please upload an Excel spreadsheet (.xlsx, .xls) or CSV (.csv)', 'error');
      return;
    }
    setSelectedFile(file);
    setParseResult(null);
    setImportSummary(null);
    setProgressState(null);
    parseFile(file, selectedCategory);
  };

  // Parse and validate file using category-specific validator
  const parseFile = async (file, category) => {
    setParsing(true);
    try {
      // Gather reference data for validation
      const [existingListings, activeLocations] = await Promise.all([
        getListings({ category }),
        getLocations()
      ]);

      const existingUpsertKeys = (existingListings || [])
        .map(l => l.upsert_key)
        .filter(Boolean);

      const knownCities = (activeLocations || [])
        .map(loc => loc.city)
        .filter(Boolean);

      const buffer = await file.arrayBuffer();
      const result = await parseCategoryExcel(buffer, category, {
        existingUpsertKeys,
        knownCities
      });

      setParseResult(result);
      setParsing(false);

      if (result.validRows.length > 0) {
        showToast(
          `Analyzed ${result.totalCount} rows: ${result.successCount} valid, ${result.errorCount} invalid.`,
          result.errorCount > 0 ? 'warning' : 'info'
        );
      } else {
        showToast('No valid rows found in file. Please correct the schema errors highlighted below.', 'error');
      }
    } catch (err) {
      setParsing(false);
      console.error('Error parsing file:', err);
      showToast(err.message || 'Failed to parse inventory file', 'error');
    }
  };

  // Download Category-specific Template
  const handleDownloadTemplate = async () => {
    try {
      await downloadCategoryTemplate(selectedCategory);
      showToast(`${selectedCategory} Excel template downloaded with sample row!`, 'info');
    } catch (err) {
      console.error('Download template error:', err);
      showToast('Failed to download template', 'error');
    }
  };

  // Download Error Report
  const handleDownloadErrors = async () => {
    if (!parseResult || !parseResult.errorRows || parseResult.errorRows.length === 0) {
      showToast('No errors to download', 'info');
      return;
    }
    try {
      await downloadErrorReport(parseResult.errorRows, selectedCategory);
      showToast('Downloaded detailed error report (.xlsx)', 'info');
    } catch (err) {
      console.error('Download error report failed:', err);
      showToast('Failed to generate error report', 'error');
    }
  };

  // Switch category
  const handleCategorySwitch = (catKey) => {
    if (selectedCategory === catKey) return;
    setSelectedCategory(catKey);
    setSearchParams({ category: catKey }, { replace: true });
    // If a file is currently selected, re-parse with the newly selected category validator
    if (selectedFile) {
      setParseResult(null);
      setImportSummary(null);
      setProgressState(null);
      parseFile(selectedFile, catKey);
    }
  };

  // Clear loaded file
  const handleClearFile = () => {
    setSelectedFile(null);
    setParseResult(null);
    setImportSummary(null);
    setProgressState(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    showToast('File and parsed preview cleared', 'info');
  };

  // Remove single row from preview
  const handleRemoveRow = (rowNumber) => {
    if (!parseResult) return;
    const newRows = parseResult.rows.filter(r => r.rowNumber !== rowNumber);
    const newValid = parseResult.validRows.filter(r => r.rowNumber !== rowNumber);
    const newErrors = parseResult.errorRows.filter(r => r.rowNumber !== rowNumber);
    setParseResult({
      ...parseResult,
      totalCount: newRows.length,
      successCount: newValid.length,
      errorCount: newErrors.length,
      rows: newRows,
      validRows: newValid,
      errorRows: newErrors
    });
    showToast(`Removed row #${rowNumber} from batch preview`, 'info');
  };

  // Execute chunked 500-row bulk upsert
  const handleConfirmImport = async () => {
    if (!parseResult || parseResult.validRows.length === 0) {
      showToast('No valid rows available to import', 'warning');
      return;
    }

    if (abortOnError && parseResult.errorCount > 0) {
      showToast(
        `Import blocked: ${parseResult.errorCount} invalid rows detected and abort-on-error toggle is ON.`,
        'error'
      );
      return;
    }

    const rowsToInsert = parseResult.validRows;
    const totalToInsert = rowsToInsert.length;

    setUploading(true);
    setProgressState({
      percent: 0,
      currentBatch: 1,
      totalBatches: Math.ceil(totalToInsert / 500),
      processed: 0,
      total: totalToInsert
    });

    try {
      const result = await bulkUpsertListingsByCategory(
        selectedCategory,
        rowsToInsert,
        {
          adminUser: localStorage.getItem('laxico_admin_user') || 'admin',
          filename: selectedFile?.name || `${selectedCategory.toLowerCase()}_import.xlsx`,
          abortOnError,
          errorCount: parseResult.errorCount,
          batchSize: 500
        },
        (progress) => {
          setProgressState(progress);
        }
      );

      setUploading(false);

      if (result.success) {
        setImportSummary({
          added: result.added,
          updated: result.updated,
          skipped: result.skipped,
          failed: result.failed,
          total: result.total
        });
        showToast(
          `Import complete! ${result.added} added, ${result.updated} updated, ${result.failed} failed.`,
          'success'
        );
        fetchLogs();
        if (outletCtx?.refreshCounts) {
          outletCtx.refreshCounts();
        }
      } else {
        showToast(result.error || 'Import failed or was aborted', 'error');
      }
    } catch (err) {
      setUploading(false);
      console.error('Error during bulk upsert:', err);
      showToast(err.message || 'Bulk import failed', 'error');
    }
  };

  // Preview filtering: show first 20 rows or full filtered list
  const displayedRows = () => {
    if (!parseResult) return [];
    let list = parseResult.rows;
    if (activeTab === 'success') list = parseResult.rows.filter(r => r.isValid);
    if (activeTab === 'error') list = parseResult.rows.filter(r => !r.isValid);
    // Preview tab shows first 20 rows
    if (activeTab === 'preview') return list.slice(0, 20);
    return list;
  };

  // Wipe All Listings (Double Warning)
  const handleConfirmWipe = async () => {
    if (wipeConfirmText.trim() !== 'DELETE') return;
    setWiping(true);
    try {
      await clearAllListings();
      setSelectedFile(null);
      setParseResult(null);
      setImportSummary(null);
      setWipeModalOpen(false);
      setWipeStep(1);
      setWipeConfirmText('');
      showToast('All listings permanently wiped from database & storage!', 'success');
      if (outletCtx?.refreshCounts) outletCtx.refreshCounts();
      fetchLogs();
    } catch (err) {
      console.error('Failed to wipe listings:', err);
      showToast('Failed to wipe listings from database', 'error');
    } finally {
      setWiping(false);
    }
  };

  // Rollback to examples
  const handleRollback = async () => {
    if (!window.confirm('Restore official curated example listings across categories?')) {
      return;
    }
    setRollingBack(true);
    try {
      const restored = await rollbackToExampleListings();
      setSelectedFile(null);
      setParseResult(null);
      setImportSummary(null);
      showToast(`Restored ${restored.length} official example listings!`, 'success');
      if (outletCtx?.refreshCounts) outletCtx.refreshCounts();
    } catch (err) {
      console.error('Failed to rollback listings:', err);
      showToast('Failed to rollback listings', 'error');
    } finally {
      setRollingBack(false);
    }
  };

  const activeSchema = CATEGORY_SCHEMAS[selectedCategory] || CATEGORY_SCHEMAS.Transit;

  return (
    <div className="space-y-4 sm:space-y-6 w-full max-w-full overflow-hidden">
      {/* Top Action Header Card */}
      <div className="bg-[#071343]/80 backdrop-blur border border-white/10 rounded-2xl sm:rounded-3xl p-4 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4 w-full max-w-full overflow-hidden">
        <div>
          <div className="inline-flex items-center gap-2 bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 text-xs font-bold px-3 py-1 rounded-full mb-2">
            <i className="fa-solid fa-file-excel"></i> PER-CATEGORY BULK INVENTORY UPLOADER
          </div>
          <h2 className="text-xl sm:text-2xl font-grotesk font-bold text-white">
            Upload Inventory (.xlsx / .csv)
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-2xl">
            Select an inventory category, download its specialized Excel template, and upload in batches of 500 rows with schema validation and duplicate tracking.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
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

          {/* Download Selected Category Template */}
          <button
            onClick={handleDownloadTemplate}
            className="inline-flex items-center gap-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold px-3 py-2 rounded-xl transition shadow"
            title={`Download ${selectedCategory} template`}
          >
            <i className="fa-solid fa-download"></i> {selectedCategory} Template (.xlsx)
          </button>

          <Link
            to="/admin/listings"
            className="inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white border border-white/10 text-xs font-bold px-3 py-2 rounded-xl transition"
          >
            <i className="fa-solid fa-list-check"></i> Manage Listings
          </Link>
        </div>
      </div>

      {/* CATEGORY SELECTOR CARDS */}
      <div className="bg-[#071343]/50 border border-white/10 rounded-3xl p-4 sm:p-6">
        <div className="flex items-center justify-between mb-3">
          <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <i className="fa-solid fa-layer-group text-emerald-400"></i>
            <span>Step 1: Select Target Inventory Category</span>
          </div>
          <span className="text-[11px] text-slate-400">Each category has its own column specification</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {INVENTORY_CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.key;
            return (
              <button
                key={cat.key}
                type="button"
                onClick={() => handleCategorySwitch(cat.key)}
                className={`p-3 rounded-2xl border text-left transition-all relative overflow-hidden group ${
                  isSelected
                    ? 'bg-emerald-500/20 border-emerald-400/80 shadow-lg shadow-emerald-500/10 ring-2 ring-emerald-400/30'
                    : 'bg-[#040A29]/60 border-white/10 hover:border-white/25 hover:bg-[#040A29]/90'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm ${
                    isSelected ? 'bg-emerald-500 text-white shadow' : 'bg-white/5 text-slate-400 group-hover:text-white'
                  }`}>
                    <i className={`fa-solid ${cat.icon}`}></i>
                  </div>
                  {isSelected && (
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  )}
                </div>
                <div className={`font-bold text-xs ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                  {cat.label}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">
                  {cat.desc}
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Category Column Info Banner */}
        <div className="mt-4 pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-slate-400">Columns for {activeSchema.label}:</span>
            {activeSchema.columns.map((col) => (
              <span
                key={col}
                className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-slate-300 font-mono text-[11px]"
              >
                {col}
              </span>
            ))}
          </div>

          <button
            onClick={handleDownloadTemplate}
            className="text-emerald-400 hover:text-emerald-300 text-xs font-bold inline-flex items-center gap-1 transition"
          >
            <i className="fa-solid fa-download"></i> Get {selectedCategory} Excel Template
          </button>
        </div>
      </div>

      {/* Upload Drop Zone Card */}
      <div className="bg-[#071343]/50 border border-white/10 rounded-3xl p-6 sm:p-8 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <i className="fa-solid fa-cloud-arrow-up text-emerald-400"></i>
            <span>Step 2: Upload File for {selectedCategory}</span>
          </div>

          {/* Validation Mode Toggle */}
          <div className="flex items-center gap-3 bg-[#040A29]/70 px-3.5 py-1.5 rounded-xl border border-white/10 text-xs">
            <span className="text-slate-300 font-medium">Validation Rule:</span>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={abortOnError}
                onChange={(e) => setAbortOnError(e.target.checked)}
                className="w-4 h-4 rounded text-red-500 focus:ring-red-400 bg-white/10 border-white/20"
              />
              <span className={abortOnError ? 'text-red-300 font-bold' : 'text-slate-400'}>
                {abortOnError ? 'Abort import on any error' : 'Skip invalid rows & import valid'}
              </span>
            </label>
          </div>
        </div>

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
            accept=".xlsx, .xls, .csv"
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
                ? `Drop your ${selectedCategory} spreadsheet here!`
                : selectedFile
                  ? selectedFile.name
                  : `Select or drop your ${selectedCategory} spreadsheet (.xlsx / .csv)`}
            </h3>

            <p className="text-slate-400 text-xs mt-1.5 max-w-md mx-auto">
              {selectedFile
                ? `${(selectedFile.size / 1024).toFixed(1)} KB • ${parsing ? 'Running category schema validation...' : 'Validation finished & ready'}`
                : 'Supports .xlsx and .csv. Loaded dynamically via SheetJS browser parser'}
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

              {parseResult && parseResult.validRows.length > 0 && !importSummary && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleConfirmImport();
                  }}
                  disabled={uploading || (abortOnError && parseResult.errorCount > 0)}
                  className="grad-btn text-white font-extrabold text-xs px-6 py-2.5 rounded-xl shadow-lg transition inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? (
                    <>
                      <i className="fa-solid fa-circle-notch fa-spin"></i> Batch Importing...
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-cloud-arrow-up"></i> Confirm & Import {parseResult.validRows.length} {selectedCategory} Rows
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* PROGRESS BAR FOR 500-ROW CHUNKS */}
        {uploading && progressState && (
          <div className="bg-[#040A29]/90 border border-emerald-500/30 rounded-2xl p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold">
              <div className="flex items-center gap-2 text-emerald-300">
                <i className="fa-solid fa-circle-notch fa-spin text-emerald-400"></i>
                <span>Importing Batch {progressState.currentBatch} of {progressState.totalBatches} (500 rows per chunk)...</span>
              </div>
              <span className="text-white font-mono">{progressState.percent}%</span>
            </div>

            <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-300"
                style={{ width: `${progressState.percent}%` }}
              ></div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>Processed {progressState.processed} of {progressState.total} rows</span>
              <span>Added: {progressState.added} • Updated: {progressState.updated}</span>
            </div>
          </div>
        )}

        {/* POST-IMPORT SUMMARY CARD */}
        {importSummary && (
          <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-2xl p-5 sm:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xl shrink-0">
                  <i className="fa-solid fa-circle-check"></i>
                </div>
                <div>
                  <h4 className="font-grotesk font-bold text-base sm:text-lg text-white">
                    {selectedCategory} Import Completed Successfully!
                  </h4>
                  <p className="text-xs text-slate-300">
                    Database synchronized across Supabase, MySQL & LocalStorage fallback
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {importSummary.failed > 0 && (
                  <button
                    onClick={handleDownloadErrors}
                    className="bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 text-xs font-bold px-3.5 py-2 rounded-xl transition inline-flex items-center gap-1.5"
                  >
                    <i className="fa-solid fa-download"></i> Download Error Report (.xlsx)
                  </button>
                )}
                <button
                  onClick={() => navigate('/admin/listings')}
                  className="grad-btn text-white font-bold text-xs px-4 py-2 rounded-xl shadow transition"
                >
                  View in Catalog →
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="bg-black/30 border border-emerald-500/20 rounded-xl p-3 text-center">
                <div className="text-2xl font-bold font-grotesk text-emerald-400">+{importSummary.added}</div>
                <div className="text-[11px] text-slate-400 font-semibold uppercase">Added New</div>
              </div>
              <div className="bg-black/30 border border-blue-500/20 rounded-xl p-3 text-center">
                <div className="text-2xl font-bold font-grotesk text-blue-400">{importSummary.updated}</div>
                <div className="text-[11px] text-slate-400 font-semibold uppercase">Updated (Upsert)</div>
              </div>
              <div className="bg-black/30 border border-amber-500/20 rounded-xl p-3 text-center">
                <div className="text-2xl font-bold font-grotesk text-amber-400">{importSummary.skipped}</div>
                <div className="text-[11px] text-slate-400 font-semibold uppercase">Skipped</div>
              </div>
              <div className="bg-black/30 border border-red-500/20 rounded-xl p-3 text-center">
                <div className="text-2xl font-bold font-grotesk text-red-400">{importSummary.failed}</div>
                <div className="text-[11px] text-slate-400 font-semibold uppercase">Failed Validation</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* PARSED PREVIEW & VALIDATION TABLE */}
      {parseResult && (
        <div className="bg-[#071343]/80 border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6">
          {/* KPI Header Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-[#040A29]/70 border border-white/10 rounded-2xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center text-lg shrink-0">
                <i className="fa-solid fa-table-list"></i>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-grotesk font-bold text-white">
                  {parseResult.totalCount}
                </div>
                <div className="text-xs text-slate-400 font-semibold">Total Rows</div>
              </div>
            </div>

            <div className="bg-[#040A29]/70 border border-emerald-500/30 rounded-2xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-lg shrink-0">
                <i className="fa-solid fa-circle-check"></i>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-grotesk font-bold text-emerald-400">
                  {parseResult.successCount}
                </div>
                <div className="text-xs text-slate-400 font-semibold">Valid Rows</div>
              </div>
            </div>

            <div className={`bg-[#040A29]/70 rounded-2xl p-4 flex items-center gap-3 border ${
              parseResult.errorCount > 0 ? 'border-red-500/40' : 'border-white/10'
            }`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 ${
                parseResult.errorCount > 0 ? 'bg-red-500/20 text-red-400' : 'bg-slate-500/20 text-slate-400'
              }`}>
                <i className="fa-solid fa-triangle-exclamation"></i>
              </div>
              <div>
                <div className={`text-xl sm:text-2xl font-grotesk font-bold ${
                  parseResult.errorCount > 0 ? 'text-red-400' : 'text-slate-400'
                }`}>
                  {parseResult.errorCount}
                </div>
                <div className="text-xs text-slate-400 font-semibold">Invalid Rows</div>
              </div>
            </div>

            <div className="bg-[#040A29]/70 border border-purple-500/30 rounded-2xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center text-lg shrink-0">
                <i className="fa-solid fa-arrows-rotate"></i>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-grotesk font-bold text-purple-400">
                  {parseResult.validRows.filter(r => r.isExistingMatch).length}
                </div>
                <div className="text-xs text-slate-400 font-semibold">Upsert Matches</div>
              </div>
            </div>
          </div>

          {/* Filter Bar & Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
            <div>
              <h3 className="font-grotesk font-bold text-base sm:text-lg text-white">
                Verification Table Preview (First 20 Rows)
              </h3>
              <p className="text-xs text-slate-400">
                Previewing parsed rows mapped to {selectedCategory} schema. Import will process in 500-item chunks.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1 bg-[#040A29]/60 p-1 rounded-xl border border-white/10 text-xs font-bold">
                <button
                  onClick={() => setActiveTab('preview')}
                  className={`px-3 py-1.5 rounded-lg transition ${
                    activeTab === 'preview' ? 'bg-white/20 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Preview (20)
                </button>
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

              {parseResult.errorCount > 0 && (
                <button
                  onClick={handleDownloadErrors}
                  className="bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 px-3 py-1.5 rounded-xl text-xs font-bold transition inline-flex items-center gap-1.5"
                >
                  <i className="fa-solid fa-download"></i> Error Report (.xlsx)
                </button>
              )}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-2xl border border-white/10 bg-[#040A29]/40">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-white/10 text-slate-400 font-bold bg-[#040A29]/80 uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4 w-14">Row</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Title / Asset</th>
                  <th className="py-3 px-4">Category</th>
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
                        <span className="inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold text-[10px]">
                          <i className="fa-solid fa-check"></i> {row.isExistingMatch ? 'Update' : 'New'}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-red-500/20 text-red-300 border border-red-500/30 px-2 py-0.5 rounded-full font-bold text-[10px]">
                          <i className="fa-solid fa-xmark"></i> Invalid
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-white font-bold max-w-[200px] truncate">
                      {row.title}
                    </td>
                    <td className="py-3 px-4">
                      <span className="bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded text-[10px] font-bold">
                        {row.category}
                      </span>
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
                    <td className="py-3 px-4 max-w-[260px]">
                      {row.isValid ? (
                        <span className="text-slate-400 text-[11px]">
                          {row.isExistingMatch ? 'Will refresh existing matching record' : 'Ready for database insert'}
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
                        title={`Remove row #${row.rowNumber} from preview`}
                      >
                        <i className="fa-solid fa-trash-can text-[11px]"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Table Bottom Footer */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs text-slate-400">
            <div>
              Showing {displayedRows().length} of {parseResult.totalCount} rows in {activeTab} view
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleClearFile}
                className="bg-white/10 hover:bg-white/20 text-white font-bold text-xs px-4 py-2 rounded-xl transition"
              >
                Clear Preview
              </button>
              {parseResult.validRows.length > 0 && !importSummary && (
                <button
                  onClick={handleConfirmImport}
                  disabled={uploading || (abortOnError && parseResult.errorCount > 0)}
                  className="grad-btn text-white font-extrabold text-xs px-5 py-2 rounded-xl shadow transition flex items-center gap-2 disabled:opacity-50"
                >
                  <i className="fa-solid fa-cloud-arrow-up"></i> Confirm & Import {parseResult.validRows.length} Rows
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* UPLOAD AUDIT LOGS HISTORY TABLE */}
      <div className="bg-[#071343]/50 border border-white/10 rounded-3xl p-6 sm:p-8 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base sm:text-lg font-grotesk font-bold text-white flex items-center gap-2">
              <i className="fa-solid fa-clock-rotate-left text-emerald-400"></i>
              <span>Upload Audit History</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Persistent tracking log across Supabase, MySQL & LocalStorage modes
            </p>
          </div>

          <button
            onClick={fetchLogs}
            disabled={loadingLogs}
            className="text-xs text-slate-400 hover:text-white transition flex items-center gap-1.5"
          >
            <i className={`fa-solid fa-arrows-rotate ${loadingLogs ? 'fa-spin' : ''}`}></i>
            <span>Refresh</span>
          </button>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-white/10 bg-[#040A29]/40">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-white/10 text-slate-400 font-bold bg-[#040A29]/80 uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Admin User</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Filename</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Total</th>
                <th className="py-3 px-4">Added</th>
                <th className="py-3 px-4">Updated</th>
                <th className="py-3 px-4">Failed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-medium">
              {uploadLogs.length === 0 ? (
                <tr>
                  <td colSpan="9" className="py-6 text-center text-slate-500">
                    No upload logs recorded yet. Upload a file above to begin.
                  </td>
                </tr>
              ) : (
                uploadLogs.slice(0, 10).map((log) => (
                  <tr key={log.id} className="hover:bg-white/[0.02] transition">
                    <td className="py-3 px-4 text-slate-300 font-mono text-[11px]">
                      {new Date(log.created_at).toLocaleString('en-IN', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="py-3 px-4 text-white font-bold">
                      {log.admin_user}
                    </td>
                    <td className="py-3 px-4">
                      <span className="bg-emerald-500/15 text-emerald-300 px-2 py-0.5 rounded font-bold text-[10px]">
                        {log.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-300 max-w-[180px] truncate" title={log.filename}>
                      {log.filename}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                        log.status === 'Success'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : log.status === 'Partial'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-red-500/20 text-red-300 border border-red-500/30'
                      }`}>
                        {log.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-300 font-mono">
                      {log.total_rows}
                    </td>
                    <td className="py-3 px-4 text-emerald-400 font-bold font-mono">
                      +{log.added_count}
                    </td>
                    <td className="py-3 px-4 text-blue-400 font-bold font-mono">
                      {log.updated_count}
                    </td>
                    <td className="py-3 px-4 text-red-400 font-bold font-mono">
                      {log.failed_count}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

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
                    Clear All Listings & Inventory Data?
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
