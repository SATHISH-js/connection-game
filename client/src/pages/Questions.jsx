import React, { useState, useEffect } from 'react';
import {
  Plus,
  Trash2,
  Edit2,
  Copy,
  Search,
  Volume2,
  Play,
  Eye,
  Sparkles,
  HelpCircle,
  Clock,
  Award,
  X,
  Check,
  ArrowUp,
  ArrowDown,
  Upload,
  Image as ImageIcon,
  Video as VideoIcon,
  Lock,
  RotateCcw,
  Download,
  Database
} from 'lucide-react';
import HostLayout from '../components/HostLayout';
import { useGame } from '../context/GameContext';
import { audioEngine } from '../services/audioEngine';
import { parseClueItem } from '../components/QuestionCard';
import { resolveMediaUrl, normalizeMediaUrl } from '../utils/media';

/**
 * Client-side Canvas Image Compression
 * Shrinks heavy mobile / camera photos (5-10MB) to ~100-150KB JPEG Data URLs.
 * Stores permanently inside JSON database so Render restarts never lose uploaded media.
 */
async function compressImageFile(file, maxWidth = 1280, maxHeight = 1280, quality = 0.82) {
  if (!file) return null;
  if (!file.type.startsWith('image/')) {
    throw new Error('Selected file is not an image');
  }

  // Preserve vector SVGs as-is
  if (file.type === 'image/svg+xml') {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error('Failed to load image for compression'));
      img.src = event.target.result;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Reusable Clue Thumbnail with Loading & Error States
 * Never leaves a blank black box even if an image fails or 404s.
 */
function ClueThumbnail({ clue, idx = 0, className = 'w-full h-full' }) {
  const [hasError, setHasError] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const resolvedUrl = resolveMediaUrl(clue?.image);

  if (clue?.video) {
    return (
      <video
        src={resolveMediaUrl(clue.video)}
        autoPlay
        loop
        muted
        playsInline
        className={`${className} object-cover bg-black`}
        onError={() => console.warn('Video load error', clue.video)}
      />
    );
  }

  if (clue?.emoji) {
    return (
      <span className="text-4xl sm:text-5xl drop-shadow-md group-hover:scale-110 transition-transform">
        {clue.emoji}
      </span>
    );
  }

  if (clue?.image) {
    if (hasError || !resolvedUrl) {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center bg-slate-900 border border-slate-800 select-none">
          <ImageIcon className="w-6 h-6 text-amber-500/60 mb-1" />
          <span className="text-[10px] font-bold text-slate-300 line-clamp-1">Image Unavailable</span>
          <span className="text-[8px] font-mono text-slate-500 mt-0.5 max-w-[140px] truncate">
            {clue.text || `Clue #${idx + 1}`}
          </span>
        </div>
      );
    }

    return (
      <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-slate-950">
        {!loaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900 animate-pulse">
            <ImageIcon className="w-5 h-5 text-amber-500/30 animate-bounce" />
          </div>
        )}
        <img
          src={resolvedUrl}
          alt={clue.text || `Clue ${idx + 1}`}
          onLoad={() => setLoaded(true)}
          onError={() => setHasError(true)}
          className={`${className} object-cover object-center transition-all duration-300 ${
            loaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          }`}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-3 text-center text-slate-500">
      <ImageIcon className="w-7 h-7 mb-1 text-slate-600" />
      <span className="text-[10px] font-mono uppercase font-bold text-slate-400">
        {clue?.text || `Clue #${idx + 1}`}
      </span>
    </div>
  );
}

