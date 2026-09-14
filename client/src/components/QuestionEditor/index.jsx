import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Volume2, Save, X, Eye, HelpCircle } from 'lucide-react';
import { audioEngine } from '../../services/audioEngine';

export default function QuestionEditor({ initialQuestion, onSave, onCancel, currentRound = 1 }) {
  const [formData, setFormData] = useState({
    round: currentRound,
    questionNumber: 1,
    title: '',
    clues: ['', '', '', ''],
    answerText: '',
    points: 10,
    timerDuration: 30,
    answerAudio: null,
    answerAudioEnabled: true,
    audioType: 'tts'
  });

  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    if (initialQuestion) {
      setFormData({
        ...initialQuestion,
        clues: initialQuestion.clues?.length ? [...initialQuestion.clues] : ['', '', '', '']
      });
    }
  }, [initialQuestion]);

  const handleClueChange = (index, value) => {
    const updated = [...formData.clues];
    updated[index] = value;
    setFormData({ ...formData, clues: updated });
  };

  const addClue = () => {
    setFormData({ ...formData, clues: [...formData.clues, ''] });
  };

  const removeClue = (index) => {
    if (formData.clues.length <= 2) return;
    const updated = formData.clues.filter((_, i) => i !== index);
    setFormData({ ...formData, clues: updated });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanClues = formData.clues.map(c => c.trim()).filter(Boolean);
    if (cleanClues.length < 2) {
      alert('Please provide at least 2 clues for a connection question.');
      return;
    }
    if (!formData.title.trim() || !formData.answerText.trim()) {
      alert('Question Title and Answer Text are required.');
      return;
    }

    onSave({
      ...formData,
      clues: cleanClues,
      points: Number(formData.points) || 10,
      timerDuration: Number(formData.timerDuration) || 30
    });
  };

  const previewVoice = () => {
    if (formData.answerText) {
      audioEngine.speakText(formData.answerText);
    }
  };

  return (
    <div className="rounded-3xl bg-slate-900/90 border border-slate-700/80 p-6 shadow-2xl backdrop-blur-xl">
      <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-800">
        <h3 className="text-xl font-black text-amber-400 flex items-center gap-2">
          <HelpCircle className="w-5 h-5" />
          <span>{initialQuestion ? 'EDIT CONNECTION QUESTION' : 'CREATE NEW CONNECTION QUESTION'}</span>
        </h3>
        <button
          type="button"
          onClick={onCancel}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
              Round
            </label>
            <select
              value={formData.round}
              onChange={(e) => setFormData({ ...formData, round: Number(e.target.value) })}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold text-slate-200"
            >
              <option value={1}>Round 1: Normal Connection</option>
              <option value={2}>Round 2: Normal Connection</option>
              <option value={3}>Round 3: Tie Breaker</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
              Question Number
            </label>
            <input
              type="number"
              min={1}
              value={formData.questionNumber}
              onChange={(e) => setFormData({ ...formData, questionNumber: Number(e.target.value) })}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold text-slate-200 font-mono"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
              Timer Duration (Seconds)
            </label>
            <select
              value={formData.timerDuration}
              onChange={(e) => setFormData({ ...formData, timerDuration: Number(e.target.value) })}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold text-slate-200"
            >
              <option value={10}>10s</option>
              <option value={15}>15s</option>
              <option value={20}>20s</option>
              <option value={30}>30s (Default)</option>
              <option value={45}>45s</option>
              <option value={60}>60s</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
            Question Title / Category
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g., Round 1: Famous Inventions"
            className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm font-bold text-slate-100"
            required
          />
        </div>

        {/* Clues */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-slate-300 uppercase">
              Clues (At least 4 clues recommended)
            </label>
            <button
              type="button"
              onClick={addClue}
              className="flex items-center gap-1 text-xs font-bold text-cyan-400 hover:text-cyan-300"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ ADD CLUE</span>
            </button>
          </div>

          <div className="space-y-2.5">
            {formData.clues.map((clue, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="w-6 text-xs font-bold text-slate-500 text-right">
                  {idx + 1}.
                </span>
                <input
                  type="text"
                  value={clue}
                  onChange={(e) => handleClueChange(idx, e.target.value)}
                  placeholder={`Clue ${idx + 1} (e.g., Apple, Newton, Falling...)`}
                  className="flex-1 px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-medium text-slate-200 focus:outline-none focus:border-amber-500"
                  required={idx < 2}
                />
                {formData.clues.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeClue(idx)}
                    className="p-2 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Answer & Points */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-300 uppercase">
                Answer Text
              </label>
              <button
                type="button"
                onClick={previewVoice}
                className="text-[11px] font-bold text-amber-400 hover:underline flex items-center gap-1"
              >
                <Volume2 className="w-3 h-3" />
                <span>Preview Voice</span>
              </button>
            </div>
            <input
              type="text"
              value={formData.answerText}
              onChange={(e) => setFormData({ ...formData, answerText: e.target.value })}
              placeholder="e.g., Gravity"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm font-black text-amber-400"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
              Points
            </label>
            <input
              type="number"
              min={1}
              value={formData.points}
              onChange={(e) => setFormData({ ...formData, points: Number(e.target.value) })}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm font-bold text-slate-200 font-mono"
            />
          </div>
        </div>

        {/* Audio Type Options */}
        <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
          <label className="block text-xs font-bold text-slate-300 uppercase">
            Answer Audio Method
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { id: 'none', label: 'None' },
              { id: 'tts', label: 'Text-to-Speech' },
              { id: 'upload', label: 'Uploaded Audio' },
              { id: 'both', label: 'Both (Voice + Audio)' }
            ].map(type => (
              <label
                key={type.id}
                className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs cursor-pointer ${
                  formData.audioType === type.id
                    ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                <input
                  type="radio"
                  name="audioType"
                  value={type.id}
                  checked={formData.audioType === type.id}
                  onChange={(e) => setFormData({ ...formData, audioType: e.target.value })}
                  className="accent-amber-500"
                />
                <span className="font-bold">{type.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={() => setPreviewOpen(!previewOpen)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{previewOpen ? 'HIDE PREVIEW' : 'PREVIEW CARD'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 text-xs font-bold"
            >
              CANCEL
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 text-xs font-black tracking-wider shadow-lg shadow-amber-500/20"
            >
              <Save className="w-3.5 h-3.5" />
              <span>SAVE QUESTION</span>
            </button>
          </div>
        </div>

        {previewOpen && (
          <div className="mt-4 p-5 rounded-2xl bg-slate-950 border border-amber-500/30">
            <div className="text-[10px] font-mono text-amber-400 mb-1">
              ROUND {formData.round} • QUESTION {formData.questionNumber} • {formData.points} PTS
            </div>
            <div className="text-base font-black text-slate-100 mb-3">{formData.title}</div>
            <div className="grid grid-cols-2 gap-2 mb-3">
              {formData.clues.filter(Boolean).map((clue, idx) => (
                <div key={idx} className="p-2 rounded-lg bg-slate-900 text-xs font-bold text-slate-300 border border-slate-800">
                  {clue}
                </div>
              ))}
            </div>
            <div className="text-xs font-mono text-emerald-400 font-bold">
              ANSWER: {formData.answerText || 'None'}
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
