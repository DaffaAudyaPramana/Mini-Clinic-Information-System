import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Stethoscope, User, Clock, CheckCircle2, FileText, Plus, Trash2, Activity, Heart, Thermometer, Scale, AlertCircle, Save, History, Building2 } from 'lucide-react';

interface QueueItem {
  id: string; // queue id
  registration_id: string;
  queue_number: string;
  queue_date: string;
  status: string;
  patient_name: string;
  no_rm: string;
  patient_id: string;
  poli_name: string;
  visit_date: string;
  complaint: string;
  payment_type: string;
}

interface ActionInput {
  action_name: string;
  notes: string;
}

interface PrescriptionInput {
  medicine_name: string;
  dosage: string;
  quantity: number;
  instructions: string;
}

export const DoctorSoap: React.FC = () => {
  const [queueList, setQueueList] = useState<QueueItem[]>([]);
  const [selectedQueue, setSelectedQueue] = useState<QueueItem | null>(null);
  const [loading, setLoading] = useState(true);

  // SOAP Form State
  const [subjective, setSubjective] = useState('');
  const [bloodPressure, setBloodPressure] = useState('120/80');
  const [temperature, setTemperature] = useState('37.5');
  const [weight, setWeight] = useState('65');
  const [height, setHeight] = useState('170');
  const [diagnosis, setDiagnosis] = useState('');
  const [treatmentPlan, setTreatmentPlan] = useState('');

  // Dynamic Actions & Prescriptions
  const [actions, setActions] = useState<ActionInput[]>([
    { action_name: 'Pemeriksaan Fisik & TTV', notes: 'Kondisi umum tampak sakit ringan' }
  ]);
  const [prescriptions, setPrescriptions] = useState<PrescriptionInput[]>([
    { medicine_name: 'Paracetamol 500mg', dosage: '3x1 sesudah makan', quantity: 10, instructions: 'Minum bila demam/pusing' }
  ]);

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchQueues = async () => {
    setLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const response = await axios.get(`${apiUrl}/api/queues`);
      if (response.data.success) {
        setQueueList(response.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch queues', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueues();
  }, []);

  const handleStartExam = (item: QueueItem) => {
    setSelectedQueue(item);
    setSubjective(item.complaint || 'Pasien mengeluh demam dan pusing');
    setDiagnosis('Febris ec ISPA (Infeksi Saluran Pernapasan Akut)');
    setTreatmentPlan('Istirahat cukup, hindari es, minum obat teratur.');
    setSaveSuccess(false);
    setErrorMsg('');
  };

  const handleAddAction = () => {
    setActions([...actions, { action_name: '', notes: '' }]);
  };

  const handleRemoveAction = (index: number) => {
    setActions(actions.filter((_, i) => i !== index));
  };

  const handleAddPrescription = () => {
    setPrescriptions([...prescriptions, { medicine_name: '', dosage: '3x1 sesudah makan', quantity: 10, instructions: '' }]);
  };

  const handleRemovePrescription = (index: number) => {
    setPrescriptions(prescriptions.filter((_, i) => i !== index));
  };

  const handleSubmitSoap = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQueue) return;

    setErrorMsg('');
    setSaving(true);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const payload = {
        registration_id: selectedQueue.registration_id,
        subjective,
        blood_pressure: bloodPressure,
        temperature: parseFloat(temperature) || 36.5,
        weight: parseFloat(weight) || 60,
        height: parseFloat(height) || 165,
        diagnosis,
        treatment_plan: treatmentPlan,
        actions: actions.filter(a => a.action_name.trim() !== ''),
        prescription_items: prescriptions.filter(p => p.medicine_name.trim() !== '')
      };

      const response = await axios.post(`${apiUrl}/api/medical-records`, payload);
      if (response.data.success) {
        setSaveSuccess(true);
        fetchQueues();
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || 'Gagal menyimpan SOAP pemeriksaan.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <Stethoscope className="w-7 h-7 text-teal-400" /> Pemeriksaan Dokter & SOAP Pasien
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Input Subjective, Objective, Assessment, Plan, Tindakan Medis, serta Resep Obat Pasien.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Queue Selection Column */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" /> Antrean Pasien Dokter
            </h3>
            <span className="text-xs bg-slate-800 text-slate-400 px-2.5 py-0.5 rounded-full border border-slate-700">
              {queueList.length} Pasien
            </span>
          </div>

          <div className="space-y-3">
            {loading ? (
              <div className="p-6 text-center text-slate-400 text-xs glass-panel rounded-2xl">
                Memuat antrean...
              </div>
            ) : queueList.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-xs glass-panel rounded-2xl">
                Tidak ada antrean pasien untuk diperiksa.
              </div>
            ) : (
              queueList.map((item) => {
                const isSelected = selectedQueue?.id === item.id;
                const isFinished = item.status === 'selesai';

                return (
                  <div
                    key={item.id}
                    onClick={() => handleStartExam(item)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-900/40 border-blue-500 shadow-lg shadow-blue-500/20'
                        : isFinished
                        ? 'bg-slate-900/40 border-slate-800 opacity-60'
                        : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-3 py-1 bg-gradient-to-r from-blue-600 to-teal-500 text-white font-mono font-extrabold text-sm rounded-lg shadow">
                        {item.queue_number}
                      </span>
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                        isFinished ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                      }`}>
                        {isFinished ? 'Selesai' : 'Menunggu / Diperiksa'}
                      </span>
                    </div>

                    <div className="mt-3">
                      <h4 className="font-bold text-white text-sm flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-blue-400" /> {item.patient_name}
                      </h4>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                        No. RM: {item.no_rm}
                      </div>
                      <div className="text-[11px] text-teal-300 mt-1 flex items-center gap-1">
                        <Building2 className="w-3 h-3 text-teal-400" /> {item.poli_name}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Form SOAP Column */}
        <div className="lg:col-span-2 space-y-6">
          {!selectedQueue ? (
            <div className="glass-panel p-12 text-center rounded-3xl space-y-3">
              <Stethoscope className="w-12 h-12 text-slate-600 mx-auto animate-pulse" />
              <h3 className="text-lg font-bold text-white">Pilih Pasien dari Antrean</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Klik salah satu antrean pasien di sebelah kiri untuk mulai mengisi data pemeriksaan SOAP dan resep obat.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmitSoap} className="glass-panel p-6 md:p-8 rounded-3xl space-y-6 border border-slate-800">
              {/* Selected Patient Banner */}
              <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase tracking-wider font-bold text-blue-400 block">Pasien Sedang Diperiksa</span>
                  <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
                    {selectedQueue.patient_name} <span className="text-xs font-mono text-slate-400">({selectedQueue.no_rm})</span>
                  </h3>
                </div>
                <div className="text-right">
                  <span className="px-3 py-1 bg-teal-500/20 text-teal-300 font-mono font-bold text-lg rounded-xl border border-teal-500/30">
                    {selectedQueue.queue_number}
                  </span>
                </div>
              </div>

              {saveSuccess && (
                <div className="p-4 bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 rounded-2xl text-sm flex items-center gap-3">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0" />
                  <div>
                    <h5 className="font-bold">Pemeriksaan SOAP Berhasil Disimpan!</h5>
                    <p className="text-xs text-emerald-200">Status antrean dan pendaftaran pasien otomatis diperbarui menjadi <strong>SELESAI</strong>.</p>
                  </div>
                </div>
              )}

              {errorMsg && (
                <div className="p-3 bg-red-950/60 border border-red-500/50 text-red-300 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400" /> {errorMsg}
                </div>
              )}

              {/* 1. S (Subjective) */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-blue-400" /> S - Subjective (Keluhan Utama Pasien)
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Pasien mengeluh demam, pusing, dan batuk kering..."
                  className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
                  value={subjective}
                  onChange={(e) => setSubjective(e.target.value)}
                />
              </div>

              {/* 2. O (Objective) - Vital Signs */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-teal-400" /> O - Objective (Tanda Vital & Pemeriksaan Fisik)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <span className="text-[11px] text-slate-400 block mb-1 flex items-center gap-1">
                      <Heart className="w-3 h-3 text-red-400" /> Tek. Darah (mmHg)
                    </span>
                    <input
                      type="text"
                      value={bloodPressure}
                      onChange={(e) => setBloodPressure(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white font-mono"
                    />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 block mb-1 flex items-center gap-1">
                      <Thermometer className="w-3 h-3 text-amber-400" /> Suhu (°C)
                    </span>
                    <input
                      type="text"
                      value={temperature}
                      onChange={(e) => setTemperature(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white font-mono"
                    />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 block mb-1 flex items-center gap-1">
                      <Scale className="w-3 h-3 text-emerald-400" /> Berat (kg)
                    </span>
                    <input
                      type="text"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white font-mono"
                    />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 block mb-1 flex items-center gap-1">
                      Tinggi (cm)
                    </span>
                    <input
                      type="text"
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* 3. A (Assessment) - Diagnosis */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Stethoscope className="w-4 h-4 text-purple-400" /> A - Assessment (Diagnosa Dokter)
                </label>
                <input
                  type="text"
                  required
                  placeholder="Febris ec Infeksi Saluran Pernapasan Akut (ISPA)"
                  className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-purple-500 font-semibold"
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                />
              </div>

              {/* 4. P (Plan) - Treatment Plan */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-emerald-400" /> P - Plan (Rencana Terapi & Edukasi)
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Istirahat cukup, hindari minuman dingin, minum obat teratur..."
                  className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
                  value={treatmentPlan}
                  onChange={(e) => setTreatmentPlan(e.target.value)}
                />
              </div>

              {/* Tindakan Medis Section */}
              <div className="pt-4 border-t border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Tindakan Medis</label>
                  <button
                    type="button"
                    onClick={handleAddAction}
                    className="text-xs text-teal-400 hover:text-teal-300 flex items-center gap-1 font-semibold"
                  >
                    <Plus className="w-3.5 h-3.5" /> Tambah Tindakan
                  </button>
                </div>

                {actions.map((act, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Nama Tindakan (misal: Pemeriksaan Fisik & TTV)"
                      className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
                      value={act.action_name}
                      onChange={(e) => {
                        const newActions = [...actions];
                        newActions[index].action_name = e.target.value;
                        setActions(newActions);
                      }}
                    />
                    <input
                      type="text"
                      placeholder="Catatan tindakan"
                      className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
                      value={act.notes}
                      onChange={(e) => {
                        const newActions = [...actions];
                        newActions[index].notes = e.target.value;
                        setActions(newActions);
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveAction(index)}
                      className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Resep Obat Section */}
              <div className="pt-4 border-t border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Resep Obat</label>
                  <button
                    type="button"
                    onClick={handleAddPrescription}
                    className="text-xs text-teal-400 hover:text-teal-300 flex items-center gap-1 font-semibold"
                  >
                    <Plus className="w-3.5 h-3.5" /> Tambah Obat
                  </button>
                </div>

                {prescriptions.map((pres, index) => (
                  <div key={index} className="grid grid-cols-1 sm:grid-cols-4 gap-2 items-center">
                    <input
                      type="text"
                      placeholder="Nama Obat (misal: Paracetamol 500mg)"
                      className="sm:col-span-2 px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white font-semibold"
                      value={pres.medicine_name}
                      onChange={(e) => {
                        const newPres = [...prescriptions];
                        newPres[index].medicine_name = e.target.value;
                        setPrescriptions(newPres);
                      }}
                    />
                    <input
                      type="text"
                      placeholder="Dosis (misal: 3x1 sesudah makan)"
                      className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
                      value={pres.dosage}
                      onChange={(e) => {
                        const newPres = [...prescriptions];
                        newPres[index].dosage = e.target.value;
                        setPrescriptions(newPres);
                      }}
                    />
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        placeholder="Jumlah"
                        className="w-20 px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
                        value={pres.quantity}
                        onChange={(e) => {
                          const newPres = [...prescriptions];
                          newPres[index].quantity = parseInt(e.target.value) || 1;
                          setPrescriptions(newPres);
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => handleRemovePrescription(index)}
                        className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Submit Button */}
              <div className="pt-6 flex justify-end border-t border-slate-800">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-3 bg-gradient-to-r from-teal-600 via-emerald-600 to-teal-500 hover:from-teal-500 hover:to-emerald-400 text-white font-bold rounded-2xl text-sm shadow-xl shadow-teal-500/25 flex items-center gap-2 transition-all"
                >
                  <Save className="w-4 h-4" />
                  {saving ? 'Menyimpan SOAP...' : 'Simpan SOAP & Selesaikan Pemeriksaan'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