export default function Questions() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRound, setSelectedRound] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [previewQuestion, setPreviewQuestion] = useState(null);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const { showToast } = useGame();

  const pin = localStorage.getItem('host_auth_pin') || '1234';

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/questions');
      const data = await res.json();
      if (data.success) {
        setQuestions(data.data);
        // Automatic local backup to browser storage
        if (Array.isArray(data.data) && data.data.length > 0) {
          try {
            localStorage.setItem('connection_game_questions_backup', JSON.stringify(data.data));
          } catch (e) {
            console.warn('localStorage backup failed', e);
          }
        }
      }
    } catch (err) {
      showToast('Error loading questions', 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const handleExport = () => {
    try {
      const jsonStr = JSON.stringify(questions, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `connection-game-questions-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast(`Exported ${questions.length} questions successfully!`, 'success');
    } catch (err) {
      showToast('Failed to export questions', 'danger');
    }
  };

  const handleImportFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        const rawList = Array.isArray(parsed) ? parsed : (Array.isArray(parsed.data) ? parsed.data : parsed.questions);
        if (!Array.isArray(rawList) || rawList.length === 0) {
          showToast('Invalid questions file format', 'danger');
          return;
        }

        // Normalize each clue to ensure url, src, imageUrl, etc. are properly captured
        const importedQuestions = rawList.map(q => ({
          ...q,
          clues: Array.isArray(q.clues)
            ? q.clues.map(c => {
                const item = parseClueItem(c);
                return {
                  text: item.text || '',
                  image: item.image || '',
                  video: item.video || '',
                  mediaType: item.video ? 'video' : (item.image ? 'image' : (item.emoji ? 'emoji' : 'text')),
                  emoji: item.emoji || ''
                };
              })
            : []
        }));

        if (!window.confirm(`Import ${importedQuestions.length} questions into database? This will update your questions bank.`)) {
          return;
        }

        const res = await fetch('/api/questions/import/all', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-host-pin': pin
          },
          body: JSON.stringify({ questions: importedQuestions })
        });
        const data = await res.json();
        if (data.success) {
          showToast(`Successfully imported ${importedQuestions.length} questions!`, 'success');
          fetchQuestions();
        } else {
          showToast(data.message || 'Import failed', 'danger');
        }
      } catch (err) {
        showToast('Error parsing JSON file: ' + err.message, 'danger');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleRestoreBrowserBackup = async () => {
    try {
      const backupRaw = localStorage.getItem('connection_game_questions_backup');
      if (!backupRaw) {
        showToast('No browser backup found', 'warning');
        return;
      }
      const parsed = JSON.parse(backupRaw);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        showToast('Browser backup is empty', 'warning');
        return;
      }
      if (!window.confirm(`Restore ${parsed.length} questions from browser local backup?`)) {
        return;
      }
      const res = await fetch('/api/questions/import/all', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-host-pin': pin
        },
        body: JSON.stringify({ questions: parsed })
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Restored ${parsed.length} questions from browser backup!`, 'success');
        fetchQuestions();
      } else {
        showToast(data.message || 'Restore failed', 'danger');
      }
    } catch (err) {
      showToast('Error restoring backup: ' + err.message, 'danger');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this question permanently?')) return;
    try {
      const res = await fetch(`/api/questions/${id}`, {
        method: 'DELETE',
        headers: { 'x-host-pin': pin }
      });
      const data = await res.json();
      if (data.success) {
        showToast('Question deleted successfully.', 'info');
        fetchQuestions();
      } else {
        showToast(data.message || 'Failed to delete question', 'danger');
      }
    } catch (err) {
      showToast('Error deleting question', 'danger');
    }
  };

  const handleDuplicate = async (id) => {
    try {
      const res = await fetch(`/api/questions/${id}/duplicate`, {
        method: 'POST',
        headers: { 'x-host-pin': pin }
      });
      const data = await res.json();
      if (data.success) {
        showToast('Question duplicated.', 'success');
        fetchQuestions();
      }
    } catch (err) {
      showToast('Error duplicating question', 'danger');
    }
  };

  const handleReorder = async (id, direction) => {
    try {
      const res = await fetch('/api/questions/reorder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-host-pin': pin
        },
        body: JSON.stringify({ id, direction })
      });
      const data = await res.json();
      if (data.success) {
        showToast('Question order updated.', 'info');
        fetchQuestions();
      }
    } catch (err) {
      showToast('Error reordering question', 'danger');
    }
  };

  const handleSaveQuestion = async (formData) => {
    const isEdit = Boolean(formData.id);
    const endpoint = isEdit ? `/api/questions/${formData.id}` : '/api/questions';
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const res = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'x-host-pin': pin
        },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Question ${isEdit ? 'updated' : 'created'} successfully!`, 'success');
        setIsNewModalOpen(false);
        setEditingQuestion(null);
        fetchQuestions();
      } else {
        showToast(data.message || 'Error saving question', 'danger');
      }
    } catch (err) {
      showToast('Network error saving question', 'danger');
    }
  };

  // Filter & search
  const filtered = questions.filter(q => {
    const matchRound = selectedRound === 'all' || q.round === Number(selectedRound);
    const matchSearch =
      q.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.answerText?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.clues?.some(c => {
        if (typeof c === 'string') return c.toLowerCase().includes(searchQuery.toLowerCase());
        if (typeof c === 'object') return (c.text || '').toLowerCase().includes(searchQuery.toLowerCase());
        return false;
      });
    return matchRound && matchSearch;
  });

  return (
    <HostLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-100 flex items-center gap-2.5">
              <HelpCircle className="w-7 h-7 text-amber-400" />
              <span>QUESTION MANAGEMENT</span>
            </h1>
            <p className="text-xs md:text-sm text-slate-400 mt-1">
              Create, edit, duplicate, and preview connection questions with 4+ clues and spoken audio.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Hidden JSON file input */}
            <input
              type="file"
              id="import-questions-input"
              accept=".json"
              onChange={handleImportFile}
              className="hidden"
            />

            {/* Export JSON Button */}
            <button
              type="button"
              onClick={handleExport}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-cyan-300 font-bold text-xs border border-cyan-500/30 transition-all shadow-sm hover:border-cyan-400"
              title="Download full questions JSON file to your computer"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">EXPORT</span> JSON
            </button>

            {/* Import JSON Button */}
            <button
              type="button"
              onClick={() => document.getElementById('import-questions-input')?.click()}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-purple-300 font-bold text-xs border border-purple-500/30 transition-all shadow-sm hover:border-purple-400"
              title="Upload questions JSON file to restore"
            >
              <Upload className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">IMPORT</span> JSON
            </button>

            {/* Restore Browser Backup */}
            {localStorage.getItem('connection_game_questions_backup') && (
              <button
                type="button"
                onClick={handleRestoreBrowserBackup}
                className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-emerald-300 font-bold text-xs border border-emerald-500/30 transition-all shadow-sm"
                title="Restore questions from browser local backup"
              >
                <Database className="w-3.5 h-3.5" />
                <span className="hidden md:inline">RESTORE</span> BACKUP
              </button>
            )}

            {/* Add New Question Button */}
            <button
              onClick={() => {
                setEditingQuestion({
                  round: 1,
                  questionNumber: questions.filter(q => q.round === 1).length + 1,
                  title: '',
                  clues: ['', '', '', ''],
                  answerText: '',
                  points: 10,
                  timerDuration: 30,
                  answerAudio: null,
                  answerAudioEnabled: true,
                  audioType: 'tts'
                });
                setIsNewModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs sm:text-sm tracking-wider shadow-lg shadow-amber-500/20 transition-all hover:scale-105"
            >
              <Plus className="w-4 h-4" />
              <span>ADD NEW QUESTION</span>
            </button>
          </div>
        </div>

        {/* Filters and search */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900/40 border border-slate-800">
          {/* Round filter tabs */}
          <div className="flex items-center gap-1.5">
            {[
              { id: 'all', label: 'ALL ROUNDS' },
              { id: '1', label: 'ROUND 1' },
              { id: '2', label: 'ROUND 2' },
              { id: '3', label: 'TIE BREAKER' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedRound(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedRound === tab.id
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-slate-800/40 text-slate-400 border border-slate-800 hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search box */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search clues, answer, title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Questions List */}
        {loading ? (
          <div className="py-20 text-center text-slate-500 text-sm font-medium">
            Loading symposium questions...
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center rounded-2xl bg-slate-900/30 border border-slate-800 text-slate-500">
            No questions match this filter. Click "ADD NEW QUESTION" to create one.
          </div>
        ) : (
          <div className="space-y-6">
            {filtered.map(q => {
              const parsedClues = (q.clues || []).map(parseClueItem);

              return (
                <div
                  key={q.id}
                  className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800/90 hover:border-slate-700 shadow-xl transition-all"
                >
                  {/* Top Metadata Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-3 border-b border-slate-800/80">
                    <div className="flex items-center gap-2.5">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-black uppercase tracking-wider ${
                        q.round === 3
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : q.round === 2
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm shadow-purple-500/10'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}>
                        {q.round === 3 ? 'TIE BREAKER' : q.round === 2 ? 'ROUND 2 • 1-BY-1 REVEAL' : `ROUND ${q.round}`}
                      </span>

                      <span className="text-sm font-black text-slate-300 font-mono">
                        QUESTION #{q.questionNumber}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
                      <span className="flex items-center gap-1 text-emerald-400 font-bold bg-emerald-950/40 px-2.5 py-1 rounded-lg border border-emerald-500/30">
                        <Award className="w-3.5 h-3.5" /> +{q.points} PTS
                      </span>
                      <span className="flex items-center gap-1 text-cyan-400 bg-cyan-950/40 px-2.5 py-1 rounded-lg border border-cyan-500/30">
                        <Clock className="w-3.5 h-3.5" /> {q.timerDuration}s
                      </span>
                      <span className="text-slate-500 hidden sm:inline">
                        Audio: {q.audioType?.toUpperCase() || 'TTS'}
                      </span>
                    </div>
                  </div>

                  {/* Question Title & Connection Theme */}
                  <h2 className="text-xl font-black text-slate-100 mb-4 tracking-wide">
                    {q.title}
                  </h2>

                  {/* Multimedia Clues Line (Responsive 4-Clue Grid) */}
                  <div className="mb-4">
                    <div className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2.5 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
                        <span>MULTIMEDIA CLUES (A LINE OF {parsedClues.length} CLUES)</span>
                      </span>
                      {q.round === 2 && (
                        <span className="text-purple-400 font-bold text-[10px]">
                          ⚡ 1-by-1 Step Reveal Mode
                        </span>
                      )}
                    </div>

                    {/* Responsive Line of 4 Clues */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                      {parsedClues.map((clue, cIdx) => (
                        <div
                          key={cIdx}
                          className="relative flex flex-col rounded-2xl bg-slate-950/80 border border-slate-800/90 overflow-hidden hover:border-amber-400/50 transition-all group"
                        >
                          {/* Card Header Tag */}
                          <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900/90 border-b border-slate-800/80 text-[10px] font-mono font-black">
                            <span className="text-amber-400">CLUE #{cIdx + 1}</span>
                            {q.round === 2 ? (
                              <span className="text-purple-400 font-bold">STEP {cIdx + 1}</span>
                            ) : clue.video ? (
                              <span className="text-cyan-400 flex items-center gap-1">
                                <VideoIcon className="w-2.5 h-2.5" /> VIDEO
                              </span>
                            ) : (
                              <span className="text-slate-500">#0{cIdx + 1}</span>
                            )}
                          </div>

                          {/* Media Frame (Proper Aspect Ratio) */}
                          <div className="h-32 sm:h-36 relative bg-slate-950 flex items-center justify-center overflow-hidden">
                            <ClueThumbnail clue={clue} idx={cIdx} />

                            {/* Gradient Overlay */}
                            {!clue.video && (
                              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />
                            )}
                          </div>

                          {/* Caption at Bottom */}
                          <div className="p-2.5 bg-slate-900/60 border-t border-slate-800/60 text-center min-h-[44px] flex items-center justify-center">
                            <span className="text-xs font-bold text-slate-200 line-clamp-2">
                              {clue.text || (clue.emoji ? `${clue.emoji} Clue` : `Clue ${cIdx + 1}`)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Official Connection Answer Bar */}
                  <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-wrap items-center justify-between gap-3 mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-amber-400 uppercase tracking-wide">
                        OFFICIAL CONNECTION ANSWER:
                      </span>
                      <span className="text-base sm:text-lg font-black text-amber-300 tracking-wide">
                        {q.answerText}
                      </span>
                    </div>

                    <button
                      onClick={() => audioEngine.speakText(q.answerText)}
                      title="Test Voice pronunciation"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-600/30 hover:bg-cyan-600/50 text-cyan-300 border border-cyan-500/40 text-xs font-bold transition-colors"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>HEAR ANSWER VOICE</span>
                    </button>
                  </div>

                  {/* Card Action Controls Footer */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-800/80">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleReorder(q.id, 'up')}
                        title="Move Question Up"
                        className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleReorder(q.id, 'down')}
                        title="Move Question Down"
                        className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                      >
                        <ArrowDown className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setPreviewQuestion(q)}
                        title="Preview Smart Board presentation layout"
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5 text-amber-400" />
                        <span>SMART BOARD PREVIEW</span>
                      </button>
                      <button
                        onClick={() => handleDuplicate(q.id)}
                        title="Duplicate question"
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-colors"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>DUPLICATE</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setEditingQuestion(q);
                          setIsNewModalOpen(true);
                        }}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-black tracking-wide transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>EDIT QUESTION</span>
                      </button>

                      <button
                        onClick={() => handleDelete(q.id)}
                        title="Delete permanently"
                        className="p-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 border border-rose-900/50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal: Question Form Editor */}
        {isNewModalOpen && editingQuestion && (
          <QuestionEditorModal
            question={editingQuestion}
            onClose={() => {
              setIsNewModalOpen(false);
              setEditingQuestion(null);
            }}
            onSave={handleSaveQuestion}
          />
        )}

        {/* Modal: Question Preview with Round 2 Simulator */}
        {previewQuestion && (
          <QuestionPreviewModal
            question={previewQuestion}
            onClose={() => setPreviewQuestion(null)}
          />
        )}
      </div>
    </HostLayout>
  );
}

// Subcomponent: Live Smart Board Clues & Round 2 Step-by-Step Reveal Preview Modal
function QuestionPreviewModal({ question, onClose }) {
  const isRound2 = question.round === 2;
  const parsedClues = (question.clues || []).map(parseClueItem);
  const [simulatedRevealCount, setSimulatedRevealCount] = useState(isRound2 ? 1 : parsedClues.length);

  const handleRevealNext = () => {
    setSimulatedRevealCount(prev => Math.min(prev + 1, parsedClues.length));
  };

  const handleRevealAll = () => {
    setSimulatedRevealCount(parsedClues.length);
  };

  const handleReset = () => {
    setSimulatedRevealCount(1);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md overflow-y-auto">
      <div className="w-full max-w-5xl p-6 md:p-8 rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl my-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black tracking-widest text-amber-400 uppercase">
              SMART BOARD QUESTION PREVIEW
            </span>
            {isRound2 && (
              <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 animate-pulse">
                ROUND 2: STEP-BY-STEP REVEAL
              </span>
            )}
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Round 2 Simulation Controller Widget */}
        {isRound2 && (
          <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-500/30 mb-6 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-purple-300 uppercase">
                ROUND 2 REVEAL SIMULATOR:
              </span>
              <span className="text-xs font-mono font-bold text-amber-300">
                {simulatedRevealCount} of {parsedClues.length} Clues Unlocked
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleRevealNext}
                disabled={simulatedRevealCount >= parsedClues.length}
                className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs tracking-wider shadow-md disabled:opacity-40 transition-all"
              >
                REVEAL NEXT CLUE (+1)
              </button>
              <button
                onClick={handleRevealAll}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors"
              >
                REVEAL ALL
              </button>
              <button
                onClick={handleReset}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                title="Reset simulation"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Title */}
        <div className="text-center my-4">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            ROUND {question.round} • QUESTION #{question.questionNumber} • {question.points} POINTS
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-slate-100 mt-1">
            {question.title}
          </h2>
        </div>

        {/* The Clues in a Responsive Line */}
        <div className={`grid gap-4 my-6 ${
          parsedClues.length === 1 ? 'grid-cols-1 max-w-xl mx-auto' :
          parsedClues.length === 2 ? 'grid-cols-1 sm:grid-cols-2 max-w-3xl mx-auto' :
          parsedClues.length === 3 ? 'grid-cols-1 sm:grid-cols-3 max-w-4xl mx-auto' :
          'grid-cols-2 sm:grid-cols-4'
        }`}>
          {parsedClues.map((clue, idx) => {
            const isRevealed = !isRound2 || idx < simulatedRevealCount;
            const isNewlyRevealed = isRound2 && idx === simulatedRevealCount - 1;
            const previewHeight = parsedClues.length === 1 ? 'h-72 sm:h-96' : parsedClues.length === 2 ? 'h-60 sm:h-72' : 'h-52 sm:h-64';

            if (!isRevealed) {
              return (
                <div
                  key={idx}
                  className={`${previewHeight} rounded-2xl border-2 border-dashed border-purple-500/30 bg-gradient-to-b from-slate-900/60 to-purple-950/20 p-4 flex flex-col items-center justify-center text-center space-y-2`}
                >
                  <span className="text-[10px] font-black uppercase text-purple-400 bg-purple-950/80 px-2.5 py-0.5 rounded-lg border border-purple-500/30">
                    <Lock className="w-3 h-3 inline mr-1" /> CLUE {idx + 1}
                  </span>
                  <div className="w-14 h-14 rounded-2xl bg-slate-950 flex items-center justify-center text-purple-400">
                    <HelpCircle className="w-7 h-7 animate-pulse" />
                  </div>
                  <span className="text-xs font-black text-slate-300">LOCKED</span>
                  <span className="text-[10px] font-mono text-purple-400">Reveal Step {idx + 1}</span>
                </div>
              );
            }

            return (
              <div
                key={idx}
                className={`relative flex flex-col ${previewHeight} rounded-2xl bg-slate-950/90 border border-slate-700/80 p-3 overflow-hidden transition-all duration-500 ${
                  isNewlyRevealed ? 'ring-4 ring-amber-400 scale-[1.02] shadow-xl shadow-amber-500/30' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black uppercase text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-lg border border-amber-500/40">
                    CLUE {idx + 1}
                  </span>
                  <span className="text-slate-500 text-[10px] font-mono font-bold">#0{idx + 1}</span>
                </div>

                <div className="flex-1 w-full rounded-xl bg-slate-950 overflow-hidden flex items-center justify-center relative mb-2">
                  <ClueThumbnail clue={clue} idx={idx} />
                </div>

                <div className="text-center">
                  <span className="text-sm font-black text-slate-100 line-clamp-1">
                    {clue.text || `Clue ${idx + 1}`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Answer Box */}
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-center my-4">
          <div className="text-xs font-bold text-amber-400 uppercase">OFFICIAL ANSWER</div>
          <div className="text-2xl sm:text-3xl font-black text-amber-300 mt-1">
            {question.answerText || 'AUDIO ONLY ANSWER'}
          </div>
          {question.answerAudio && (
            <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/40 text-xs font-mono">
              <span>🎵 External Audio Attached</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-wrap justify-between items-center gap-2 pt-4 border-t border-slate-800">
          <div className="flex items-center gap-2">
            {question.answerText && (
              <button
                onClick={() => audioEngine.speakText(question.answerText)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 text-xs font-bold hover:bg-cyan-600/40 transition-colors"
              >
                <Volume2 className="w-4 h-4" />
                <span>VOICE TTS</span>
              </button>
            )}
            {question.answerAudio && (
              <button
                onClick={() => audioEngine.playAudioFile(question.answerAudio)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold hover:bg-emerald-600/40 transition-colors"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>PLAY EXTERNAL AUDIO</span>
              </button>
            )}
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold"
          >
            CLOSE PREVIEW
          </button>
        </div>
      </div>
    </div>
  );
}

// Subcomponent: Full Multimedia Question Editor Modal
function QuestionEditorModal({ question, onClose, onSave }) {
  // Normalize clues to object format { text, image, video, mediaType }
  const initialClues = (question.clues && question.clues.length > 0 ? question.clues : ['', '', '', '']).map(c => {
    if (typeof c === 'object') {
      return {
        text: c.text || '',
        image: c.image || '',
        video: c.video || '',
        mediaType: c.mediaType || (c.video ? 'video' : 'image')
      };
    }
    const item = parseClueItem(c);
    return {
      text: item.text || '',
      image: item.image || '',
      video: item.video || '',
      mediaType: item.video ? 'video' : 'image'
    };
  });

  const [formData, setFormData] = useState({
    ...question,
    clues: initialClues,
    initialRevealedCount: question.initialRevealedCount !== undefined ? Number(question.initialRevealedCount) : 1,
    revealAllAtStart: !!question.revealAllAtStart
  });

  const [uploadingClueIndex, setUploadingClueIndex] = useState(null);
  const [isAudioUploading, setIsAudioUploading] = useState(false);
  const pin = localStorage.getItem('host_auth_pin') || '1234';

  const handleClueFieldChange = (idx, field, value) => {
    const updated = [...formData.clues];
    updated[idx] = { ...updated[idx], [field]: value };
    setFormData({ ...formData, clues: updated });
  };

  const addClue = () => {
    setFormData({
      ...formData,
      clues: [...formData.clues, { text: '', image: '', video: '', mediaType: 'image' }]
    });
  };

  const removeClue = (idx) => {
    if (formData.clues.length <= 1) return;
    const updated = formData.clues.filter((_, i) => i !== idx);
    setFormData({ ...formData, clues: updated });
  };

  // Upload clue image or video file
  const handleUploadClueMedia = async (idx, file) => {
    if (!file) return;
    setUploadingClueIndex(idx);

    try {
      const isVideo = file.type.startsWith('video/') || /\.(mp4|webm|ogg|mov)$/i.test(file.name);

      if (!isVideo) {
        // 1. Instant client-side compression to ~100-150KB base64 Data URL
        // Embedded directly into question data: survives all Render container restarts & exports!
        const compressedDataUrl = await compressImageFile(file, 1280, 1280, 0.82);
        if (compressedDataUrl) {
          const updated = [...formData.clues];
          updated[idx] = {
            ...updated[idx],
            image: compressedDataUrl,
            video: '',
            mediaType: 'image'
          };
          setFormData({ ...formData, clues: updated });
        }
      }

      // 2. Also send to server for local disk storage / caching
      const fd = new FormData();
      fd.append('media', file);
      const res = await fetch('/api/questions/upload-media', {
        method: 'POST',
        headers: { 'x-host-pin': pin },
        body: fd
      });
      const data = await res.json();
      if (data.success && isVideo) {
        const updated = [...formData.clues];
        updated[idx] = {
          ...updated[idx],
          video: data.url,
          image: '',
          mediaType: 'video'
        };
        setFormData({ ...formData, clues: updated });
      }
    } catch (e) {
      console.error('Media upload error:', e);
      alert('Error processing media file: ' + (e.message || 'Unknown error'));
    } finally {
      setUploadingClueIndex(null);
    }
  };

  const handleUploadAnswerAudio = async (file) => {
    if (!file) return;
    const fd = new FormData();
    fd.append('audio', file);
    setIsAudioUploading(true);

    try {
      const res = await fetch('/api/audio/upload', {
        method: 'POST',
        headers: { 'x-host-pin': pin },
        body: fd
      });
      const data = await res.json();
      if (data.success) {
        setFormData(prev => ({
          ...prev,
          answerAudio: data.url,
          audioType: 'upload',
          answerAudioEnabled: true
        }));
      }
    } catch (e) {
      console.error('Upload error', e);
    } finally {
      setIsAudioUploading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title?.trim()) {
      alert('Please enter a Question Title / Theme.');
      return;
    }

    const trimmedAnswer = (formData.answerText || '').trim();
    if (!trimmedAnswer && !formData.answerAudio) {
      alert('Please provide either an Answer Text or upload an Answer Audio file.');
      return;
    }

    // Process clues: clues are multimedia (image or video)
    const finalClues = formData.clues
      .map((c, i) => {
        const text = (c.text || '').trim();
        const image = (c.image || '').trim();
        const video = (c.video || '').trim();
        if (!image && !video && !text) return null;
        return {
          text: text || `Clue ${i + 1}`,
          image,
          video,
          mediaType: video ? 'video' : 'image'
        };
      })
      .filter(Boolean);

    if (finalClues.length === 0) {
      alert('Please provide at least one multimedia Clue (image or video).');
      return;
    }

    const effectiveAudioType = formData.audioType || (formData.answerAudio ? 'upload' : 'tts');

    onSave({
      ...formData,
      title: formData.title.trim(),
      answerText: trimmedAnswer || (formData.answerAudio ? 'Audio Answer' : ''),
      clues: finalClues,
      audioType: effectiveAudioType,
      answerAudioEnabled: true
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="w-full max-w-5xl p-6 rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl my-8">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-800">
          <div>
            <h2 className="text-xl font-black text-amber-400 flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              <span>{formData.id ? 'EDIT CONNECTION QUESTION' : 'ADD NEW CONNECTION QUESTION'}</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Configure 4 multimedia clues (images or videos) with proper responsive alignment and audio.
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase mb-1">Round</label>
              <select
                value={formData.round}
                onChange={(e) => setFormData({ ...formData, round: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold text-slate-200"
              >
                <option value={1}>Round 1 (Normal)</option>
                <option value={2}>Round 2 (Step Reveal)</option>
                <option value={3}>Round 3 (Tie Breaker)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-400 uppercase mb-1">Question #</label>
              <input
                type="number"
                min="1"
                value={formData.questionNumber}
                onChange={(e) => setFormData({ ...formData, questionNumber: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold text-slate-200 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-slate-400 uppercase mb-1">Points</label>
              <input
                type="number"
                min="1"
                value={formData.points}
                onChange={(e) => setFormData({ ...formData, points: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold text-slate-200 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-slate-400 uppercase mb-1">Timer (Seconds)</label>
              <select
                value={formData.timerDuration}
                onChange={(e) => setFormData({ ...formData, timerDuration: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold text-slate-200"
              >
                <option value={15}>15 Seconds</option>
                <option value={20}>20 Seconds</option>
                <option value={30}>30 Seconds (Default)</option>
                <option value={45}>45 Seconds</option>
                <option value={60}>60 Seconds</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-black text-amber-400 uppercase mb-1">Initial Reveal</label>
              <select
                value={formData.initialRevealedCount !== undefined ? formData.initialRevealedCount : 1}
                onChange={(e) => setFormData({ ...formData, initialRevealedCount: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold text-slate-200"
                title="Number of clues visible immediately when question starts"
              >
                <option value={1}>1 Clue (Default)</option>
                <option value={2}>2 Clues</option>
                <option value={3}>3 Clues</option>
                <option value={4}>All Clues</option>
              </select>
            </div>
          </div>

          {/* Question Title */}
          <div>
            <label className="block text-xs font-black text-slate-400 uppercase mb-1.5">
              Question Title / Theme
            </label>
            <input
              type="text"
              placeholder="e.g. The Great Physics Connection or Celestial Optics"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm font-bold text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500"
              required
            />
          </div>

          {/* Dynamic Multimedia Clues Section */}
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
              <label className="text-xs font-black text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-amber-400" />
                <span>MULTIMEDIA CLUES ({formData.clues.length} {formData.clues.length === 1 ? 'CLUE' : 'CLUES'})</span>
              </label>

              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 hover:border-slate-700 transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.revealAllAtStart}
                    onChange={(e) => setFormData({ ...formData, revealAllAtStart: e.target.checked })}
                    className="w-4 h-4 rounded text-amber-500 bg-slate-800 border-slate-700 focus:ring-amber-400"
                  />
                  <span className="text-xs font-bold text-slate-300">
                    Reveal All Clues at Start
                  </span>
                </label>

                <button
                  type="button"
                  onClick={addClue}
                  className="text-xs text-amber-400 font-bold hover:text-amber-300 flex items-center gap-1 bg-amber-500/15 hover:bg-amber-500/25 px-3 py-1.5 rounded-xl border border-amber-500/30 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> ADD CLUE
                </button>
              </div>
            </div>

            {/* Recommended Image Dimensions Banner */}
            <div className="p-3 rounded-xl bg-gradient-to-r from-amber-500/10 via-cyan-500/10 to-transparent border border-amber-500/25 flex items-start gap-2 text-xs text-slate-300 mb-3">
              <span className="text-amber-400 font-bold text-sm leading-none mt-0.5">📐</span>
              <div className="leading-relaxed">
                <strong className="text-amber-300 font-black">Image Specs for Hoster: </strong>
                Recommended ratio is <span className="font-mono text-cyan-300 font-bold">16:9</span> (1920×1080, 1280×720) or <span className="font-mono text-cyan-300 font-bold">4:3</span> (1024×768), min width 600px.
                Images automatically scale and adapt flexibly on Smart Board and mobile without letterbox distortion. Formats: JPG, PNG, WEBP, or MP4.
              </div>
            </div>

            {/* Responsive Line of Clue Editor Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {formData.clues.map((clue, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between space-y-2.5 relative group"
                >
                  {/* Clue Header */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-black text-amber-400 px-2 py-0.5 rounded bg-amber-500/15 border border-amber-500/30">
                      CLUE #{idx + 1}
                    </span>

                    {formData.clues.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeClue(idx)}
                        className="text-slate-500 hover:text-rose-400 p-1 transition-colors"
                        title="Remove clue"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Media Preview Box */}
                  <div className="w-full h-28 rounded-xl bg-slate-900 border border-slate-800 overflow-hidden flex items-center justify-center relative">
                    {uploadingClueIndex === idx ? (
                      <div className="text-xs font-mono text-cyan-400 animate-pulse flex flex-col items-center justify-center p-2">
                        <ImageIcon className="w-5 h-5 text-cyan-400 mb-1 animate-bounce" />
                        <span>Optimizing media...</span>
                      </div>
                    ) : (
                      <ClueThumbnail clue={clue} idx={idx} />
                    )}
                  </div>

                  {/* Clue Text / Caption Input */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-300 uppercase mb-0.5 flex items-center justify-between">
                      <span>Caption / Text Label</span>
                      <span className="text-emerald-400 font-bold lowercase text-[10px] bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      placeholder={`e.g. ${idx === 0 ? '🍎 Red Apple' : 'Clue detail'}`}
                      value={clue.text}
                      onChange={(e) => handleClueFieldChange(idx, 'text', e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-bold text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  {/* Clue Image / Video URL Input */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">
                      Media URL (Image / Video) <span className="text-slate-500 lowercase">(or upload below)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="https://... or /uploads/..."
                      value={clue.video || clue.image || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        const isVid = /\.(mp4|webm|ogg|mov)/i.test(val);
                        if (isVid) {
                          handleClueFieldChange(idx, 'video', val);
                          handleClueFieldChange(idx, 'image', '');
                          handleClueFieldChange(idx, 'mediaType', 'video');
                        } else {
                          handleClueFieldChange(idx, 'image', val);
                          handleClueFieldChange(idx, 'video', '');
                          handleClueFieldChange(idx, 'mediaType', 'image');
                        }
                      }}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-300 placeholder-slate-600 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  {/* File Upload Button for Clue */}
                  <div>
                    <label className="w-full py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-[11px] font-bold flex items-center justify-center gap-1.5 cursor-pointer border border-slate-700 transition-colors">
                      <Upload className="w-3 h-3" />
                      <span>{uploadingClueIndex === idx ? 'Uploading...' : 'Upload Image / Video'}</span>
                      <input
                        type="file"
                        accept="image/*,video/*"
                        className="hidden"
                        onChange={(e) => handleUploadClueMedia(idx, e.target.files[0])}
                      />
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Answer Text & Voice / External Audio Controls */}
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-xs font-black text-amber-400 uppercase">
                  Official Connection Answer
                </label>
                <span className="text-[10px] text-slate-400">
                  Enter text answer or upload an external audio file below (either is enough)
                </span>
              </div>

              {formData.answerText && (
                <button
                  type="button"
                  onClick={() => audioEngine.speakText(formData.answerText)}
                  className="text-xs text-cyan-400 font-bold hover:underline flex items-center gap-1"
                >
                  <Volume2 className="w-3.5 h-3.5" /> TEST VOICE PRONUNCIATION
                </button>
              )}
            </div>

            <input
              type="text"
              placeholder="e.g. Gravity or Rainbow or Tim Berners-Lee (optional if external audio uploaded)"
              value={formData.answerText}
              onChange={(e) => setFormData({ ...formData, answerText: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-amber-500/40 text-base font-black text-amber-300 placeholder-slate-600 focus:outline-none focus:border-amber-400"
            />

            {/* Audio Reveal Mode & External Audio File Upload */}
            <div className="p-3.5 rounded-xl bg-slate-950/90 border border-slate-800 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="text-xs font-black uppercase text-slate-300 flex items-center gap-1.5">
                  <Volume2 className="w-4 h-4 text-cyan-400" />
                  <span>Answer Reveal Audio Mode</span>
                </span>

                {/* Audio Mode Selector */}
                <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, audioType: 'tts' })}
                    className={`px-3 py-1 rounded-lg font-bold transition-colors ${
                      formData.audioType === 'tts'
                        ? 'bg-amber-500 text-slate-950 shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    🗣️ Browser TTS Voice
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, audioType: 'upload' })}
                    className={`px-3 py-1 rounded-lg font-bold transition-colors ${
                      formData.audioType === 'upload'
                        ? 'bg-amber-500 text-slate-950 shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    🎵 External Audio File
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, audioType: 'both' })}
                    className={`px-3 py-1 rounded-lg font-bold transition-colors ${
                      formData.audioType === 'both'
                        ? 'bg-amber-500 text-slate-950 shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    🔄 Both (Audio + Voice)
                  </button>
                </div>
              </div>

              {/* Upload external audio file */}
              <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={(e) => handleUploadAnswerAudio(e.target.files[0])}
                    className="text-xs text-slate-400 file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:bg-slate-800 file:text-slate-200 cursor-pointer"
                  />
                  {isAudioUploading && <span className="text-xs text-cyan-400 font-mono animate-pulse">Uploading audio...</span>}
                </div>

                {formData.answerAudio && (
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                      AUDIO ATTACHED
                    </span>
                    <button
                      type="button"
                      onClick={() => audioEngine.playAudioFile(formData.answerAudio)}
                      className="text-cyan-400 hover:underline flex items-center gap-1 text-xs font-bold"
                    >
                      <Play className="w-3 h-3 fill-current" /> Test Audio
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, answerAudio: null, audioType: 'tts' }))}
                      className="text-rose-400 hover:underline flex items-center gap-1 text-xs"
                    >
                      <Trash2 className="w-3 h-3" /> Remove
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Form Actions Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors"
            >
              CANCEL
            </button>
            <button
              type="submit"
              className="px-7 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs tracking-wider shadow-lg shadow-amber-500/20 transition-all hover:scale-105"
            >
              SAVE QUESTION
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
